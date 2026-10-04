import { Router } from "express";
import { User, LaundryBatch, Payment } from "../models/index.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

/**
 * GET /api/users — list all users (warden only, or staff see own block)
 */
router.get("/", requireRole("warden", "staff"), async (req, res) => {
  try {
    const all = await User.find({});
    let users = all;
    // Staff can only see users in their block (plus themselves)
    if (req.user.role === "staff") {
      users = all.filter(
        (u) =>
          u.role === "staff" ||
          u.role === "warden" ||
          (u.hostelBlock || "").toUpperCase() === (req.user.hostelBlock || "").toUpperCase()
      );
    }

    // Enrich with batch count
    const enriched = await Promise.all(
      users.map(async (u) => {
        const batches = await LaundryBatch.find({ user: u._id });
        const completed = batches.filter((b) => b.status === "picked_up").length;
        const payments = await Payment.find({ user: u._id });
        const totalSpent = payments.filter((p) => p.status === "success").reduce((s, p) => s + (p.amount || 0), 0);
        return { ...u._doc, batchCount: batches.length, completedCount: completed, totalSpent };
      })
    );

    const roleBreakdown = { student: 0, staff: 0, warden: 0 };
    enriched.forEach((u) => { if (roleBreakdown[u.role] !== undefined) roleBreakdown[u.role]++; });

    res.json({ users: enriched, totalUsers: enriched.length, byRole: roleBreakdown });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH /api/users/:id/role — update user role (warden only)
 */
router.patch("/:id/role", requireRole("warden"), async (req, res) => {
  try {
    const { role } = req.body;
    if (!["student", "staff", "warden"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (String(user._id) === req.user.id) {
      return res.status(400).json({ error: "You can't change your own role" });
    }
    user.role = role;
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH /api/users/:id/block — update user hostel block (warden only)
 */
router.patch("/:id/block", requireRole("warden"), async (req, res) => {
  try {
    const { hostelBlock } = req.body;
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(404).json({ error: "User not found" });
    user.hostelBlock = (hostelBlock || "").trim().toUpperCase();
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH /api/users/:id/profile — update own profile (student name, block)
 */
router.patch("/:id/profile", authenticate, async (req, res) => {
  try {
    const { name, hostelBlock } = req.body;
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (String(user._id) !== req.user.id) {
      return res.status(403).json({ error: "Can only edit your own profile" });
    }
    if (name !== undefined) user.name = name;
    if (hostelBlock !== undefined) user.hostelBlock = hostelBlock;
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH /api/users/:id/password — change password
 */
router.patch("/:id/password", authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (String(user._id) !== req.user.id) {
      return res.status(403).json({ error: "Can only edit your own password" });
    }
    const match = await user.comparePassword(currentPassword);
    if (!match) return res.status(400).json({ error: "Current password is incorrect" });
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters" });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: "Password updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/users/:id — delete user (warden only)
 */
router.delete("/:id", requireRole("warden"), async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (String(user._id) === req.user.id) {
      return res.status(400).json({ error: "You can't delete your own account" });
    }
    // Cascade: remove user's batches, notifications, payments, reviews
    await LaundryBatch.find({ user: user._id }); // read to confirm
    await User.findOneAndDelete({ _id: user._id });
    res.json({ message: `${user.name} removed` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
