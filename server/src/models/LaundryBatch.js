import mongoose from "mongoose";

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: [
        "submitted",
        "received",
        "washing",
        "drying",
        "folding",
        "ready",
        "picked_up",
      ],
      required: true,
    },
    note: { type: String, default: "" },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const laundryBatchSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hostelBlock: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
      index: true,
    },
    status: {
      type: String,
      enum: [
        "submitted",
        "received",
        "washing",
        "drying",
        "folding",
        "ready",
        "picked_up",
      ],
      default: "submitted",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    itemEstimate: {
      type: String,
      trim: true,
      default: "",
    },
    estimatedReady: {
      type: Date,
      required: true,
    },
    statusHistory: [statusHistorySchema],
    issueReported: {
      type: Boolean,
      default: false,
    },
    issueDescription: {
      type: String,
      trim: true,
      default: "",
    },
    issueResolved: {
      type: Boolean,
      default: false,
    },
    issueResponse: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// Record status changes in history — exactly one entry per transition.
laundryBatchSchema.pre("save", function (next) {
  if (this.isNew) {
    if (!this.statusHistory?.length) {
      this.statusHistory = [{ status: this.status || "submitted", updatedAt: new Date() }];
    }
  } else if (this.isModified("status")) {
    const history = this.statusHistory || [];
    const last = history[history.length - 1];
    if (!last || last.status !== this.status) {
      this.statusHistory.push({ status: this.status, updatedAt: new Date() });
    }
  }
  next();
});

export default mongoose.model("LaundryBatch", laundryBatchSchema);
