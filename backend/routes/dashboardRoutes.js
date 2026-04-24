const express = require("express");
const {
  getDashboard,
  trackRecentSearch,
  trackVisitedProduct,
} = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getDashboard);
router.post("/searches", protect, trackRecentSearch);
router.post("/visits", protect, trackVisitedProduct);

module.exports = router;
