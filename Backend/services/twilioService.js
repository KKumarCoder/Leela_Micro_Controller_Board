import twilio from "twilio";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

let client;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

// For development/testing
const devOtpStore = new Map();

export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const generateRequestId = () => {
  return `req_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
};

export const sendOtpSms = async (mobile, otp) => {
  try {
    // In production, use Twilio
    if (process.env.NODE_ENV === "production" && client) {
      const message = await client.messages.create({
        body: `Your Leela Board verification code is: ${otp}. Valid for 10 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: `+91${mobile}`,
      });
      console.log(`✅ OTP sent via Twilio to ${mobile}, SID: ${message.sid}`);
      return { success: true, messageSid: message.sid };
    } else {
      // Development mode
      console.log(`📱 [DEV] OTP for ${mobile}: ${otp}`);
      return { success: true, devOtp: otp };
    }
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    // Don't throw error in development
    if (process.env.NODE_ENV !== "production") {
      return { success: true, devOtp: otp };
    }
    throw new Error("Failed to send OTP");
  }
};

// Store OTP temporarily
export const storeOtp = (requestId, mobile, otp) => {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  devOtpStore.set(requestId, {
    mobile,
    otp,
    expiresAt,
    verified: false,
  });

  // Cleanup after 11 minutes
  setTimeout(() => {
    devOtpStore.delete(requestId);
  }, 11 * 60 * 1000);
};

export const getStoredOtp = (requestId) => {
  return devOtpStore.get(requestId);
};

// Simple OTP verification for development
export const verifyOtp = async (mobile, otp, requestId) => {
  const storedOtp = getStoredOtp(requestId);

  if (!storedOtp) {
    return { success: false, message: "OTP expired or invalid" };
  }

  if (storedOtp.otp !== otp || storedOtp.mobile !== mobile) {
    return { success: false, message: "Invalid OTP" };
  }

  if (new Date() > storedOtp.expiresAt) {
    devOtpStore.delete(requestId);
    return { success: false, message: "OTP expired" };
  }

  return { success: true, message: "OTP verified successfully" };
};

// import twilio from "twilio";
// import dotenv from "dotenv";
// import crypto from "crypto";

// dotenv.config();

// let client = null;

// if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
//   client = twilio(
//     process.env.TWILIO_ACCOUNT_SID,
//     process.env.TWILIO_AUTH_TOKEN
//   );
// }

// // Local store for dev mode
// const devOtpStore = new Map();

// export const generateOtp = () => {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// };

// export const generateRequestId = () => {
//   return `req_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
// };

// export const sendOtpSms = async (mobile, otp) => {
//   try {
//     // Normalize mobile number
//     const toNumber = mobile.startsWith("+") ? mobile : `+91${mobile}`;
//     const fromNumber =
//       process.env.TWILIO_FROM_NUMBER || process.env.TWILIO_PHONE_NUMBER;

//     // If Twilio client is configured, send SMS using Twilio
//     if (client && fromNumber) {
//       const message = await client.messages.create({
//         body: `Your Leela Board verification code is: ${otp}. Valid for 10 minutes.`,
//         from: fromNumber,
//         to: toNumber,
//       });

//       console.log("✅ OTP Sent Successfully:", message.sid);
//       return { success: true, messageSid: message.sid };
//     }

//     // Fallback (development) — still store and return devOtp
//     console.warn(
//       "Twilio not configured or TWILIO_FROM_NUMBER missing. Falling back to DEV mode (console)."
//     );
//     console.log("📱 DEV MODE: OTP =", otp, "for mobile:", toNumber);
//     return { success: true, devOtp: otp };
//   } catch (error) {
//     console.error("❌ OTP Error:", error.message || error);
//     if (process.env.NODE_ENV !== "production") {
//       return { success: true, devOtp: otp };
//     }
//     return { success: false, message: "Failed to send OTP" };
//   }
// };

// export const storeOtp = (requestId, mobile, otp) => {
//   devOtpStore.set(requestId, {
//     mobile,
//     otp,
//     expiresAt: new Date(Date.now() + 10 * 60 * 1000),
//   });

//   setTimeout(() => {
//     devOtpStore.delete(requestId);
//   }, 11 * 60 * 1000);
// };

// export const getStoredOtp = (requestId) => {
//   return devOtpStore.get(requestId);
// };

// export const verifyOtp = async (mobile, otp, requestId) => {
//   const stored = getStoredOtp(requestId);

//   if (!stored) return { success: false, message: "OTP expired or invalid" };

//   if (stored.mobile !== mobile)
//     return { success: false, message: "Invalid mobile" };
//   if (stored.otp !== otp) return { success: false, message: "Invalid OTP" };
//   if (new Date() > stored.expiresAt)
//     return { success: false, message: "OTP expired" };

//   return { success: true, message: "OTP verified successfully" };
// };
