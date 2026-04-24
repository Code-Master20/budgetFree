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

    recentSearches: [
      {
        query: {
          type: String,
          trim: true,
        },
        searchedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    recentlyVisitedProducts: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        visitedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

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
