import { AppError } from "../lib/errors.js";
import { config } from "../config.js";

const norm = (value) => String(value || "").trim().toUpperCase();

export const ROLES = ["student", "staff", "warden"];

export function isWarden(user) {
  return user?.role === "warden";
}

export function isStaff(user) {
  return user?.role === "staff";
}

/** Warden manages every block; staff only their own non-empty block. */
export function canManageBlock(user, block) {
  if (isWarden(user)) return true;
  if (!isStaff(user)) return false;
  const own = norm(user.hostelBlock);
  return Boolean(own) && own === norm(block);
}

export function isManager(user, batch) {
  if (isWarden(user)) return true;
  if (!isStaff(user)) return false;
  const block = norm(batch?.hostelBlock);
  return Boolean(block) && block === norm(user.hostelBlock);
}

export function canViewBatch(user, batch) {
  return String(batch?.user) === user.id || isManager(user, batch);
}

export function assertManager(user, batch) {
  if (!isManager(user, batch)) {
    throw new AppError(403, "You can't manage this batch");
  }
}

export function assertVerified(user) {
  if (config.requireVerifiedEmail && !user.emailVerified) {
    throw new AppError(403, "Verify your email address before paying");
  }
}
