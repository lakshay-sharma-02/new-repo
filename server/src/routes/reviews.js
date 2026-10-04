import { Router } from "express";
import { Review, User, LaundryBatch } from "../models/index.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

const DONE_STATUSES = ["ready", "picked_up"];

/**
 * GET /api/reviews — public reviews feed
 * Returns aggregate stats + list of reviews (most recent first).
 */
router.get("/", async (req, res) => {
  try {
    const all = await Review.find({});
    const ratings = all.map((r) => r.rating);
    const avg = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) : 0;

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    all.forEach((r) => { if (r.rating >= 1 && r.rating <= 5) breakdown[r.rating]++; });

    all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      averageRating: Number(avg.toFixed(1)),
      totalReviews: all.length,
      breakdown,
      reviews: all.slice(0, 50),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/reviews/mine — current user's reviews
 */
router.get("/mine", authenticate, async (req, res) => {
  try {
    const mine = await Review.find({ user: req.user.id });
    mine.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(mine);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/reviews/usable-batches — completed batches the current user can review
 */
router.get("/usable-batches", authenticate, async (req, res) => {
  try {
    const batches = await LaundryBatch.find({ user: req.user.id });
    const done = batches.filter((b) => DONE_STATUSES.includes(b.status));
    // Exclude batches already reviewed
    const reviewed = await Review.find({ user: req.user.id });
    const reviewedBatchIds = new Set(reviewed.map((r) => String(r.batch)));
    const usable = done.filter((b) => !reviewedBatchIds.has(String(b._id)));

    res.json(
      usable.map((b) => ({
        _id: b._id,
        description: b.description,
        status: b.status,
        hostelBlock: b.hostelBlock,
        createdAt: b.createdAt,
        estimatedReady: b.estimatedReady,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/reviews — create a review
 * Body: { rating, comment, batch? }
 */
router.post("/", authenticate, async (req, res) => {
  try {
    const { rating, comment = "", batch } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be 1–5" });
    }

    let batchId = batch || null;
    // If linking to a batch, verify eligibility
    if (batchId) {
      const b = await LaundryBatch.findOne({ _id: batchId });
      if (!b) return res.status(400).json({ error: "Batch not found" });
      if (String(b.user) !== req.user.id) return res.status(403).json({ error: "Not your batch to review" });
      if (!DONE_STATUSES.includes(b.status)) {
        return res.status(400).json({ error: "Batch must be picked up or ready to review" });
      }
      const already = await Review.findOne({ user: req.user.id, batch: batchId });
      if (already) return res.status(400).json({ error: "You already reviewed this batch" });
    }

    // Build anonymous display name
    const anonName = req.user.name
      ? (() => {
          const parts = req.user.name.trim().split(/\s+/);
          const first = parts[0] || "";
          const lastInit = parts.length > 1 ? parts[parts.length - 1][0] : "";
          return first.charAt(0).toUpperCase() + first.slice(1) + (lastInit ? lastInit.toUpperCase() + "." : "");
        })()
      : "Guest";

    const review = await Review.create({
      user: req.user.id,
      batch: batchId,
      rating: Number(rating),
      comment,
      anonymousName: anonName,
      anonymous: true,
    });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/reviews/stats — aggregate rating stats
 * Returns: average rating, count by stars
 */
router.get("/stats", async (req, res) => {
  try {
    const reviews = await Review.find({});
    const total = reviews.length;
    const avg = total > 0 ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / total) * 10) / 10 : 0;

    const byStars = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of reviews) {
      byStars[r.rating] = (byStars[r.rating] || 0) + 1;
    }

    res.json({
      average: avg,
      total,
      byStars,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/reviews/service-rating — overall service rating summary
 * Returns: average, total, sentiment breakdown, recent reviews
 */
router.get("/service-rating", async (req, res) => {
  try {
    const reviews = await Review.find({});
    const total = reviews.length;
    const avg = total > 0 ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / total) * 10) / 10 : 0;

    const positive = reviews.filter((r) => r.rating >= 4).length;
    const neutral = reviews.filter((r) => r.rating === 3).length;
    const negative = reviews.filter((r) => r.rating <= 2).length;

    const recent = [...reviews]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((r) => ({
        _id: r._id,
        rating: r.rating,
        comment: r.comment,
        anonymousName: r.anonymousName,
        createdAt: r.createdAt,
      }));

    res.json({
      average: avg,
      total,
      breakdown: { positive, neutral, negative },
      recent,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/reviews/:id — single review detail (admin only)
 */
router.get("/:id", requireRole("warden"), async (req, res) => {
  try {
    const review = await Review.findOne({ _id: req.params.id });
    if (!review) return res.status(404).json({ error: "Review not found" });

    const u = await User.findOne({ _id: review.user });
    res.json({ review, userName: u?.name, userEmail: u?.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
