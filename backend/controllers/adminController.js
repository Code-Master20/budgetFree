const Product = require("../models/Product");
const Review = require("../models/Review");
const Reward = require("../models/Reward");
const User = require("../models/User");

exports.getDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalAdmins,
      verifiedUsers,
      totalProducts,
      totalReviews,
      pendingReviews,
      approvedReviews,
      totalRewardRequests,
      pendingRewardRequests,
      recentUsers,
      recentProducts,
      recentPendingReviews,
      recentRewardRequests,
      walletSummary,
      pointsSummary,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ isVerified: true }),
      Product.countDocuments(),
      Review.countDocuments(),
      Review.countDocuments({ status: "pending" }),
      Review.countDocuments({ status: "approved" }),
      Reward.countDocuments(),
      Reward.countDocuments({ status: "pending" }),
      User.find()
        .select("name email role isVerified createdAt points walletBalance")
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
      Product.find()
        .select("title category price rating video createdAt")
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
      Review.find({ status: "pending" })
        .populate("userId", "name email")
        .populate("productId", "title category")
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
      Reward.find()
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
      User.aggregate([
        {
          $group: {
            _id: null,
            totalWalletBalance: { $sum: "$walletBalance" },
          },
        },
      ]),
      User.aggregate([
        {
          $group: {
            _id: null,
            totalPoints: { $sum: "$points" },
          },
        },
      ]),
    ]);

    res.json({
      overview: {
        totalUsers,
        totalAdmins,
        verifiedUsers,
        totalProducts,
        totalReviews,
        pendingReviews,
        approvedReviews,
        totalRewardRequests,
        pendingRewardRequests,
        totalWalletBalance: walletSummary[0]?.totalWalletBalance || 0,
        totalPoints: pointsSummary[0]?.totalPoints || 0,
      },
      recentUsers,
      recentProducts,
      recentPendingReviews,
      recentRewardRequests,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
