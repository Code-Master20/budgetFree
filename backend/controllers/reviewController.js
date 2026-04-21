const Review = require("../models/Review");
const Product = require("../models/Product");
const User = require("../models/User");
const { sendEmail } = require("../services/emailService");

// ================== Add Review ==================
exports.addReview = async (req, res) => {
  try {
    const { productId, rating, reviewText } = req.body;

    const image = req.file ? req.file.path : null;

    if (!rating) {
      return res.status(400).json({ message: "Rating required" });
    }

    if (!reviewText || reviewText.length < 20) {
      return res.status(400).json({
        message: "Review must be at least 20 characters",
      });
    }

    if (!image) {
      return res.status(400).json({ message: "Image required" });
    }

    const exists = await Review.findOne({
      userId: req.user._id,
      productId,
    });

    if (exists) {
      return res.status(400).json({
        message: "Already reviewed this product",
      });
    }

    const product = await Product.findById(productId);

    if (!product || product.price < 399) {
      return res.status(400).json({
        message: "Product must be above ₹399",
      });
    }

    const review = await Review.create({
      userId: req.user._id,
      productId,
      rating,
      reviewText,
      image,
    });

    // Notify admin
    await sendEmail(
      process.env.ADMIN_EMAIL,
      "New Review Submitted",
      `<p>User ${req.user.email} submitted a review for product ${productId}</p>`,
    );

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================== Get Reviews ==================
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      productId: req.params.productId,
      status: "approved",
    }).select("-image");

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================== Admin: All Reviews ==================
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .select("+image")
      .populate("userId", "name email")
      .populate("productId", "title");

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================== Admin: Pending ==================
exports.getPendingReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ status: "pending" })
      .select("+image")
      .populate("userId", "name email")
      .populate("productId", "title");

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================== Reject Review ==================
exports.rejectReview = async (req, res) => {
  try {
    const { reviewId } = req.body;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const reviewUser = await User.findById(review.userId);

    await review.deleteOne();

    await sendEmail(
      reviewUser.email,
      "Review Rejected",
      `<p>Your review was rejected due to suspicious activity.</p>`,
    );

    res.json({ message: "Review rejected and deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================== Approve Review ==================
exports.approveReview = async (req, res) => {
  try {
    const { reviewId } = req.body;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    review.status = "approved";
    await review.save();

    await User.findByIdAndUpdate(review.userId, {
      $inc: { points: 5 },
    });

    const reviewUser = await User.findById(review.userId);

    await sendEmail(
      reviewUser.email,
      "Review Approved",
      `<p>Your review has been approved. You earned 5 points.</p>`,
    );

    res.json({ message: "Approved & points added" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
