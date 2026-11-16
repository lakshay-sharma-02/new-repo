import { User } from "../models/index.js";
import { AppError } from "../lib/errors.js";

async function activeWardens() {
  const all = await User.find({});
  return all.filter((user) => user.role === "warden" && !user.deletedAt);
}

async function assertNotLastWarden(target) {
  const wardens = await activeWardens();
  if (wardens.length <= 1 && String(wardens[0]?._id) === String(target._id)) {
    throw new AppError(400, "Cannot remove or demote the last warden");
  }
}

export async function assertCanChangeRole(actor, target, nextRole) {
  if (String(target._id) === actor.id && nextRole !== target.role) {
    throw new AppError(400, "You can't change your own role");
  }
  if (target.role === "warden" && nextRole !== "warden") {
    await assertNotLastWarden(target);
  }
}

export async function assertCanDeleteUser(actor, target) {
  if (String(target._id) === actor.id) {
    throw new AppError(400, "You can't delete your own account");
  }
  if (target.role === "warden") {
    await assertNotLastWarden(target);
  }
}

/**
 * Soft delete: keep batches/payments/reviews for the historical record, but
 * remove the account's identity and login ability.
 */
export async function anonymizeAndDelete(user) {
  user.deletedAt = new Date();
  user.name = "Deleted user";
  user.email = `deleted-${String(user._id)}@invalid.local`;
  user.hostelBlock = "";
  await user.save();
}
