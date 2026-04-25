const Product = require("../models/Product");
const { fetchAmazonProduct } = require("../services/amazonProductImportService");

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 300;
const SEARCHABLE_FIELDS = [
  "title",
  "description",
  "category",
  "features",
  "pros",
  "cons",
];
const SEARCH_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "best",
  "buy",
  "for",
  "from",
  "in",
  "is",
  "of",
  "on",
  "or",
  "product",
  "products",
  "the",
  "to",
  "with",
]);

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeSearchTerm = (value) => {
  const normalizedValue = value.trim().toLowerCase();

  if (normalizedValue.length > 3 && normalizedValue.endsWith("s")) {
    return normalizedValue.slice(0, -1);
  }

  return normalizedValue;
};

const extractSearchTerms = (search) => {
  if (!search) {
    return [];
  }

  const rawTerms = search
    .split(/[^a-z0-9]+/i)
    .map(normalizeSearchTerm)
    .filter((term) => term.length >= 2);

  const meaningfulTerms = rawTerms.filter((term) => !SEARCH_STOP_WORDS.has(term));
  const selectedTerms = meaningfulTerms.length ? meaningfulTerms : rawTerms;

  return [...new Set(selectedTerms)];
};

const buildSearchQuery = (search, fields = SEARCHABLE_FIELDS) => {
  const terms = extractSearchTerms(search);

  if (!terms.length) {
    return null;
  }

  return {
    $and: terms.map((term) => ({
      $or: fields.map((field) => ({
        [field]: {
          $regex: escapeRegex(term),
          $options: "i",
        },
      })),
    })),
  };
};

const buildPaginatedResponse = async ({
  res,
  query,
  page = 1,
  limit = DEFAULT_PAGE_SIZE,
  sort = { createdAt: -1 },
}) => {
  const normalizedPage = Math.max(Number(page) || 1, 1);
  const normalizedLimit = Math.min(
    Math.max(Number(limit) || DEFAULT_PAGE_SIZE, 1),
    MAX_PAGE_SIZE,
  );
  const skip = (normalizedPage - 1) * normalizedLimit;

  const products = await Product.find(query)
    .skip(skip)
    .limit(normalizedLimit)
    .sort(sort);
  const total = await Product.countDocuments(query);

  return res.json({
    products,
    total,
    page: normalizedPage,
    pages: Math.ceil(total / normalizedLimit),
  });
};

// @desc Get all products (with filters)
exports.getProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search, page = 1, limit } = req.query;

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
      query.$and = [...(query.$and || []), searchQuery];
    }

    return buildPaginatedResponse({
      res,
      query,
      page,
      limit,
      sort: { createdAt: -1 },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get best student laptops between Rs 16,000 and Rs 25,000
exports.getBestStudentLaptopsUnder16000To25000 = async (req, res) => {
  try {
    const { search, page = 1, limit } = req.query;
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
      query.$and = [...(query.$and || []), searchQuery];
    }

    return buildPaginatedResponse({
      res,
      query,
      page,
      limit,
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
