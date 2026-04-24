const express = require("express");
const { getDashboard } = require("../controllers/adminController");
const { protect, admin } = require("../middleware/authMiddleware");
const { requireOtpVerification } = require("../middleware/otpMiddleware");
const { OTP_PURPOSES } = require("../utils/otp");

const router = express.Router();

router.get(
  "/dashboard",
  protect,
  admin,
  requireOtpVerification(OTP_PURPOSES.ADMIN_ACCESS),
  getDashboard,
);

module.exports = router;
