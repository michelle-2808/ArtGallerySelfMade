
import express from "express";
import { Order } from "../models/index.js";
import { authMiddleware as isAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get user dashboard stats
router.get("/dashboard-stats", isAuth, async (req, res) => {
  try {
    // Get user's orders
    const orders = await Order.find({ user: req.user.id }).populate(
      "items.product"
    );

    // Calculate stats
    let totalSpent = 0;
    let totalItems = 0;
    let categoryCounts = {};

    orders.forEach((order) => {
      totalSpent += order.totalAmount;
      totalItems += order.items.length;

      // Count categories for favorite determination
      order.items.forEach((item) => {
        if (item.product && item.product.category) {
          const category = item.product.category;
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        }
      });
    });

    // Determine favorite category
    let favoriteCategory = "N/A";
    let maxCount = 0;
    Object.entries(categoryCounts).forEach(([category, count]) => {
      if (count > maxCount) {
        maxCount = count;
        favoriteCategory = category;
      }
    });

    // Calculate order frequency (per month)
    let orderFrequency = "0/month";
    if (orders.length > 0) {
      // Calculate months between first and last order
      const firstOrder = new Date(orders[orders.length - 1].createdAt);
      const lastOrder = new Date(orders[0].createdAt);

      // If only one order or orders on same day
      if (orders.length === 1 || firstOrder.getTime() === lastOrder.getTime()) {
        orderFrequency = `${orders.length}/month`;
      } else {
        const monthDiff =
          (lastOrder.getFullYear() - firstOrder.getFullYear()) * 12 +
          (lastOrder.getMonth() - firstOrder.getMonth());
        const frequency =
          monthDiff > 0 ? orders.length / monthDiff : orders.length;
        orderFrequency = `${frequency.toFixed(1)}/month`;
      }
    }

    // Determine loyalty status
    let loyaltyStatus = "Bronze";
    if (orders.length >= 5) {
      loyaltyStatus = "Gold";
    } else if (orders.length >= 3) {
      loyaltyStatus = "Silver";
    }

    const stats = {
      totalOrders: orders.length,
      totalSpent: totalSpent,
      averageOrderValue: orders.length > 0 ? totalSpent / orders.length : 0,
      totalItems: totalItems,
    };

    res.json({
      stats,
      favoriteCategory,
      orderFrequency,
      loyaltyStatus,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Error fetching dashboard stats" });
  }
});

export default router;
