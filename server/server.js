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
import path from 'path'; //Import path module
import fs from 'fs'; // Added for file system operations


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

// All authentication related routes have been moved to authRoutes.js


// Import routes
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);


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