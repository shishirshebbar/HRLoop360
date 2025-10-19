import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: { type: Date, required: true },
  clockIn: { type: Date },
  clockOut: { type: Date },
  status: {
    type: String,
    enum: ["Present", "Absent", "Late", "On Leave"],
    default: "Present",
  },
  // Manager can't directly approve/reject attendance, but they monitor it
  // We include a reference for simple querying based on the manager's team
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

export default mongoose.model("Attendance", attendanceSchema);
