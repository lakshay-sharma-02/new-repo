import express from "express";
import cors from "cors";
import dotenv from "dotenv";
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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MOCK_MODE = process.env.MOCK_MODE === "true";

app.use(cors());
app.use(express.json());

// Routes
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

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", mode: MOCK_MODE ? "demo" : "live" });
});

if (MOCK_MODE) {
  // Demo mode — no MongoDB needed
  const { seedDemoData } = await import("./mock/seed.js");
  await seedDemoData();
  console.log("🎭 Running in DEMO MODE (in-memory store)");
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} else {
  // Live mode — connect to MongoDB
  const mongoose = await import("mongoose");
  mongoose
    .default.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log("Connected to MongoDB");
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err);
      process.exit(1);
    });
}
