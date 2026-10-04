import { Router } from "express";
import { User, LaundryBatch, Payment, Service, Coupon, Review } from "../models/index.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);
router.use(requireRole("warden"));

const ORDER = ["submitted", "received", "washing", "drying", "folding", "ready", "picked_up"];

/* ---------- Users (admin namespace) ---------- */

/**
 * GET /api/admin/users — list all users
 * Returns: name, email, role, block, join date
 */
router.get("/users", async (req, res) => {
  try {
    const { role } = req.query;
    let users = await User.find({});

    if (role) {
      users = users.filter((u) => u.role === role);
    }

    res.json(
      users.map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        hostelBlock: u.hostelBlock,
        createdAt: u.createdAt,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/users/:id — user detail
 */
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const batches = await LaundryBatch.find({ user: user._id });
    const payments = await Payment.find({ user: user._id });

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      hostelBlock: user.hostelBlock,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      stats: {
        batchCount: batches.length,
        paidAmount: payments.filter((p) => p.status === "success").reduce((s, p) => s + p.amount, 0),
        pendingBatches: batches.filter((b) => b.status !== "picked_up").length,
      },
      batches: batches.map((b) => ({
        _id: b._id,
        status: b.status,
        hostelBlock: b.hostelBlock,
        description: b.description,
        createdAt: b.createdAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH /api/admin/users/:id — update role or block
 */
router.patch("/users/:id", async (req, res) => {
  try {
    const { role, hostelBlock } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (role) {
      const validRoles = ["student", "staff", "warden"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }
      user.role = role;
    }
    if (hostelBlock !== undefined) {
      user.hostelBlock = hostelBlock || "";
    }

    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      hostelBlock: user.hostelBlock,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/admin/users/:id — remove a user
 */
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Don't allow removing the last warden
    if (user.role === "warden") {
      const wardens = (await User.find({})).filter((u) => u.role === "warden");
      if (wardens.length <= 1) {
        return res.status(400).json({ error: "Cannot remove the last warden" });
      }
    }

    await User.findOneAndDelete({ _id: user._id });
    res.json({ message: "User removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------- Services (admin namespace) ---------- */

/**
 * GET /api/admin/services — list all service tiers
 */
router.get("/services", async (req, res) => {
  try {
    const services = await Service.find({});
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/admin/services — add a new service tier
 */
router.post("/services", async (req, res) => {
  try {
    const { name, priceSmall, priceMedium, priceLarge, priceXL, description, isDefault } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Service name is required" });
    }

    // If isDefault, unset default on others
    let services = await Service.find({});
    if (isDefault) {
      for (const s of services) {
        if (s.isDefault) {
          s.isDefault = false;
          await s.save();
        }
      }
    }

    const service = await Service.create({
      name,
      priceSmall: priceSmall || 120,
      priceMedium: priceMedium || 180,
      priceLarge: priceLarge || 250,
      priceXL: priceXL || 350,
      description: description || "",
      isDefault: isDefault || services.length === 0,
    });

    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH /api/admin/services/:id — update a service tier
 */
router.patch("/services/:id", async (req, res) => {
  try {
    const { name, priceSmall, priceMedium, priceLarge, priceXL, description, isDefault } = req.body;
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ error: "Service not found" });

    if (isDefault && !service.isDefault) {
      const others = await Service.find({});
      for (const s of others) {
        if (s._id !== service._id && s.isDefault) {
          s.isDefault = false;
          await s.save();
        }
      }
    }

    if (name !== undefined) service.name = name;
    if (priceSmall !== undefined) service.priceSmall = Number(priceSmall);
    if (priceMedium !== undefined) service.priceMedium = Number(priceMedium);
    if (priceLarge !== undefined) service.priceLarge = Number(priceLarge);
    if (priceXL !== undefined) service.priceXL = Number(priceXL);
    if (description !== undefined) service.description = description;
    if (isDefault !== undefined) service.isDefault = isDefault;

    await service.save();
    res.json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/admin/services/:id — remove a service tier
 */
router.delete("/services/:id", async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ error: "Service not found" });

    await Service.findOneAndDelete({ _id: service._id });
    res.json({ message: "Service tier removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------- Analytics ---------- */

/**
 * GET /api/admin/analytics — dashboard metrics
 * Returns: total batches, revenue, avg processing time, issues by day
 */
router.get("/analytics", async (req, res) => {
  try {
    const batches = await LaundryBatch.find({});
    const payments = await Payment.find({});

    // Total revenue
    const totalRevenue = payments
      .filter((p) => p.status === "success")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    // Average processing time (from submitted to picked_up) in hours
    let totalHours = 0;
    let completedCount = 0;
    for (const b of batches) {
      if (b.status === "picked_up" && b.statusHistory && b.statusHistory.length >= 2) {
        const submitted = new Date(b.statusHistory[0].updatedAt || b.createdAt);
        const pickedUp = b.statusHistory.find((h) => h.status === "picked_up")?.updatedAt;
        if (submitted && pickedUp) {
          const hours = (new Date(pickedUp) - new Date(submitted)) / (1000 * 3600);
          totalHours += hours;
          completedCount++;
        }
      }
    }
    const avgProcessingHours = completedCount > 0 ? Math.round((totalHours / completedCount) * 10) / 10 : 0;

    // Issues by day (last 7 days)
    const now = new Date();
    const issuesByDay = [];
    for (let d = 6; d >= 0; d--) {
      const date = new Date(now);
      date.setDate(date.getDate() - d);
      date.setHours(0, 0, 0, 0);
      const next = new Date(date);
      next.setDate(next.getDate() + 1);

      const count = batches.filter(
        (b) =>
          b.issueReported &&
          new Date(b.createdAt) >= date &&
          new Date(b.createdAt) < next
      ).length;

      issuesByDay.push({
        date: date.toISOString().split("T")[0],
        count,
      });
    }

    // Batches by status
    const batchesByStatus = {};
    for (const s of ORDER) {
      batchesByStatus[s] = batches.filter((b) => b.status === s).length;
    }

    // Revenue by block
    const revenueByBlock = {};
    for (const p of payments) {
      if (p.status !== "success") continue;
      let block = "Unknown";
      if (p.batch) {
        const batch = batches.find((b) => String(b._id) === String(p.batch));
        if (batch) block = batch.hostelBlock || "Unknown";
      }
      revenueByBlock[block] = (revenueByBlock[block] || 0) + (p.amount || 0);
    }

    // User stats
    const users = await User.find({});
    const usersByRole = {};
    for (const u of users) {
      usersByRole[u.role] = (usersByRole[u.role] || 0) + 1;
    }

    res.json({
      totalBatches: batches.length,
      completedBatches: batchesByStatus.picked_up,
      activeBatches: batches.filter((b) => b.status !== "picked_up" && b.status !== "submitted").length,
      totalRevenue,
      avgProcessingHours,
      batchesByStatus,
      issuesByDay,
      revenueByBlock,
      usersByRole,
      totalUsers: users.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
