const mongoose = require("mongoose");
const Product = require("../models/Product");
const Review = require("../models/Review");
const Reward = require("../models/Reward");
const User = require("../models/User");

const MAX_RECENT_ITEMS = 8;

exports.getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select(
        "name email points walletBalance lastConversion recentSearches recentlyVisitedProducts",
      )
      .populate(
        "recentlyVisitedProducts.productId",
        "title category price rating images",
      )
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const [reviews, rewardRequests] = await Promise.all([
      Review.find({ userId: req.user._id })
        .select(
          "productId rating reviewText status rejectionReason likesCount createdAt updatedAt",
        )
        .populate("productId", "title category price rating images")
        .sort({ createdAt: -1 })
        .lean(),
      Reward.find({ userId: req.user._id })
        .select("rewardAmount email status provider giftCardLink createdAt updatedAt")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const reviewCounts = reviews.reduce(
      (summary, review) => {
        summary.total += 1;
        summary[review.status] += 1;
        return summary;
      },
      {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
      },
    );

    const recentlyVisitedProducts = (user.recentlyVisitedProducts || [])
      .map((entry) => ({
        visitedAt: entry.visitedAt,
        product: entry.productId,
      }))
      .filter((entry) => entry.product);

    res.json({
      profile: {
        name: user.name,
        email: user.email,
      },
      overview: {
        points: user.points || 0,
        walletBalance: user.walletBalance || 0,
        lastConversion: user.lastConversion || null,
        canConvertPoints: (user.points || 0) >= 100,
        canRequestGiftCard:
          (user.walletBalance || 0) >= 500 &&
          !rewardRequests.some((request) => request.status === "pending"),
        reviewCounts,
        latestRewardRequest: rewardRequests[0] || null,
      },
      recentSearches: user.recentSearches || [],
      recentlyVisitedProducts,
      reviews,
      rewardRequests,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.trackRecentSearch = async (req, res) => {
  try {
    const query = String(req.body.query || "")
      .replace(/\s+/g, " ")
      .trim();

    if (query.length < 2 || query.length > 80) {
      return res.status(400).json({
        message: "Search query must be between 2 and 80 characters",
      });
    }

    const user = await User.findById(req.user._id).select("recentSearches");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const nextEntries = (user.recentSearches || []).filter(
      (entry) => entry.query.toLowerCase() !== query.toLowerCase(),
    );

    user.recentSearches = [{ query, searchedAt: new Date() }, ...nextEntries].slice(
      0,
      MAX_RECENT_ITEMS,
    );

    await user.save();

    res.json({ recentSearches: user.recentSearches });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.trackVisitedProduct = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const productExists = await Product.exists({ _id: productId });

    if (!productExists) {
      return res.status(404).json({ message: "Product not found" });
    }

    const user = await User.findById(req.user._id).select(
      "recentlyVisitedProducts",
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const nextEntries = (user.recentlyVisitedProducts || []).filter(
      (entry) => String(entry.productId) !== String(productId),
    );

    user.recentlyVisitedProducts = [
      { productId, visitedAt: new Date() },
      ...nextEntries,
    ].slice(0, MAX_RECENT_ITEMS);

    await user.save();

    res.json({ message: "Visit tracked" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
