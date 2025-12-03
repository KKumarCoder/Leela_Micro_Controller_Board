import Enquiry from "../models/Enquiry.js";
import crypto from "crypto";
import {
  sendConfirmationEmail,
  sendManagerNotification,
} from "../services/emailService.js";

// In-memory OTP store
const otpStore = new Map();

// Request OTP
export const requestOtp = async (req, res) => {
  try {
    const { mobile } = req.body;

    // Validate mobile
    if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid 10-digit mobile number",
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const requestId = `req_${Date.now()}_${crypto
      .randomBytes(4)
      .toString("hex")}`;

    // Store OTP
    otpStore.set(requestId, {
      mobile,
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      verified: false,
    });

    console.log(`📱 OTP for ${mobile}: ${otp}`);

    // Cleanup after 15 minutes
    setTimeout(() => {
      otpStore.delete(requestId);
    }, 15 * 60 * 1000);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      requestId,
      devOtp: otp, // Return OTP for development
    });
  } catch (error) {
    console.error("❌ Error in requestOtp:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};

// Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { mobile, otp, requestId } = req.body;

    // console.log("🔍 Verifying:----", { mobile, otp, requestId });

    // Validate input
    if (!mobile || !otp || !requestId) {
      return res.status(400).json({
        success: false,
        message: "Mobile, OTP, and requestId are required",
      });
    }

    // Get stored OTP
    const storedData = otpStore.get(requestId);

    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: "OTP expired or invalid request",
      });
    }

    // Verify mobile
    if (storedData.mobile !== mobile) {
      return res.status(400).json({
        success: false,
        message: "Mobile number mismatch",
      });
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Check expiry
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(requestId);
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    // Mark as verified
    storedData.verified = true;
    otpStore.set(requestId, storedData);

    // Generate mobile token
    const mobileToken = crypto.randomBytes(32).toString("hex");

    res.status(200).json({
      success: true,
      message: "Mobile number verified successfully",
      mobileToken,
    });
  } catch (error) {
    console.error("❌ Error in verifyOtp:", error);
    res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};

// Submit enquiry
export const submitEnquiry = async (req, res) => {
  try {
    const { name, email, mobile, subject, message, mobileToken } = req.body;

    // Basic validation
    const errors = [];

    if (!name?.trim()) errors.push("Name is required");
    if (!email?.trim() || !/^\S+@\S+\.\S+$/.test(email))
      errors.push("Valid email is required");
    if (!mobile || !/^[0-9]{10}$/.test(mobile))
      errors.push("Valid 10-digit mobile number is required");
    if (!subject?.trim()) errors.push("Subject is required");
    if (!message?.trim()) errors.push("Message is required");

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    // Check mobile verification
    let isMobileVerified = false;
    if (mobileToken) {
      // In a real app, verify the token signature
      isMobileVerified = true;
    }

    // Create enquiry with metadata
    const enquiry = new Enquiry({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      mobile,
      subject: subject.trim(),
      message: message.trim(),
      mobileToken: mobileToken || "",
      isMobileVerified,
      status: "pending",
      metadata: {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get("user-agent"),
        referrer: req.get("referer"),
      },
    });

    await enquiry.save();

    // Send emails (async - don't await)
    sendConfirmationEmail(enquiry).catch((err) =>
      console.error("Email error:", err)
    );

    sendManagerNotification(enquiry).catch((err) =>
      console.error("Manager email error:", err)
    );

    res.status(201).json({
      success: true,
      message: "Enquiry submitted successfully",
      data: {
        enquiryId: enquiry.enquiryId,
        name: enquiry.name,
        email: enquiry.email,
        submittedAt: enquiry.createdAt,
      },
    });
  } catch (error) {
    console.error("❌ Error in submitEnquiry:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate enquiry detected",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to submit enquiry",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get all enquiries with filtering and pagination
export const getAllEnquiries = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
      mobileVerified,
    } = req.query;

    // Build query
    const query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (mobileVerified === "true") {
      query.isMobileVerified = true;
    } else if (mobileVerified === "false") {
      query.isMobileVerified = false;
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { mobile: searchRegex },
        { subject: searchRegex },
        { enquiryId: searchRegex },
        { message: searchRegex },
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get total count
    const total = await Enquiry.countDocuments(query);

    // Get enquiries with all fields
    const enquiries = await Enquiry.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(); // Convert to plain objects

    // Add serial numbers
    const enquiriesWithSN = enquiries.map((enquiry, index) => ({
      ...enquiry,
      serialNo: (page - 1) * limit + index + 1,
    }));

    res.status(200).json({
      success: true,
      data: enquiriesWithSN,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("❌ Error in getAllEnquiries:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch enquiries",
    });
  }
};

// Get single enquiry
export const getEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const enquiry = await Enquiry.findById(id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    res.status(200).json({
      success: true,
      data: enquiry,
    });
  } catch (error) {
    console.error("❌ Error in getEnquiry:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch enquiry",
    });
  }
};

