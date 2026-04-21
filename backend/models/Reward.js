const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    rewardAmount: Number,

    email: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "sent"],
      default: "pending",
    },

    giftCardLink: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Reward", rewardSchema);
