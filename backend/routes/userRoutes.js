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

export default router;
