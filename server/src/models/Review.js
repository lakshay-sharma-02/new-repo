import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LaundryBatch",
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1000,
    },
    // Precomputed so the public feed can show names without extra lookups
    anonymousName: {
      type: String,
      trim: true,
      default: "",
    },
    anonymous: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

/**
 * Build a friendly anonymous display name (first name + initial).
 * Called from the route handler so it works in both real and mock modes.
 */
reviewSchema.methods.setAnonymousName = function (realName) {
  if (realName && realName.trim()) {
    const parts = realName.trim().split(/\s+/);
    const first = parts[0] || "";
    const lastInitial = parts.length > 1 ? parts[parts.length - 1][0] : "";
    this.anonymousName =
      (first.charAt(0).toUpperCase() + first.slice(1)) + (lastInitial ? lastInitial.toUpperCase() + "." : "");
  } else {
    this.anonymousName = "Guest";
  }
};

export default mongoose.model("Review", reviewSchema);
