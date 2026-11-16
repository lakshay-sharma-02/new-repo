import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import { config, assertConfig } from "./config.js";
import { createApp } from "./app.js";
import { logger } from "./lib/logger.js";

async function boot() {
  assertConfig();

  if (config.serveClient) {
    const indexPath = path.join(config.clientDist, "index.html");
    if (!fs.existsSync(indexPath)) {
      throw new Error(
        `SERVE_CLIENT=true but no client build at ${indexPath} — run the client build or set CLIENT_DIST.`
      );
    }
  }

  if (config.mockMode) {
    const { seedDemoData } = await import("./mock/seed.js");
    await seedDemoData();
    logger.warn("Running in DEMO MODE (in-memory store) — do not use for real data");
  } else {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info("Connected to MongoDB");
  }

  const app = createApp();
  const server = app.listen(config.port, () => {
    logger.info(
      { port: config.port, serveClient: config.serveClient },
      "Server listening"
    );
  });

  const shutdown = (signal) => {
    logger.info({ signal }, "Shutting down");
    server.close(async () => {
      await mongoose.disconnect().catch(() => {});
      process.exit(0);
    });
    // Don't hang forever on a stuck connection.
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("unhandledRejection", (err) => {
    logger.error({ err }, "Unhandled rejection");
  });
}

boot().catch((err) => {
  logger.error({ err }, "Failed to start server");
  process.exit(1);
});
