import { Router } from "express";
import { User, LaundryBatch, Payment, Service } from "../models/index.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { validate } from "../lib/validate.js";
import { schemas } from "../lib/schemas.js";
import { AppError, asyncHandler } from "../lib/errors.js";
import { STAGES } from "../domain/status.js";
import {
  assertCanChangeRole,
  assertCanDeleteUser,
  anonymizeAndDelete,
} from "../services/users.js";
import { TOKEN_KINDS, revokeAllTokens } from "../services/authTokens.js";

const router = Router();
router.use(authenticate);
router.use(requireRole("warden"));

/* ---------- Users ---------- */

router.get(
  "/users",
  asyncHandler(async (req, res) => {
    const { role } = req.query;
    const all = await User.find({});
    let users = all.filter((user) => !user.deletedAt);
    if (role) users = users.filter((user) => user.role === role);

    res.json(
      users.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hostelBlock: user.hostelBlock,
        emailVerified: Boolean(user.emailVerified),
        createdAt: user.createdAt,
      }))
    );
  })
);

router.get(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user || user.deletedAt) throw new AppError(404, "User not found");

    const batches = await LaundryBatch.find({ user: user._id });
    const payments = await Payment.find({ user: user._id });

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      hostelBlock: user.hostelBlock,
      emailVerified: Boolean(user.emailVerified),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      stats: {
        batchCount: batches.length,
        paidAmount: payments
          .filter((payment) => payment.status === "success")
          .reduce((sum, payment) => sum + payment.amount, 0),
        pendingBatches: batches.filter((batch) => batch.status !== "picked_up").length,
      },
      batches: batches.map((batch) => ({
        _id: batch._id,
        status: batch.status,
        hostelBlock: batch.hostelBlock,
        description: batch.description,
        createdAt: batch.createdAt,
      })),
    });
  })
);

router.patch(
  "/users/:id",
  validate({ body: schemas.adminUserPatch }),
  asyncHandler(async (req, res) => {
    const { role, hostelBlock } = req.body;

    const user = await User.findById(req.params.id);
    if (!user || user.deletedAt) throw new AppError(404, "User not found");

    if (role) await assertCanChangeRole(req.user, user, role);

    if (role) user.role = role;
    if (hostelBlock !== undefined) user.hostelBlock = hostelBlock || "";

    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      hostelBlock: user.hostelBlock,
    });
  })
);

router.delete(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user || user.deletedAt) throw new AppError(404, "User not found");

    const name = user.name;
    await assertCanDeleteUser(req.user, user);
    await anonymizeAndDelete(user);
    await revokeAllTokens(user._id, TOKEN_KINDS.REFRESH);

    res.json({ message: `${name} removed` });
  })
);

/* ---------- Services ---------- */

router.get(
  "/services",
  asyncHandler(async (_req, res) => {
    res.json(await Service.find({}));
  })
);

router.post(
  "/services",
  validate({ body: schemas.serviceCreate }),
  asyncHandler(async (req, res) => {
    const { name, priceSmall, priceMedium, priceLarge, priceXL, description, isDefault } =
      req.body;

    const services = await Service.find({});
    if (isDefault) {
      for (const service of services) {
        if (service.isDefault) {
          service.isDefault = false;
          await service.save();
        }
      }
    }

    const created = await Service.create({
      name,
      priceSmall,
      priceMedium,
      priceLarge,
      priceXL,
      description,
      isDefault: Boolean(isDefault) || services.length === 0,
    });

    res.status(201).json(created);
  })
);

router.patch(
  "/services/:id",
  validate({ body: schemas.servicePatch }),
  asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id);
    if (!service) throw new AppError(404, "Service not found");

    if (req.body.isDefault && !service.isDefault) {
      const others = await Service.find({});
      for (const other of others) {
        if (String(other._id) !== String(service._id) && other.isDefault) {
          other.isDefault = false;
          await other.save();
        }
      }
    }

    for (const field of [
      "name",
      "priceSmall",
      "priceMedium",
      "priceLarge",
      "priceXL",
      "description",
      "isDefault",
    ]) {
      if (req.body[field] !== undefined) service[field] = req.body[field];
    }

    await service.save();
    res.json(service);
  })
);

router.delete(
  "/services/:id",
  asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id);
    if (!service) throw new AppError(404, "Service not found");
    if (service.isDefault) {
      throw new AppError(400, "Cannot delete the default service tier");
    }

    await Service.findOneAndDelete({ _id: service._id });
    res.json({ message: "Service tier removed" });
  })
);

/* ---------- Analytics ---------- */

router.get(
  "/analytics",
  asyncHandler(async (_req, res) => {
    const batches = await LaundryBatch.find({});
    const payments = await Payment.find({});

    const totalRevenue = payments
      .filter((payment) => payment.status === "success")
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);

    let totalHours = 0;
    let completedCount = 0;
    for (const batch of batches) {
      if (batch.status !== "picked_up" || !batch.statusHistory?.length) continue;
      const submitted = new Date(
        batch.statusHistory[0].updatedAt || batch.createdAt
      );
      const pickedUp = batch.statusHistory.find(
        (entry) => entry.status === "picked_up"
      )?.updatedAt;
      if (submitted && pickedUp) {
        totalHours += (new Date(pickedUp) - submitted) / (1000 * 3600);
        completedCount++;
      }
    }

    const now = new Date();
    const issuesByDay = [];
    for (let d = 6; d >= 0; d--) {
      const date = new Date(now);
      date.setDate(date.getDate() - d);
      date.setHours(0, 0, 0, 0);
      const next = new Date(date);
      next.setDate(next.getDate() + 1);

      issuesByDay.push({
        date: date.toISOString().split("T")[0],
        count: batches.filter(
          (batch) =>
            batch.issueReported &&
            new Date(batch.createdAt) >= date &&
            new Date(batch.createdAt) < next
        ).length,
      });
    }

    const batchesByStatus = {};
    for (const stage of STAGES) {
      batchesByStatus[stage] = batches.filter((batch) => batch.status === stage).length;
    }

    const revenueByBlock = {};
    for (const payment of payments) {
      if (payment.status !== "success") continue;
      const batch = payment.batch
        ? batches.find((item) => String(item._id) === String(payment.batch))
        : null;
      const block = batch?.hostelBlock || "Unknown";
      revenueByBlock[block] = (revenueByBlock[block] || 0) + (payment.amount || 0);
    }

    const users = await User.find({});
    const activeUsers = users.filter((user) => !user.deletedAt);
    const usersByRole = {};
    for (const user of activeUsers) {
      usersByRole[user.role] = (usersByRole[user.role] || 0) + 1;
    }

    res.json({
      totalBatches: batches.length,
      completedBatches: batchesByStatus.picked_up,
      activeBatches: batches.filter(
        (batch) => batch.status !== "picked_up" && batch.status !== "submitted"
      ).length,
      openIssues: batches.filter(
        (batch) => batch.issueReported && !batch.issueResolved
      ).length,
      totalRevenue,
      avgProcessingHours:
        completedCount > 0
          ? Math.round((totalHours / completedCount) * 10) / 10
          : 0,
      batchesByStatus,
      issuesByDay,
      revenueByBlock,
      usersByRole,
      totalUsers: activeUsers.length,
    });
  })
);

export default router;
