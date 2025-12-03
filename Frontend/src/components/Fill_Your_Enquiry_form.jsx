import React, { useState, useEffect } from "react";
import {
  FaCheckCircle,
  FaWhatsapp,
  FaPhone,
  FaClock,
  FaExclamationTriangle,
  FaEnvelope,
} from "react-icons/fa";
import axios from "axios";
import { toast } from "react-hot-toast";

const Fill_Your_Enquiry_form = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    subject: "",
    message: "",
  });

  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [mobileToken, setMobileToken] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [mobileError, setMobileError] = useState("");
  const [enquiryId, setEnquiryId] = useState("");
  const [otpRequestId, setOtpRequestId] = useState(null);
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // API base URL
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  // Mobile validation regex
  const mobileRegex = /^[0-9]{10}$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // OTP timer effect
  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0 && showOtpInput) {
      setShowOtpInput(false);
      toast.error("OTP expired. Please request a new one.");
    }
    return () => clearInterval(interval);
  }, [otpTimer, showOtpInput]);

  // Send OTP to mobile via backend API
  const handleSendOtp = async () => {
    if (!mobileRegex.test(form.mobile)) {
      setMobileError("Please enter a valid 10-digit mobile number");
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    setMobileError("");
    setIsSendingOtp(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/enquiry/request-otp`, {
        mobile: form.mobile,
      });

      if (response.data.success) {
        setShowOtpInput(true);
        setOtpTimer(600); // 10 minutes in seconds

        // Store request ID
        if (response.data.requestId) {
          setOtpRequestId(response.data.requestId);
        }

        // Show OTP for testing
        if (response.data.devOtp) {
          toast.success(`OTP sent! For testing: ${response.data.devOtp}`);
        } else {
          toast.success("OTP sent successfully!");
        }
      } else {
        toast.error(response.data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("OTP Error:", error);

      if (error.response?.status === 400) {
        toast.error(error.response.data.message || "Invalid mobile number");
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to send OTP. Please try again.");
      }
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verify OTP via backend API
  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a 6-digit OTP");
      return;
    }

    if (!otpRequestId) {
      toast.error("OTP request ID not found. Please request a new OTP.");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        mobile: form.mobile,
        otp: otp,
        requestId: otpRequestId,
      };

      const response = await axios.post(
        `${API_BASE_URL}/enquiry/verify-otp`,
        payload
      );

      if (response.data.success) {
        setMobileToken(response.data.mobileToken);
        setShowOtpInput(false);
        setOtp("");
        toast.success("Mobile number verified successfully!");
      } else {
        toast.error(response.data.message || "Invalid OTP");
      }
    } catch (error) {
      console.error("OTP Verification Error:", error);

      if (error.response?.status === 400) {
        toast.error(error.response.data.message || "Invalid OTP");
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("OTP verification failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Reset mobile verification if mobile number changes
    if (name === "mobile" && mobileToken) {
      setMobileToken("");
      setOtpRequestId(null);
      setShowOtpInput(false);
      setOtpTimer(0);
    }

    setForm({ ...form, [name]: value });

    // Validate mobile in real-time
    if (name === "mobile") {
      if (value && !mobileRegex.test(value)) {
        setMobileError("Please enter a valid 10-digit mobile number");
      } else {
        setMobileError("");
      }
    }

    // Validate email in real-time
    if (name === "email") {
      if (value && !emailRegex.test(value)) {
        setEmailError("Please enter a valid email address");
      } else {
        setEmailError("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const errors = [];

    if (!form.name.trim()) errors.push("Name is required");
    if (!form.email.trim()) errors.push("Email is required");
    if (!emailRegex.test(form.email)) errors.push("Valid email is required");
    if (!form.mobile.trim()) errors.push("Mobile number is required");
    if (!mobileRegex.test(form.mobile))
      errors.push("Valid 10-digit mobile number is required");
    if (!form.subject.trim()) errors.push("Subject is required");
    if (!form.message.trim()) errors.push("Message is required");

    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      return;
    }

    // Mobile verification warning (but still allow submission)
    if (!mobileToken) {
      const shouldProceed = window.confirm(
        "Your mobile number is not verified. For better security and faster response, we recommend verifying your mobile number. Would you like to proceed without verification?"
      );
      if (!shouldProceed) return;
    }

    setIsSubmitting(true);

    try {
      const enquiryData = {
        name: form.name.trim(),
        email: form.email.toLowerCase().trim(),
        mobile: form.mobile.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
        mobileToken: mobileToken || "",
      };

      console.log("Submitting enquiry:", enquiryData);

      const response = await axios.post(
        `${API_BASE_URL}/enquiry/submit`,
        enquiryData
      );

      if (response.data.success) {
        setSubmitSuccess(true);
        setEnquiryId(response.data.data.enquiryId);

        // Reset form
        setForm({
          name: "",
          email: "",
          mobile: "",
          subject: "",
          message: "",
        });
        setOtp("");
        setShowOtpInput(false);
        setMobileToken("");
        setOtpTimer(0);
        setOtpRequestId(null);
        setMobileError("");
        setEmailError("");

        toast.success("Enquiry submitted successfully!");

        // Reset success message after 10 seconds
        setTimeout(() => {
          setSubmitSuccess(false);
          setEnquiryId("");
        }, 10000);
      } else {
        toast.error(response.data.message || "Submission failed");
      }
    } catch (error) {
      console.error("Submission Error:", error);

      if (error.response?.status === 400) {
        if (error.response.data.errors) {
          error.response.data.errors.forEach((err) => toast.error(err));
        } else if (error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Validation failed. Please check your inputs.");
        }
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppClick = () => {
    const phoneNumber = "8340202627";
    const message = `Hello, I have an enquiry about Leela Board products.\n\nName: ${
      form.name || "Not provided"
    }\nMobile: ${form.mobile || "Not provided"}\nSubject: ${
      form.subject || "General enquiry"
    }\nMessage: ${form.message?.substring(0, 100) || "Not provided"}...`;
    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const handleClearForm = () => {
    setForm({
      name: "",
      email: "",
      mobile: "",
      subject: "",
      message: "",
    });
    setOtp("");
    setShowOtpInput(false);
    setMobileToken("");
    setOtpTimer(0);
    setMobileError("");
    setEmailError("");
    setOtpRequestId(null);
    toast.success("Form cleared");
  };

  // Format timer
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Auto-focus next OTP input
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = otp.split("");
    newOtp[index] = value;
    const updatedOtp = newOtp.join("").slice(0, 6);
    setOtp(updatedOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Resend OTP
  const handleResendOtp = () => {
    if (otpTimer > 540) {
      toast.error("Please wait 1 minute before resending OTP");
      return;
    }
    handleSendOtp();
  };

  // Copy enquiry ID to clipboard
  const copyEnquiryId = () => {
    if (enquiryId) {
      navigator.clipboard.writeText(enquiryId);
      toast.success("Enquiry ID copied to clipboard!");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200 sticky top-8">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          Enquiry About Leela Board
        </h2>
        <p className="text-gray-600 mt-2">
          Fill out the form below and our team will get back to you within 24
          hours.
        </p>

        {mobileToken && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center animate-pulse">
            <FaCheckCircle className="text-green-600 mr-3 text-lg" />
            <span className="text-green-700 font-medium">
              ✓ Mobile number verified
            </span>
          </div>
        )}
      </div>

      {submitSuccess && (
        <div className="mb-6 p-5 md:p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl animate-fadeIn">
          <div className="flex items-start">
            <FaCheckCircle className="text-green-600 text-xl md:text-2xl mr-4 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-green-800 text-lg md:text-xl">
                Thank You for Your Enquiry! 🎉
              </h4>
              <p className="text-green-700 mt-2 text-sm md:text-base">
                Your enquiry has been submitted successfully. We've sent a
                confirmation email to{" "}
                <span className="font-semibold">{form.email}</span>.
              </p>
              <p className="text-green-600 mt-3 font-medium text-sm md:text-base">
                <strong>Jaldi hi aapki enquiry ko resolve kiya jaeyga.</strong>
                <br />
                Have a nice day!
              </p>
              {enquiryId && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-green-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        <span className="font-bold">Enquiry Reference:</span>
                      </p>
                      <p className="text-sm font-mono text-gray-800 mt-1">
                        {enquiryId}
                      </p>
                    </div>
                    <button
                      onClick={copyEnquiryId}
                      className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200 transition"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Please quote this reference in any future communications.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full p-3 md:p-4 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              className={`w-full p-3 md:p-4 rounded-xl border ${
                emailError ? "border-red-300" : "border-gray-300"
              } focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition`}
              required
            />
            {emailError && (
              <p className="text-red-500 text-sm mt-1">{emailError}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              Mobile Number *
              {mobileToken && (
                <span className="ml-2 text-green-600 text-sm">✓ Verified</span>
              )}
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="tel"
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  maxLength="10"
                  className={`w-full p-3 md:p-4 rounded-xl border ${
                    mobileError ? "border-red-300" : "border-gray-300"
                  } focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition`}
                  required
                />
                {mobileError && (
                  <p className="text-red-500 text-sm mt-1">{mobileError}</p>
                )}
              </div>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={
                  showOtpInput ||
                  !form.mobile ||
                  mobileError ||
                  isSendingOtp ||
                  mobileToken
                }
                className={`px-5 py-3 md:px-6 md:py-4 rounded-xl font-medium whitespace-nowrap transition ${
                  showOtpInput || !form.mobile || mobileError || mobileToken
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isSendingOtp ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-4 w-4 mr-2 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  <>
                    <FaPhone className="inline mr-2" />
                    {mobileToken ? "Verified" : "Send OTP"}
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              OTP verification required for form submission
            </p>
          </div>

          {showOtpInput && (
            <div className="p-4 md:p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-blue-700">
                  <FaClock className="mr-2" />
                  <span className="font-medium">Mobile Verification</span>
                </div>
                <div className="text-sm font-mono bg-blue-100 px-3 py-1 rounded-lg text-blue-800">
                  {formatTime(otpTimer)}
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3">
                Enter the 6-digit OTP sent to{" "}
                <span className="font-bold">+91 {form.mobile}</span>
              </p>

              <div className="flex justify-center space-x-2 mb-4">
                {[...Array(6)].map((_, i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength="1"
                    className="w-12 h-12 md:w-14 md:h-14 text-center text-xl md:text-2xl font-bold border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={otp[i] || ""}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    id={`otp-${i}`}
                  />
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={!otp || otp.length !== 6 || isLoading}
                  className="flex-1 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 mr-2 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={otpTimer > 540}
                  className="py-3 px-4 bg-blue-100 text-blue-700 font-medium rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Resend OTP
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-3 text-center">
                OTP is valid for 10 minutes
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-gray-700 mb-2 font-medium">
            Subject *
          </label>
          <input
            type="text"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            placeholder="What is your enquiry about?"
            className="w-full p-3 md:p-4 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2 font-medium">
            Your Message *
          </label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Please provide details about your enquiry..."
            rows="4"
            className="w-full p-3 md:p-4 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none"
            required
          ></textarea>
        </div>

        {!mobileToken && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-start">
              <FaExclamationTriangle className="text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-yellow-800 font-medium">
                  Mobile Verification Recommended
                </p>
                <p className="text-yellow-700 text-sm mt-1">
                  Verifying your mobile number ensures better security and
                  faster response. Your form can still be submitted without
                  verification.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            type="button"
            onClick={handleClearForm}
            className="flex-1 py-3 md:py-4 bg-gray-200 text-gray-800 font-bold rounded-xl hover:bg-gray-300 transition flex items-center justify-center"
          >
            Clear Form
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 py-3 md:py-4 rounded-xl font-bold text-white transition-all ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
            } flex items-center justify-center`}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Submitting...
              </span>
            ) : (
              "Submit Enquiry"
            )}
          </button>
        </div>
      </form>

      <div className="mt-8 pt-8 border-t border-gray-200">
        <div className="mb-6">
          <h4 className="font-bold text-gray-800 mb-3">
            What happens after submission?
          </h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <FaCheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>Confirmation email with enquiry details</span>
            </li>
            <li className="flex items-start">
              <FaEnvelope className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>Manager notification with your enquiry</span>
            </li>
            <li className="flex items-start">
              <FaClock className="text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>Automatic reminders if no reply within 6 hours</span>
            </li>
            <li className="flex items-start">
              <FaCheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>Follow-up from our team within 24 hours</span>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleWhatsAppClick}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-green-700 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all"
          >
            <FaWhatsapp className="text-xl" />
            Message on WhatsApp
          </button>

          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-gray-700 text-sm">
              <strong>Manager Email:</strong> Leelainfoservices@gmail.com
            </p>
            <p className="text-gray-500 text-xs mt-2">
              All enquiries are stored securely in our database and can be
              tracked in the admin dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Fill_Your_Enquiry_form;
