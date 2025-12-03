import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create transporter with improved error handling
const createTransporter = () => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // Verify connection
  transporter.verify(function (error, success) {
    if (error) {
      console.error("❌ Email server connection error:", error);
    } else {
      console.log("✅ Email server is ready to send messages");
    }
  });

  return transporter;
};

// Export the functions (same as before)
export const sendConfirmationEmail = async (enquiry) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Leela Board" <${process.env.SMTP_USER}>`,
      to: enquiry.email,
      subject: "Thank You for Your Enquiry - Leela Board",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9fafb; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
            .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Thank You for Contacting Leela Board!</h1>
            </div>
            <div class="content">
              <p>Dear ${enquiry.name},</p>
              <p>Thank you for reaching out to us. We have received your enquiry and our team will get back to you within 24 hours.</p>
              
              <div class="details">
                <h3>Your Enquiry Details:</h3>
                <p><strong>Reference ID:</strong> ${enquiry.enquiryId}</p>
                <p><strong>Subject:</strong> ${enquiry.subject}</p>
                <p><strong>Message:</strong> ${enquiry.message}</p>
                <p><strong>Submitted on:</strong> ${new Date(
                  enquiry.createdAt
                ).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
              </div>
              
              <p><strong>Jaldi hi aapki enquiry ko resolve kiya jaeyga.</strong></p>
              <p>Have a nice day!</p>
            </div>
            <div class="footer">
              <p>Leela Board | WhatsApp: 8340202627 | Email: leelainfoservices@gmail.com</p>
              <p>This is an automated email, please do not reply directly.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(
      `✅ Confirmation email sent to ${enquiry.email}: ${info.messageId}`
    );
    return true;
  } catch (error) {
    console.error("❌ Error sending confirmation email:", error.message);
    return false;
  }
};

export const sendManagerNotification = async (enquiry) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Leela Board Enquiry System" <${process.env.SMTP_USER}>`,
      to: process.env.MANAGER_EMAIL || "krishnakumar.snm004@gmail.com",
      subject: `📋 New Enquiry Received: ${enquiry.enquiryId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 700px; margin: 0 auto; }
            .urgent { color: #dc2626; background: #fef2f2; padding: 10px; border-radius: 5px; }
            .details { background: #f8fafc; padding: 20px; border-radius: 5px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>🚨 New Enquiry Received</h2>
            <div class="urgent">
              <strong>⚠️ ACTION REQUIRED:</strong> Please respond within 6 hours
            </div>
            
            <div class="details">
              <h3>Enquiry Details:</h3>
              <p><strong>Reference:</strong> ${enquiry.enquiryId}</p>
              <p><strong>Customer:</strong> ${enquiry.name}</p>
              <p><strong>Email:</strong> ${enquiry.email}</p>
              <p><strong>Mobile:</strong> ${enquiry.mobile} ${
        enquiry.isMobileVerified ? "✅ Verified" : "⚠️ Not Verified"
      }</p>
              <p><strong>Subject:</strong> ${enquiry.subject}</p>
              <p><strong>Message:</strong><br>${enquiry.message}</p>
              <p><strong>Received:</strong> ${new Date(
                enquiry.createdAt
              ).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
            </div>
            
            <p><strong>Reply to customer at:</strong> ${enquiry.email}</p>
            <p><strong>WhatsApp:</strong> <a href="https://wa.me/91${
              enquiry.mobile
            }">+91 ${enquiry.mobile}</a></p>
            
            <hr>
            <p style="font-size: 12px; color: #6b7280;">
              Reminder: If no response is recorded within 6 hours, an automatic reminder will be sent.
            </p>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Manager notification sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending manager notification:", error.message);
    return false;
  }
};
