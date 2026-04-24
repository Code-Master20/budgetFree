const express = require("express");
const { getDashboard } = require("../controllers/adminController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/dashboard", protect, admin, getDashboard);

module.exports = router;
