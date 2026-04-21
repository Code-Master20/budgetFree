const express = require("express");
const { getPointsBalance } = require("../controllers/pointsController");
const { convertPoints } = require("../controllers/pointsController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Get user points
router.get("/balance", protect, getPointsBalance);

//convert points to wallet
router.post("/convert", protect, convertPoints);

module.exports = router;
