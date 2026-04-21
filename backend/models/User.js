const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      unique: true,
    },
    password: String,

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    points: {
      type: Number,
      default: 0,
    },

    walletBalance: {
      type: Number,
      default: 0,
    },

    lastConversion: Date,

    // 🔥 NEW FIELDS
    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
