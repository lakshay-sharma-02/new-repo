import { Router } from "express";
import { User, LaundryBatch, Payment } from "../models/index.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { publicUser } from "../lib/serialize.js";
import { schemas } from "../lib/schemas.js";
import { validate } from "../lib/validate.js";
import { AppError, asyncHandler } from "../lib/errors.js";
import {
  assertCanChangeRole,
  assertCanDeleteUser,
  anonymizeAndDelete,
} from "../services/users.js";
import {
  TOKEN_KINDS,
  clearRefreshCookie,
  revokeAllTokens,
} from "../services/authTokens.js";

const router = Router();
router.use(authenticate);

/**
 * GET /api/users — warden sees everyone; staff see their block plus staff/warden.
 */
router.get(
  "/",
  requireRole("warden", "staff"),
  asyncHandler(async (req, res) => {
    const all = await User.find({});
    let users = all.filter((user) => !user.deletedAt);

    if (req.user.role === "staff") {
      users = users.filter(
        (user) =>
          user.role === "staff" ||
          user.role === "warden" ||
          (user.hostelBlock || "").toUpperCase() ===
            (req.user.hostelBlock || "").toUpperCase()
      );
    }

    const enriched = await Promise.all(
      users.map(async (user) => {
        const batches = await LaundryBatch.find({ user: user._id });
        const completed = batches.filter((batch) => batch.status === "picked_up").length;
        const payments = await Payment.find({ user: user._id });
        const totalSpent = payments
          .filter((payment) => payment.status === "success")
          .reduce((sum, payment) => sum + (payment.amount || 0), 0);
        return {
          ...publicUser(user),
          batchCount: batches.length,
          completedCount: completed,
          totalSpent,
        };
      })
    );

    const byRole = { student: 0, staff: 0, warden: 0 };
    enriched.forEach((user) => {
      if (byRole[user.role] !== undefined) byRole[user.role]++;
    });

    res.json({ users: enriched, totalUsers: enriched.length, byRole });
  })
);

/**
 * PATCH /api/users/:id/role — warden only, with last-warden protection.
 */
router.patch(
  "/:id/role",
  requireRole("warden"),
  validate({ body: schemas.adminUserPatch }),
  asyncHandler(async (req, res) => {
    const { role } = req.body;
    if (!role) throw new AppError(400, "Role is required");

    const user = await User.findOne({ _id: req.params.id });
    if (!user || user.deletedAt) throw new AppError(404, "User not found");

    await assertCanChangeRole(req.user, user, role);

    user.role = role;
    await user.save();
    res.json(publicUser(user));
  })
);

/**
 * PATCH /api/users/:id/block — warden only.
 */
router.patch(
  "/:id/block",
  requireRole("warden"),
  validate({ body: schemas.adminUserPatch }),
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ _id: req.params.id });
    if (!user || user.deletedAt) throw new AppError(404, "User not found");

    user.hostelBlock = req.body.hostelBlock || "";
    await user.save();
    res.json(publicUser(user));
  })
);

/**
 * PATCH /api/users/:id/profile — own profile only. Staff/warden blocks are
 * managed by a warden, not self-service.
 */
router.patch(
  "/:id/profile",
  validate({ body: schemas.profile }),
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ _id: req.params.id });
    if (!user || user.deletedAt) throw new AppError(404, "User not found");
    if (String(user._id) !== req.user.id) {
      throw new AppError(403, "Can only edit your own profile");
    }

    if (req.body.name !== undefined) user.name = req.body.name;
    if (req.body.hostelBlock !== undefined) {
      if (req.user.role !== "student") {
        throw new AppError(403, "Block changes for staff are managed by a warden");
      }
      user.hostelBlock = req.body.hostelBlock;
    }

    await user.save();
    res.json(publicUser(user));
  })
);

/**
 * PATCH /api/users/:id/password — own password only; revokes all sessions.
 */
router.patch(
  "/:id/password",
  validate({ body: schemas.changePassword }),
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findOne({ _id: req.params.id });
    if (!user || user.deletedAt) throw new AppError(404, "User not found");
    if (String(user._id) !== req.user.id) {
      throw new AppError(403, "Can only edit your own password");
    }

    const match = await user.comparePassword(currentPassword);
    if (!match) throw new AppError(400, "Current password is incorrect");

    if (await user.comparePassword(newPassword)) {
      throw new AppError(400, "New password must be different from the current one");
    }

    user.password = newPassword;
    await user.save();

    await revokeAllTokens(user._id, TOKEN_KINDS.REFRESH);
    clearRefreshCookie(res);

    res.json({ message: "Password updated — sign in again" });
  })
);

/**
 * DELETE /api/users/:id — warden only, soft delete + token revocation.
 */
router.delete(
  "/:id",
  requireRole("warden"),
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ _id: req.params.id });
    if (!user || user.deletedAt) throw new AppError(404, "User not found");

    await assertCanDeleteUser(req.user, user);
    await anonymizeAndDelete(user);
    await revokeAllTokens(user._id, TOKEN_KINDS.REFRESH);

    res.json({ message: `${user.name} removed` });
  })
);

export default router;
