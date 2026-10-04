import mongoose from "mongoose";

/**
 * A laundry schedule belongs to a HOSTEL BLOCK, not to a student.
 * Staff/warden publish it; students of that block read it to submit batches.
 */
const laundryTimingsSchema = new mongoose.Schema(
  {
    // Staff/warden account that published / last edited this schedule
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    hostelBlock: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
    },
    laundryDays: {
      type: [String],
      enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      required: true,
    },
    dropoffStart: {
      type: String,
      required: true,
    },
    dropoffEnd: {
      type: String,
      required: true,
    },
    pickupStart: {
      type: String,
      required: true,
    },
    pickupEnd: {
      type: String,
      required: true,
    },
    cutoffTime: {
      type: String,
      required: true,
    },
    turnaroundDays: {
      type: Number,
      required: true,
      min: 1,
      max: 14,
    },
  },
  { timestamps: true }
);

export default mongoose.model("LaundryTimings", laundryTimingsSchema);
