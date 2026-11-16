import { Router } from "express";
import {
  Payment,
  Coupon,
  User,
  LaundryBatch,
  Service,
  LaundryTimings,
  Notification,
} from "../models/index.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { validate } from "../lib/validate.js";
import { schemas } from "../lib/schemas.js";
import { AppError, asyncHandler } from "../lib/errors.js";
import { publicUser } from "../lib/serialize.js";
import { buildQuote } from "../services/quote.js";
import {
  assertCouponReusable,
  releaseCoupon,
  reserveCoupon,
} from "../services/coupons.js";
import { assertVerified } from "../services/access.js";
import { computeEstimatedReady, submissionWindow } from "../services/schedule.js";
import { checkoutLimiter, writeLimiter } from "../middleware/rateLimit.js";

const router = Router();
router.use(authenticate);

const norm = (value) => String(value || "").trim().toUpperCase();

function toPlain(doc) {
  return doc && doc._doc ? doc._doc : doc || {};
}

function makeRef() {
  return "txn_" + Math.random().toString(36).slice(2, 12).toUpperCase();
}

async function findSchedule(block) {
  const all = await LaundryTimings.find({});
  return all.find((schedule) => norm(schedule.hostelBlock) === norm(block)) || null;
}

async function notifyBlockStaff(block, actor, batch) {
  try {
    const users = await User.find({});
    const staff = users.filter(
      (user) =>
        user.role === "staff" &&
        !user.deletedAt &&
        norm(user.hostelBlock) === norm(block)
    );
    for (const member of staff) {
      if (String(member._id) === actor.id) continue;
      await Notification.create({
        user: member._id,
        type: "new_batch",
        title: "New drop-off",
        message: `${actor.name} submitted a batch in ${block}.`,
        batch: batch._id,
      });
    }
  } catch {
    /* notifications are best-effort */
  }
}

/**
 * POST /api/payments/calculate
 * Quote only — never creates a payment. The amount is always server-side.
 */
router.post(
  "/calculate",
  validate({ body: schemas.calculate }),
  asyncHandler(async (req, res) => {
    const quote = await buildQuote(req.body);
    res.json({
      valid: true,
      service: quote.service,
      items: quote.items,
      subtotal: quote.subtotal,
      discount: quote.discount,
      tax: quote.tax,
      total: quote.total,
      currency: "INR",
      couponCode: quote.couponCode,
    });
  })
);

/**
 * POST /api/payments/checkout
 * The only money path used by the client: prices, validates the schedule,
 * creates the batch, records the payment and marks the batch paid in one
 * request. An idempotency key makes retries safe.
 */
