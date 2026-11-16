import { Router } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import { config } from "../config.js";
import { publicUser } from "../lib/serialize.js";
import { AppError, asyncHandler } from "../lib/errors.js";
import { schemas } from "../lib/schemas.js";
import { validate } from "../lib/validate.js";
import { authenticate } from "../middleware/auth.js";
import { requireTrustedOrigin } from "../middleware/origin.js";
import { authLimiter } from "../middleware/rateLimit.js";
import {
  TOKEN_KINDS,
  clearRefreshCookie,
  consumeToken,
  findValidToken,
  issueRefreshToken,
  issueToken,
  markTokenUsed,
  revokeAllTokens,
  revokeToken,
  setRefreshCookie,
} from "../services/authTokens.js";

const router = Router();

function signAccessToken(user) {
  return jwt.sign({ userId: String(user._id), typ: "access" }, config.jwtSecret, {
    expiresIn: config.accessTokenTtl,
  });
}

function requestMeta(req) {
  return {
    userAgent: req.headers["user-agent"] || "",
    ip: req.ip || "",
  };
}

// POST /api/auth/register
router.post(
  "/register",
  authLimiter,
  validate({ body: schemas.register }),
  asyncHandler(async (req, res) => {
    const { name, email, password, hostelBlock } = req.body;

    const existing = await User.findOne({ email });
    if (existing) throw new AppError(409, "Email already registered");

    const user = await User.create({
      name,
      email,
      password,
      hostelBlock: hostelBlock || "",
      role: "student",
      emailVerified: false,
    });

    const verifyToken = await issueToken(
      user._id,
      TOKEN_KINDS.VERIFY,
      24 * 60 * 60 * 1000
    );
    if (!config.isProd) {
      console.info(`[auth] email verification token for ${email}: ${verifyToken}`);
    }

    const refresh = await issueRefreshToken(user._id, requestMeta(req));
    setRefreshCookie(res, refresh);

    res.status(201).json({
      user: publicUser(user),
      accessToken: signAccessToken(user),
      ...(config.isProd ? {} : { verifyToken }),
    });
  })
);

// POST /api/auth/login
router.post(
  "/login",
  authLimiter,
  validate({ body: schemas.login }),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.deletedAt) {
      throw new AppError(401, "Invalid email or password");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new AppError(401, "Invalid email or password");

    const refresh = await issueRefreshToken(user._id, requestMeta(req));
    setRefreshCookie(res, refresh);

    res.json({
      user: publicUser(user),
      accessToken: signAccessToken(user),
    });
  })
);

// POST /api/auth/refresh — rotate the refresh cookie, return a new access token
router.post(
  "/refresh",
  requireTrustedOrigin,
  asyncHandler(async (req, res) => {
    const raw = req.cookies?.[config.cookieName];
    const token = await findValidToken(raw, TOKEN_KINDS.REFRESH);
    if (!token) {
      clearRefreshCookie(res);
      throw new AppError(401, "Session expired — sign in again");
    }

    const user = await User.findById(token.user);
    if (!user || user.deletedAt) {
      clearRefreshCookie(res);
      throw new AppError(401, "Account unavailable");
    }

    await markTokenUsed(token);
    const next = await issueRefreshToken(user._id, requestMeta(req));
    setRefreshCookie(res, next);

    res.json({
      user: publicUser(user),
      accessToken: signAccessToken(user),
    });
  })
);

// POST /api/auth/logout
router.post(
  "/logout",
  requireTrustedOrigin,
  asyncHandler(async (req, res) => {
    const raw = req.cookies?.[config.cookieName];
    if (raw) await revokeToken(raw, TOKEN_KINDS.REFRESH);
    clearRefreshCookie(res);
    res.json({ message: "Signed out" });
  })
);

// POST /api/auth/logout-all — revoke every refresh token for this account
router.post(
  "/logout-all",
  authenticate,
  asyncHandler(async (req, res) => {
    await revokeAllTokens(req.user.id, TOKEN_KINDS.REFRESH);
    clearRefreshCookie(res);
    res.json({ message: "Signed out of all sessions" });
  })
);

// GET /api/auth/me
router.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user || user.deletedAt) throw new AppError(401, "Account unavailable");
    res.json({ user: publicUser(user) });
  })
);

// POST /api/auth/forgot-password
router.post(
  "/forgot-password",
  authLimiter,
  validate({ body: schemas.forgotPassword }),
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    let resetToken;
    if (user && !user.deletedAt) {
      resetToken = await issueToken(user._id, TOKEN_KINDS.RESET, 60 * 60 * 1000);
      if (!config.isProd) {
        console.info(`[auth] password reset token for ${user.email}: ${resetToken}`);
      }
    }

    res.json({
      message: "If that email is registered, a reset link has been sent.",
      ...(config.isProd || !resetToken ? {} : { resetToken }),
    });
  })
);

// POST /api/auth/reset-password
router.post(
  "/reset-password",
  authLimiter,
  validate({ body: schemas.resetPassword }),
  asyncHandler(async (req, res) => {
    const token = await consumeToken(req.body.token, TOKEN_KINDS.RESET);
    if (!token) throw new AppError(400, "Reset link is invalid or has expired");

    const user = await User.findById(token.user);
    if (!user || user.deletedAt) throw new AppError(400, "Account unavailable");

    user.password = req.body.password;
    await user.save();
    await revokeAllTokens(user._id, TOKEN_KINDS.REFRESH);
    clearRefreshCookie(res);

    res.json({ message: "Password updated — sign in with your new password" });
  })
);

// POST /api/auth/verify-email
router.post(
  "/verify-email",
  validate({ body: schemas.verifyEmail }),
  asyncHandler(async (req, res) => {
    const token = await consumeToken(req.body.token, TOKEN_KINDS.VERIFY);
    if (!token) throw new AppError(400, "Verification link is invalid or has expired");

    const user = await User.findById(token.user);
    if (!user || user.deletedAt) throw new AppError(400, "Account unavailable");

    user.emailVerified = true;
    await user.save();

    res.json({ message: "Email verified", emailVerified: true });
  })
);

// POST /api/auth/resend-verification
router.post(
  "/resend-verification",
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) throw new AppError(404, "User not found");
    if (user.emailVerified) throw new AppError(400, "Email is already verified");

    const verifyToken = await issueToken(
      user._id,
      TOKEN_KINDS.VERIFY,
      24 * 60 * 60 * 1000
    );
    if (!config.isProd) {
      console.info(`[auth] email verification token for ${user.email}: ${verifyToken}`);
    }

    res.json({
      message: "Verification email sent",
      ...(config.isProd ? {} : { verifyToken }),
    });
  })
);

export default router;
