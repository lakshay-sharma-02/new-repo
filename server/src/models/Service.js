import mongoose from "mongoose";

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
 * Look up a price for a given item size.
 */
serviceSchema.methods.priceFor = function (size) {
  const key = `price${size.charAt(0).toUpperCase()}${size.slice(1).toLowerCase()}`;
  return this[key] || 0;
};

export default mongoose.model("Service", serviceSchema);
