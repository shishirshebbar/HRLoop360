

const express = require("express");
const router = express.Router();
const { performance, offer, skills, satisfaction } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

// Exact role check for HR-only access
function hrOnly(req, res, next) {
  const role = req.user?.role;
  if (role === "HR Recruiter") return next();
  return res.status(403).json({ ok: false, error: "forbidden_hr_only" });
}

const json = express.json();
const jsonLarge = express.json({ limit: "1mb" }); // larger payloads for Skills text

router.post("/performance", protect, hrOnly, json, performance);
router.post("/offer",        protect, hrOnly, json, offer);
router.post("/skills",       protect, hrOnly, jsonLarge, skills);
router.post("/satisfaction", protect, hrOnly, json, satisfaction);

module.exports = router;