// Update enquiry status with more fields
export const updateEnquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, assignedTo, priority, followUpDate } = req.body;

    const enquiry = await Enquiry.findById(id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    // Update status
    if (
      status &&
      ["pending", "processing", "completed", "cancelled"].includes(status)
    ) {
      enquiry.status = status;
      enquiry.updatedAt = new Date();
    }

    // Add note if provided
    if (notes?.trim()) {
      enquiry.notes.push({
        content: notes.trim(),
        addedBy: "Admin", // In production, get from authenticated user
        createdAt: new Date(),
      });
    }

    // Assign to manager
    if (assignedTo) {
      enquiry.assignedTo = assignedTo;
    }

    // Set priority
    if (priority && ["low", "medium", "high", "urgent"].includes(priority)) {
      enquiry.priority = priority;
    }

    // Set follow-up date
    if (followUpDate) {
      enquiry.followUpDate = new Date(followUpDate);
    }

    await enquiry.save();

    res.status(200).json({
      success: true,
      message: "Enquiry updated successfully",
      data: enquiry,
    });
  } catch (error) {
    console.error("❌ Error in updateEnquiryStatus:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update enquiry",
    });
  }
};

// Get basic statistics
export const getStatistics = async (req, res) => {
  try {
    const [total, pending, processing, completed] = await Promise.all([
      Enquiry.countDocuments(),
      Enquiry.countDocuments({ status: "pending" }),
      Enquiry.countDocuments({ status: "processing" }),
      Enquiry.countDocuments({ status: "completed" }),
    ]);

    res.status(200).json({
      success: true,
      data: { total, pending, processing, completed },
    });
  } catch (error) {
    console.error("❌ Error in getStatistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get stats",
    });
  }
};

// Get dashboard statistics with more details
export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const [
      total,
      pending,
      processing,
      completed,
      cancelled,
      todayCount,
      yesterdayCount,
      weekCount,
      monthCount,
      verifiedCount,
    ] = await Promise.all([
      Enquiry.countDocuments(),
      Enquiry.countDocuments({ status: "pending" }),
      Enquiry.countDocuments({ status: "processing" }),
      Enquiry.countDocuments({ status: "completed" }),
      Enquiry.countDocuments({ status: "cancelled" }),
      Enquiry.countDocuments({
        createdAt: { $gte: today },
      }),
      Enquiry.countDocuments({
        createdAt: {
          $gte: yesterday,
          $lt: today,
        },
      }),
      Enquiry.countDocuments({
        createdAt: { $gte: lastWeek },
      }),
      Enquiry.countDocuments({
        createdAt: { $gte: lastMonth },
      }),
      Enquiry.countDocuments({
        isMobileVerified: true,
      }),
    ]);

    // Get status percentages
    const pendingPercent = total > 0 ? ((pending / total) * 100).toFixed(1) : 0;
    const processingPercent =
      total > 0 ? ((processing / total) * 100).toFixed(1) : 0;
    const completedPercent =
      total > 0 ? ((completed / total) * 100).toFixed(1) : 0;

    // Get daily average for last 7 days
    const dailyAverage = weekCount > 0 ? (weekCount / 7).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        processing,
        completed,
        cancelled,
        today: todayCount,
        yesterday: yesterdayCount,
        last7Days: weekCount,
        last30Days: monthCount,
        verified: verifiedCount,
        pendingPercent,
        processingPercent,
        completedPercent,
        dailyAverage,
        responseRate: total > 0 ? ((completed / total) * 100).toFixed(1) : 0,
      },
    });
  } catch (error) {
    console.error("❌ Error in getDashboardStats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get dashboard statistics",
    });
  }
};

// Delete enquiry
export const deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;

    const enquiry = await Enquiry.findByIdAndDelete(id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Enquiry deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error in deleteEnquiry:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete enquiry",
    });
  }
};

// Export enquiries to CSV
export const exportEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });

    // Convert to CSV format
    const headers = [
      "Enquiry ID",
      "Name",
      "Email",
      "Mobile",
      "Subject",
      "Message",
      "Status",
      "Mobile Verified",
      "Created At",
      "Updated At",
    ];

    const csvData = enquiries.map((enquiry) => [
      enquiry.enquiryId,
      enquiry.name,
      enquiry.email,
      enquiry.mobile,
      enquiry.subject,
      enquiry.message.replace(/"/g, '""'), // Escape quotes
      enquiry.status,
      enquiry.isMobileVerified ? "Yes" : "No",
      new Date(enquiry.createdAt).toLocaleString("en-IN"),
      new Date(enquiry.updatedAt).toLocaleString("en-IN"),
    ]);

    const csv = [headers, ...csvData]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=enquiries_${Date.now()}.csv`
    );
    res.send(csv);
  } catch (error) {
    console.error("❌ Error in exportEnquiries:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export enquiries",
    });
  }
};
