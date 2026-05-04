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
const productMediaUpload = upload.createUpload({
  folder: "products",
  maxFileSizeMb: 50,
  resourceType: "auto",
  allowedMimePrefixes: ["image/", "video/"],
});

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
  productMediaUpload.fields([
    { name: "uploadedImages", maxCount: 4 },
    { name: "uploadedVideo", maxCount: 1 },
  ]),
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
  productMediaUpload.fields([
    { name: "uploadedImages", maxCount: 4 },
    { name: "uploadedVideo", maxCount: 1 },
  ]),
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
