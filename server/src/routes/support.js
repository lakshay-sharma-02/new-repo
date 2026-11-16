import { Router } from "express";
import { SupportTicket, Notification, User } from "../models/index.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { validate } from "../lib/validate.js";
import { schemas } from "../lib/schemas.js";
import { AppError, asyncHandler } from "../lib/errors.js";
import { supportLimiter } from "../middleware/rateLimit.js";

const router = Router();

/**
 * POST /api/support — open a ticket. Wardens are notified (the old version
 * notified the requester, so tickets never reached anyone).
 */
router.post(
  "/",
  authenticate,
  supportLimiter,
  validate({ body: schemas.support }),
  asyncHandler(async (req, res) => {
    const ticket = await SupportTicket.create({
      user: req.user.id,
      subject: req.body.subject,
      message: req.body.message,
      status: "open",
    });

    try {
      const users = await User.find({});
      const wardens = users.filter(
        (user) => user.role === "warden" && !user.deletedAt
      );
      for (const warden of wardens) {
        await Notification.create({
          user: warden._id,
          type: "support",
          title: `Support: ${req.body.subject}`,
          message: `${req.user.name} (${req.user.email}): ${req.body.message.slice(0, 160)}`,
          batch: null,
        });
      }
    } catch {
      /* notifications are best effort */
    }

    res.status(201).json({
      success: true,
      message: "Your ticket has been sent — we'll get back to you soon!",
      ticketId: String(ticket._id).slice(-6).toUpperCase(),
      status: ticket.status,
    });
  })
);

/** GET /api/support/mine — the current user's tickets. */
router.get(
  "/mine",
  authenticate,
  asyncHandler(async (req, res) => {
    const tickets = await SupportTicket.find({ user: req.user.id });
    tickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(tickets);
  })
);

/** GET /api/support — warden queue. */
router.get(
  "/",
  authenticate,
  requireRole("warden"),
  asyncHandler(async (req, res) => {
    const { status } = req.query;
    const all = await SupportTicket.find({});
    const filtered = status ? all.filter((ticket) => ticket.status === status) : all;
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const users = await User.find({});
    const names = {};
    users.forEach((user) => {
      names[String(user._id)] = user.name;
    });

    res.json(
      filtered.map((ticket) => ({
        ...ticket,
        requesterName: names[String(ticket.user)] || "—",
      }))
    );
  })
);

/** PATCH /api/support/:id — warden updates status and replies to the student. */
router.patch(
  "/:id",
  authenticate,
  requireRole("warden"),
  validate({ body: schemas.supportUpdate }),
  asyncHandler(async (req, res) => {
    const ticket = await SupportTicket.findOne({ _id: req.params.id });
    if (!ticket) throw new AppError(404, "Ticket not found");

    ticket.status = req.body.status;
    if (req.body.response !== undefined) ticket.response = req.body.response;
    ticket.handledBy = req.user.id;
    await ticket.save();

    if (req.body.response) {
      try {
        await Notification.create({
          user: ticket.user,
          type: "support",
          title: `Support reply: ${ticket.subject}`,
          message: req.body.response,
          batch: null,
        });
      } catch {
        /* best effort */
      }
    }

    res.json(ticket);
  })
);

export default router;
