import cron from "node-cron";
import Enquiry from "../models/Enquiry.js";
import { sendManagerNotification } from "../services/emailService.js";

// Send reminder every 6 hours for pending enquiries
export const setupReminderCron = () => {
  // Run every hour at minute 0
  cron.schedule("0 * * * *", async () => {
    try {
      console.log("⏰ Running reminder check...");

      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

      // Find enquiries pending for more than 6 hours
      const pendingEnquiries = await Enquiry.find({
        status: "pending",
        createdAt: { $lte: sixHoursAgo },
        $or: [
          { lastReminderSent: { $exists: false } },
          {
            lastReminderSent: {
              $lte: new Date(Date.now() - 6 * 60 * 60 * 1000),
            },
          },
        ],
      });

      console.log(
        `📊 Found ${pendingEnquiries.length} enquiries needing reminder`
      );

      for (const enquiry of pendingEnquiries) {
        // Update reminder info
        enquiry.reminderCount = (enquiry.reminderCount || 0) + 1;
        enquiry.lastReminderSent = new Date();

        // Send reminder email
        const reminderSent = await sendReminderEmail(enquiry);

        if (reminderSent) {
          await enquiry.save();
          console.log(`✅ Sent reminder for enquiry ${enquiry.enquiryId}`);
        }
      }
    } catch (error) {
      console.error("❌ Error in reminder cron job:", error);
    }
  });

  console.log("✅ Reminder cron job scheduled");
};

// Helper function for reminder emails
const sendReminderEmail = async (enquiry) => {
  try {
    const transporter = createTransporter();

    const hoursPending = Math.round(
      (Date.now() - enquiry.createdAt) / (1000 * 60 * 60)
    );

    const mailOptions = {
      from: `"Leela Board Reminder" <${process.env.SMTP_USER}>`,
      to: process.env.MANAGER_EMAIL || "krishnakumar.snm004@gmail.com",
      subject: `⏰ REMINDER: Pending Enquiry ${enquiry.enquiryId} - ${hoursPending} hours`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 700px; margin: 0 auto; }
            .urgent { color: #dc2626; background: #fef2f2; padding: 15px; border-radius: 5px; border-left: 4px solid #dc2626; }
            .details { background: #f8fafc; padding: 20px; border-radius: 5px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="urgent">
              <h3>⏰ URGENT REMINDER</h3>
              <p>This enquiry has been pending for ${hoursPending} hours without a response!</p>
              <p>Reminder count: ${enquiry.reminderCount || 1}</p>
            </div>
            
            <h2>Pending Enquiry Details:</h2>
            <div class="details">
              <p><strong>Reference:</strong> ${enquiry.enquiryId}</p>
              <p><strong>Customer:</strong> ${enquiry.name}</p>
              <p><strong>Email:</strong> ${enquiry.email}</p>
              <p><strong>Mobile:</strong> ${enquiry.mobile} ${
        enquiry.isMobileVerified ? "✅ Verified" : ""
      }</p>
              <p><strong>Subject:</strong> ${enquiry.subject}</p>
              <p><strong>Message:</strong> ${enquiry.message.substring(
                0,
                200
              )}...</p>
              <p><strong>Received:</strong> ${new Date(
                enquiry.createdAt
              ).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
            </div>
            
            <p><strong>⚠️ Customer is waiting for your response!</strong></p>
            <p>Please respond immediately to maintain customer satisfaction.</p>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Reminder email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending reminder email:", error.message);
    return false;
  }
};

// Helper function to create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
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
};
