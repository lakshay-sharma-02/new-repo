import { Router } from "express";
import { Notification } from "../models/index.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

// GET /api/notifications — my notifications, newest first
router.get("/", async (req, res) => {
  try {
    const all = await Notification.find({ user: req.user.id });
    all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const unreadCount = all.filter((n) => !n.read).length;
    res.json({ items: all.slice(0, 25), unreadCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/notifications/:id/read — mark one as read
router.patch("/:id/read", async (req, res) => {
  try {
    const n = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { read: true },
      { new: true }
    );
    if (!n) return res.status(404).json({ error: "Notification not found" });
    res.json(n);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/notifications/read-all — mark everything read
router.patch("/read-all", async (req, res) => {
  try {
    const all = await Notification.find({ user: req.user.id, read: false });
    for (const n of all) {
      await Notification.findOneAndUpdate({ _id: n._id, user: req.user.id }, { read: true });
    }
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
