import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import crypto from "crypto";
import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import pinoHttp from "pino-http";
import { config } from "./config.js";
import { logger } from "./lib/logger.js";
import authRoutes from "./routes/auth.js";
import timingsRoutes from "./routes/timings.js";
import batchesRoutes from "./routes/batches.js";
import notificationsRoutes from "./routes/notifications.js";
import demoRoutes from "./routes/demo.js";
import paymentsRoutes from "./routes/payments.js";
import reviewsRoutes from "./routes/reviews.js";
import servicesRoutes from "./routes/services.js";
import usersRoutes from "./routes/users.js";
import adminRoutes from "./routes/admin.js";
import supportRoutes from "./routes/support.js";
import { notFound, errorHandler } from "./middleware/error.js";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || config.corsOrigins.includes(origin)) return callback(null, true);
        return callback(null, false);
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());
  app.use((req, res, next) => {
    req.id = crypto.randomUUID();
    res.setHeader("X-Request-Id", req.id);
    next();
  });
  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => req.id,
      autoLogging: { ignore: (req) => req.url === "/api/health" },
      customLogLevel: (req, res, err) => {
        if (err || res.statusCode >= 500) return "error";
        if (res.statusCode >= 400) return "warn";
        return "info";
      },
      serializers: {
        req: (req) => ({ id: req.id, method: req.method, url: req.url }),
        res: (res) => ({ statusCode: res.statusCode }),
      },
    })
  );

  app.get("/api/health", (_req, res) => {
    const db = config.mockMode
      ? "mock"
      : mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected";
    const ok = config.mockMode || db === "connected";
    res.status(ok ? 200 : 503).json({
      status: ok ? "ok" : "degraded",
      mode: config.mockMode ? "demo" : "live",
      db,
      uptime: Math.round(process.uptime()),
    });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/timings", timingsRoutes);
  app.use("/api/batches", batchesRoutes);
  app.use("/api/notifications", notificationsRoutes);
  app.use("/api/demo", demoRoutes);
  app.use("/api/payments", paymentsRoutes);
  app.use("/api/reviews", reviewsRoutes);
  app.use("/api/services", servicesRoutes);
  app.use("/api/users", usersRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/support", supportRoutes);

  // Single-container deployment: serve the built SPA from the API process.
  if (config.serveClient) {
    const indexPath = path.join(config.clientDist, "index.html");
    app.use(
      express.static(config.clientDist, {
        index: false,
        maxAge: config.isProd ? "1y" : 0,
        setHeaders: (res, filePath) => {
          if (filePath.endsWith("index.html")) res.setHeader("Cache-Control", "no-cache");
        },
      })
    );
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) return next();
      if (!fs.existsSync(indexPath)) {
        return res.status(503).json({ error: "Client build not found" });
      }
      return res.sendFile(indexPath);
    });
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

export const app = createApp();

export default app;
