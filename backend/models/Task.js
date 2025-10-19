import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  assigner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, // Should be the Manager's ID
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, // Should be the Employee's ID
  },
  dueDate: { type: Date },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed"],
    default: "Pending",
  },
  assignedOn: { type: Date, default: Date.now },
});

export default mongoose.model("Task", taskSchema);
