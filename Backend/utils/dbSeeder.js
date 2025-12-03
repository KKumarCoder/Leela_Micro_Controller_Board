import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";

export const seedAdminUser = async () => {
  try {
    // Check if admin already exists
    const adminExists = await Admin.findOne({ email: "admin@leelaboard.com" });

    if (!adminExists) {
      // Create admin user
      const hashedPassword = await bcrypt.hash("admin123", 10);

      const admin = new Admin({
        name: "System Admin",
        email: "admin@leelaboard.com",
        password: hashedPassword,
        role: "admin",
        permissions: ["all"],
      });

      await admin.save();
      console.log("✅ Admin user created successfully");
      console.log("📧 Email: admin@leelaboard.com");
      console.log("🔑 Password: admin123");
    } else {
      console.log("✅ Admin user already exists");
    }
  } catch (error) {
    console.error("❌ Error seeding admin user:", error);
  }
};
