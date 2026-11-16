import crypto from "crypto";
import { AuthToken } from "../models/index.js";
import { config } from "../config.js";

export const TOKEN_KINDS = {
  REFRESH: "refresh",
  VERIFY: "verify",
  RESET: "reset",
};

export function hashToken(raw) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

function newRawToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function issueToken(userId, kind, ttlMs, meta = {}) {
  const raw = newRawToken();
  await AuthToken.create({
    user: userId,
    kind,
    tokenHash: hashToken(raw),
    expiresAt: new Date(Date.now() + ttlMs),
    usedAt: null,
    meta,
  });
  return raw;
}

export async function findValidToken(raw, kind) {
  if (!raw) return null;
  const doc = await AuthToken.findOne({ tokenHash: hashToken(raw), kind });
  if (!doc || doc.usedAt) return null;
  if (new Date(doc.expiresAt) <= new Date()) return null;
  return doc;
}

export async function markTokenUsed(doc) {
  if (!doc) return;
  await AuthToken.findOneAndUpdate({ _id: doc._id }, { usedAt: new Date() });
}

export async function consumeToken(raw, kind) {
  const doc = await findValidToken(raw, kind);
  if (!doc) return null;
  await markTokenUsed(doc);
  return doc;
}

export async function revokeToken(raw, kind) {
  const doc = await AuthToken.findOne({ tokenHash: hashToken(raw), kind });
  if (doc && !doc.usedAt) await markTokenUsed(doc);
}

export async function revokeAllTokens(userId, kind) {
  const docs = await AuthToken.find({ user: userId, kind });
  for (const doc of docs) {
    if (!doc.usedAt) await markTokenUsed(doc);
  }
}

export async function issueRefreshToken(userId, meta = {}) {
  return issueToken(userId, TOKEN_KINDS.REFRESH, config.refreshTokenDays * 86400000, meta);
}

const cookieOptions = () => ({
  httpOnly: true,
  sameSite: config.cookieSameSite,
  secure: config.cookieSecure,
  path: "/api/auth",
});

export function setRefreshCookie(res, rawToken) {
  res.cookie(config.cookieName, rawToken, {
    ...cookieOptions(),
    maxAge: config.refreshTokenDays * 86400000,
  });
}

export function clearRefreshCookie(res) {
  res.clearCookie(config.cookieName, cookieOptions());
}
