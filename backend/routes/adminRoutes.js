import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin creates users
router.post("/create-user", protect, adminOnly, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already in use" });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashed, role });

    res.status(201).json({ message: "User created successfully", newUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
<<<<<<< HEAD
router.get("/managers", protect, adminOnly, async (req, res) => {
  try {
    const managers = await User.find({ role: "Senior Manager" }).select(
      "name email"
    );
    res.json(managers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- NEW ROUTE: Assign Manager to an Employee ---
router.patch(
  "/assign-manager/:employeeId",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const { employeeId } = req.params;
      const { managerId } = req.body; // Can be a Manager's ID or null

      // Optional: Add validation to ensure managerId, if provided, belongs to a 'Senior Manager'
      if (managerId) {
        const manager = await User.findById(managerId);
        if (!manager || manager.role !== "Senior Manager") {
          return res
            .status(400)
            .json({ message: "Invalid manager ID or role." });
        }
      }

      // Find employee and ensure they are an 'Employee' (or any non-admin/non-manager role if you change it)
      const employee = await User.findById(employeeId);
      if (
        !employee ||
        employee.role === "Management Admin" ||
        employee.role === "Senior Manager"
      ) {
        return res
          .status(403)
          .json({ message: "Cannot assign a manager to an Admin or Manager." });
      }

      const updatedEmployee = await User.findByIdAndUpdate(
        employeeId,
        { manager: managerId || null }, // Set to new managerId or null (unassign)
        { new: true, select: "-password" }
      );

      if (!updatedEmployee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      res.json({
        message: "Manager assigned successfully",
        user: updatedEmployee,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);
=======
>>>>>>> 0aa482e365723ad9899daba81968225e82f6e432

export default router;
