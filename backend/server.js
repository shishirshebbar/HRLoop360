import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cron from "node-cron";
import runAttendanceJob from "./jobs/attendanceJob.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import hrmsRoutes from "./routes/hrmsRoutes.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
console.log("DEBUG FLAG:", process.env.AI_DEBUG);
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/users", userRoutes);
app.use("/api/hr", hrmsRoutes);

console.log(process.env.GEMINI_API_KEY);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err));

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on ${process.env.PORT}`);

  // ==========================================================
  // 🎯 SCHEDULING THE ATTENDANCE JOB
  // ==========================================================

  // Schedule to run every day at 2:00 AM (0 minutes, 2 hours, any day of month, any month, any day of week)
  const dailyAttendanceJob = cron.schedule(
    "0 2 * * *",
    () => {
      console.log("[Scheduler] Executing daily attendance job...");
      runAttendanceJob();
    },
    {
      // You must set a timezone for consistent execution, especially with daily jobs
      scheduled: true,
      timezone: "Asia/Kolkata",
    }
  );

  // Start the job (though it often starts by default if 'scheduled: true')
  dailyAttendanceJob.start();
  console.log(
    "[Scheduler] Daily attendance job successfully scheduled for 2:00 AM (Asia/Kolkata)."
  );
  // ==========================================================
});
