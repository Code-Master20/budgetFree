const express = require("express");
const {
  requestReward,
  sendGiftCard,
} = require("../controllers/rewardController");

const { protect, admin } = require("../middleware/authMiddleware");
const { requireOtpVerification } = require("../middleware/otpMiddleware");
const { OTP_PURPOSES } = require("../utils/otp");

const router = express.Router();

router.post(
  "/request",
  protect,
  requireOtpVerification(OTP_PURPOSES.REWARD_REQUEST),
  requestReward,
);
router.patch(
  "/send",
  protect,
  admin,
  requireOtpVerification(OTP_PURPOSES.ADMIN_ACCESS),
  sendGiftCard,
);

module.exports = router;
