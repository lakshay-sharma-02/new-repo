import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const env = process.env.NODE_ENV || "development";
const isProd = env === "production";
const DEV_SECRET = "dev-only-insecure-jwt-secret-change-me";

function num(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const config = {
  env,
  isProd,
  port: num(process.env.PORT, 5000),
  logLevel: process.env.LOG_LEVEL || (isProd ? "info" : "debug"),
  serveClient: process.env.SERVE_CLIENT === "true",
  clientDist: process.env.CLIENT_DIST || path.resolve(__dirname, "../../client/dist"),
  mockMode: process.env.MOCK_MODE === "true",
  jwtSecret: process.env.JWT_SECRET || DEV_SECRET,
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || "15m",
  refreshTokenDays: num(process.env.REFRESH_TOKEN_DAYS, 30),
  corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  cookieName: "lr_refresh",
  cookieSameSite: process.env.COOKIE_SAME_SITE || "lax",
  cookieSecure: process.env.COOKIE_SECURE
    ? process.env.COOKIE_SECURE === "true"
    : isProd,
  requireVerifiedEmail: process.env.REQUIRE_VERIFIED_EMAIL === "true",
};

/** Fail fast on unsafe production configuration. */
export function assertConfig() {
  if (!isProd) return;
  if (
    !process.env.JWT_SECRET ||
    process.env.JWT_SECRET === "your-secret-key-here" ||
    process.env.JWT_SECRET === DEV_SECRET
  ) {
    throw new Error("JWT_SECRET must be set to a strong, unique value in production");
  }
  if (config.mockMode) {
    throw new Error("MOCK_MODE must be false in production");
  }
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required in production");
  }
  if (config.cookieSameSite === "none" && !config.cookieSecure) {
    throw new Error("COOKIE_SAME_SITE=none requires COOKIE_SECURE=true");
  }
}
