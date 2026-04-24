const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendEmail } = require("../services/emailService");
const {
  buildOtpVerificationState,
  generateOtpCode,
  getOtpConfig,
  hashOtpCode,
  OTP_PURPOSES,
} = require("../utils/otp");

const isProduction = process.env.NODE_ENV === "production";
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const buildSafeUserPayload = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  points: user.points,
  walletBalance: user.walletBalance,
  otpVerification: buildOtpVerificationState(user),
});

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationToken,
    });

    const baseUrl = process.env.BASE_URL || "http://localhost:5000";
    const verifyLink = `${baseUrl}/api/auth/verify/${verificationToken}`;

    await sendEmail(
      user.email,
      "Verify Your Email",
      `<p>Click below to verify your account:</p>
       <a href="${verifyLink}">Verify Email</a>`,
    );

    res.json({
      message: "Registered successfully. Please verify your email.",
      verifyLink,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({
      verificationToken: req.params.token,
    });

    if (!user) {
      return res.status(400).send("Invalid or expired token");
    }

    user.isVerified = true;
    user.verificationToken = null;

    await user.save();

    res.send("Email verified successfully");
  } catch (error) {
    res.status(500).send("Verification failed");
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        message: "Please verify your email first",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.cookie("token", token, cookieOptions);

    res.json(buildSafeUserPayload(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    res.json(buildSafeUserPayload(req.user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.requestOtp = async (req, res) => {
  try {
    const purpose = String(req.body.purpose || "").trim();
    const config = getOtpConfig(purpose);

    if (!config) {
      return res.status(400).json({ message: "Invalid OTP purpose" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (purpose === OTP_PURPOSES.ADMIN_ACCESS && user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const now = Date.now();
    const lastRequestedAt = user[config.requestedAtField]
      ? new Date(user[config.requestedAtField]).getTime()
      : 0;

    if (lastRequestedAt && now - lastRequestedAt < 60 * 1000) {
      return res.status(429).json({
        message: "Please wait a minute before requesting another OTP",
      });
    }

    const otpCode = generateOtpCode();

    user[config.codeHashField] = hashOtpCode(otpCode);
    user[config.expiresAtField] = new Date(now + config.ttlMs);
    user[config.requestedAtField] = new Date(now);

    await user.save();

    await sendEmail(
      user.email,
      config.subject,
      `<p>Your BudgetFree one-time code for ${config.actionLabel} is:</p>
       <p style="font-size:24px;font-weight:700;letter-spacing:4px;">${otpCode}</p>
       <p>This code expires in 10 minutes.</p>`,
    );

    res.json({ message: `OTP sent to ${user.email}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const purpose = String(req.body.purpose || "").trim();
    const code = String(req.body.code || "").trim();
    const config = getOtpConfig(purpose);

    if (!config) {
      return res.status(400).json({ message: "Invalid OTP purpose" });
    }

    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({ message: "Enter a valid 6-digit OTP" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (purpose === OTP_PURPOSES.ADMIN_ACCESS && user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const codeHash = user[config.codeHashField];
    const expiresAt = user[config.expiresAtField];

    if (!codeHash || !expiresAt || new Date(expiresAt).getTime() <= Date.now()) {
      return res.status(400).json({ message: "OTP expired. Request a new code." });
    }

    if (hashOtpCode(code) !== codeHash) {
      return res.status(400).json({ message: "Invalid OTP code" });
    }

    user[config.codeHashField] = null;
    user[config.expiresAtField] = null;
    user[config.requestedAtField] = null;
    user[config.verifiedUntilField] = new Date(
      Date.now() + config.verifiedWindowMs,
    );

    await user.save();

    res.json({
      message: `OTP verified for ${config.actionLabel}`,
      otpVerification: buildOtpVerificationState(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token", cookieOptions);

  res.json({ message: "Logged out" });
};
