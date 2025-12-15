import { useState, useEffect, useRef } from "react";
import {
  FaCheckCircle,
  FaWhatsapp,
  FaPhone,
  FaClock,
  FaExclamationTriangle,
  FaEnvelope,
  FaUser,
  FaCopy,
  FaRedo,
  FaPaperPlane,
} from "react-icons/fa";
import axios from "axios";
import { toast } from "react-hot-toast";

const Fill_Your_Enquiry_form = () => {
  // Form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    subject: "",
    message: "",
  });

  // OTP & Verification state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [mobileToken, setMobileToken] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [enquiryId, setEnquiryId] = useState("");
  const [otpRequestId, setOtpRequestId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  // Refs for OTP inputs
  const otpRefs = useRef([]);

  // API base URL
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  // Validation regex
  const mobileRegex = /^[6-9][0-9]{9}$/; // Indian mobile numbers starting with 6-9
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const nameRegex = /^[a-zA-Z\s]{2,50}$/;

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

  // Validate field
  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "name":
        if (!value.trim()) error = "Name is required";
        else if (!nameRegex.test(value))
          error = "Name should be 2-50 characters (letters and spaces only)";
        break;
      case "email":
        if (!value.trim()) error = "Email is required";
        else if (!emailRegex.test(value))
          error = "Please enter a valid email address";
        break;
      case "mobile":
        if (!value.trim()) error = "Mobile number is required";
        else if (!mobileRegex.test(value))
          error = "Please enter a valid 10-digit Indian mobile number";
        break;
      case "subject":
        if (!value.trim()) error = "Subject is required";
        else if (value.trim().length < 5)
          error = "Subject should be at least 5 characters";
        break;
      case "message":
        if (!value.trim()) error = "Message is required";
        else if (value.trim().length < 10)
          error = "Message should be at least 10 characters";
        break;
      default:
        break;
    }

    return error;
  };

  // Handle field blur
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouchedFields({ ...touchedFields, [name]: true });

    const error = validateField(name, value);
    setFormErrors({ ...formErrors, [name]: error });
  };

  // Send OTP
  const handleSendOtp = async () => {
    const mobileError = validateField("mobile", form.mobile);
    if (mobileError) {
      setFormErrors({ ...formErrors, mobile: mobileError });
      toast.error(mobileError);
      return;
    }

    setFormErrors({ ...formErrors, mobile: "" });
    setIsSendingOtp(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/enquiry/request-otp`, {
        mobile: form.mobile,
      });

      if (response.data.success) {
        setShowOtpInput(true);
        setOtpTimer(300); // 5 minutes
        setOtpRequestId(response.data.requestId);

        // Focus first OTP input
        setTimeout(() => {
          if (otpRefs.current[0]) {
            otpRefs.current[0].focus();
          }
        }, 100);

        toast.success(
          response.data.devOtp
            ? `OTP sent! For testing: ${response.data.devOtp}`
            : "OTP sent successfully! Check your mobile."
        );
      } else {
        toast.error(response.data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("OTP Error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to send OTP. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      toast.error("Please enter complete 6-digit OTP");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/enquiry/verify-otp`, {
        mobile: form.mobile,
        otp: otpString,
        requestId: otpRequestId,
      });

      if (response.data.success) {
        setMobileToken(response.data.mobileToken);
        setShowOtpInput(false);
        setOtp(["", "", "", "", "", ""]);
        setOtpTimer(0);
        toast.success("Mobile number verified successfully!");
      } else {
        toast.error(response.data.message || "Invalid OTP");
      }
    } catch (error) {
      console.error("OTP Verification Error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "OTP verification failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form field change
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Reset mobile verification if mobile changes
    if (name === "mobile" && mobileToken) {
      setMobileToken("");
      setOtpRequestId(null);
      setShowOtpInput(false);
      setOtpTimer(0);
      setOtp(["", "", "", "", "", ""]);
    }

    setForm({ ...form, [name]: value });

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take only last character
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-focus previous on backspace
    if (!value && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);

      // Focus last input
      setTimeout(() => {
        otpRefs.current[5]?.focus();
      }, 0);
    }
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const errors = {};
    let hasErrors = false;

    Object.keys(form).forEach((key) => {
      const error = validateField(key, form[key]);
      if (error) {
        errors[key] = error;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setFormErrors(errors);
      setTouchedFields({
        name: true,
        email: true,
        mobile: true,
        subject: true,
        message: true,
      });

      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      document.querySelector(`[name="${firstErrorField}"]`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      toast.error("Please fix the errors in the form");
      return;
    }

    // Mobile verification warning
    if (!mobileToken) {
      const shouldProceed = window.confirm(
        "⚠️ Mobile verification is recommended for faster response and better security.\n\nProceed without verification?"
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
        mobileToken: mobileToken || null,
      };

      const response = await axios.post(
        `${API_BASE_URL}/enquiry/submit`,
        enquiryData
      );

      if (response.data.success) {
        setSubmitSuccess(true);
        setEnquiryId(response.data.data.enquiryId || response.data.data.id);

        // Reset form
        resetForm();

        toast.success(
          "Enquiry submitted successfully! We'll contact you soon."
        );
      } else {
        toast.error(response.data.message || "Submission failed");
      }
    } catch (error) {
      console.error("Submission Error:", error);

      let errorMessage = "Something went wrong. Please try again.";

      if (error.response?.status === 400) {
        if (error.response.data.errors) {
          errorMessage = error.response.data.errors.join(", ");
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      mobile: "",
      subject: "",
      message: "",
    });
    setOtp(["", "", "", "", "", ""]);
    setShowOtpInput(false);
    setMobileToken("");
    setOtpTimer(0);
    setOtpRequestId(null);
    setFormErrors({});
    setTouchedFields({});
  };

  // Resend OTP
  const handleResendOtp = () => {
    if (otpTimer > 240) {
      toast.error(
        `Please wait ${Math.ceil(
          (otpTimer - 240) / 60
        )} minute(s) before resending`
      );
      return;
    }
    handleSendOtp();
  };

  // Copy enquiry ID
  const copyEnquiryId = () => {
    if (enquiryId) {
      navigator.clipboard.writeText(enquiryId);
      toast.success("Enquiry ID copied to clipboard!");
    }
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Handle WhatsApp click
  const handleWhatsAppClick = () => {
    const phoneNumber = "8340202627";
    const message = `Hello, I have an enquiry about Leela Board products.\n\nName: ${
      form.name || "Not provided"
    }\nMobile: ${form.mobile || "Not provided"}\nEmail: ${
      form.email || "Not provided"
    }\nSubject: ${form.subject || "General enquiry"}\nMessage: ${
      form.message?.substring(0, 100) || "Not provided"
    }`;
    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  // Check if form is valid
  const isFormValid =
    Object.values(formErrors).every((error) => !error) &&
    Object.values(form).every((value) => value.trim() !== "");

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-100 sticky top-8 transition-all duration-300 hover:shadow-3xl">
      {/* Header */}
      <div className="mb-8 text-center md:text-left">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
          <FaEnvelope className="text-white text-2xl" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent">
          Enquiry About Leela Board
        </h2>
        <p className="text-gray-600 mt-2 text-sm md:text-base">
          Fill out the form below and our team will get back to you within 24
          hours.
        </p>

        {mobileToken && (
          <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl flex items-center animate-pulse">
            <FaCheckCircle className="text-green-600 mr-3 text-lg flex-shrink-0" />
            <span className="text-green-700 font-medium">
              ✓ Mobile number verified
            </span>
          </div>
        )}
      </div>

      {/* Success Message */}
      {submitSuccess && (
        <div className="mb-6 p-5 md:p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl animate-fadeIn shadow-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FaCheckCircle className="text-green-600 text-2xl" />
              </div>
            </div>
            <div className="ml-4">
              <h4 className="font-bold text-green-800 text-lg md:text-xl">
                Thank You for Your Enquiry! 🎉
              </h4>
              <p className="text-green-700 mt-2 text-sm md:text-base">
                Your enquiry has been submitted successfully. We've sent a
                confirmation email to{" "}
                <span className="font-semibold">{form.email}</span>.
              </p>
              {enquiryId && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-green-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-700 font-medium">
                        Enquiry Reference:
                      </p>
                      <p className="text-sm font-mono text-gray-800 mt-1 bg-gray-50 p-2 rounded">
                        {enquiryId}
                      </p>
                    </div>
                    <button
                      onClick={copyEnquiryId}
                      className="ml-2 px-4 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-200 transition flex items-center"
                    >
                      <FaCopy className="mr-2" />
                      Copy
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          <div>
            <label className="block text-gray-700 mb-2 font-medium flex items-center">
              <FaUser className="mr-2 text-gray-400" />
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="John Doe"
              className={`w-full p-3 md:p-4 rounded-xl border transition-all duration-200 ${
                formErrors.name && touchedFields.name
                  ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              } outline-none`}
              required
            />
            {formErrors.name && touchedFields.name && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <FaExclamationTriangle className="mr-1" />
                {formErrors.name}
              </p>
            )}
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
              onBlur={handleBlur}
              placeholder="john@example.com"
              className={`w-full p-3 md:p-4 rounded-xl border transition-all duration-200 ${
                formErrors.email && touchedFields.email
                  ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              } outline-none`}
              required
            />
            {formErrors.email && touchedFields.email && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <FaExclamationTriangle className="mr-1" />
                {formErrors.email}
              </p>
            )}
          </div>
        </div>

        {/* Mobile & OTP */}
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              Mobile Number *
              {mobileToken && (
                <span className="ml-2 text-green-600 text-sm font-medium">
                  ✓ Verified
                </span>
              )}
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                    +91
                  </span>
                  <input
                    type="tel"
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="9876543210"
                    maxLength="10"
                    className={`w-full pl-14 p-3 md:p-4 rounded-xl border transition-all duration-200 ${
                      formErrors.mobile && touchedFields.mobile
                        ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    } outline-none`}
                    required
                  />
                </div>
                {formErrors.mobile && touchedFields.mobile && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <FaExclamationTriangle className="mr-1" />
                    {formErrors.mobile}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={
                  showOtpInput ||
                  !form.mobile ||
                  formErrors.mobile ||
                  isSendingOtp ||
                  mobileToken
                }
                className={`px-5 py-3 md:px-6 md:py-4 rounded-xl font-medium whitespace-nowrap transition-all duration-200 ${
                  showOtpInput ||
                  !form.mobile ||
                  formErrors.mobile ||
                  mobileToken
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg"
                }`}
              >
                {isSendingOtp ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
          </div>

          {/* OTP Input */}
          {showOtpInput && (
            <div className="p-4 md:p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-blue-700">
                  <FaClock className="mr-2" />
                  <span className="font-medium">Enter OTP</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-sm font-mono bg-blue-100 px-3 py-1 rounded-lg text-blue-800">
                    {formatTime(otpTimer)}
                  </div>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={otpTimer > 240}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    <FaRedo className="inline mr-1" />
                    Resend
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Enter the 6-digit OTP sent to{" "}
                <span className="font-bold">+91 {form.mobile}</span>
              </p>

              <div
                className="flex justify-center space-x-2 mb-4"
                onPaste={handleOtpPaste}
              >
                {[...Array(6)].map((_, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    type="text"
                    maxLength="1"
                    className="w-12 h-12 md:w-14 md:h-14 text-center text-xl md:text-2xl font-bold border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={otp[i]}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otp[i] && i > 0) {
                        otpRefs.current[i - 1]?.focus();
                      }
                    }}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={otp.join("").length !== 6 || isLoading}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md hover:shadow-lg"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Verifying...
                  </span>
                ) : (
                  "Verify OTP"
                )}
              </button>
            </div>
          )}
        </div>

        {/* Subject */}
        <div>
          <label className="block text-gray-700 mb-2 font-medium">
            Subject *
          </label>
          <input
            type="text"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="What is your enquiry about?"
            className={`w-full p-3 md:p-4 rounded-xl border transition-all duration-200 ${
              formErrors.subject && touchedFields.subject
                ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            } outline-none`}
            required
          />
          {formErrors.subject && touchedFields.subject && (
            <p className="text-red-500 text-sm mt-2 flex items-center">
              <FaExclamationTriangle className="mr-1" />
              {formErrors.subject}
            </p>
          )}
        </div>

        {/* Message */}
        <div>
          <label className="block text-gray-700 mb-2 font-medium">
            Your Message *
          </label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Please provide details about your enquiry..."
            rows="4"
            className={`w-full p-3 md:p-4 rounded-xl border transition-all duration-200 ${
              formErrors.message && touchedFields.message
                ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            } outline-none resize-none`}
            required
          ></textarea>
          <div className="flex justify-between mt-2">
            {formErrors.message && touchedFields.message && (
              <p className="text-red-500 text-sm flex items-center">
                <FaExclamationTriangle className="mr-1" />
                {formErrors.message}
              </p>
            )}
            <span className="text-gray-500 text-sm ml-auto">
              {form.message.length}/500
            </span>
          </div>
        </div>

        {/* Mobile Verification Warning */}
        {!mobileToken && !showOtpInput && (
          <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl">
            <div className="flex items-start">
              <FaExclamationTriangle className="text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-yellow-800 font-medium">
                  Mobile Verification Recommended
                </p>
                <p className="text-yellow-700 text-sm mt-1">
                  Verify your mobile number for better security and faster
                  response.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={resetForm}
            className="flex-1 py-3 md:py-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition border border-gray-300 hover:border-gray-400"
          >
            Clear Form
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !isFormValid}
            className={`flex-1 py-3 md:py-4 rounded-xl font-bold text-white transition-all shadow-lg ${
              isSubmitting || !isFormValid
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
            } flex items-center justify-center`}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Submitting...
              </span>
            ) : (
              <>
                <FaPaperPlane className="mr-2" />
                Submit Enquiry
              </>
            )}
          </button>
        </div>
      </form>

      {/* Footer Information */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <div className="mb-6">
          <h4 className="font-bold text-gray-800 mb-4 text-lg">
            What happens after submission?
          </h4>
          <ul className="space-y-3 text-sm text-gray-600">
            {[
              {
                icon: FaCheckCircle,
                color: "text-green-500",
                text: "Confirmation email with enquiry details",
              },
              {
                icon: FaEnvelope,
                color: "text-blue-500",
                text: "Manager notification with your enquiry",
              },
              {
                icon: FaClock,
                color: "text-orange-500",
                text: "Automatic reminders if no reply within 6 hours",
              },
              {
                icon: FaCheckCircle,
                color: "text-green-500",
                text: "Follow-up from our team within 24 hours",
              },
            ].map((item, index) => (
              <li key={index} className="flex items-start">
                <item.icon
                  className={`${item.color} mr-3 mt-0.5 flex-shrink-0`}
                />
                <span>{item.text}</span>
              </li>
            ))}
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

          <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
            <p className="text-gray-700 text-sm">
              <strong className="text-gray-800">Manager Email:</strong>{" "}
              Leelainfoservices@gmail.com
            </p>
            <p className="text-gray-500 text-xs mt-2">
              All enquiries are stored securely and can be tracked in our admin
              dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Inline Styles */}
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
