/**
 * Single source of truth for laundry pricing, shared by the real (Mongoose)
 * and mock service models. The old dynamic key lookup built `priceXl` while
 * the schema field is `priceXL`, which priced XL laundry at ₹0.
 */

const SIZE_ALIASES = {
  small: "small",
  s: "small",
  medium: "medium",
  m: "medium",
  large: "large",
  l: "large",
  xl: "xl",
  "extra-large": "xl",
  "extra large": "xl",
  extralarge: "xl",
};

const PRICE_FIELDS = {
  small: "priceSmall",
  medium: "priceMedium",
  large: "priceLarge",
  xl: "priceXL",
};

export const TAX_RATE = 0.05;

/** "XL" / "extra-large" / "xl" -> "xl". Unknown sizes return null. */
export function normalizeSize(value) {
  const key = String(value ?? "").trim().toLowerCase();
  return SIZE_ALIASES[key] || null;
}

/** Rupee price for a service tier and size. */
export function priceFor(service, size) {
  const key = normalizeSize(size);
  if (!key) return 0;
  return Number(service?.[PRICE_FIELDS[key]]) || 0;
}

/** Tax and total for a discounted subtotal, rounded the same way the UI shows it. */
export function totalsFor(subtotal, discount = 0) {
  const taxable = Math.max(0, Number(subtotal) - Number(discount || 0));
  const tax = Math.round(taxable * TAX_RATE);
  return { tax, total: taxable + tax };
}
