const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Register
const crypto = require("crypto");
const { sendEmail } = require("../services/emailService");

// Register
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

    // 🔥 Generate token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationToken,
    });

    // 🔥 Send verification email
    const verifyLink = `http://localhost:8000/api/auth/verify/${verificationToken}`;

    await sendEmail(
      user.email,
      "Verify Your Email",
      `<p>Click below to verify your account:</p>
       <a href="${verifyLink}">Verify Email</a>`,
    );

    res.json({
      message: "Registered successfully. Please verify your email.",
      verifyLink, // 👈 ADD THIS
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify Email
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

    res.send("✅ Email verified successfully");
  } catch (error) {
    res.status(500).send("Verification failed");
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      points: user.points,
    });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
};

// Logout
exports.logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
};
