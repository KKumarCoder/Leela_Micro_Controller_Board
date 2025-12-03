import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema(
  {
    enquiryId: {
      type: String,
      unique: true,
      required: true,
      default: () =>
        `ENQ-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 4)
          .toUpperCase()}`,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      match: [/^[0-9]{10}$/, "Please enter a valid 10-digit mobile number"],
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    mobileToken: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "cancelled"],
      default: "pending",
    },
    notes: [
      {
        content: String,
        addedBy: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    assignedTo: {
      type: String,
      default: "",
    },
    isMobileVerified: {
      type: Boolean,
      default: false,
    },
    reminderCount: {
      type: Number,
      default: 0,
    },
    lastReminderSent: Date,
    metadata: {
      ipAddress: String,
      userAgent: String,
      referrer: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
enquirySchema.index({ email: 1 });
enquirySchema.index({ mobile: 1 });
enquirySchema.index({ status: 1 });
enquirySchema.index({ createdAt: -1 });
enquirySchema.index({ enquiryId: 1 });

const Enquiry = mongoose.model("Enquiry", enquirySchema);

export default Enquiry;
