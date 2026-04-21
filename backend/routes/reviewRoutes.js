const express = require("express");
const {
  addReview,
  getReviews,
  approveReview,
  getAllReviews,
  getPendingReviews,
  rejectReview,
} = require("../controllers/reviewController");

const { protect, admin } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// ✅ USER ROUTE
router.post("/", protect, upload.single("image"), addReview);

// ✅ ADMIN ROUTES (MUST COME FIRST)
router.get("/admin/all", protect, admin, getAllReviews);
router.get("/admin/pending", protect, admin, getPendingReviews);
router.delete("/admin/reject", protect, admin, rejectReview);
router.patch("/approve", protect, admin, approveReview);

// ✅ PUBLIC ROUTE (LAST)
router.get("/:productId", getReviews);

module.exports = router;
