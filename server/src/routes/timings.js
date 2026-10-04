import { Router } from "express";
import { LaundryTimings } from "../models/index.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

const norm = (b) => String(b || "").trim().toUpperCase();

const REQUIRED_FIELDS = [
  "laundryDays",
  "dropoffStart",
  "dropoffEnd",
  "pickupStart",
  "pickupEnd",
  "cutoffTime",
  "turnaroundDays",
];

async function findSchedule(block) {
  const all = await LaundryTimings.find({});
  return all.find((s) => norm(s.hostelBlock) === norm(block)) || null;
}

// GET /api/timings — the published schedule for MY block (student or staff)
router.get("/", async (req, res) => {
  try {
    if (!req.user.hostelBlock || req.user.role === "warden") return res.json(null);
    res.json(await findSchedule(req.user.hostelBlock));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/timings/all — every published block schedule (staff/warden console)
router.get("/all", requireRole("staff", "warden"), async (req, res) => {
  try {
    const all = await LaundryTimings.find({});
    all.sort((a, b) => norm(a.hostelBlock).localeCompare(norm(b.hostelBlock)));
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/timings — publish/update the schedule for a block (staff/warden only)
router.post("/", requireRole("staff", "warden"), async (req, res) => {
  try {
    const {
      hostelBlock,
      laundryDays,
      dropoffStart,
      dropoffEnd,
      pickupStart,
      pickupEnd,
      cutoffTime,
      turnaroundDays,
    } = req.body;

    if (!hostelBlock) {
      return res.status(400).json({ error: "Hostel block is required" });
    }
    if (!laundryDays?.length || REQUIRED_FIELDS.slice(1).some((f) => !req.body[f])) {
      return res.status(400).json({ error: "All schedule fields are required" });
    }

    const block = norm(hostelBlock);
    // A block staff member manages their own block only; warden manages all
    if (req.user.role === "staff" && block !== norm(req.user.hostelBlock)) {
      return res.status(403).json({ error: "Staff can only manage their own block's schedule" });
    }

    const fields = {
      hostelBlock: block,
      laundryDays,
      dropoffStart,
      dropoffEnd,
      pickupStart,
      pickupEnd,
      cutoffTime,
      turnaroundDays: Number(turnaroundDays),
      user: req.user.id,
    };

    const existing = await findSchedule(block);
    if (existing) {
      const saved = await LaundryTimings.findOneAndUpdate({ _id: existing._id }, fields, { new: true });
      return res.json(saved);
    }
    const created = await LaundryTimings.create(fields);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/timings?block=B6 — remove a published schedule
router.delete("/", requireRole("staff", "warden"), async (req, res) => {
  try {
    const block = norm(req.query.block || req.body.block);
    if (!block) return res.status(400).json({ error: "Block is required" });
    if (req.user.role === "staff" && block !== norm(req.user.hostelBlock)) {
      return res.status(403).json({ error: "Staff can only manage their own block's schedule" });
    }
    const existing = await findSchedule(block);
    if (!existing) return res.status(404).json({ error: `No schedule for block ${block}` });
    await LaundryTimings.findOneAndDelete({ _id: existing._id });
    res.json({ message: `Schedule for ${block} removed` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
