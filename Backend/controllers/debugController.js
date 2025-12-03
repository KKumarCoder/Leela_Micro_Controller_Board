import crypto from 'crypto';

// Simple in-memory storage for OTPs
const otpStore = new Map();

// Request OTP (Debug version)
export const requestOtpDebug = async (req, res) => {
  try {
    const { mobile } = req.body;
    
    // Validate mobile
    if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number'
      });
    }
    
    // Generate OTP and request ID
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const requestId = `req_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    
    // Store OTP in memory
    otpStore.set(requestId, {
      mobile,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      verified: false
    });
    
    console.log(`📱 OTP for ${mobile}: ${otp}`);
    console.log(`🔑 Request ID: ${requestId}`);
    
    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      requestId,
      otp // Returning OTP for testing
    });
  } catch (error) {
    console.error('❌ Error in requestOtp:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
};

// Verify OTP (Debug version)
export const verifyOtpDebug = async (req, res) => {
  try {
    const { mobile, otp, requestId } = req.body;
    
    console.log('📱 Received verification request:', { mobile, otp, requestId });
    
    // Validate input
    if (!mobile || !otp || !requestId) {
      return res.status(400).json({
        success: false,
        message: 'Mobile, OTP, and requestId are required'
      });
    }
    
    // Get stored OTP
    const storedOtp = otpStore.get(requestId);
    
    console.log('🔍 Stored OTP:', storedOtp);
    
    if (!storedOtp) {
      return res.status(400).json({
        success: false,
        message: 'OTP request not found or expired'
      });
    }
    
    // Check mobile
    if (storedOtp.mobile !== mobile) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number mismatch'
      });
    }
    
    // Check OTP
    if (storedOtp.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }
    
    // Check expiry
    if (new Date() > storedOtp.expiresAt) {
      otpStore.delete(requestId);
      return res.status(400).json({
        success: false,
        message: 'OTP expired'
      });
    }
    
    // Mark as verified
    storedOtp.verified = true;
    otpStore.set(requestId, storedOtp);
    
    // Generate token
    const mobileToken = crypto.randomBytes(32).toString('hex');
    
    res.status(200).json({
      success: true,
      message: 'Mobile number verified successfully',
      mobileToken
    });
  } catch (error) {
    console.error('❌ Error in verifyOtp:', error);
    res.status(500).json({
      success: false,
      message: 'OTP verification failed'
    });
  }
};