router.post(
  "/checkout",
  checkoutLimiter,
  validate({ body: schemas.checkout }),
  asyncHandler(async (req, res) => {
    const { description, itemEstimate, couponCode, method, idempotencyKey } = req.body;
    assertVerified(req.user);

    if (idempotencyKey) {
      const existing = await Payment.findOne({
        user: req.user.id,
        idempotencyKey,
      });
      if (existing) {
        const batch = await LaundryBatch.findOne({ _id: existing.batch });
        return res.json({ success: true, replayed: true, batch, payment: existing });
      }
    }

    const block = norm(req.user.hostelBlock);
    if (!block) {
      throw new AppError(400, "Add a hostel block to your profile before submitting.");
    }

    const schedule = await findSchedule(block);
    if (!schedule) {
      throw new AppError(
        400,
        `No published laundry schedule for block ${block} yet — the laundry service needs to publish one.`
      );
    }

    const window = submissionWindow(schedule);
    if (!window.ok) throw new AppError(400, window.reason);

    const quote = await buildQuote({ itemEstimate, couponCode });

    if (quote.coupon) {
      await assertCouponReusable(quote.coupon, req.user.id);
      await reserveCoupon(quote.coupon, quote.subtotal);
    }

    let batch = null;
    try {
      batch = await LaundryBatch.create({
        user: req.user.id,
        hostelBlock: block,
        description,
        itemEstimate: quote.items[0].type,
        status: "submitted",
        estimatedReady: computeEstimatedReady(schedule),
        lateDrop: Boolean(window.lateDrop),
        paid: false,
      });

      const payment = await Payment.create({
        user: req.user.id,
        batch: batch._id,
        amount: quote.total,
        currency: "INR",
        status: "success",
        method,
        paidAt: new Date(),
        breakdown: {
          subtotal: quote.subtotal,
          discount: quote.discount,
          tax: quote.tax,
          total: quote.total,
          couponCode: quote.couponCode,
          items: quote.items,
        },
        transactionRef: makeRef(),
        ...(idempotencyKey ? { idempotencyKey } : {}),
      });

      payment.invoiceUrl = `/api/payments/${payment._id}/invoice`;
      await payment.save();

      batch.paid = true;
      await batch.save();

      await notifyBlockStaff(block, req.user, batch);

      res.status(201).json({
        success: true,
        batch,
        payment,
        quote: {
          service: quote.service,
          items: quote.items,
          subtotal: quote.subtotal,
          discount: quote.discount,
          tax: quote.tax,
          total: quote.total,
          couponCode: quote.couponCode,
          currency: "INR",
        },
      });
    } catch (err) {
      // Compensate: don't leave an unpaid batch or a consumed coupon behind.
      if (batch) {
        await LaundryBatch.findOneAndDelete({ _id: batch._id }).catch(() => {});
      }
      if (quote.coupon) {
        await releaseCoupon(quote.coupon).catch(() => {});
      }
      throw err;
    }
  })
);

/**
 * POST /api/payments/process
 * Pays an existing, unpaid batch. Kept for clients that submit the batch
 * separately; the amount is still recomputed server-side.
 */
router.post(
  "/process",
  writeLimiter,
  validate({ body: schemas.process }),
  asyncHandler(async (req, res) => {
    const { batchId, method, couponCode, idempotencyKey } = req.body;
    assertVerified(req.user);

    if (idempotencyKey) {
      const existing = await Payment.findOne({
        user: req.user.id,
        idempotencyKey,
      });
      if (existing) {
        return res.json({ success: true, replayed: true, payment: existing });
      }
    }

    const batch = await LaundryBatch.findOne({ _id: batchId });
    if (!batch || String(batch.user) !== req.user.id) {
      throw new AppError(404, "Batch not found");
    }
    if (batch.paid) {
      throw new AppError(409, "This batch has already been paid");
    }

    const quote = await buildQuote({
      itemEstimate: batch.itemEstimate || "medium",
      couponCode,
    });

    if (quote.coupon) {
      await assertCouponReusable(quote.coupon, req.user.id);
      await reserveCoupon(quote.coupon, quote.subtotal);
    }

    let payment;
    try {
      payment = await Payment.create({
        user: req.user.id,
        batch: batch._id,
        amount: quote.total,
        currency: "INR",
        status: "success",
        method,
        paidAt: new Date(),
        breakdown: {
          subtotal: quote.subtotal,
          discount: quote.discount,
          tax: quote.tax,
          total: quote.total,
          couponCode: quote.couponCode,
          items: quote.items,
        },
        transactionRef: makeRef(),
        ...(idempotencyKey ? { idempotencyKey } : {}),
      });

      payment.invoiceUrl = `/api/payments/${payment._id}/invoice`;
      await payment.save();

      batch.paid = true;
      await batch.save();
    } catch (err) {
      if (quote.coupon) await releaseCoupon(quote.coupon).catch(() => {});
      throw err;
    }

    res.status(201).json({
      success: true,
      payment,
      transactionRef: payment.transactionRef,
    });
  })
);

/**
 * GET /api/payments/stats — warden revenue analytics
 */
