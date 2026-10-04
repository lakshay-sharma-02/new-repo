import { Router } from "express";
import { LaundryBatch, LaundryTimings } from "../models/index.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

const ORDER = ["submitted", "received", "washing", "drying", "folding", "ready", "picked_up"];
const LABELS = {
  submitted: "Submitted",
  received: "Received",
  washing: "Washing",
  drying: "Drying",
  folding: "Folding",
  ready: "Ready for pickup",
  picked_up: "Picked up",
};

/**
 * POST /api/demo/advance — DEMO MODE ONLY.
 *
 * Drives the floating "live demo" widget: it advances the *requesting
 * student's own* batches one stage at a time, or submits a fresh batch,
 * exactly as their block's staff would from the console.
 * In production this endpoint does not exist (404 when MOCK_MODE is off) —
 * real status changes happen through the staff console.
 */
router.post("/advance", authenticate, async (req, res) => {
  if (process.env.MOCK_MODE !== "true") {
    return res.status(404).json({ error: "Demo endpoints are disabled" });
  }
  if (req.user.role !== "student") {
    return res.status(403).json({ error: "Staff use the console — demo driver is for students" });
  }

  try {
    const mine = await LaundryBatch.find({ user: req.user.id });
    const active = mine.filter((b) => b.status !== "picked_up");
    active.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Advance the oldest active batch one stage
    if (active.length > 0) {
      const target = active[0];
      const idx = ORDER.indexOf(target.status);
      const next = ORDER[idx + 1];
      if (!next) {
        return res.json({ ok: false, reason: "all_done", batch: target });
      }
      target.status = next;
      await target.save();
      return res.json({
        ok: true,
        action: "advanced",
        message: `Batch #${String(target._id).slice(-5).toUpperCase()} → ${LABELS[next]}`,
        batch: target,
      });
    }

    // Nothing active — start a fresh batch if the block has a schedule
    const allSchedules = await LaundryTimings.find({});
    const schedule = allSchedules.find(
      (s) => String(s.hostelBlock).toUpperCase() === String(req.user.hostelBlock || "").toUpperCase()
    );
    if (!schedule) {
      return res.json({ ok: false, reason: "no_schedule", message: "No published schedule for your block yet." });
    }

    const items = [
      "2 shirts, 3 tees, 1 hoodie",
      "Bed sheets + pillow covers",
      "4 t-shirts, 2 track pants",
      "Jeans, kurta, 5 tees",
      "Towel set + gym wear",
    ];
    const sizes = ["small", "medium", "large"];
    const estimate = new Date();
    estimate.setDate(estimate.getDate() + (schedule.turnaroundDays || 2));

    const batch = await LaundryBatch.create({
      user: req.user.id,
      hostelBlock: schedule.hostelBlock,
      description: items[Math.floor(Math.random() * items.length)],
      itemEstimate: sizes[Math.floor(Math.random() * sizes.length)],
      status: "submitted",
      estimatedReady: estimate,
    });
    return res.status(201).json({
      ok: true,
      action: "created",
      message: "New batch submitted",
      batch,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
