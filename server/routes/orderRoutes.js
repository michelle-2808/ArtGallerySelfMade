// routes/orderRoutes.js
import express from "express";
import {
  Order,
  OrderItem,
  CartItem,
  Product,
  OtpCode,
  User,
} from "../models/index.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import crypto from "crypto";

const router = express.Router();

// Apply auth middleware to all order routes
router.use(authMiddleware);

// Get all orders for the current user
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching orders", error: error.message });
  }
});

// Get all orders for the current user (my-orders endpoint)
router.get("/my-orders", async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "items.productId",
        select: "title imageUrl price category",
      });

     if (!orders || orders.length === 0) {
       console.log(`No orders found for user ${userId}`);
       return res.status(200).json([]);
     }

     // Log the orders for debugging
     console.log(`Found ${orders.length} orders for user ${userId}`);

    res.json(orders);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching orders", error: error.message });
  }
});

// Get a specific order
router.get("/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: orderId, userId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching order", error: error.message });
  }
});

// Get order items for a specific order
router.get("/:orderId/items", async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    // Verify the order belongs to the user
    const order = await Order.findOne({ _id: orderId, userId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const orderItems = await OrderItem.find({ orderId }).populate(
      "productId",
      "title imageUrl category"
    );

    const formattedItems = orderItems.map((item) => ({
      _id: item._id,
      product: item.productId,
      quantity: item.quantity,
      price: item.price,
    }));

    res.json(formattedItems);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching order items", error: error.message });
  }
});

// Request OTP for order placement
router.post("/request-otp", async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user has items in cart
    const cartItems = await CartItem.find({ userId });

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    await OtpCode.create({
      userId,
      code: otp,
      purpose: "order_placement",
      expiresAt,
      used: false,
    });

    // Find user for email
    const user = await User.findById(userId);

    if (!user || !user.email) {
      throw new Error("User email not found");
    }

    // For demo purposes, just log the OTP
    console.log(`[ORDER OTP] Sending OTP ${otp} to ${user.email}`);

    // In a real application, send the OTP via email or SMS
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error sending OTP", error: error.message });
  }
});

// Place an order (with OTP verification)
router.post("/place-order", async (req, res) => {
  try {
    const { otp, shippingInfo } = req.body;
    const userId = req.user.id;

    // Validate OTP
    const otpRecord = await OtpCode.findOne({
      userId,
      code: otp,
      purpose: "order_placement",
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Mark OTP as used
    otpRecord.used = true;
    await otpRecord.save();

    // Get cart items
    const cartItems = await CartItem.find({ userId }).populate("productId");

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    // Calculate total amount
    let totalAmount = 0;

    // Validate stock for all items
    for (const item of cartItems) {
      const product = item.productId;

      if (!product.isAvailable || product.stockQuantity < item.quantity) {
        return res.status(400).json({
          message: `Product "${product.title}" is unavailable or has insufficient stock`,
        });
      }

      totalAmount += product.price * item.quantity;
    }

    // Create order
    const order = new Order({
      userId,
      status: "pending",
      totalAmount,
      shippingInfo,
      statusHistory: [
        { status: "pending", timestamp: new Date(), note: "Order placed" },
      ],
    });

    await order.save();

    // Create order items and update product stock
    for (const item of cartItems) {
      const product = item.productId;

      // Create order item
      await OrderItem.create({
        orderId: order._id,
        productId: product._id,
        quantity: item.quantity,
        price: product.price,
      });

      // Update product stock
      product.stockQuantity -= item.quantity;
      if (product.stockQuantity <= 0) {
        product.stockQuantity = 0;
        product.isAvailable = false;
      }

      await product.save();
    }

    // Clear the user's cart
    await CartItem.deleteMany({ userId });

    res.status(201).json({
      message: "Order placed successfully",
      orderId: order._id,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error placing order", error: error.message });
  }
});

export default router;
