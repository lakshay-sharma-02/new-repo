import { Router } from "express";
import { LaundryBatch, LaundryTimings } from "../models/index.js";
import { authenticate } from "../middleware/auth.js";
import { config } from "../config.js";
import { historyEntry, LABELS, nextStage } from "../domain/status.js";
import { computeEstimatedReady } from "../services/schedule.js";
import { asyncHandler, AppError } from "../lib/errors.js";

const router = Router();

/**
 * POST /api/demo/advance — DEMO MODE ONLY.
 * Advances the requesting student's oldest batch one stage, or starts a fresh
 * batch. Real status changes happen through the staff console.
 */
router.post(
  "/advance",
  authenticate,
  asyncHandler(async (req, res) => {
    if (!config.mockMode) {
      throw new AppError(404, "Demo endpoints are disabled");
    }
    if (req.user.role !== "student") {
      throw new AppError(403, "Staff use the console — demo driver is for students");
    }

    const mine = await LaundryBatch.find({ user: req.user.id });
    const active = mine.filter((batch) => batch.status !== "picked_up");
    active.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    if (active.length > 0) {
      const target = active[0];
      const next = nextStage(target.status);
      if (!next) {
        return res.json({ ok: false, reason: "all_done", batch: target });
      }

      target.statusHistory = target.statusHistory || [];
      target.statusHistory.push(
        historyEntry({
          status: next,
          by: null,
          byName: "Demo simulator",
          reason: "Auto-advance (demo)",
        })
      );
      target.status = next;
      await target.save();

      return res.json({
        ok: true,
        action: "advanced",
        message: `Batch #${String(target._id).slice(-5).toUpperCase()} → ${LABELS[next]}`,
        batch: target,
      });
    }

    const schedules = await LaundryTimings.find({});
    const schedule = schedules.find(
      (item) =>
        String(item.hostelBlock).toUpperCase() ===
        String(req.user.hostelBlock || "").toUpperCase()
    );
    if (!schedule) {
      return res.json({
        ok: false,
        reason: "no_schedule",
        message: "No published schedule for your block yet.",
      });
    }

    const descriptions = [
      "2 shirts, 3 tees, 1 hoodie",
      "Bed sheets + pillow covers",
      "4 t-shirts, 2 track pants",
      "Jeans, kurta, 5 tees",
      "Towel set + gym wear",
    ];
    const sizes = ["small", "medium", "large", "xl"];

    const batch = await LaundryBatch.create({
      user: req.user.id,
      hostelBlock: schedule.hostelBlock,
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      itemEstimate: sizes[Math.floor(Math.random() * sizes.length)],
      status: "submitted",
      estimatedReady: computeEstimatedReady(schedule),
      lateDrop: false,
    });

    return res.status(201).json({
      ok: true,
      action: "created",
      message: "New batch submitted",
      batch,
    });
  })
);

export default router;
