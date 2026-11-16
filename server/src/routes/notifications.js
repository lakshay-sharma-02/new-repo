import { Router } from "express";
import { Notification } from "../models/index.js";
import { authenticate } from "../middleware/auth.js";
import { AppError, asyncHandler } from "../lib/errors.js";

const router = Router();
router.use(authenticate);

// GET /api/notifications — my notifications, newest first
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const all = await Notification.find({ user: req.user.id });
    all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const unreadCount = all.filter((notification) => !notification.read).length;
    res.json({ items: all.slice(0, 25), unreadCount });
  })
);

// PATCH /api/notifications/read-all — must be declared before /:id/read
router.patch(
  "/read-all",
  asyncHandler(async (req, res) => {
    const unread = await Notification.find({ user: req.user.id, read: false });
    for (const notification of unread) {
      await Notification.findOneAndUpdate(
        { _id: notification._id, user: req.user.id },
        { read: true }
      );
    }
    res.json({ message: "All notifications marked as read" });
  })
);

// PATCH /api/notifications/:id/read
router.patch(
  "/:id/read",
  asyncHandler(async (req, res) => {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { read: true },
      { new: true }
    );
    if (!notification) throw new AppError(404, "Notification not found");
    res.json(notification);
  })
);

export default router;
