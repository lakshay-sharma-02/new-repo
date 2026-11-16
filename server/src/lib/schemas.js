import { z } from "zod";
import { normalizeSize } from "./pricing.js";
import { STAGES } from "../domain/status.js";
import { DAYS } from "../services/schedule.js";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(254)
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address");

const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password is too long")
  .regex(/[A-Za-z]/, "Password must include a letter")
  .regex(/\d/, "Password must include a number");

const name = z.string().trim().min(2, "Name is too short").max(80);

const block = z
  .string()
  .trim()
  .min(1, "Hostel block is required")
  .max(20)
  .transform((value) => value.toUpperCase())
  .refine((value) => /^[A-Z0-9][A-Z0-9 -]*$/.test(value), "Invalid hostel block");

const optionalBlock = z.union([block, z.literal("")]).optional();

const size = z
  .string()
  .min(1, "Pick a laundry size")
  .refine((value) => normalizeSize(value) !== null, "Unknown laundry size")
  .transform((value) => normalizeSize(value));

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM (24-hour)");

const id = z.string().trim().min(1).max(64);
const couponCode = z.string().trim().max(32).optional();
const method = z.enum(["upi", "card", "netbanking"]).default("upi");

export const schemas = {
  register: z.object({ name, email, password, hostelBlock: optionalBlock }),
  login: z.object({ email, password: z.string().min(1).max(72) }),
  forgotPassword: z.object({ email }),
  resetPassword: z.object({ token: z.string().regex(/^[a-f0-9]{64}$/i), password }),
  verifyEmail: z.object({ token: z.string().regex(/^[a-f0-9]{64}$/i) }),
  changePassword: z.object({
    currentPassword: z.string().min(1).max(72),
    newPassword: password,
  }),
  profile: z.object({ name: name.optional(), hostelBlock: optionalBlock }),
  adminUserPatch: z.object({
    role: z.enum(["student", "staff", "warden"]).optional(),
    hostelBlock: optionalBlock,
  }),
  batchCreate: z.object({
    description: z.string().trim().max(500).default(""),
    itemEstimate: size.optional(),
    hostelBlock: block.optional(),
  }),
  batchStatus: z.object({
    status: z.enum(STAGES),
    reason: z.string().trim().max(300).optional(),
  }),
  reportIssue: z.object({
    issueDescription: z.string().trim().min(10, "Describe the issue in at least 10 characters").max(1000),
  }),
  resolveIssue: z.object({
    response: z.string().trim().min(2, "Add a response for the student").max(1000),
  }),
  timings: z.object({
    hostelBlock: block,
    laundryDays: z.array(z.enum(DAYS)).min(1, "Pick at least one laundry day"),
    dropoffStart: time,
    dropoffEnd: time,
    pickupStart: time,
    pickupEnd: time,
    cutoffTime: time,
    turnaroundDays: z.coerce.number().int().min(1).max(14),
  }),
  calculate: z.object({
    items: z
      .array(z.object({ type: size, count: z.coerce.number().int().min(1).max(100) }))
      .max(20)
      .optional(),
    itemEstimate: size.optional(),
    couponCode,
  }),
  checkout: z.object({
    description: z.string().trim().max(500).default(""),
    itemEstimate: size,
    couponCode,
    method,
    idempotencyKey: z.string().trim().min(8).max(100).optional(),
  }),
  process: z.object({
    batchId: id,
    method,
    couponCode,
    idempotencyKey: z.string().trim().min(8).max(100).optional(),
  }),
  review: z.object({
    rating: z.coerce.number().int().min(1).max(5),
    comment: z.string().trim().max(1000).default(""),
    batch: id.optional(),
  }),
  support: z.object({
    subject: z.string().trim().min(3).max(120),
    message: z.string().trim().min(10).max(2000),
  }),
  supportUpdate: z.object({
    status: z.enum(["open", "in_progress", "resolved"]),
    response: z.string().trim().max(1000).optional(),
  }),
  serviceCreate: z.object({
    name: z.string().trim().min(2).max(60),
    priceSmall: z.coerce.number().min(0).max(100000),
    priceMedium: z.coerce.number().min(0).max(100000),
    priceLarge: z.coerce.number().min(0).max(100000),
    priceXL: z.coerce.number().min(0).max(100000),
    description: z.string().trim().max(300).default(""),
    isDefault: z.boolean().optional(),
  }),
  servicePatch: z.object({
    name: z.string().trim().min(2).max(60).optional(),
    priceSmall: z.coerce.number().min(0).max(100000).optional(),
    priceMedium: z.coerce.number().min(0).max(100000).optional(),
    priceLarge: z.coerce.number().min(0).max(100000).optional(),
    priceXL: z.coerce.number().min(0).max(100000).optional(),
    description: z.string().trim().max(300).optional(),
    isDefault: z.boolean().optional(),
  }),
  refund: z.object({ reason: z.string().trim().max(300).optional() }),
  idParams: z.object({ id }),
};
