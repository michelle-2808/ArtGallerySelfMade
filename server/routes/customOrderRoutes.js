import express from "express";
import CustomOrder from "../models/CustomOrder.js";
import OtpCode from "../models/OtpCode.js";
import {
  authMiddleware as isAuth,
  isAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Request OTP
router.post("/request-otp", isAuth, async (req, res) => {
  try {
    const { phone, email } = req.body;
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to database
    const otp = new OtpCode({
      userId: req.user.id,
      code: otpCode,
      purpose: "custom_order",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
    });

    await otp.save();

    // For demo purposes, log the OTP
    console.log(`[CUSTOM ORDER OTP] ${otpCode} sent to ${phone} and ${email}`);

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error sending OTP", error: error.message });
  }
});

// Verify OTP and Submit Order
router.post("/submit", isAuth, async (req, res) => {
  try {
    const { otp } = req.body;

    // Verify OTP
    const otpRecord = await OtpCode.findOne({
      userId: req.user.id,
      code: otp,
      purpose: "custom_order",
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Mark OTP as used
    otpRecord.used = true;
    await otpRecord.save();

    // Create custom order with request body data
    const customOrder = new CustomOrder({
      userId: req.user.id,
      customerInfo: {
        name: req.body.customerInfo.name,
        phone: req.body.customerInfo.phone,
        email: req.body.customerInfo.email,
        otpVerified: true,
      },
      productDetails: {
        title: req.body.productDetails.title,
        description: req.body.productDetails.description,
        specifications: req.body.productDetails.specifications,
        customizations: req.body.productDetails.customizations,
        expectedPrice: req.body.productDetails.expectedPrice,
        attachments: req.body.productDetails.attachments || [],
      },
      shippingAddress: {
        street: req.body.shippingAddress.street,
        city: req.body.shippingAddress.city,
        state: req.body.shippingAddress.state,
        zip: req.body.shippingAddress.zip,
        country: req.body.shippingAddress.country,
      },
      status: "pending",
    });

    try {
      await customOrder.save();
    } catch (err) {
      console.error("Save error:", err);
      throw err;
    }

    res.status(201).json({
      message: "Custom order created successfully",
      orderId: customOrder._id,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating custom order", error: error.message });
  }
});

// Get user's custom orders
router.get("/my-orders", isAuth, async (req, res) => {
  try {
    const orders = await CustomOrder.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching orders", error: error.message });
  }
});

// Admin routes
router.get("/all", isAuth, isAdmin, async (req, res) => {
  try {
    const orders = await CustomOrder.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching orders", error: error.message });
  }
});

router.patch("/:orderId/status", isAuth, isAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, adminNotes, approvedPrice } = req.body;

    const order = await CustomOrder.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    order.adminNotes = adminNotes;
    order.approvedPrice = approvedPrice;
    order.approvedBy = req.user.id;

    await order.save();
    res.json({ message: "Order updated successfully", order });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating order", error: error.message });
  }
});

export default router;
