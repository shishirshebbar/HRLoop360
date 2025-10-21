import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cron from "node-cron";
import path from "path";
import { fileURLToPath } from "url";
import YAML from "yamljs";
import swaggerUi from "swagger-ui-express";

// Import routes
import runAttendanceJob from "./jobs/attendanceJob.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import hrmsRoutes from "./routes/hrmsRoutes.js";

// Env setup
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// __dirname workaround for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

console.log("DEBUG FLAG:", process.env.AI_DEBUG);

// ✅ Swagger setup
const swaggerDocument = YAML.load(path.join(__dirname, "./docs/openapi.yaml"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/users", userRoutes);
app.use("/api/hr", hrmsRoutes);

console.log(process.env.GEMINI_API_KEY);

// DB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on ${PORT}`);
  console.log(`📚 Swagger docs at http://localhost:${PORT}/api-docs`);

  // ==========================================================
  // 🎯 SCHEDULING THE ATTENDANCE JOB
  // ==========================================================

  const dailyAttendanceJob = cron.schedule(
    "0 2 * * *",
    () => {
      console.log("[Scheduler] Executing daily attendance job...");
      runAttendanceJob();
    },
    {
      scheduled: true,
      timezone: "Asia/Kolkata",
    }
  );

  dailyAttendanceJob.start();
  console.log(
    "[Scheduler] Daily attendance job successfully scheduled for 2:00 AM (Asia/Kolkata)."
  );
  // ==========================================================
});
