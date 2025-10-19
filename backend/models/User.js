import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["Management Admin", "Senior Manager", "HR Recruiter", "Employee"],
    default: "Employee",
  },
<<<<<<< HEAD
  // --- NEW FIELD FOR MANAGER RELATIONSHIP ---
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // References the User model itself
    default: null, // Initially null for self-registered employees
  },
  // ------------------------------------------
=======
>>>>>>> 0aa482e365723ad9899daba81968225e82f6e432
});

export default mongoose.model("User", userSchema);
