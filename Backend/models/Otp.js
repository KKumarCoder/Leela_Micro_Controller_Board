import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    mobile: {
      type: String,
      required: true,
      match: [/^[0-9]{10}$/, "Invalid mobile number"],
    },
    otp: {
      type: String,
      required: true,
    },
    requestId: {
      type: String,
      required: true,
      unique: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: Date,
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create TTL index for automatic cleanup (1 hour expiry)
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });

const Otp = mongoose.model("Otp", otpSchema);

export default Otp;
