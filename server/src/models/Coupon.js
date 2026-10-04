import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      default: null,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

/**
 * Validate this coupon against an order total.
 * Returns { valid, reason } so callers can surface a friendly error.
 */
couponSchema.methods.validateForOrder = function (orderTotal) {
  if (!this.active) return { valid: false, reason: "Coupon is no longer active" };
  if (new Date() > this.expiryDate) {
    return { valid: false, reason: "Coupon has expired" };
  }
  if (this.usageLimit !== null && this.usedCount >= this.usageLimit) {
    return { valid: false, reason: "Coupon usage limit reached" };
  }
  if (orderTotal < this.minOrderAmount) {
    return {
      valid: false,
      reason: `Minimum order of ₹${this.minOrderAmount} required for this coupon`,
    };
  }
  return { valid: true };
};

/**
 * Compute the discount amount for a given subtotal.
 */
couponSchema.methods.calculateDiscount = function (subtotal) {
  if (this.discountType === "percentage") {
    return Math.round((subtotal * this.value) / 100);
  }
  // Fixed amount — cap at subtotal so discount never goes negative
  return Math.min(this.value, subtotal);
};

export default mongoose.model("Coupon", couponSchema);
