import pino from "pino";
import { config } from "../config.js";

/** Structured JSON logger; silent during tests so suites stay readable. */
export const logger = pino({
  level: config.env === "test" ? "silent" : config.logLevel,
  base: { service: "laundry-roulette-api", env: config.env },
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "res.headers['set-cookie']",
      "password",
      "*.password",
      "token",
      "*.token",
    ],
    censor: "[redacted]",
  },
});
