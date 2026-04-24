const crypto = require("crypto");

const OTP_PURPOSES = {
  ADMIN_ACCESS: "admin_access",
  REWARD_REQUEST: "reward_request",
};

const OTP_CONFIG = {
  [OTP_PURPOSES.ADMIN_ACCESS]: {
    codeHashField: "adminOtpCodeHash",
    expiresAtField: "adminOtpExpiresAt",
    requestedAtField: "adminOtpRequestedAt",
    verifiedUntilField: "adminOtpVerifiedUntil",
    ttlMs: 10 * 60 * 1000,
    verifiedWindowMs: 30 * 60 * 1000,
    subject: "Your BudgetFree admin access code",
    actionLabel: "admin access",
  },
  [OTP_PURPOSES.REWARD_REQUEST]: {
    codeHashField: "rewardOtpCodeHash",
    expiresAtField: "rewardOtpExpiresAt",
    requestedAtField: "rewardOtpRequestedAt",
    verifiedUntilField: "rewardOtpVerifiedUntil",
    ttlMs: 10 * 60 * 1000,
    verifiedWindowMs: 15 * 60 * 1000,
    subject: "Your BudgetFree reward request code",
    actionLabel: "reward request",
  },
};

function getOtpConfig(purpose) {
  return OTP_CONFIG[purpose] || null;
}

function generateOtpCode() {
  return String(crypto.randomInt(100000, 1000000));
}

function hashOtpCode(code) {
  return crypto.createHash("sha256").update(String(code)).digest("hex");
}

function isOtpVerified(user, purpose) {
  const config = getOtpConfig(purpose);

  if (!config || !user) {
    return false;
  }

  const verifiedUntil = user[config.verifiedUntilField];

  return Boolean(verifiedUntil && new Date(verifiedUntil).getTime() > Date.now());
}

function buildOtpVerificationState(user) {
  return {
    adminAccess: isOtpVerified(user, OTP_PURPOSES.ADMIN_ACCESS),
    rewardRequest: isOtpVerified(user, OTP_PURPOSES.REWARD_REQUEST),
  };
}

module.exports = {
  OTP_PURPOSES,
  buildOtpVerificationState,
  generateOtpCode,
  getOtpConfig,
  hashOtpCode,
  isOtpVerified,
};
