import { Router } from "express";
import { Payment, Coupon, User, LaundryBatch, Service, LaundryTimings } from "../models/index.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

const TAX_RATE = 0.05; // 5% tax

/** Safely extract plain object from Mongoose doc or mock model */
function toPlain(doc) {
  return doc && doc._doc ? doc._doc : doc || {};
}

/**
 * POST /api/payments/calculate
 * Mock price calculation — always succeeds.
 * Body: { itemEstimate?, items?, couponCode? }
 */
router.post("/calculate", async (req, res) => {
  try {
    const { itemEstimate, items, couponCode } = req.body;

    // Resolve the active service tier
    const allServices = await Service.find({});
    let service = allServices.find((s) => s.isDefault) || allServices[0] || null;
    if (allServices.length === 0) {
      // Seed a default service tier if none exists
      service = await Service.create({
        name: "Standard",
        priceSmall: 120,
        priceMedium: 180,
        priceLarge: 250,
        priceXL: 350,
        description: "Standard laundry service",
        isDefault: true,
      });
    }

    // Build item breakdown
    let itemBreakdown = [];
    if (items && Array.isArray(items) && items.length > 0) {
      // items = [{ type: "small", count: 3 }, ...]
      for (const it of items) {
        const price = service.priceFor(it.type);
        itemBreakdown.push({ type: it.type, count: it.count || 1, price });
      }
    } else if (itemEstimate) {
      // Legacy single-size estimate
      itemBreakdown = [{ type: itemEstimate, count: 1, price: service.priceFor(itemEstimate) }];
    } else {
      // Default to medium
      itemBreakdown = [{ type: "medium", count: 1, price: service.priceFor("medium") }];
    }

    const subtotal = itemBreakdown.reduce((sum, it) => sum + it.price * it.count, 0);

    // Validate coupon if provided
    let coupon = null;
    let discount = 0;
    let couponCodeApplied = "";
    if (couponCode) {
      coupon = await Coupon.findOne({ code: String(couponCode).toUpperCase() });
      if (!coupon) {
        return res.status(400).json({ error: "Coupon not found", valid: false });
      }
      const validation = coupon.validateForOrder(subtotal);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.reason, valid: false });
      }
      discount = coupon.calculateDiscount(subtotal);
      couponCodeApplied = coupon.code;
    }

    const taxable = subtotal - discount;
    const tax = Math.round(taxable * TAX_RATE);
    const total = taxable + tax;

    return res.json({
      valid: true,
      service: { name: service.name, description: service.description },
      items: itemBreakdown,
      subtotal,
      discount,
      tax,
      total,
      currency: "INR",
      couponCode: couponCodeApplied,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/payments/process
 * Mock payment processing — always successful (per spec).
 * Body: { amount, breakdown, batchId?, method?, couponCode? }
 */
router.post("/process", async (req, res) => {
  try {
    const { amount, breakdown, batchId, method = "upi", couponCode } = req.body;

    // Generate a mock transaction reference
    const txRef = "txn_" + Math.random().toString(36).slice(2, 12).toUpperCase();

    const paymentData = {
      user: req.user.id,
      batch: batchId || null,
      amount: Number(amount) || 0,
      currency: "INR",
      status: "success",
      method,
      paidAt: new Date(),
      invoiceUrl: `/api/payments/${undefined}/invoice`.replace(undefined, ""),
      breakdown: {
        subtotal: breakdown?.subtotal || 0,
        discount: breakdown?.discount || 0,
        tax: breakdown?.tax || 0,
        total: breakdown?.total || amount,
        couponCode: breakdown?.couponCode || couponCode || "",
        items: breakdown?.items || [],
      },
      transactionRef: txRef,
    };

    // If linking to a batch, mark it as paid
    if (batchId) {
      const batch = await LaundryBatch.findOne({ _id: batchId });
      if (batch && String(batch.user) === req.user.id) {
        batch.paid = true;
        await batch.save();
      }
    }

    const payment = await Payment.create(paymentData);
    payment.invoiceUrl = `/api/payments/${payment._id}/invoice`;
    await payment.save();

    return res.status(201).json({ success: true, payment, transactionRef: txRef });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/payments — list all payments for current user
 */
router.get("/", async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id });
    payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const enriched = await Promise.all(
      payments.map(async (p) => {
        let batchInfo = null;
        if (p.batch) {
          const batch = await LaundryBatch.findOne({ _id: p.batch });
          if (batch) {
            batchInfo = { description: batch.description, status: batch.status };
          }
        }
        return { ...toPlain(p), batchInfo };
      })
    );

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/payments/stats — admin revenue analytics
 * Returns: revenue totals, revenue by week, top services
 */
router.get("/stats", requireRole("warden"), async (req, res) => {
  try {
    const payments = await Payment.find({});

    const totalRevenue = payments
      .filter((p) => p.status === "success")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const pendingCount = payments.filter((p) => p.status === "pending").length;
    const successCount = payments.filter((p) => p.status === "success").length;
    const failedCount = payments.filter((p) => p.status === "failed").length;
    const refundedCount = payments.filter((p) => p.status === "refunded").length;

    // Revenue by week (last 8 weeks)
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
          (p) =>
            p.status === "success" &&
            new Date(p.createdAt) >= start &&
            new Date(p.createdAt) <= end
        )
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      weeks.push({
        week: `${start.toISOString().split("T")[0]} — ${end.toISOString().split("T")[0]}`,
        revenue: weekRevenue,
      });
    }
    weeks.reverse();

    // Top services by payment method
    const byMethod = {};
    for (const p of payments) {
      if (p.status !== "success") continue;
      const key = p.method;
      byMethod[key] = (byMethod[key] || 0) + (p.amount || 0);
    }
    const topServices = Object.entries(byMethod)
      .map(([method, revenue]) => ({ method, revenue, count: payments.filter((p) => p.method === method && p.status === "success").length }))
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/payments/:id — payment detail
 */
router.get("/:id", async (req, res) => {
  try {
    const payment = await Payment.findOne({ _id: req.params.id });
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    if (String(payment.user) !== req.user.id && req.user.role !== "warden") {
      return res.status(403).json({ error: "Not authorized" });
    }

    let batch = null, user = null;
    if (payment.batch) batch = await LaundryBatch.findOne({ _id: payment.batch });
    user = await User.findOne({ _id: payment.user });

    res.json({ payment, batch, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/payments/:id/invoice — invoice detail view
 */
router.get("/:id/invoice", async (req, res) => {
  try {
    const payment = await Payment.findOne({ _id: req.params.id });
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    if (String(payment.user) !== req.user.id && req.user.role !== "warden") {
      return res.status(403).json({ error: "Not authorized" });
    }

    let batch = null, user = null;
    if (payment.batch) batch = await LaundryBatch.findOne({ _id: payment.batch });
    user = await User.findOne({ _id: payment.user });

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
        : { description: "(One-off payment)", itemEstimate: payment.breakdown?.items?.[0]?.type || "—" },
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/payments/:id/receipt — full receipt data for QR/print
 */
router.get("/:id/receipt", async (req, res) => {
  try {
    const payment = await Payment.findOne({ _id: req.params.id });
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    if (String(payment.user) !== req.user.id && req.user.role !== "warden") {
      return res.status(403).json({ error: "Not authorized" });
    }

    let user = null, batch = null;
    user = await User.findOne({ _id: payment.user });
    if (payment.batch) batch = await LaundryBatch.findOne({ _id: payment.batch });

    const invoiceNumber = `INV-${String(payment._id).slice(-8).toUpperCase()}`;
    const payload = {
      invoiceNumber,
      studentName: user?.name || "—",
      block: user?.hostelBlock || batch?.hostelBlock || "—",
      amount: payment.breakdown?.total || payment.amount,
      currency: payment.currency,
      status: payment.status,
      paidAt: payment.paidAt || payment.createdAt,
      issuedAt: payment.createdAt,
      qrData: `${invoiceNumber}|${payment._id}|${payment.breakdown?.total || payment.amount}`,
    };

    res.json(payload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/payments/all — admin/warden: all payments with filters
 * Query: ?status=&block=&limit=&offset=
 */
router.get("/all/admin", requireRole("warden"), async (req, res) => {
  try {
    const { status, block, limit = 50, offset = 0 } = req.query;
    let all = await Payment.find({});
    if (status) all = all.filter((p) => p.status === status);
    if (block) {
      all = all.filter((p) => {
        if (p.batch) {
          return String(p.batch.hostelBlock || "").toUpperCase() === String(block).toUpperCase();
        }
        return false;
      });
    }

    // Enrich with user + batch
    const enriched = await Promise.all(
      all.map(async (p) => {
        const u = await User.findOne({ _id: p.user });
        let b = null;
        if (p.batch) b = await LaundryBatch.findOne({ _id: p.batch });
        return {
          ...toPlain(p),
          userName: u?.name || "—",
          userEmail: u?.email || "—",
          userBlock: u?.hostelBlock || "—",
          batchDescription: b?.description || "—",
          batchStatus: b?.status || "—",
        };
      })
    );

    const totalRevenue = enriched
      .filter((p) => p.status === "success")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const total = enriched.length;
    const page = enriched.slice(Number(offset), Number(offset) + Number(limit));

    res.json({
      payments: page,
      total,
      totalRevenue,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/payments/:id/refund — admin/warden refund
 */
router.post("/:id/refund", requireRole("warden"), async (req, res) => {
  try {
    const payment = await Payment.findOne({ _id: req.params.id });
    if (!payment) return res.status(404).json({ error: "Payment not found" });

    if (payment.status === "success") {
      payment.status = "refunded";
      await payment.save();
      return res.json({ success: true, message: "Payment refunded", payment });
    }
    return res.status(400).json({ error: "Payment cannot be refunded", payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/payments/:id/cancel — user cancels pending payment
 */
router.post("/:id/cancel", async (req, res) => {
  try {
    const payment = await Payment.findOne({ _id: req.params.id });
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    if (String(payment.user) !== req.user.id) return res.status(403).json({ error: "Not authorized" });

    if (payment.status === "pending") {
      payment.status = "failed";
      await payment.save();
      return res.json({ success: true, message: "Payment cancelled", payment });
    }
    res.json({ message: "Nothing to cancel", payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
