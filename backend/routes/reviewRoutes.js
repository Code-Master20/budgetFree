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
const { requireOtpVerification } = require("../middleware/otpMiddleware");
const { OTP_PURPOSES } = require("../utils/otp");

const router = express.Router();

// ✅ USER ROUTE
router.post("/", protect, upload.single("image"), addReview);

// ✅ ADMIN ROUTES (MUST COME FIRST)
router.get(
  "/admin/all",
  protect,
  admin,
  requireOtpVerification(OTP_PURPOSES.ADMIN_ACCESS),
  getAllReviews,
);
router.get(
  "/admin/pending",
  protect,
  admin,
  requireOtpVerification(OTP_PURPOSES.ADMIN_ACCESS),
  getPendingReviews,
);
router.delete(
  "/admin/reject",
  protect,
  admin,
  requireOtpVerification(OTP_PURPOSES.ADMIN_ACCESS),
  rejectReview,
);
router.patch(
  "/approve",
  protect,
  admin,
  requireOtpVerification(OTP_PURPOSES.ADMIN_ACCESS),
  approveReview,
);

// ✅ PUBLIC ROUTE (LAST)
router.get("/:productId", getReviews);

module.exports = router;
