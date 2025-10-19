// routes/userRoutes.js
import express from "express";
import User from "../models/User.js";
import { protect, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET /api/users
 * Optional query: ?roles=Employee,Senior%20Manager
 * Secured for: Management Admin, HR Recruiter, Senior Manager
 */
router.get(
  "/",
  protect,
  allowRoles("Management Admin", "HR Recruiter", "Senior Manager"),
  async (req, res) => {
    try {
      const rolesParam = req.query.roles;
      let filter = {};
      if (rolesParam) {
        const roles = rolesParam.split(",").map((r) => r.trim());
        filter.role = { $in: roles };
      }
      // never leak password hashes
      const users = await User.find(filter).select("-password");
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

<<<<<<< HEAD
router.get("/profile", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the user and POPULATE the 'manager' field to get the manager's name and email.
    const user = await User.findById(userId)
      .select("-password") // Exclude password hash
      .populate("manager", "name email"); // Populate manager's name and email

    if (!user) {
      return res.status(404).json({ message: "User profile not found." });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get(
  "/direct-reports",
  protect,
  allowRoles("Senior Manager"),
  async (req, res) => {
    try {
      // The current user's ID is available in req.user.id from the 'protect' middleware
      const managerId = req.user.id;

      // Find all users whose 'manager' field matches the current manager's ID
      // You should add .populate('manager', 'name email') if you want to also display the manager's name on the employee list
      const directReports = await User.find({
        manager: managerId,
        role: "Employee",
      }).select("-password");

      res.json(directReports);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

=======
>>>>>>> 0aa482e365723ad9899daba81968225e82f6e432
export default router;
