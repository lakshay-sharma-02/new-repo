import { Router } from "express";
import {
  LaundryBatch,
  LaundryTimings,
  User,
  Notification,
} from "../models/index.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../lib/validate.js";
import { schemas } from "../lib/schemas.js";
import { AppError, asyncHandler } from "../lib/errors.js";
import { canTransition, historyEntry, LABELS } from "../domain/status.js";
import { canViewBatch, isManager } from "../services/access.js";
import { computeEstimatedReady, submissionWindow } from "../services/schedule.js";
import { writeLimiter } from "../middleware/rateLimit.js";

const router = Router();
router.use(authenticate);

const norm = (value) => String(value || "").trim().toUpperCase();

async function findById(id) {
  return LaundryBatch.findOne({ _id: id });
}

async function pushNotification(userId, { type = "system", title, message, batch }) {
  try {
    await Notification.create({
      user: userId,
      type,
      title,
      message,
      batch: batch || null,
    });
  } catch {
    /* notifications are best-effort */
  }
}

async function findSchedule(block) {
  const all = await LaundryTimings.find({});
  return all.find((schedule) => norm(schedule.hostelBlock) === norm(block)) || null;
}

async function staffOfBlock(block) {
  const users = await User.find({});
  return users.filter(
    (user) =>
      user.role === "staff" &&
      !user.deletedAt &&
      norm(user.hostelBlock) === norm(block)
  );
}

async function attachOwnerNames(batches) {
  if (!batches.length) return batches;
  const users = await User.find({});
  const names = {};
  users.forEach((user) => {
    names[String(user._id)] = user.name;
  });
  return batches.map((batch) => ({
    ...batch,
    ownerName: names[String(batch.user)] || "—",
  }));
}

// POST /api/batches — submit a batch (student at drop-off, or staff logging one)
router.post(
  "/",
  writeLimiter,
  validate({ body: schemas.batchCreate }),
  asyncHandler(async (req, res) => {
    const { description, itemEstimate, hostelBlock } = req.body;
    const block = norm(hostelBlock || req.user.hostelBlock);
    if (!block) {
      throw new AppError(400, "No hostel block — add one to your profile first.");
    }

    const manager = req.user.role !== "student";
    if (!manager && block !== norm(req.user.hostelBlock)) {
      throw new AppError(403, "You can only submit batches for your own block");
    }

    const schedule = await findSchedule(block);
    if (!schedule) {
      throw new AppError(
        400,
        `No published laundry schedule for block ${block} yet — the laundry service needs to publish one.`
      );
    }

    const window = submissionWindow(schedule);
    if (!window.ok && !manager) {
      throw new AppError(400, window.reason);
    }

    const batch = await LaundryBatch.create({
      user: req.user.id,
      hostelBlock: block,
      description,
      itemEstimate: itemEstimate || "",
      status: "submitted",
      estimatedReady: computeEstimatedReady(schedule),
      lateDrop: !window.ok || Boolean(window.lateDrop),
    });

    const staff = await staffOfBlock(block);
    for (const member of staff) {
      if (String(member._id) !== req.user.id) {
        await pushNotification(member._id, {
          type: "new_batch",
          title: "New drop-off",
          message: `${req.user.name} submitted a batch in ${block}.`,
          batch: batch._id,
        });
      }
    }

    res.status(201).json(batch);
  })
);

// GET /api/batches — student: own batches · staff: own block · warden: all
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { status, block } = req.query;
    const all = await LaundryBatch.find({});

    let docs =
      req.user.role === "student"
        ? all.filter((batch) => String(batch.user) === req.user.id)
        : all.filter((batch) => canViewBatch(req.user, batch));

    if (status) docs = docs.filter((batch) => batch.status === status);
    if (block) docs = docs.filter((batch) => norm(batch.hostelBlock) === norm(block));

    docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(await attachOwnerNames(docs));
  })
);

// GET /api/batches/:id — owner or that block's manager
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const batch = await findById(req.params.id);
    if (!batch || !canViewBatch(req.user, batch)) {
      throw new AppError(404, "Batch not found");
    }
    const [owned] = await attachOwnerNames([batch]);
    res.json(owned);
  })
);

