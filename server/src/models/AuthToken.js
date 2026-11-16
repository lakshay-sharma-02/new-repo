import mongoose from "mongoose";

const authTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    kind: {
      type: String,
      enum: ["refresh", "verify", "reset"],
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    usedAt: {
      type: Date,
      default: null,
    },
    meta: {
      userAgent: { type: String, default: "" },
      ip: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

// Expired tokens are cleaned up by MongoDB automatically.
authTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("AuthToken", authTokenSchema);
