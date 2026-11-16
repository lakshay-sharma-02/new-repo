import mongoose from "mongoose";
import { priceFor } from "../lib/pricing.js";

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    priceSmall: {
      type: Number,
      required: true,
      default: 120,
    },
    priceMedium: {
      type: Number,
      required: true,
      default: 180,
    },
    priceLarge: {
      type: Number,
      required: true,
      default: 250,
    },
    priceXL: {
      type: Number,
      required: true,
      default: 350,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

/**
 * Look up a price for a given item size (small / medium / large / xl).
 */
serviceSchema.methods.priceFor = function (size) {
  return priceFor(this, size);
};

export default mongoose.model("Service", serviceSchema);
