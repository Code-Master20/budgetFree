const Product = require("../models/Product");
const { fetchAmazonProduct } = require("../services/amazonProductImportService");

const DEFAULT_PAGE_SIZE = 10;

const buildSearchQuery = (search) => {
  if (!search) {
    return null;
  }

  return { $regex: search, $options: "i" };
};

const buildPaginatedResponse = async ({
  res,
  query,
  page = 1,
  limit = DEFAULT_PAGE_SIZE,
  sort = { createdAt: -1 },
}) => {
  const normalizedPage = Math.max(Number(page) || 1, 1);
  const skip = (normalizedPage - 1) * limit;

  const products = await Product.find(query).skip(skip).limit(limit).sort(sort);
  const total = await Product.countDocuments(query);

  return res.json({
    products,
    total,
    page: normalizedPage,
    pages: Math.ceil(total / limit),
  });
};

// @desc Get all products (with filters)
exports.getProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search, page = 1 } = req.query;

    let query = {};

    // Filters
    if (category) query.category = category;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const searchQuery = buildSearchQuery(search);
    if (searchQuery) {
      query.title = searchQuery;
    }

    return buildPaginatedResponse({
      res,
      query,
      page,
      sort: { createdAt: -1 },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get best student laptops between Rs 16,000 and Rs 25,000
exports.getBestStudentLaptopsUnder16000To25000 = async (req, res) => {
  try {
    const { search, page = 1 } = req.query;
    const searchQuery = buildSearchQuery(search);

    const query = {
      price: { $gte: 16000, $lte: 25000 },
      $or: [
        { category: { $regex: "laptop", $options: "i" } },
        { title: { $regex: "laptop", $options: "i" } },
        { description: { $regex: "laptop", $options: "i" } },
      ],
    };

    if (searchQuery) {
      query.$and = [
        {
          $or: [
            { title: searchQuery },
            { description: searchQuery },
            { category: searchQuery },
          ],
        },
      ];
    }

    return buildPaginatedResponse({
      res,
      query,
      page,
      sort: { rating: -1, price: 1, createdAt: -1 },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc Get single product
exports.getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.json(product);
};

// @desc Create product (Admin)
exports.createProduct = async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
};

// @desc Import product from Amazon affiliate link (Admin)
exports.importAmazonProduct = async (req, res) => {
  try {
    const affiliateLink = req.body?.affiliateLink?.trim();

    if (!affiliateLink) {
      return res
        .status(400)
        .json({ message: "Affiliate link is required for Amazon import" });
    }

    const importedProduct = await fetchAmazonProduct(affiliateLink);
    const existingProduct = await Product.findOne({
      affiliateLink: importedProduct.affiliateLink,
    });

    if (existingProduct) {
      Object.assign(existingProduct, importedProduct);
      await existingProduct.save();

      return res.json({
        message: "Amazon product refreshed successfully.",
        product: existingProduct,
      });
    }

    const product = await Product.create(importedProduct);

    return res.status(201).json({
      message: "Amazon product imported successfully.",
      product,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// @desc Update product (Admin)
exports.updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.json(product);
};

// @desc Delete product (Admin)
exports.deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product removed" });
};
