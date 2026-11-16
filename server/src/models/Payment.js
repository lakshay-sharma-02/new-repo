import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
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
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    method: {
      type: String,
      enum: ["card", "upi", "netbanking"],
      default: "upi",
    },
    paidAt: {
      type: Date,
    },
    invoiceUrl: {
      type: String,
    },
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    refundedAt: {
      type: Date,
      default: null,
    },
    refundReason: {
      type: String,
      default: "",
    },
    // Snapshot of the price breakdown for record keeping
    breakdown: {
      subtotal: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      couponCode: { type: String, default: "" },
      items: [
        {
          type: { type: String, enum: ["small", "medium", "large", "xl"], required: true },
          count: { type: Number, default: 1 },
          price: { type: Number, required: true },
        },
      ],
    },
  },
  { timestamps: true }
);

paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });

// Generate the invoice URL lazily — stored on the document for later retrieval
paymentSchema.virtual("invoiceNumber").get(function () {
  return `INV-${String(this._id).slice(-8).toUpperCase()}`;
});

paymentSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Payment", paymentSchema);
