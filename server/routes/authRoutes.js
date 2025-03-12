import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User, OtpCode } from "../models/index.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import crypto from "crypto";

const router = express.Router();

// Helper function to send password reset email (mock for now)
const sendPasswordResetEmail = async (email, token) => {
  const resetLink = `${
    process.env.BASE_URL || "http://localhost:3000"
  }/reset-password/${token}`;
  console.log(
    `Sending password reset email to ${email}. Reset link: ${resetLink}`
  );
  // In production, implement actual email sending here
};

// 1. Request OTP (POST /api/auth/request-otp)
router.post("/request-otp", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Generate OTP (simple example, use a library in production)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiration = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store the OTP in the session
    req.session.otp = otp;
    req.session.otpExpiration = otpExpiration;
    req.session.email = email; // Store email to verify
    req.session.password = await bcrypt.hash(password, 10); // Hash and store password
    req.session.save(); // Save the session explicitly

    // Send OTP (replace with actual sending, e.g., Nodemailer)
    console.log(`Sending OTP ${otp} to ${email}`); // Replace with actual sending
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error during OTP request:", error);
    res
      .status(500)
      .json({ message: "Internal server error during OTP request" });
  }
});

// 2. Register (POST /api/auth/register)
router.post("/register", async (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({ message: "OTP is required" });
  }
  // Check if there's a pending registration in the session
  if (!req.session.otp || !req.session.email || !req.session.password) {
    return res.status(400).json({ message: "Invalid registration attempt" });
  }

  // Verify OTP
  if (req.session.otp !== otp || Date.now() > req.session.otpExpiration) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  const email = req.session.email;
  const password = req.session.password;

  try {
    //Create user
    const newUser = new User({
      email,
      password, // Already hashed in request-otp endpoint
      username: email.split("@")[0], //create username
    });
    await newUser.save();

    // Clear the OTP data from the session
    delete req.session.otp;
    delete req.session.otpExpiration;
    delete req.session.email;
    delete req.session.password;

    // Set user in the session (log them in immediately)
    req.session.user = {
      id: newUser._id,
      email: newUser.email,
      username: newUser.username,
      isAdmin: newUser.isAdmin,
    }; // Store user info in session
    req.session.save();

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        isAdmin: newUser.isAdmin,
      },
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res
      .status(500)
      .json({ message: "Internal server error during registration" });
  }
});

// 3. Login (POST /api/auth/login)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordMatch = await user.checkPassword(password); // Use checkPassword method from User model
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Set user information in the session
    req.session.user = {
      id: user._id,
      email: user.email,
      username: user.username,
      isAdmin: user.isAdmin,
    };
    req.session.save(); // Save session

    // Generate JWT token
    const secret = process.env.JWT_SECRET || "your_fallback_secret_key";
    const token = jwt.sign(
      { id: user._id, email: user.email, isAdmin: user.isAdmin },
      secret,
      { expiresIn: "24h" }
    );

    // Return token with response
    res.status(200).json({
      message: "Login successful",
      token: token, // Include the JWT token in the response
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error during login" });
  }
});

// 4. Logout (POST /api/auth/logout)
router.post("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      // Destroy the session
      if (err) {
        res
          .status(500)
          .json({ message: "Could not log out, please try again" });
      } else {
        res.status(200).json({ message: "Logout successful" });
      }
    });
  } else {
    res.status(200).json({ message: "Logout successful" }); // Already logged out
  }
});

// 5. Profile (GET /api/auth/profile)
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "Profile accessed", user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res
      .status(500)
      .json({ message: "Error fetching user profile", error: error.message });
  }
});

// Validate token
router.get("/validate-token", authMiddleware, (req, res) => {
  res.status(200).json({ valid: true, user: req.user });
});

// Update user profile
router.post("/update-profile", authMiddleware, async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    // Find and update the user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        username: name,
        phone,
        address,
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Error updating profile:", error);
    res
      .status(500)
      .json({ message: "Error updating profile", error: error.message });
  }
});

// 6. Request Password Reset (POST /api/auth/forgot-password)
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      // Security best practice: Don't reveal whether the email exists.
      return res.status(200).json({
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
    }

    const token = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    await sendPasswordResetEmail(email, token);

    res.status(200).json({
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Error requesting password reset:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// 7. Reset Password (POST /api/auth/reset-password/:token)
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: "New password is required." });
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired password reset token." });
    }

    user.password = password; // The pre('save') hook will hash it
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

export default router;
