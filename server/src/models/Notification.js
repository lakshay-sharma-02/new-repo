import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      default: "system",
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      default: "",
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LaundryBatch",
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
