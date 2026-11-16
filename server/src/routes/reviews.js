import { Router } from "express";
import { Review, User, LaundryBatch } from "../models/index.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { validate } from "../lib/validate.js";
import { schemas } from "../lib/schemas.js";
import { AppError, asyncHandler } from "../lib/errors.js";
import { writeLimiter } from "../middleware/rateLimit.js";

const router = Router();

const DONE_STATUSES = ["ready", "picked_up"];

function publicReview(review) {
  return {
    _id: review._id,
    rating: review.rating,
    comment: review.comment,
    anonymousName: review.anonymousName,
    createdAt: review.createdAt,
  };
}

// GET /api/reviews — public feed + aggregate stats
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const all = await Review.find({});
    const ratings = all.map((review) => review.rating);
    const average =
      ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : 0;

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    all.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) breakdown[review.rating]++;
    });

    all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      average: Number(average.toFixed(1)),
      total: all.length,
      breakdown,
      reviews: all.slice(0, 50).map(publicReview),
    });
  })
);

// GET /api/reviews/mine
router.get(
  "/mine",
  authenticate,
  asyncHandler(async (req, res) => {
    const mine = await Review.find({ user: req.user.id });
    mine.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(mine);
  })
);

// GET /api/reviews/usable-batches
router.get(
  "/usable-batches",
  authenticate,
  asyncHandler(async (req, res) => {
    const batches = await LaundryBatch.find({ user: req.user.id });
    const done = batches.filter((batch) => DONE_STATUSES.includes(batch.status));
    const reviewed = await Review.find({ user: req.user.id });
    const reviewedBatchIds = new Set(reviewed.map((review) => String(review.batch)));

    res.json(
      done
        .filter((batch) => !reviewedBatchIds.has(String(batch._id)))
        .map((batch) => ({
          _id: batch._id,
          description: batch.description,
          status: batch.status,
          hostelBlock: batch.hostelBlock,
          createdAt: batch.createdAt,
          estimatedReady: batch.estimatedReady,
        }))
    );
  })
);

// POST /api/reviews
router.post(
  "/",
  authenticate,
  writeLimiter,
  validate({ body: schemas.review }),
  asyncHandler(async (req, res) => {
    const { rating, comment, batch } = req.body;

    let batchId = batch || null;
    if (batchId) {
      const target = await LaundryBatch.findOne({ _id: batchId });
      if (!target) throw new AppError(400, "Batch not found");
      if (String(target.user) !== req.user.id) {
        throw new AppError(403, "Not your batch to review");
      }
      if (!DONE_STATUSES.includes(target.status)) {
        throw new AppError(400, "Batch must be ready or picked up to review");
      }
      const already = await Review.findOne({ user: req.user.id, batch: batchId });
      if (already) throw new AppError(400, "You already reviewed this batch");
    }

    const anonName = req.user.name
      ? (() => {
          const parts = req.user.name.trim().split(/\s+/);
          const first = parts[0] || "";
          const lastInit = parts.length > 1 ? parts[parts.length - 1][0] : "";
          return (
            first.charAt(0).toUpperCase() +
            first.slice(1) +
            (lastInit ? lastInit.toUpperCase() + "." : "")
          );
        })()
      : "Guest";

    const review = await Review.create({
      user: req.user.id,
      batch: batchId,
      rating,
      comment,
      anonymousName: anonName,
      anonymous: true,
    });

    res.status(201).json(review);
  })
);

// GET /api/reviews/stats
router.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const reviews = await Review.find({});
    const total = reviews.length;
    const average =
      total > 0
        ? Math.round(
            (reviews.reduce((sum, review) => sum + review.rating, 0) / total) * 10
          ) / 10
        : 0;

    const byStars = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const review of reviews) {
      byStars[review.rating] = (byStars[review.rating] || 0) + 1;
    }

    res.json({ average, total, byStars });
  })
);

// GET /api/reviews/service-rating
router.get(
  "/service-rating",
  asyncHandler(async (_req, res) => {
    const reviews = await Review.find({});
    const total = reviews.length;
    const average =
      total > 0
        ? Math.round(
            (reviews.reduce((sum, review) => sum + review.rating, 0) / total) * 10
          ) / 10
        : 0;

    const recent = [...reviews]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(publicReview);

    res.json({
      average,
      total,
      breakdown: {
        positive: reviews.filter((review) => review.rating >= 4).length,
        neutral: reviews.filter((review) => review.rating === 3).length,
        negative: reviews.filter((review) => review.rating <= 2).length,
      },
      recent,
    });
  })
);

// GET /api/reviews/:id — warden only
router.get(
  "/:id",
  requireRole("warden"),
  asyncHandler(async (req, res) => {
    const review = await Review.findOne({ _id: req.params.id });
    if (!review) throw new AppError(404, "Review not found");

    const user = await User.findOne({ _id: review.user });
    res.json({ review, userName: user?.name, userEmail: user?.email });
  })
);

export default router;