// PATCH /api/batches/:id/status
//  - staff/warden: move a batch in their block through the pipeline
//  - student: only mark their OWN batch picked up, and only from "ready"
//  - warden: may override a skipped/backwards step with a written reason
router.patch(
  "/:id/status",
  validate({ body: schemas.batchStatus }),
  asyncHandler(async (req, res) => {
    const { status, reason } = req.body;
    const batch = await findById(req.params.id);
    if (!batch) throw new AppError(404, "Batch not found");

    const owner = String(batch.user) === req.user.id;
    const manager = isManager(req.user, batch);
    if (!owner && !manager) {
      throw new AppError(404, "Batch not found");
    }

    if (batch.status === status) return res.json(batch);

    if (owner && !manager) {
      if (!(batch.status === "ready" && status === "picked_up")) {
        throw new AppError(403, "You can't move this batch to that status.");
      }
    } else if (!canTransition(batch.status, status)) {
      const overrideAllowed =
        req.user.role === "warden" && reason && reason.trim().length >= 5;
      if (!overrideAllowed) {
        throw new AppError(
          409,
          `Cannot move a batch from ${LABELS[batch.status]} to ${LABELS[status]}.` +
            (req.user.role === "warden" ? " Add a reason (5+ characters) to override." : "")
        );
      }
    }

    batch.statusHistory = batch.statusHistory || [];
    batch.statusHistory.push(
      historyEntry({
        status,
        by: req.user.id,
        byName: req.user.name,
        reason,
      })
    );
    batch.status = status;
    await batch.save();

    if (!owner && batch.user) {
      await pushNotification(String(batch.user), {
        type: "status",
        title: "Batch update",
        message: `Your batch is now “${LABELS[status]}”.`,
        batch: batch._id,
      });
    }
    if (owner && status === "picked_up") {
      const staff = await staffOfBlock(batch.hostelBlock);
      for (const member of staff) {
        await pushNotification(String(member._id), {
          type: "status",
          title: "Batch picked up",
          message: `${req.user.name} collected their batch.`,
          batch: batch._id,
        });
      }
    }

    res.json(batch);
  })
);

// POST /api/batches/:id/report-issue — owner or manager flags a problem
router.post(
  "/:id/report-issue",
  validate({ body: schemas.reportIssue }),
  asyncHandler(async (req, res) => {
    const { issueDescription } = req.body;
    const batch = await findById(req.params.id);
    if (!batch) throw new AppError(404, "Batch not found");

    const owner = String(batch.user) === req.user.id;
    const manager = isManager(req.user, batch);
    if (!owner && !manager) throw new AppError(404, "Batch not found");

    batch.issueReported = true;
    batch.issueDescription = issueDescription;
    batch.issueResolved = false;
    batch.issueResponse = "";
    batch.issueResolvedBy = null;
    batch.issueResolvedAt = null;
    await batch.save();

    const reporter = owner ? req.user.name : `Staff (${req.user.name})`;
    const staff = await staffOfBlock(batch.hostelBlock);
    for (const member of staff) {
      await pushNotification(String(member._id), {
        type: "issue",
        title: "⚠️ Issue reported",
        message: `${reporter} flagged a problem on batch #${String(batch._id).slice(-5).toUpperCase()}: ${issueDescription.slice(0, 90)}`,
        batch: batch._id,
      });
    }
    if (!owner) {
      await pushNotification(String(batch.user), {
        type: "issue",
        title: "Issue logged",
        message: "Your issue has been logged and the laundry staff have been notified.",
        batch: batch._id,
      });
    }

    res.json(batch);
  })
);

// POST /api/batches/:id/resolve-issue — staff/warden respond and close an issue
router.post(
  "/:id/resolve-issue",
  validate({ body: schemas.resolveIssue }),
  asyncHandler(async (req, res) => {
    const { response } = req.body;
    const batch = await findById(req.params.id);
    if (!batch) throw new AppError(404, "Batch not found");
    if (!isManager(req.user, batch)) {
      throw new AppError(403, "This batch isn't in your block");
    }

    batch.issueResolved = true;
    batch.issueResponse = response;
    batch.issueResolvedBy = req.user.id;
    batch.issueResolvedAt = new Date();
    await batch.save();

    await pushNotification(String(batch.user), {
      type: "issue",
      title: "✅ Issue resolved",
      message: response,
      batch: batch._id,
    });

    res.json(batch);
  })
);

// DELETE /api/batches/:id — owner or block manager removes a batch
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const batch = await findById(req.params.id);
    if (!batch) throw new AppError(404, "Batch not found");
    if (String(batch.user) !== req.user.id && !isManager(req.user, batch)) {
      throw new AppError(404, "Batch not found");
    }
    await LaundryBatch.findOneAndDelete({ _id: batch._id });
    res.json({ message: "Batch deleted" });
  })
);

export default router;
