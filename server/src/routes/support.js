import { Router } from "express";
import { Notification, User } from "../models/index.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

/**
 * POST /api/support — submit a support / contact request
 * Body: { subject, message } (name/email auto-filled from authenticated user)
 * Creates a notification for wardens so they can follow up.
 */
router.post("/", authenticate, async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message || message.trim().length < 10) {
      return res.status(400).json({ error: "Subject and a meaningful message are required" });
    }

    // Create a notification for warden(s) to triage
    const notification = await Notification.create({
      user: req.user.id,
      type: "support",
      title: `Support: ${subject}`,
      message: message.trim(),
      read: false,
    });

    // In mock mode, also log to console so it's visible during demos
    if (process.env.MOCK_MODE === "true") {
      console.log(`📨 Support ticket from ${req.user.email}: ${subject}`);
    }

    res.status(201).json({
      success: true,
      message: "Your message has been sent — we'll get back to you soon!",
      ticketId: String(notification._id).slice(-6).toUpperCase(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
