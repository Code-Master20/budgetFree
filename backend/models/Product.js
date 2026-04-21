const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,

    category: {
      type: String,
      required: true,
    },

    price: Number,

    affiliateLink: {
      type: String,
      required: true,
    },

    images: [String],

    features: [String],
    pros: [String],
    cons: [String],

    rating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
