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

const getRequestProtocol = (req) => {
  const forwardedProto = req.headers["x-forwarded-proto"];

  if (typeof forwardedProto === "string" && forwardedProto.length) {
    return forwardedProto.split(",")[0].trim();
  }

  return req.protocol;
};

const getCookieOptions = (req) => {
  const origin = req.get("origin");
  const requestProtocol = getRequestProtocol(req);
  const isSecureRequest = requestProtocol === "https";
  let isCrossOriginRequest = false;

  if (origin) {
    try {
      const originUrl = new URL(origin);
      const requestHost = req.get("host");

      isCrossOriginRequest = originUrl.host !== requestHost;
    } catch {
      isCrossOriginRequest = false;
    }
  }

  if (isCrossOriginRequest && isSecureRequest) {
    return {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    };
  }

  return {
    httpOnly: true,
    secure: isProduction && isSecureRequest,
    sameSite: "lax",
  };
};

const stripTrailingSlash = (value) => value.replace(/\/+$/, "");

const getApiBaseUrl = (req) => {
  const requestBaseUrl = `${req.protocol}://${req.get("host")}`;

  if (!isProduction) {
    return stripTrailingSlash(requestBaseUrl);
  }

  const configuredBaseUrl = process.env.BASE_URL?.trim();

  if (configuredBaseUrl) {
    return stripTrailingSlash(configuredBaseUrl);
  }

  return stripTrailingSlash(requestBaseUrl);
};

const getFrontendBaseUrl = () => {
  const configuredFrontendUrl =
    process.env.FRONTEND_URL?.trim() || process.env.BASE_URL?.trim();

  if (configuredFrontendUrl) {
    return stripTrailingSlash(configuredFrontendUrl);
  }

  return "http://localhost:5173";
};

const buildVerificationRedirectUrl = (status, message) => {
  const redirectUrl = new URL("/verify-email", `${getFrontendBaseUrl()}/`);

  redirectUrl.searchParams.set("status", status);

  if (message) {
    redirectUrl.searchParams.set("message", message);
  }

  return redirectUrl.toString();
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
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body.password || "");

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    const userExists = await User.findOne({ email });
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verifyLink = `${getApiBaseUrl(req)}/api/auth/verify/${verificationToken}`;
    let user;
    let createdNewUser = false;
    let message = "Registered successfully. Please verify your email.";

    if (userExists) {
      if (userExists.isVerified) {
        return res.status(400).json({
          message: "User already exists",
        });
      }

      userExists.name = name;
      userExists.password = hashedPassword;
      userExists.verificationToken = verificationToken;

      user = await userExists.save();
      message = "Your account is still unverified. We sent a fresh verification email.";
    } else {
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        verificationToken,
      });
      createdNewUser = true;
    }

    try {
      await sendEmail(
        user.email,
        "Verify Your Email",
        `<p>Welcome to BudgetFree, ${user.name}.</p>
         <p>Click the button below to verify your email address and finish creating your account.</p>
         <p>
           <a href="${verifyLink}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:#0f766e;color:#ffffff;text-decoration:none;font-weight:600;">
             Verify Email
           </a>
         </p>
         <p>If the button does not work, copy and paste this link into your browser:</p>
         <p>${verifyLink}</p>`,
      );
    } catch (emailError) {
      if (createdNewUser) {
        await User.findByIdAndDelete(user._id).catch(() => null);
      }

      return res.status(502).json({
        message:
          emailError.message ||
          "We could not send the verification email. Please try again.",
      });
    }

    res.json({ message });
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
      return res.redirect(
        buildVerificationRedirectUrl(
          "error",
          "This verification link is invalid or has already been used.",
        ),
      );
    }

    user.isVerified = true;
    user.verificationToken = null;

    await user.save();

    return res.redirect(
      buildVerificationRedirectUrl(
        "success",
        "Your email has been verified. You can log in now.",
      ),
    );
  } catch (error) {
    return res.redirect(
      buildVerificationRedirectUrl(
        "error",
        "We could not verify your email right now. Please try again.",
      ),
    );
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

    res.cookie("token", token, getCookieOptions(req));

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
  res.clearCookie("token", getCookieOptions(req));

  res.json({ message: "Logged out" });
};
