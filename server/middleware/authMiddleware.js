import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authMiddleware = async (req, res, next) => {
  try {
    // Check for authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    // Extract token - make sure it's properly formatted
    // Should be in format: "Bearer <token>"
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res
        .status(401)
        .json({
          message: "Authorization format invalid. Use 'Bearer <token>'",
        });
    }

    const token = parts[1];

    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res
      .status(401)
      .json({ message: "Authentication failed", error: error.message });
  }
};

export const adminMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!req.user.isAdmin) {
      return res
        .status(403)
        .json({ message: "Access denied: Admin privileges required" });
    }

    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    return res.status(403).json({ message: "Admin authentication failed" });
  }
};

// Export adminMiddleware as isAdmin for compatibility with routes
export const isAdmin = adminMiddleware;
