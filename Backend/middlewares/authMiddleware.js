import jwt from "jsonwebtoken";

// Simple admin authentication (for demo)
export const authenticateAdmin = (req, res, next) => {
  try {
    // For demo purposes, allow access without authentication
    // In production, implement proper JWT authentication
    req.user = {
      email: "admin@leelaboard.com",
      role: "admin",
    };
    return next();

    // Uncomment for production:
    /*
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
    */
  } catch (error) {
    console.error("❌ Auth error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
