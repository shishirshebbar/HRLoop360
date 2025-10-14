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

export default router;
