// import express from "express";
// import {
//   getAllEnquiries,
//   getEnquiry,
//   updateEnquiryStatus,
//   getStatistics,
//   getDashboardStats,
//   deleteEnquiry,
// } from "../controllers/enquiryController.js";

// const router = express.Router();

// // Admin dashboard routes (without auth for now - add auth later)
// router.get("/enquiries", getAllEnquiries);
// router.get("/enquiries/:id", getEnquiry);
// router.put("/enquiries/:id", updateEnquiryStatus);
// router.delete("/enquiries/:id", deleteEnquiry);
// router.get("/stats", getStatistics);
// router.get("/dashboard-stats", getDashboardStats);

// export default router;

import express from "express";
import {
  getAllEnquiries,
  getEnquiry,
  updateEnquiryStatus,
  getStatistics,
  getDashboardStats,
  deleteEnquiry,
  exportEnquiries,
} from "../controllers/enquiryController.js";

const router = express.Router();

// Admin dashboard routes
router.get("/enquiries", getAllEnquiries);
router.get("/enquiries/:id", getEnquiry);
router.put("/enquiries/:id", updateEnquiryStatus);
router.delete("/enquiries/:id", deleteEnquiry);
router.get("/stats", getStatistics);
router.get("/dashboard-stats", getDashboardStats);
router.get("/export", exportEnquiries);

export default router;