router.get(
  "/stats",
  requireRole("warden"),
  asyncHandler(async (_req, res) => {
    const payments = await Payment.find({});

    const totalRevenue = payments
      .filter((payment) => payment.status === "success")
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);

    const pendingCount = payments.filter((p) => p.status === "pending").length;
    const successCount = payments.filter((p) => p.status === "success").length;
    const failedCount = payments.filter((p) => p.status === "failed").length;
    const refundedCount = payments.filter((p) => p.status === "refunded").length;

    const weeks = [];
    const now = new Date();
    for (let w = 0; w < 8; w++) {
      const end = new Date(now);
      end.setDate(end.getDate() - w * 7);
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      const weekRevenue = payments
        .filter(
          (payment) =>
            payment.status === "success" &&
            new Date(payment.createdAt) >= start &&
            new Date(payment.createdAt) <= end
        )
        .reduce((sum, payment) => sum + (payment.amount || 0), 0);

      weeks.push({
        week: `${start.toISOString().split("T")[0]} — ${end.toISOString().split("T")[0]}`,
        revenue: weekRevenue,
      });
    }
    weeks.reverse();

    const byMethod = {};
    for (const payment of payments) {
      if (payment.status !== "success") continue;
      const key = payment.method;
      byMethod[key] = (byMethod[key] || 0) + (payment.amount || 0);
    }
    const topServices = Object.entries(byMethod)
      .map(([method, revenue]) => ({
        method,
        revenue,
        count: payments.filter(
          (payment) => payment.method === method && payment.status === "success"
        ).length,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    res.json({
      totalRevenue,
      totalCount: payments.length,
      successCount,
      pendingCount,
      failedCount,
      refundedCount,
      revenueByWeek: weeks,
      topServices,
    });
  })
);

/**
 * GET /api/payments/all/admin — warden: all payments with filters
 */
router.get(
  "/all/admin",
  requireRole("warden"),
  asyncHandler(async (req, res) => {
    const { status, limit = 50, offset = 0 } = req.query;

    let all = await Payment.find({});
    if (status) all = all.filter((payment) => payment.status === status);

    const enriched = await Promise.all(
      all.map(async (payment) => {
        const user = await User.findOne({ _id: payment.user });
        const batch = payment.batch
          ? await LaundryBatch.findOne({ _id: payment.batch })
          : null;
        return {
          ...toPlain(payment),
          userName: user?.name || "—",
          userEmail: user?.email || "—",
          userBlock: user?.hostelBlock || batch?.hostelBlock || "—",
          batchDescription: batch?.description || "—",
          batchStatus: batch?.status || "—",
        };
      })
    );

    const totalRevenue = enriched
      .filter((payment) => payment.status === "success")
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);

    const total = enriched.length;
    const page = enriched.slice(Number(offset), Number(offset) + Number(limit));

    res.json({
      payments: page,
      total,
      totalRevenue,
      limit: Number(limit),
      offset: Number(offset),
    });
  })
);

/**
 * GET /api/payments — current user's payment history
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const payments = await Payment.find({ user: req.user.id });
    payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const enriched = await Promise.all(
      payments.map(async (payment) => {
        let batchInfo = null;
        if (payment.batch) {
          const batch = await LaundryBatch.findOne({ _id: payment.batch });
          if (batch) {
            batchInfo = { description: batch.description, status: batch.status };
          }
        }
        return { ...toPlain(payment), batchInfo };
      })
    );

    res.json(enriched);
  })
);

/**
 * POST /api/payments/:id/refund — warden refund with audit fields
 */
router.post(
  "/:id/refund",
  requireRole("warden"),
  validate({ body: schemas.refund }),
  asyncHandler(async (req, res) => {
    const payment = await Payment.findOne({ _id: req.params.id });
    if (!payment) throw new AppError(404, "Payment not found");
    if (payment.status !== "success") {
      throw new AppError(400, "Only successful payments can be refunded");
    }

    payment.status = "refunded";
    payment.refundedAt = new Date();
    payment.refundReason = req.body.reason || "";
    await payment.save();

    try {
      await Notification.create({
        user: payment.user,
        type: "system",
        title: "Payment refunded",
        message: `A payment of ₹${payment.amount} was refunded.`,
        batch: payment.batch || null,
      });
    } catch {
      /* best effort */
    }

    res.json({ success: true, message: "Payment refunded", payment });
  })
);

/**
 * POST /api/payments/:id/cancel — user cancels a pending payment
 */
router.post(
  "/:id/cancel",
  asyncHandler(async (req, res) => {
    const payment = await Payment.findOne({ _id: req.params.id });
    if (!payment) throw new AppError(404, "Payment not found");
    if (String(payment.user) !== req.user.id) {
      throw new AppError(403, "Not authorized");
    }
    if (payment.status !== "pending") {
      return res.json({ message: "Nothing to cancel", payment });
    }

    payment.status = "failed";
    await payment.save();
    res.json({ success: true, message: "Payment cancelled", payment });
  })
);

/**
 * GET /api/payments/:id/invoice
 */
router.get(
  "/:id/invoice",
  asyncHandler(async (req, res) => {
    const payment = await Payment.findOne({ _id: req.params.id });
    if (!payment) throw new AppError(404, "Payment not found");
    if (String(payment.user) !== req.user.id && req.user.role !== "warden") {
      throw new AppError(403, "Not authorized");
    }

    const batch = payment.batch
      ? await LaundryBatch.findOne({ _id: payment.batch })
      : null;
    const user = await User.findOne({ _id: payment.user });

    res.json({
      invoiceNumber: `INV-${String(payment._id).slice(-8).toUpperCase()}`,
      studentName: user?.name || "—",
      studentEmail: user?.email || "—",
      block: user?.hostelBlock || batch?.hostelBlock || "—",
      batchDetails: batch
        ? {
            description: batch.description,
            itemEstimate: batch.itemEstimate,
            status: batch.status,
            submittedAt: batch.createdAt,
          }
        : {
            description: "(One-off payment)",
            itemEstimate: payment.breakdown?.items?.[0]?.type || "—",
          },
      items: payment.breakdown?.items || [],
      pricing: {
        subtotal: payment.breakdown?.subtotal || 0,
        discount: payment.breakdown?.discount || 0,
        couponCode: payment.breakdown?.couponCode || "",
        tax: payment.breakdown?.tax || 0,
        total: payment.breakdown?.total || payment.amount,
        currency: payment.currency,
      },
      paymentStatus: payment.status,
      paidAt: payment.paidAt,
      method: payment.method,
      createdAt: payment.createdAt,
      transactionRef: payment.transactionRef,
    });
  })
);

/**
 * GET /api/payments/:id/receipt — printable receipt data
 */
router.get(
  "/:id/receipt",
  asyncHandler(async (req, res) => {
    const payment = await Payment.findOne({ _id: req.params.id });
    if (!payment) throw new AppError(404, "Payment not found");
    if (String(payment.user) !== req.user.id && req.user.role !== "warden") {
      throw new AppError(403, "Not authorized");
    }

    const user = await User.findOne({ _id: payment.user });
    const batch = payment.batch
      ? await LaundryBatch.findOne({ _id: payment.batch })
      : null;

    const invoiceNumber = `INV-${String(payment._id).slice(-8).toUpperCase()}`;
    res.json({
      invoiceNumber,
      studentName: user?.name || "—",
      block: user?.hostelBlock || batch?.hostelBlock || "—",
      amount: payment.breakdown?.total || payment.amount,
      currency: payment.currency,
      status: payment.status,
      paidAt: payment.paidAt || payment.createdAt,
      issuedAt: payment.createdAt,
      qrData: `${invoiceNumber}|${payment._id}|${payment.breakdown?.total || payment.amount}`,
    });
  })
);

/**
 * GET /api/payments/:id — payment detail
 */
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const payment = await Payment.findOne({ _id: req.params.id });
    if (!payment) throw new AppError(404, "Payment not found");
    if (String(payment.user) !== req.user.id && req.user.role !== "warden") {
      throw new AppError(403, "Not authorized");
    }

    const batch = payment.batch
      ? await LaundryBatch.findOne({ _id: payment.batch })
      : null;
    const user = await User.findOne({ _id: payment.user });

    res.json({ payment, batch, user: publicUser(user) });
  })
);

export default router;
