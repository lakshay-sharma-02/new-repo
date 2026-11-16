import { Router } from "express";
import { LaundryTimings } from "../models/index.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { validate } from "../lib/validate.js";
import { schemas } from "../lib/schemas.js";
import { AppError, asyncHandler } from "../lib/errors.js";

const router = Router();
router.use(authenticate);

const norm = (value) => String(value || "").trim().toUpperCase();

async function findSchedule(block) {
  const all = await LaundryTimings.find({});
  return all.find((schedule) => norm(schedule.hostelBlock) === norm(block)) || null;
}

// GET /api/timings — the published schedule for MY block
router.get(
  "/",
  asyncHandler(async (req, res) => {
    if (!req.user.hostelBlock || req.user.role === "warden") return res.json(null);
    res.json(await findSchedule(req.user.hostelBlock));
  })
);

// GET /api/timings/all — every published block schedule
router.get(
  "/all",
  requireRole("staff", "warden"),
  asyncHandler(async (_req, res) => {
    const all = await LaundryTimings.find({});
    all.sort((a, b) => norm(a.hostelBlock).localeCompare(norm(b.hostelBlock)));
    res.json(all);
  })
);

// POST /api/timings — publish/update a block schedule
router.post(
  "/",
  requireRole("staff", "warden"),
  validate({ body: schemas.timings }),
  asyncHandler(async (req, res) => {
    const block = norm(req.body.hostelBlock);

    if (req.user.role === "staff" && block !== norm(req.user.hostelBlock)) {
      throw new AppError(403, "Staff can only manage their own block's schedule");
    }

    const fields = {
      hostelBlock: block,
      laundryDays: req.body.laundryDays,
      dropoffStart: req.body.dropoffStart,
      dropoffEnd: req.body.dropoffEnd,
      pickupStart: req.body.pickupStart,
      pickupEnd: req.body.pickupEnd,
      cutoffTime: req.body.cutoffTime,
      turnaroundDays: req.body.turnaroundDays,
      user: req.user.id,
    };

    const existing = await findSchedule(block);
    if (existing) {
      const saved = await LaundryTimings.findOneAndUpdate(
        { _id: existing._id },
        fields,
        { new: true }
      );
      return res.json(saved);
    }

    const created = await LaundryTimings.create(fields);
    return res.status(201).json(created);
  })
);

// DELETE /api/timings?block=B6 — remove a published schedule
router.delete(
  "/",
  requireRole("staff", "warden"),
  asyncHandler(async (req, res) => {
    const block = norm(req.query.block || req.body?.block);
    if (!block) throw new AppError(400, "Block is required");

    if (req.user.role === "staff" && block !== norm(req.user.hostelBlock)) {
      throw new AppError(403, "Staff can only manage their own block's schedule");
    }

    const existing = await findSchedule(block);
    if (!existing) throw new AppError(404, `No schedule for block ${block}`);

    await LaundryTimings.findOneAndDelete({ _id: existing._id });
    res.json({ message: `Schedule for ${block} removed` });
  })
);

export default router;
