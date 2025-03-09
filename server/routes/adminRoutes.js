
// routes/adminRoutes.js
import express from "express";
import { AdminAnalytics, Product, Order, User, OrderItem } from "../models/index.js";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Apply auth middleware to all admin routes
router.use(authMiddleware, isAdmin);

// Get dashboard summary
router.get("/dashboard", async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" }
        }
      }
    ]);
    const totalUsers = await User.countDocuments();
    
    // Get revenue by week (last 8 weeks)
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
    
    const weeklyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: eightWeeksAgo } } },
      {
        $group: {
          _id: { 
            year: { $year: "$createdAt" },
            week: { $week: "$createdAt" }
          },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.week": 1 } }
    ]);
    
    // Get sales by category
    const salesByCategory = await OrderItem.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $group: {
          _id: "$product.category",
          revenue: { $sum: { $multiply: ["$price", "$quantity"] } },
          count: { $sum: "$quantity" }
        }
      },
      { $sort: { revenue: -1 } }
    ]);
    
    res.json({
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      totalUsers,
      weeklyRevenue,
      salesByCategory
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard data", error: error.message });
  }
});

// Get recent orders for admin dashboard
router.get("/recent-orders", async (req, res) => {
  try {
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("userId", "username email");
    
    res.json(recentOrders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching recent orders", error: error.message });
  }
});

// Get product analytics
router.get("/analytics/products", async (req, res) => {
  try {
    const productAnalytics = await AdminAnalytics.find()
      .populate("productId", "title imageUrl price category")
      .sort({ revenue: -1 });
    
    res.json(productAnalytics);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product analytics", error: error.message });
  }
});

// Get analytics for a specific product
router.get("/analytics/products/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Find or create analytics for this product
    let analytics = await AdminAnalytics.findOne({ productId })
      .populate("productId", "title imageUrl price category");
    
    if (!analytics) {
      analytics = new AdminAnalytics({ productId, viewCount: 0, purchaseCount: 0, revenue: 0 });
      await analytics.save();
    }
    
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product analytics", error: error.message });
  }
});

// Record a product view
router.post("/analytics/record-view/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Find or create analytics for this product
    let analytics = await AdminAnalytics.findOne({ productId });
    
    if (!analytics) {
      analytics = new AdminAnalytics({ productId, viewCount: 1, purchaseCount: 0, revenue: 0 });
    } else {
      analytics.viewCount += 1;
    }
    
    await analytics.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Error recording product view", error: error.message });
  }
});

// Manage products

// Get all products with pagination
router.get("/products", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    
    const query = category ? { category } : {};
    
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Product.countDocuments(query);
    
    res.json({
      products,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error: error.message });
  }
});

// Create a new product
router.post("/products", upload.single("image"), async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
      tags,
      stockQuantity,
      featured,
      width,
      height,
      depth,
      unit,
      artist,
      creationYear,
      imageUrl
    } = req.body;
    
    // Use uploaded file path or provided imageUrl
    let productImageUrl = imageUrl;
    if (req.file) {
      productImageUrl = `/uploads/${req.file.filename}`;
    }
    
    if (!productImageUrl) {
      return res.status(400).json({ message: "Image URL or file is required" });
    }
    
    const tagsArray = tags ? tags.split(",").map(tag => tag.trim()) : [];
    
    const newProduct = new Product({
      title,
      description,
      price: parseFloat(price),
      imageUrl: productImageUrl,
      category,
      tags: tagsArray,
      stockQuantity: parseInt(stockQuantity),
      isAvailable: parseInt(stockQuantity) > 0,
      featured: featured === "true",
      dimensions: {
        width: width ? parseFloat(width) : undefined,
        height: height ? parseFloat(height) : undefined,
        depth: depth ? parseFloat(depth) : undefined,
        unit: unit || "cm"
      },
      artist,
      creationYear: creationYear ? parseInt(creationYear) : undefined
    });
    
    await newProduct.save();
    
    // Initialize analytics for the new product
    const analytics = new AdminAnalytics({
      productId: newProduct._id,
      viewCount: 0,
      purchaseCount: 0,
      revenue: 0
    });
    
    await analytics.save();
    
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: "Error creating product", error: error.message });
  }
});

