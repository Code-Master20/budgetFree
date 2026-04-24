const express = require("express");
const {
  register,
  verifyEmail,
  login,
  logout,
  getMe,
  requestOtp,
  verifyOtp,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.get("/verify/:token", verifyEmail);
router.post("/login", login);
router.post("/logout", logout);

router.get("/me", protect, getMe);
router.post("/otp/request", protect, requestOtp);
router.post("/otp/verify", protect, verifyOtp);

module.exports = router;
