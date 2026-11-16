/**
 * Create or promote a warden in a real (non-mock) database.
 *
 *   ADMIN_EMAIL=warden@campus.edu ADMIN_PASSWORD='...' ADMIN_NAME='Warden' \
 *     MOCK_MODE=false MONGODB_URI=mongodb://... node src/scripts/create-warden.js
 *
 * Safe to re-run: an existing account with the email is promoted to warden.
 */
import mongoose from "mongoose";
import { config } from "../config.js";
import { User } from "../models/index.js";
import { logger } from "../lib/logger.js";

const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const password = String(process.env.ADMIN_PASSWORD || "");
const name = String(process.env.ADMIN_NAME || "Warden").trim();
const block = String(process.env.ADMIN_BLOCK || "ALL").trim().toUpperCase();

async function main() {
  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required");
  }
  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters");
  }
  if (config.mockMode) {
    throw new Error("Set MOCK_MODE=false — the mock store is seeded automatically");
  }
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = "warden";
    existing.hostelBlock = block;
    existing.deletedAt = null;
    existing.emailVerified = true;
    if (name) existing.name = name;
    await existing.save();
    logger.info({ email }, "Existing account promoted to warden");
  } else {
    await User.create({
      name,
      email,
      password,
      role: "warden",
      hostelBlock: block,
      emailVerified: true,
    });
    logger.info({ email }, "Warden account created");
  }

  await mongoose.disconnect();
}

main().catch(async (err) => {
  logger.error({ err }, "Could not create warden");
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
