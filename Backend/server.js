import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// Routes
import enquiryRoutes from "./routes/enquiryRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// CORS configuration - ALLOW ALL ORIGINS FOR DEVELOPMENT
const corsOptions = {
  origin: "*", // Allow all origins for development
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));

// Rate limiting (temporarily disable for testing)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Increased for testing
  message: "Too many requests from this IP",
});

app.use("/api/", limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/leela_enquiries",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Add middleware to set headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API is working!",
    timestamp: new Date().toISOString(),
    allowedOrigins: "All origins for development",
  });
});

// Routes
app.use("/api/enquiry", enquiryRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 CORS enabled for ALL origins`);
  console.log(`📡 Frontend: http://localhost:5173`);
  console.log(`📡 Backend API: http://localhost:${PORT}/api`);
});
