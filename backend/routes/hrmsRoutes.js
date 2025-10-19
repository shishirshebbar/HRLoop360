import express from "express";
import { protect, allowRoles } from "../middleware/authMiddleware.js";
import Leave from "../models/Leave.js";
import Task from "../models/Task.js";
import Attendance from "../models/Attendance.js";
import User from "../models/User.js"; // Needed for checking manager and employee details

const router = express.Router();

// ===================================
// 1. LEAVE MANAGEMENT ROUTES
// ===================================

// EMPLOYEE: Submit a new leave request
router.post(
  "/leave/request",
  protect,
  allowRoles("Employee"),
  async (req, res) => {
    try {
      const { startDate, endDate, reason, type } = req.body;
      const employeeId = req.user.id;

      // 1. Fetch employee to get their assigned manager
      const employee = await User.findById(employeeId);

      if (!employee || !employee.manager) {
        return res.status(400).json({
          message:
            "You must have an assigned manager to submit a leave request.",
        });
      }

      const newLeave = await Leave.create({
        employee: employeeId,
        manager: employee.manager,
        startDate,
        endDate,
        reason,
        type,
      });

      res.status(201).json(newLeave);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// EMPLOYEE: Get their own leave history
router.get(
  "/leave/history",
  protect,
  allowRoles("Employee"),
  async (req, res) => {
    try {
      const history = await Leave.find({ employee: req.user.id }).sort({
        appliedOn: -1,
      });
      res.json(history);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// MANAGER: Get pending leave requests for their direct reports
router.get(
  "/leave/approvals",
  protect,
  allowRoles("Senior Manager"),
  async (req, res) => {
    try {
      const pendingRequests = await Leave.find({
        manager: req.user.id,
        status: "Pending",
      }).populate("employee", "name email"); // Populate employee details for display

      res.json(pendingRequests);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// MANAGER: Update leave request status (Approve/Reject)
router.patch(
  "/leave/approve/:leaveId",
  protect,
  allowRoles("Senior Manager"),
  async (req, res) => {
    try {
      const { status } = req.body; // status should be 'Approved' or 'Rejected'
      const managerId = req.user.id;

      const updatedLeave = await Leave.findOneAndUpdate(
        { _id: req.params.leaveId, manager: managerId, status: "Pending" }, // Only managers can update their own team's PENDING requests
        { status },
        { new: true }
      );

      if (!updatedLeave) {
        return res
          .status(404)
          .json({ message: "Leave request not found or already processed." });
      }

      res.json(updatedLeave);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ===================================
// 2. TASK MANAGEMENT ROUTES
// ===================================

// MANAGER: Assign a new task
router.post(
  "/task/assign",
  protect,
  allowRoles("Senior Manager"),
  async (req, res) => {
    try {
      const { title, description, assigneeId, dueDate } = req.body;
      const assignerId = req.user.id; // Manager is the assigner

      // Basic validation: ensure the assignee is a direct report (optional but good practice)
      const employee = await User.findOne({
        _id: assigneeId,
        manager: assignerId,
      });
      if (!employee) {
        return res.status(400).json({
          message: "Cannot assign task: User not found or not a direct report.",
        });
      }

      const newTask = await Task.create({
        title,
        description,
        assigner: assignerId,
        assignee: assigneeId,
        dueDate,
      });

      res.status(201).json(newTask);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// EMPLOYEE: Get tasks assigned to them
router.get(
  "/task/allocated",
  protect,
  allowRoles("Employee"),
  async (req, res) => {
    try {
      const tasks = await Task.find({ assignee: req.user.id }).sort({
        dueDate: 1,
      });
      res.json(tasks);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// EMPLOYEE: Update task status (e.g., set to 'Completed')
router.patch(
  "/task/update/:taskId",
  protect,
  allowRoles("Employee"),
  async (req, res) => {
    try {
      const { status } = req.body; // e.g., 'In Progress', 'Completed'

      const updatedTask = await Task.findOneAndUpdate(
        { _id: req.params.taskId, assignee: req.user.id }, // Ensure employee can only update their own tasks
        { status },
        { new: true }
      );

      if (!updatedTask) {
        return res
          .status(404)
          .json({ message: "Task not found or you are not the assignee." });
      }

      res.json(updatedTask);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// MANAGER: Monitor tasks for their direct reports
router.get(
  "/task/monitoring",
  protect,
  allowRoles("Senior Manager"),
  async (req, res) => {
    try {
      const tasks = await Task.find({ assigner: req.user.id })
        .populate("assignee", "name email")
        .sort({ assignedOn: -1 });

      res.json(tasks);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ===================================
// 3. ATTENDANCE ROUTES
// ===================================

// EMPLOYEE: Submit clock-in
router.post(
  "/attendance/clock-in",
  protect,
  allowRoles("Employee"),
  async (req, res) => {
    try {
      const employeeId = req.user.id;
      const employee = await User.findById(employeeId); // Use the start of the current day for the date field

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Check if employee already clocked in today

      const existing = await Attendance.findOne({
        employee: employeeId,
        date: today,
      });
      if (existing) {
        return res.status(400).json({ message: "Already clocked in today." });
      }

      const newAttendance = await Attendance.create({
        employee: employeeId,
        manager: employee?.manager || null,
        date: today,
        clockIn: new Date(), // Current time for clock-in
        status: "Present", // Initial status
      });

      res
        .status(201)
        .json({ message: "Clock-in recorded.", attendance: newAttendance });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// EMPLOYEE: Submit clock-out
router.patch(
  "/attendance/clock-out",
  protect,
  allowRoles("Employee"),
  async (req, res) => {
    try {
      const employeeId = req.user.id; // 1. Calculate the start of today and the start of tomorrow for robust range filtering

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const startOfTomorrow = new Date(startOfToday);
      startOfTomorrow.setDate(startOfTomorrow.getDate() + 1); // Add one day

      const attendanceRecord = await Attendance.findOneAndUpdate(
        {
          employee: employeeId, // *** USE $gte and $lt FOR ROBUST DATE FILTERING ***
          date: {
            $gte: startOfToday, // Greater than or equal to 00:00:00 today
            $lt: startOfTomorrow, // Less than 00:00:00 tomorrow
          },
          clockOut: { $exists: false }, // Must not have clocked out yet
        },
        { clockOut: new Date() },
        { new: true }
      );

      if (!attendanceRecord) {
        return res.status(400).json({
          message:
            "Clock-in record for today not found or already clocked out.",
        });
      }

      res.json({
        message: "Clock-out recorded.",
        attendance: attendanceRecord,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// --- NEW ENDPOINT: EMPLOYEE Get Personal Attendance History ---
router.get(
  "/attendance/history",
  protect,
  allowRoles("Employee"),
  async (req, res) => {
    try {
      // Fetch last 30 days of records for a reasonable history view
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);

      const historyRecords = await Attendance.find({
        employee: req.user.id,
        date: { $gte: thirtyDaysAgo },
      })
        .select("date clockIn clockOut status")
        .sort({ date: -1 }); // Newest records first

      res.json(historyRecords);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch attendance history." });
    }
  }
);
// --- END NEW ENDPOINT ---

// MANAGER: Monitor attendance for direct reports (MODIFIED to filter by TODAY)
router.get(
  "/attendance/monitoring",
  protect,
  allowRoles("Senior Manager"),
  async (req, res) => {
    try {
      // Calculate the start of today and start of tomorrow
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const startOfTomorrow = new Date(startOfToday);
      startOfTomorrow.setDate(startOfTomorrow.getDate() + 1); // Fetch ONLY today's attendance records for the manager's team

      const attendanceRecords = await Attendance.find({
        manager: req.user.id,
        date: {
          $gte: startOfToday,
          $lt: startOfTomorrow,
        },
      })
        .populate("employee", "name email")
        .sort({ status: 1 }); // Sort by status to group Present, Absent, etc.

      res.json(attendanceRecords);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

export default router;
