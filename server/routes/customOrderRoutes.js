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
    // Generate order number first
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    const orderNumber = `CUST-${timestamp}-${random}`;

    const customOrder = new CustomOrder({
      orderNumber,
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
        customizations: req.body.productDetails.customizations || "",
        expectedPrice: Number(req.body.productDetails.expectedPrice) || 0,
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
      // Add initial status to history
      customOrder.statusHistory = [
        {
          status: "pending",
          timestamp: new Date(),
          note: "Custom order placed",
        },
      ];

      // Save the order
      await customOrder.save();

      // Double check the save was successful
      const savedOrder = await CustomOrder.findById(customOrder._id);
      if (!savedOrder) {
        throw new Error("Failed to save custom order");
      }
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

// Get specific custom order
router.get("/:orderId", isAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await CustomOrder.findOne({ _id: orderId, userId });

    if (!order) {
      return res.status(404).json({
        message: "Custom order not found",
        errorType: "NOT_FOUND",
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching custom order",
      error: error.message,
      errorType: "SERVER_ERROR",
    });
  }
});

// Admin routes - moved to top to prevent conflict with :orderId route
router.get("/admin/list", isAuth, isAdmin, async (req, res) => {
  try {
    const orders = await CustomOrder.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res
      .status(500)
      .json({ message: "Error fetching orders", error: error.message });
  }
});

// Admin route to get the custom orders in CustomOrderDetail page.
router.get("/admin/:orderId", isAuth, isAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await CustomOrder.findById(orderId).populate(
      "userId",
      "name email"
    );

    if (!order) {
      return res.status(404).json({ message: "Custom order not found" });
    }

    res.json(order);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching custom order", error: error.message });
  }
});


router.patch("/admin/:orderId/status", isAuth, isAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, adminNotes, approvedPrice, validationNotes } = req.body;

    const order = await CustomOrder.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    order.adminNotes = adminNotes;
    order.approvedPrice = approvedPrice;
    order.validationNotes = validationNotes;
    order.approvedBy = req.user.id;

    // Add to status history
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: `Status updated to ${status}${
        validationNotes ? ` - ${validationNotes}` : ""
      }`,
    });

    await order.save();
    res.json({ message: "Order updated successfully", order });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating order", error: error.message });
  }
});

export default router;
