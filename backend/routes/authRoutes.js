const express = require("express");
const {
  register,
  verifyEmail,
  login,
  logout,
  getMe,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// PUBLIC ROUTES
router.post("/register", register);
router.get("/verify/:token", verifyEmail);
router.post("/login", login);
router.post("/logout", logout);

// 🔥 PROTECTED ROUTE (VERY IMPORTANT)
router.get("/me", protect, getMe);

module.exports = router;
