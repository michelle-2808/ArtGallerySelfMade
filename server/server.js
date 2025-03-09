import express from "express";
import http from "http";
import { setupVite, serveStatic } from "./vite.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import connectDB from "./db.js";
import session from "express-session"; // For session management
import MongoStore from "connect-mongo"; // Store sessions in MongoDB
import dotenv from "dotenv";
import { User } from "./models/index.js"; // Import the User model
// CORRECT (for modern Node.js)
import crypto from "crypto";

dotenv.config();

// Initialize express app
const app = express();

// Parse JSON requests
app.use(express.json());

// --- Session Configuration ---
const sessionSecret =
  process.env.SESSION_SECRET || "your-super-secret-session-key"; // Use environment variable
if (!process.env.SESSION_SECRET) {
  console.warn(
    "SESSION_SECRET is not defined.  Using a default secret is INSECURE!"
  );
}

app.use(
  session({
    secret: sessionSecret,
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something stored
    cookie: {
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
      maxAge: 1000 * 60 * 60 * 24, // Session expiration (24 hours) - adjust as needed
    },
    store: MongoStore.create({
      // Store sessions in MongoDB
      mongoUrl: process.env.DATABASE_URL,
      // You can add other options here, like autoRemove: 'native' (to use MongoDB's TTL)
    }),
  })
);

// --- JWT Secret ---
const jwtSecret = process.env.JWT_SECRET || "your-super-secret-jwt-key";
if (!process.env.JWT_SECRET) {
  console.warn(
    "JWT_SECRET is not defined in your environment variables. Using a default is INSECURE"
  );
}

// --- Helper Functions ---
// --- Authentication middleware (protect routes) ---
function authenticateToken(req, res, next) {
  // Use session-based authentication
  if (req.session && req.session.user) {
    // If user is in the session, they're authenticated
    req.user = req.session.user; // make user accessible.
    return next();
  }

  // Fallback to JWT authentication (if needed for API clients that don't use cookies)
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  jwt.verify(token, jwtSecret, async (err, decoded) => {
    //verify token
    if (err) {
      return res.status(403).json({ message: "Forbidden: Invalid token" });
    }
    try {
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      req.user = user;
      next();
    } catch (error) {
      console.error("Error finding user:", error);
      return res
        .status(500)
        .json({ message: "Internal server error during authentication" });
    }
  });
}


// --- Mock Email Sending Function (Replace with Real Email Sending) ---
const sendPasswordResetEmail = async (email, token) => {
    const resetLink = `${process.env.BASE_URL}/reset-password/${token}`;
    console.log(`Sending password reset email to ${email}.  Reset link: ${resetLink}`);
};


// --- API Routes ---

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Express API!" });
});

// 1. Request OTP (POST /api/request-otp)
app.post("/api/request-otp", async (req, res) => {
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

    // Store the OTP in the session (instead of saving it directly to the user)
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

// 2. Register (POST /api/register)
app.post("/api/register", async (req, res) => {
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
      password,
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
    }; // Store user info in session
    req.session.save();

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username,
      },
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res
      .status(500)
      .json({ message: "Internal server error during registration" });
  }
});

// 3. Login (POST /api/login)
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordMatch = await user.checkPassword(password); //use checkPassword
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Set user information in the session
    req.session.user = {
      id: user._id,
      email: user.email,
      username: user.username,
    };
    req.session.save(); // Save session

    res
      .status(200)
      .json({
        message: "Login successful",
        user: { id: user._id, email: user.email, username: user.username },
      });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error during login" });
  }
});

// 4. Logout (POST /api/logout)
app.post("/api/logout", (req, res) => {
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

// 5. Protected Route Example (GET /api/profile)
app.get("/api/profile", authenticateToken, (req, res) => {
  res.status(200).json({ message: "Profile accessed", user: req.user });
});





// --- Forgot Password Routes ---

// 1.  Request Password Reset (POST /api/forgot-password)
app.post("/api/forgot-password", async (req, res) => {
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

        const crypt  = crypto.randomBytes(20)
        const token = crypt.toString('hex');
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

// 2. Reset Password (POST /api/reset-password/:token)
app.post("/api/reset-password/:token", async (req, res) => {
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

        user.password = password; // The pre('save') hook will hash it.
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: "Password has been reset successfully." });
    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// --- Existing Routes (Register, Request OTP, Login, Logout, Profile) ---

// 1. Request OTP (POST /api/request-otp)
app.post("/api/request-otp", async (req, res) => {
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

    // Store the OTP in the session (instead of saving it directly to the user)
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

// 2. Register (POST /api/register)
app.post("/api/register", async (req, res) => {
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
      password,
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
    }; // Store user info in session
    req.session.save();

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username,
      },
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res
      .status(500)
      .json({ message: "Internal server error during registration" });
  }
});

// 3. Login (POST /api/login)
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordMatch = await user.checkPassword(password); //use checkPassword
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Set user information in the session
    req.session.user = {
      id: user._id,
      email: user.email,
      username: user.username,
    };
    req.session.save(); // Save session

    res
      .status(200)
      .json({
        message: "Login successful",
        user: { id: user._id, email: user.email, username: user.username },
      });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error during login" });
  }
});

// 4. Logout (POST /api/logout)
app.post("/api/logout", (req, res) => {
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

// 5. Protected Route Example (GET /api/profile)
app.get("/api/profile", authenticateToken, (req, res) => {
  res.status(200).json({ message: "Profile accessed", user: req.user });
});

// --- Server Setup ---
const server = http.createServer(app);

async function startServer() {
  try {
    await connectDB();
    if (process.env.NODE_ENV !== "production") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

startServer();
// In your server.js file, add this near your other route imports and usage
import adminRoutes from "./routes/adminRoutes.js";

// Add this with your other app.use statements
app.use("/api/admin", adminRoutes);
