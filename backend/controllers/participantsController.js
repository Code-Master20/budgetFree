const Review = require("../models/Review");
const Reward = require("../models/Reward");

const REVIEW_POINTS = 5;

exports.getParticipantsOverview = async (req, res) => {
  try {
    const visitorToken = String(
      req.cookies.budgetfree_review_visitor || "",
    ).trim();
    const [approvedReviews, sentAmazonRewards] = await Promise.all([
      Review.find({ status: "approved" })
        .select(
          "userId productId rating reviewText likesCount createdAt likedVisitorTokens",
        )
        .populate("userId", "name points walletBalance createdAt")
        .populate("productId", "title category price rating images")
        .sort({ createdAt: -1 })
        .lean(),
      Reward.find({ status: "sent", provider: "amazon_pay" })
        .select("userId rewardAmount createdAt")
        .populate("userId", "name")
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    const participantMap = new Map();
    const productMap = new Map();
    const giftRecipientMap = new Map();

    for (const review of approvedReviews) {
      if (!review.userId || !review.productId) {
        continue;
      }

      const userId = String(review.userId._id);
      const productId = String(review.productId._id);
      const existingParticipant = participantMap.get(userId) || {
        userId,
        name: review.userId.name || "Participant",
        approvedReviewsCount: 0,
        reviewPointsEarned: 0,
        currentPoints: review.userId.points || 0,
        walletBalance: review.userId.walletBalance || 0,
        joinedAt: review.userId.createdAt || null,
        lastApprovedReviewAt: null,
      };

      existingParticipant.approvedReviewsCount += 1;
      existingParticipant.reviewPointsEarned += REVIEW_POINTS;
      existingParticipant.lastApprovedReviewAt =
        !existingParticipant.lastApprovedReviewAt ||
        new Date(review.createdAt) > new Date(existingParticipant.lastApprovedReviewAt)
          ? review.createdAt
          : existingParticipant.lastApprovedReviewAt;

      participantMap.set(userId, existingParticipant);

      const existingProduct = productMap.get(productId) || {
        product: {
          id: productId,
          title: review.productId.title,
          category: review.productId.category,
          price: review.productId.price,
          rating: review.productId.rating,
          image: review.productId.images?.[0] || null,
        },
        approvedReviewsCount: 0,
        participants: [],
      };

      existingProduct.approvedReviewsCount += 1;
      existingProduct.participants.push({
        reviewId: String(review._id),
        userId,
        name: review.userId.name || "Participant",
        rating: review.rating,
        reviewText: review.reviewText,
        likesCount: review.likesCount || 0,
        viewerHasLiked: visitorToken
          ? (review.likedVisitorTokens || []).includes(visitorToken)
          : false,
        submittedAt: review.createdAt,
        reviewPointsEarned: REVIEW_POINTS,
      });

      productMap.set(productId, existingProduct);
    }

    for (const reward of sentAmazonRewards) {
      if (!reward.userId) {
        continue;
      }

      const userId = String(reward.userId._id);
      const existingRecipient = giftRecipientMap.get(userId) || {
        userId,
        name: reward.userId.name || "Participant",
        totalGiftCardsSent: 0,
        totalRewardAmount: 0,
        lastSentAt: null,
        rewards: [],
      };

      existingRecipient.totalGiftCardsSent += 1;
      existingRecipient.totalRewardAmount += reward.rewardAmount || 0;
      existingRecipient.lastSentAt =
        !existingRecipient.lastSentAt ||
        new Date(reward.createdAt) > new Date(existingRecipient.lastSentAt)
          ? reward.createdAt
          : existingRecipient.lastSentAt;
      existingRecipient.rewards.push({
        rewardAmount: reward.rewardAmount || 0,
        sentAt: reward.createdAt,
      });

      giftRecipientMap.set(userId, existingRecipient);
    }

    const topPointEarners = Array.from(participantMap.values())
      .sort((left, right) => {
        if (right.reviewPointsEarned !== left.reviewPointsEarned) {
          return right.reviewPointsEarned - left.reviewPointsEarned;
        }

        if (right.currentPoints !== left.currentPoints) {
          return right.currentPoints - left.currentPoints;
        }

        return left.name.localeCompare(right.name);
      })
      .slice(0, 10);

    const productParticipation = Array.from(productMap.values())
      .map((entry) => ({
        ...entry,
        participants: entry.participants.sort(
          (left, right) => new Date(right.submittedAt) - new Date(left.submittedAt),
        ),
      }))
      .sort((left, right) => {
        if (right.approvedReviewsCount !== left.approvedReviewsCount) {
          return right.approvedReviewsCount - left.approvedReviewsCount;
        }

        return left.product.title.localeCompare(right.product.title);
      });

    const amazonPayRecipients = Array.from(giftRecipientMap.values()).sort(
      (left, right) => {
        if (right.totalRewardAmount !== left.totalRewardAmount) {
          return right.totalRewardAmount - left.totalRewardAmount;
        }

        return new Date(right.lastSentAt) - new Date(left.lastSentAt);
      },
    );

    res.json({
      definitions: {
        participants:
          "Users with at least one approved product review on BudgetFree.",
        highGainers:
          `Top 10 participants ranked by approved review points earned (${REVIEW_POINTS} points per approved review).`,
        amazonPayRecipients:
          "Users whose Amazon Pay gift card requests have been sent successfully.",
      },
      summary: {
        participantsCount: participantMap.size,
        reviewedProductsCount: productMap.size,
        approvedReviewsCount: approvedReviews.length,
        amazonPayRecipientsCount: amazonPayRecipients.length,
      },
      topPointEarners,
      amazonPayRecipients,
      productParticipation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
