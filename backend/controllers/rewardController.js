const Reward = require("../models/Reward");
const User = require("../models/User");
const { sendEmail } = require("../services/emailService");

// ================== Request Reward ==================
exports.requestReward = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim();

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const pendingRequest = await Reward.findOne({
      userId: user._id,
      status: "pending",
    });

    if (pendingRequest) {
      return res.status(400).json({
        message: "You already have a pending gift card request",
      });
    }

    if (user.walletBalance < 500) {
      return res.status(400).json({
        message: "Minimum ₹500 required",
      });
    }

    const reward = await Reward.create({
      userId: user._id,
      rewardAmount: user.walletBalance,
      email,
      provider: "amazon_pay",
    });

    user.walletBalance = 0;
    await user.save();

    // Notify admin
    await sendEmail(
      process.env.ADMIN_EMAIL,
      "New Reward Request",
      `<p>${user.email} requested a gift card.</p>`,
    );

    // Notify user
    await sendEmail(
      user.email,
      "Reward Request Received",
      `<p>Your gift card request is being processed.</p>`,
    );

    res.json({ message: "Request submitted", reward });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================== Send Gift Card ==================
exports.sendGiftCard = async (req, res) => {
  try {
    const { rewardId, giftCardLink } = req.body;

    const reward = await Reward.findById(rewardId);

    if (!reward) {
      return res.status(404).json({ message: "Reward not found" });
    }

    reward.status = "sent";
    reward.giftCardLink = giftCardLink;

    await reward.save();

    await sendEmail(
      reward.email,
      "🎁 Your Amazon Gift Card",
      `<p>Your gift card is ready:</p>
       <a href="${giftCardLink}">Click to Redeem</a>`,
    );

    res.json({ message: "Gift card sent", reward });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
