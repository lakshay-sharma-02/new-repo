import { Coupon, Service } from "../models/index.js";
import { normalizeSize, priceFor, totalsFor } from "../lib/pricing.js";
import { AppError } from "../lib/errors.js";

/** The active service tier, created on demand if none exists. */
export async function resolveService() {
  const all = await Service.find({});
  const existing = all.find((service) => service.isDefault) || all[0];
  if (existing) return existing;
  return Service.create({
    name: "Standard",
    priceSmall: 120,
    priceMedium: 180,
    priceLarge: 250,
    priceXL: 350,
    description: "Standard laundry service",
    isDefault: true,
  });
}

/**
 * Price a cart (or a single size) against the active service tier.
 * Returns the coupon document too, so the caller can reserve it.
 */
export async function buildQuote({ items, itemEstimate, couponCode }) {
  const service = await resolveService();

  let breakdown = [];
  if (Array.isArray(items) && items.length > 0) {
    breakdown = items.map((item) => {
      const type = normalizeSize(item.type);
      if (!type) throw new AppError(400, `Unknown laundry size "${item.type}"`);
      const count = Math.max(1, Math.floor(Number(item.count) || 1));
      return { type, count, price: priceFor(service, type) };
    });
  } else {
    const type = normalizeSize(itemEstimate) || "medium";
    breakdown = [{ type, count: 1, price: priceFor(service, type) }];
  }

  const subtotal = breakdown.reduce((sum, item) => sum + item.price * item.count, 0);

  let coupon = null;
  let discount = 0;
  let appliedCode = "";
  if (couponCode) {
    coupon = await Coupon.findOne({ code: String(couponCode).toUpperCase() });
    if (!coupon) throw new AppError(400, "Coupon not found");
    const validation = coupon.validateForOrder(subtotal);
    if (!validation.valid) throw new AppError(400, validation.reason);
    discount = coupon.calculateDiscount(subtotal);
    appliedCode = coupon.code;
  }

  const { tax, total } = totalsFor(subtotal, discount);

  return {
    service: { name: service.name, description: service.description },
    items: breakdown,
    subtotal,
    discount,
    tax,
    total,
    coupon,
    couponCode: appliedCode,
  };
}
