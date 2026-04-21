const User = require("../models/User");
const { sendEmail } = require("../services/emailService");

// ================== Get Points ==================
exports.getPointsBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("points");

    res.json({
      points: user.points,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================== Convert Points ==================
exports.convertPoints = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.lastConversion) {
      const now = new Date();
      const diff = now - user.lastConversion;
      const hoursPassed = diff / (1000 * 60 * 60);

      if (hoursPassed < 24) {
        await sendEmail(
          user.email,
          "Conversion Failed",
          `<p>You cannot convert points yet. Try later.</p>`,
        );

        return res.status(400).json({
          message: `You can convert again after ${Math.ceil(
            24 - hoursPassed,
          )} hours`,
        });
      }
    }

    if (user.points < 100) {
      return res.status(400).json({
        message: "Minimum 100 points required",
      });
    }

    user.points -= 100;
    user.walletBalance += 50;
    user.lastConversion = new Date();

    await user.save();

    await sendEmail(
      process.env.ADMIN_EMAIL,
      "User Converted Points",
      `<p>${user.email} converted points.</p>`,
    );

    await sendEmail(
      user.email,
      "Points Converted",
      `<p>You converted 100 points into ₹50 wallet balance.</p>`,
    );

    res.json({
      message: "Converted 100 points → ₹50",
      walletBalance: user.walletBalance,
      points: user.points,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
