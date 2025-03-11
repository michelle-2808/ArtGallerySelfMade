// routes/cartRoutes.js
import express from "express";
import { CartItem, Product } from "../models/index.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import OtpCode from "../models/OtpCode.js"; // Import existing OtpCode model

const router = express.Router();

// Apply auth middleware to all cart routes
router.use(authMiddleware);

// Get user's cart
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;

    // Get cart items with populated product details
    const cartItems = await CartItem.find({ userId })
      .populate("productId")
      .sort({ createdAt: -1 });

    // Transform for frontend display
    const formattedCart = cartItems.map((item) => ({
      _id: item._id,
      product: item.productId,
      quantity: item.quantity,
    }));

    res.json(formattedCart);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching cart", error: error.message });
  }
});

// Get user's cart item count
router.get("/count", async (req, res) => {
  try {
    const userId = req.user.id;

    // Count cart items for the user
    const count = await CartItem.countDocuments({ userId });

    res.json({ count });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching cart count", error: error.message });
  }
});

// Add item to cart
router.post("/add", async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    // Validate product exists and has sufficient stock
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!product.isAvailable || product.stockQuantity < quantity) {
      return res
        .status(400)
        .json({ message: "Product is unavailable or insufficient stock" });
    }

    // Check if product already in cart
    let cartItem = await CartItem.findOne({ userId, productId });

    if (cartItem) {
      // Update quantity if already in cart
      cartItem.quantity += parseInt(quantity);

      // Ensure we don't exceed available stock
      if (cartItem.quantity > product.stockQuantity) {
        cartItem.quantity = product.stockQuantity;
      }

      await cartItem.save();
    } else {
      // Add new item to cart
      cartItem = new CartItem({
        userId,
        productId,
        quantity: parseInt(quantity),
      });

      await cartItem.save();
    }

    res.status(200).json({
      message: "Product added to cart",
      cartItem,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding to cart", error: error.message });
  }
});

// Update cart item quantity
router.put("/:itemId", async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    // Ensure valid quantity
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    // Find cart item
    const cartItem = await CartItem.findOne({ _id: itemId, userId });

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    // Verify product has sufficient stock
    const product = await Product.findById(cartItem.productId);

    if (!product || !product.isAvailable) {
      return res
        .status(400)
        .json({ message: "Product is no longer available" });
    }

    if (quantity > product.stockQuantity) {
      return res.status(400).json({
        message: "Requested quantity exceeds available stock",
        availableStock: product.stockQuantity,
      });
    }

    // Update the quantity
    cartItem.quantity = parseInt(quantity);
    await cartItem.save();

    res.status(200).json({ message: "Cart updated", cartItem });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating cart", error: error.message });
  }
});

// Remove item from cart
router.delete("/:itemId", async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;

    const result = await CartItem.deleteOne({ _id: itemId, userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.status(200).json({ message: "Item removed from cart" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error removing item from cart", error: error.message });
  }
});

// Clear cart
router.delete("/", async (req, res) => {
  try {
    const userId = req.user.id;

    await CartItem.deleteMany({ userId });

    res.status(200).json({ message: "Cart cleared" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error clearing cart", error: error.message });
  }
});


// Process checkout
router.post("/checkout", async (req, res) => {
  try {
    const userId = req.user.id;
    const { shippingInfo } = req.body;
    
    // Get cart items
    const cartItems = await CartItem.find({ userId })
      .populate("productId");
    
    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }
    
    // Calculate total amount and validate stock
    let totalAmount = 0;
    
    for (const item of cartItems) {
      const product = item.productId;
      
      if (!product.isAvailable || product.stockQuantity < item.quantity) {
        return res.status(400).json({ 
          message: `Product "${product.title}" is unavailable or has insufficient stock`
        });
      }
      
      totalAmount += product.price * item.quantity;
    }
    
    // Generate OTP for order confirmation
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save OTP to database
    const otp = new OtpCode({
      userId,
      code: otpCode,
      purpose: 'order_placement',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiry
    });
    
    await otp.save();
    
    // TODO: In a production environment, send OTP via email or SMS
    // For demo purposes, we'll return it in the response
    
    res.json({ 
      message: "Checkout initiated", 
      totalAmount,
      otpCode, // In production, remove this and send via secure channel
      cartItems: cartItems.length
    });
    
  } catch (error) {
    res.status(500).json({ 
      message: "Error processing checkout", 
      error: error.message 
    });
  }
});


export default router;
