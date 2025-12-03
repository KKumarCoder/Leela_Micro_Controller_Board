

import express from "express";
import {
  requestOtp,
  verifyOtp,
  submitEnquiry,
  getAllEnquiries,
  getEnquiry,
  updateEnquiryStatus,
  getStatistics,
  getDashboardStats,
  deleteEnquiry,
  exportEnquiries,
} from "../controllers/enquiryController.js";
import { validateRequest } from "../middlewares/validationMiddleware.js";

const router = express.Router();

// Public routes
router.post("/request-otp", validateRequest(["mobile"]), requestOtp);
router.post(
  "/verify-otp",
  validateRequest(["mobile", "otp", "requestId"]),
  verifyOtp
);
router.post(
  "/submit",
  validateRequest(["name", "email", "mobile", "subject", "message"]),
  submitEnquiry
);

// Admin routes
router.get("/all", getAllEnquiries);
router.get("/stats", getStatistics);
router.get("/dashboard-stats", getDashboardStats);
router.get("/export", exportEnquiries);
router.get("/:id", getEnquiry);
router.put("/:id/update", updateEnquiryStatus);
router.delete("/:id", deleteEnquiry);

export default router;