// Update a product
router.put("/products/:productId", upload.single("image"), async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      title,
      description,
      price,
      category,
      tags,
      stockQuantity,
      featured,
      width,
      height,
      depth,
      unit,
      artist,
      creationYear,
      imageUrl
    } = req.body;
    
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    // Use uploaded file path or provided imageUrl or keep existing
    let productImageUrl = imageUrl;
    if (req.file) {
      productImageUrl = `/uploads/${req.file.filename}`;
    }
    
    const tagsArray = tags ? tags.split(",").map(tag => tag.trim()) : [];
    
    product.title = title || product.title;
    product.description = description || product.description;
    if (price) product.price = parseFloat(price);
    if (productImageUrl) product.imageUrl = productImageUrl;
    if (category) product.category = category;
    if (tags) product.tags = tagsArray;
    if (stockQuantity) {
      product.stockQuantity = parseInt(stockQuantity);
      product.isAvailable = parseInt(stockQuantity) > 0;
    }
    if (featured !== undefined) product.featured = featured === "true";
    
    if (width || height || depth || unit) {
      product.dimensions = product.dimensions || {};
      if (width) product.dimensions.width = parseFloat(width);
      if (height) product.dimensions.height = parseFloat(height);
      if (depth) product.dimensions.depth = parseFloat(depth);
      if (unit) product.dimensions.unit = unit;
    }
    
    if (artist) product.artist = artist;
    if (creationYear) product.creationYear = parseInt(creationYear);
    
    await product.save();
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Error updating product", error: error.message });
  }
});

// Delete a product
router.delete("/products/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    // Check if the product is used in any orders
    const orderItems = await OrderItem.findOne({ productId });
    
    if (orderItems) {
      // Don't delete, just mark as unavailable
      product.isAvailable = false;
      product.stockQuantity = 0;
      await product.save();
      return res.json({ message: "Product marked as unavailable (has order history)" });
    }
    
    // Delete related analytics
    await AdminAnalytics.deleteOne({ productId });
    
    // Delete the product
    await Product.deleteOne({ _id: productId });
    
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error: error.message });
  }
});

// Order management routes

// Get all orders with filtering and pagination
router.get("/orders", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    
    const query = status ? { status } : {};
    
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "username email");
    
    const total = await Order.countDocuments(query);
    
    res.json({
      orders,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
});

// Get order details
router.get("/orders/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId)
      .populate("userId", "username email");
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Error fetching order details", error: error.message });
  }
});

// Update order status
router.put("/orders/:orderId/status", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, note } = req.body;
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Update status using the method that tracks history
    await order.updateStatus(status, note);
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Error updating order status", error: error.message });
  }
});

// Add tracking number to order
router.put("/orders/:orderId/tracking", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { trackingNumber, shippingMethod } = req.body;
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    order.trackingNumber = trackingNumber;
    if (shippingMethod) order.shippingMethod = shippingMethod;
    
    // If adding tracking number and status is pending, update to processing
    if (order.status === 'pending') {
      await order.updateStatus('processing', 'Tracking number added');
    }
    
    await order.save();
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Error adding tracking number", error: error.message });
  }
});

// Get sales statistics
router.get("/statistics/sales", async (req, res) => {
  try {
    const period = req.query.period || 'week'; // week, month, year
    
    let dateFilter = {};
    const now = new Date();
    
    if (period === 'week') {
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: lastWeek } };
    } else if (period === 'month') {
      const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: lastMonth } };
    } else if (period === 'year') {
      const lastYear = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: lastYear } };
    }
    
    // Total sales in the period
    const totalSales = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          revenue: { $sum: "$totalAmount" }
        }
      }
    ]);
    
    // Daily sales within the period
    const dailySales = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          count: { $sum: 1 },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);
    
    res.json({
      total: totalSales.length > 0 ? totalSales[0] : { count: 0, revenue: 0 },
      daily: dailySales.map(day => ({
        date: `${day._id.year}-${day._id.month.toString().padStart(2, '0')}-${day._id.day.toString().padStart(2, '0')}`,
        count: day.count,
        revenue: day.revenue
      }))
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching sales statistics", error: error.message });
  }
});

export default router;
