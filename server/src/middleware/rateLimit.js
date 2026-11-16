import rateLimit from "express-rate-limit";
import { config } from "../config.js";

const skip = () => config.env === "test";

const base = {
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip,
};

export const authLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 30,
  message: { error: "Too many attempts — try again in a few minutes" },
});

export const supportLimiter = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  limit: 10,
  message: { error: "Too many support requests — try again later" },
});

export const checkoutLimiter = rateLimit({
  ...base,
  windowMs: 10 * 60 * 1000,
  limit: 20,
  message: { error: "Too many checkout attempts — try again shortly" },
});

export const writeLimiter = rateLimit({
  ...base,
  windowMs: 60 * 1000,
  limit: 60,
  message: { error: "Too many requests — slow down" },
});
