import express from "express";
import http from "http";
import { setupVite, serveStatic } from "./vite.js";
import connectDB from "./db.js";
import session from "express-session"; // For session management
import MongoStore from "connect-mongo"; // Store sessions in MongoDB
import dotenv from "dotenv";
import path from 'path'; // Import path module
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

// Authentication middleware has been moved to middleware/authMiddleware.js
// Email sending logic has been moved to routes/authRoutes.js


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
import userRoutes from "./routes/userRoutes.js"; 
import customOrderRoutes from "./routes/customOrderRoutes.js"

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
app.use("/api/users", userRoutes);
app.use("/api/custom-orders", customOrderRoutes);


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
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

startServer();