import { Router } from "express";
import {
  LaundryBatch,
  LaundryTimings,
  User,
  Notification,
} from "../models/index.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

const ORDER = ["submitted", "received", "washing", "drying", "folding", "ready", "picked_up"];
const LABELS = {
  submitted: "Submitted",
  received: "Received by staff",
  washing: "Washing",
  drying: "Drying",
  folding: "Folding",
  ready: "Ready for pickup",
  picked_up: "Picked up",
};

/* ---------------- helpers ---------------- */

const norm = (b) => String(b || "").trim().toUpperCase();

/** Staff manage their own block; warden manages everything. */
function isManager(user, batch) {
  if (user.role === "warden") return true;
  if (user.role === "staff") return !batch.hostelBlock || norm(batch.hostelBlock) === norm(user.hostelBlock);
  return false;
}

async function findById(id) {
  return LaundryBatch.findOne({ _id: id });
}

async function pushNotification(userId, { type = "system", title, message, batch }) {
  try {
    await Notification.create({ user: userId, type, title, message, batch: batch || null });
  } catch {
    /* notifications are best-effort */
  }
}

/** Next scheduled laundry day (from tomorrow) + turnaround => estimated ready date. */
function computeEstimatedReady(schedule) {
  const dayIdx = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const days = schedule.laundryDays || [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  for (let off = 1; off <= 7; off++) {
    const d = new Date(base);
    d.setDate(base.getDate() + off);
    if (days.some((x) => dayIdx[x] === d.getDay())) {
      d.setDate(d.getDate() + (schedule.turnaroundDays || 2));
      d.setHours(18, 0, 0, 0);
      return d;
    }
  }
  const fallback = new Date();
  fallback.setDate(fallback.getDate() + (schedule.turnaroundDays || 2));
  return fallback;
}

async function findSchedule(block) {
  const all = await LaundryTimings.find({});
  return all.find((s) => norm(s.hostelBlock) === norm(block)) || null;
}

async function staffOfBlock(block) {
  const users = await User.find({});
  return users.filter((u) => u.role === "staff" && norm(u.hostelBlock) === norm(block));
}

async function attachOwnerNames(batches) {
  if (!batches.length) return batches;
  const users = await User.find({});
  const names = {};
  users.forEach((u) => (names[String(u._id)] = u.name));
  return batches.map((d) => ({ ...d, ownerName: names[String(d.user)] || "—" }));
}

/* ---------------- routes ---------------- */

// POST /api/batches — submit a batch (student at drop-off, or staff logging one)
router.post("/", async (req, res) => {
  try {
    const { description = "", itemEstimate = "", hostelBlock } = req.body;
    const block = norm(hostelBlock || req.user.hostelBlock);
    if (!block) {
      return res.status(400).json({ error: "No hostel block — add one to your profile first." });
    }

    const schedule = await findSchedule(block);
    if (!schedule) {
      return res.status(400).json({
        error: `No published laundry schedule for block ${block} yet — the laundry service needs to publish one.`,
      });
    }

    const batch = await LaundryBatch.create({
      user: req.user.id,
      hostelBlock: block,
      description,
      itemEstimate,
      status: "submitted",
      estimatedReady: computeEstimatedReady(schedule),
    });

    // Alert that block's staff a new batch arrived
    const staffs = await staffOfBlock(block);
    for (const s of staffs) {
      if (String(s._id) !== req.user.id) {
        await pushNotification(s._id, {
          type: "new_batch",
          title: "New drop-off",
          message: `${req.user.name} submitted a batch in ${block}.`,
          batch: batch._id,
        });
      }
    }

    res.status(201).json(batch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/batches — student: own batches · staff: own block · warden: all
router.get("/", async (req, res) => {
  try {
    const { status, block } = req.query;
    const u = req.user;
    const all = await LaundryBatch.find({});
    let docs = u.role === "student" ? all.filter((d) => String(d.user) === u.id) : all.filter((d) => isManager(u, d));
    if (status) docs = docs.filter((d) => d.status === status);
    if (block) docs = docs.filter((d) => norm(d.hostelBlock) === norm(block));
    docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(await attachOwnerNames(docs));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/batches/:id — detail for owner or that block's manager
router.get("/:id", async (req, res) => {
  try {
    const batch = await findById(req.params.id);
    if (!batch) return res.status(404).json({ error: "Batch not found" });
    if (String(batch.user) !== req.user.id && !isManager(req.user, batch)) {
      return res.status(404).json({ error: "Batch not found" });
    }
    const [owned] = await attachOwnerNames([batch]);
    res.json(owned);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/batches/:id/status
//  - staff/warden: move any batch in their block through the pipeline
//  - student: may only mark their OWN batch as picked up once it is ready
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!ORDER.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const batch = await findById(req.params.id);
    if (!batch) return res.status(404).json({ error: "Batch not found" });

    const u = req.user;
    const owner = String(batch.user) === u.id;
    const manager = isManager(u, batch);

    if (!manager && !(owner && batch.status === "ready" && status === "picked_up")) {
      return res.status(403).json({ error: "You can't move this batch to that status." });
    }
    if (batch.status === status) return res.json(batch);

    batch.status = status;
    await batch.save();

    // Notify the owner (when someone else — staff/demo — moves it)
    if (!owner && String(batch.user)) {
      await pushNotification(String(batch.user), {
        type: "status",
        title: "Batch update",
        message: `Your batch is now “${LABELS[status]}”.`,
        batch: batch._id,
      });
    }
    // Notify block staff when a student confirms pickup
    if (owner && status === "picked_up") {
      const staffs = await staffOfBlock(batch.hostelBlock);
      for (const s of staffs) {
        await pushNotification(String(s._id), {
          type: "status",
          title: "Batch picked up",
          message: `${req.user.name} collected their batch.`,
          batch: batch._id,
        });
      }
    }

    res.json(batch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/batches/:id/report-issue — owner (or manager) flags a problem
router.post("/:id/report-issue", async (req, res) => {
  try {
    const { issueDescription } = req.body;
    if (!issueDescription) {
      return res.status(400).json({ error: "Describe the issue first" });
    }

    const batch = await findById(req.params.id);
    if (!batch) return res.status(404).json({ error: "Batch not found" });
    const owner = String(batch.user) === req.user.id;
    if (!owner && !isManager(req.user, batch)) {
      return res.status(404).json({ error: "Batch not found" });
    }

    batch.issueReported = true;
    batch.issueDescription = issueDescription;
    batch.issueResolved = false;
    batch.issueResponse = "";
    await batch.save();

    const reporter = owner ? req.user.name : `Staff (${req.user.name})`;
    const staffs = await staffOfBlock(batch.hostelBlock);
    for (const s of staffs) {
      await pushNotification(String(s._id), {
        type: "issue",
        title: "⚠️ Issue reported",
        message: `${reporter} flagged a problem on batch #${String(batch._id).slice(-5).toUpperCase()}: ${issueDescription.slice(0, 90)}`,
        batch: batch._id,
      });
    }
    // The owner wants confirmation too
    if (!owner) {
      await pushNotification(String(batch.user), {
        type: "issue",
        title: "Issue logged",
        message: "Your issue has been logged and the laundry staff have been notified.",
        batch: batch._id,
      });
    }

    res.json(batch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/batches/:id/resolve-issue — staff/warden respond and close an issue
router.post("/:id/resolve-issue", requireRole("staff", "warden"), async (req, res) => {
  try {
    const { response, status } = req.body;
    if (!response) {
      return res.status(400).json({ error: "Add a response for the student" });
    }

    const batch = await findById(req.params.id);
    if (!batch) return res.status(404).json({ error: "Batch not found" });
    if (!isManager(req.user, batch)) {
      return res.status(403).json({ error: "This batch isn't in your block" });
    }

    batch.issueResolved = true;
    batch.issueResponse = response;
    if (status && ORDER.includes(status)) {
      batch.status = status; // e.g. send it back to "washing" for a re-wash
    }
    await batch.save();

    await pushNotification(String(batch.user), {
      type: "issue",
      title: "✅ Issue resolved",
      message: response,
      batch: batch._id,
    });

    res.json(batch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/batches/:id — owner or block manager removes a batch
router.delete("/:id", async (req, res) => {
  try {
    const batch = await findById(req.params.id);
    if (!batch) return res.status(404).json({ error: "Batch not found" });
    if (String(batch.user) !== req.user.id && !isManager(req.user, batch)) {
      return res.status(404).json({ error: "Batch not found" });
    }
    await LaundryBatch.findOneAndDelete({ _id: batch._id });
    res.json({ message: "Batch deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
