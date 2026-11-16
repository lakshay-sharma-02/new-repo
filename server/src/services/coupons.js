import { Coupon, Payment } from "../models/index.js";
import { config } from "../config.js";
import { AppError } from "../lib/errors.js";

/** A coupon may only be redeemed once per student. */
export async function assertCouponReusable(coupon, userId) {
  const prior = await Payment.findOne({
    user: userId,
    "breakdown.couponCode": coupon.code,
    status: "success",
  });
  if (prior) {
    throw new AppError(400, "You've already used this coupon");
  }
}

/** Atomically reserve one redemption (mock mode has no concurrency). */
export async function reserveCoupon(coupon, subtotal) {
  const validation = coupon.validateForOrder(subtotal);
  if (!validation.valid) throw new AppError(400, validation.reason);

  if (config.mockMode) {
    if (
      coupon.usageLimit !== null &&
      coupon.usageLimit !== undefined &&
      coupon.usedCount >= coupon.usageLimit
    ) {
      throw new AppError(400, "Coupon usage limit reached");
    }
    coupon.usedCount = (coupon.usedCount || 0) + 1;
    await coupon.save();
    return;
  }

  const updated = await Coupon.findOneAndUpdate(
    {
      _id: coupon._id,
      active: true,
      expiryDate: { $gt: new Date() },
      $or: [
        { usageLimit: null },
        { usageLimit: { $exists: false } },
        { $expr: { $lt: ["$usedCount", "$usageLimit"] } },
      ],
    },
    { $inc: { usedCount: 1 } },
    { new: true }
  );
  if (!updated) throw new AppError(400, "Coupon usage limit reached");
}

/** Give a reservation back when a later step fails. */
export async function releaseCoupon(coupon) {
  if (!coupon) return;
  if (config.mockMode) {
    coupon.usedCount = Math.max(0, (coupon.usedCount || 0) - 1);
    await coupon.save();
    return;
  }
  await Coupon.findOneAndUpdate({ _id: coupon._id }, { $inc: { usedCount: -1 } });
}
