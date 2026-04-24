const { getOtpConfig, OTP_PURPOSES, isOtpVerified } = require("../utils/otp");

function requireOtpVerification(purpose) {
  const config = getOtpConfig(purpose);

  return (req, res, next) => {
    if (!config) {
      return res.status(500).json({ message: "OTP verification is misconfigured" });
    }

    if (
      purpose === OTP_PURPOSES.ADMIN_ACCESS &&
      (!req.user || req.user.role !== "admin")
    ) {
      return res.status(403).json({ message: "Admin only" });
    }

    if (!isOtpVerified(req.user, purpose)) {
      return res.status(403).json({
        message: `OTP verification required for ${config.actionLabel}`,
        code: "OTP_REQUIRED",
        purpose,
      });
    }

    next();
  };
}

module.exports = {
  requireOtpVerification,
};
