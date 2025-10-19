import jwt from "jsonwebtoken";

// ====== AUTH PROTECTION MIDDLEWARE ======
export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // decoded contains _id, role, etc.
    next();
  } catch (err) {
    console.error("Auth Error:", err.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// ====== ADMIN ONLY ======
export const adminOnly = (req, res, next) => {
  if (req.user.role !== "Management Admin") {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }
  next();
};

// ====== GENERIC ROLE CHECKER ======
export const allowRoles =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access denied: insufficient role" });
    }
    next();
  };

// ====== SPECIFIC ROLE HELPERS ======
export const managerOnly = (req, res, next) => {
  if (req.user.role !== "Senior Manager") {
    return res.status(403).json({ message: "Access denied: Managers only" });
  }
  next();
};

export const hrOnly = (req, res, next) => {
  if (req.user.role !== "HR Recruiter") {
    return res.status(403).json({ message: "Access denied: HRs only" });
  }
  next();
};

export const employeeOnly = (req, res, next) => {
  if (req.user.role !== "Employee") {
    return res.status(403).json({ message: "Access denied: Employees only" });
  }
  next();
};
