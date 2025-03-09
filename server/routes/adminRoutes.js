
// routes/adminRoutes.js
import express from "express";
import { AdminAnalytics, Product, Order, User } from "../models/index.js";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Middleware to ensure only admins can access these routes
router.use(authMiddleware);
router.use(isAdmin);

// Get all product analytics
router.get("/analytics/products", async (req, res) => {
  try {
    const analytics = await AdminAnalytics.find().populate("productId");
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product analytics", error: error.message });
  }
});

// Get analytics for a specific product
router.get("/analytics/products/:productId", async (req, res) => {
  try {
    const analytics = await AdminAnalytics.findOne({ 
      productId: req.params.productId 
    }).populate("productId");
    
    if (!analytics) {
      return res.status(404).json({ message: "Analytics not found for this product" });
    }
    
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product analytics", error: error.message });
  }
});

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
    
    res.json({
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      totalUsers
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
      .populate("userId");
    
    res.json(recentOrders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching recent orders", error: error.message });
  }
});

export default router;
