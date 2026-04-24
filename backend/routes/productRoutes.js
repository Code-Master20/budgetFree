const express = require("express");
const {
  getProducts,
  getProductById,
  createProduct,
  importAmazonProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const { protect, admin } = require("../middleware/authMiddleware");
const { requireOtpVerification } = require("../middleware/otpMiddleware");
const { OTP_PURPOSES } = require("../utils/otp");

const router = express.Router();

// Public
router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin
router.post(
  "/",
  protect,
  admin,
  requireOtpVerification(OTP_PURPOSES.ADMIN_ACCESS),
  createProduct,
);
router.post(
  "/import/amazon",
  protect,
  admin,
  requireOtpVerification(OTP_PURPOSES.ADMIN_ACCESS),
  importAmazonProduct,
);
router.put(
  "/:id",
  protect,
  admin,
  requireOtpVerification(OTP_PURPOSES.ADMIN_ACCESS),
  updateProduct,
);
router.delete(
  "/:id",
  protect,
  admin,
  requireOtpVerification(OTP_PURPOSES.ADMIN_ACCESS),
  deleteProduct,
);

module.exports = router;
