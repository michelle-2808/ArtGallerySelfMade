// routes/productRoutes.js
import express from "express";
import { Product, AdminAnalytics } from "../models/index.js";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get featured products
router.get("/featured", async (req, res) => {
  try {
    const featuredProducts = await Product.find({
      featured: true,
      isAvailable: true,
    }).limit(6);
    res.json(featuredProducts);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching featured products",
        error: error.message,
      });
  }
});

// Record a product view (accessible to normal users)
router.post("/record-view/:productId", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    // Get AdminAnalytics model
    const { AdminAnalytics } = await import("../models/index.js");

    // Find or create analytics for this product
    let analytics = await AdminAnalytics.findOne({ productId });

    if (!analytics) {
      analytics = new AdminAnalytics({
        productId,
        viewCount: 1,
        purchaseCount: 0,
        revenue: 0,
      });
    } else {
      analytics.viewCount += 1;
    }

    await analytics.save();
    res.json({ success: true });
  } catch (error) {
    console.error("Error recording product view:", error);
    // Don't send detailed error to client for analytics
    res.status(500).json({ message: "Error recording product view" });
  }
});

// Get products by category
router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category, isAvailable: true });
    res.json(products);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching products by category",
        error: error.message,
      });
  }
});

// Search products
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const products = await Product.find(
      { $text: { $search: query }, isAvailable: true },
      { score: { $meta: "textScore" } }
    ).sort({ score: { $meta: "textScore" } });

    res.json(products);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error searching products", error: error.message });
  }
});

// Get all products with optional filtering
router.get("/", async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      sortBy,
      limit = 12,
      page = 1,
    } = req.query;

    // Build query
    const query = { isAvailable: true };

    if (category) {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Build sort
    let sort = {};
    if (sortBy === "price-asc") {
      sort.price = 1;
    } else if (sortBy === "price-desc") {
      sort.price = -1;
    } else if (sortBy === "newest") {
      sort.createdAt = -1;
    } else {
      // Default sort
      sort.createdAt = -1;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    res.json({
      products,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
});

// Create a new product (admin only)
router.post("/", authMiddleware, isAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      imageUrl,
      category,
      tags,
      stockQuantity,
      featured,
      dimensions,
      artist,
      creationYear,
    } = req.body;

    const newProduct = new Product({
      title,
      description,
      price: parseFloat(price),
      imageUrl,
      category,
      tags: Array.isArray(tags) ? tags : [],
      stockQuantity: parseInt(stockQuantity),
      isAvailable: parseInt(stockQuantity) > 0,
      featured: featured || false,
      dimensions,
      artist,
      creationYear,
    });

    await newProduct.save();

    // Initialize analytics for the new product
    const analytics = new AdminAnalytics({
      productId: newProduct._id,
      viewCount: 0,
      purchaseCount: 0,
      revenue: 0,
    });

    await analytics.save();

    res.status(201).json(newProduct);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating product", error: error.message });
  }
});

// Get a single product
router.get("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Record view for analytics
    fetch(
      `${req.protocol}://${req.get(
        "host"
      )}/api/admin/analytics/record-view/${productId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    ).catch((err) => console.error("Could not record product view:", err));

    res.json(product);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching product", error: error.message });
  }
});

// Update a product (admin only)
router.put("/:productId", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { productId } = req.params;
    const updates = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update fields
    Object.keys(updates).forEach((key) => {
      if (key !== "_id" && key !== "__v") {
        if (key === "price") {
          product[key] = parseFloat(updates[key]);
        } else if (key === "stockQuantity") {
          product[key] = parseInt(updates[key]);
          product.isAvailable = parseInt(updates[key]) > 0;
        } else {
          product[key] = updates[key];
        }
      }
    });

    await product.save();

    res.json(product);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating product", error: error.message });
  }
});

// Delete a product (admin only)
router.delete("/:productId", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await Product.deleteOne({ _id: productId });

    // Also delete related analytics
    await AdminAnalytics.deleteOne({ productId });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting product", error: error.message });
  }
});

export default router;
