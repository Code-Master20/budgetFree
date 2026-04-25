const express = require("express");
const {
  getProducts,
  getBestStudentLaptopsUnder16000To25000,
  getProductById,
  createProduct,
  importAmazonProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const { protect, admin } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { requireOtpVerification } = require("../middleware/otpMiddleware");
const { OTP_PURPOSES } = require("../utils/otp");

const router = express.Router();
const productImageUpload = upload.createUpload({ folder: "products" });

// Public
router.get("/", getProducts);
router.get(
  "/best-student-laptops-under-16000-25000",
  getBestStudentLaptopsUnder16000To25000,
);
router.get("/:id", getProductById);

// Admin
router.post(
  "/",
  protect,
  admin,
  requireOtpVerification(OTP_PURPOSES.ADMIN_ACCESS),
  productImageUpload.array("uploadedImages", 4),
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
  productImageUpload.array("uploadedImages", 4),
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
