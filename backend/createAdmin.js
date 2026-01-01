// backend/createAdmin.js
const prisma = require("./prismaClient");
const bcrypt = require("bcrypt");

async function createAdmin() {
  const adminEmail = "admin@cricket.com";
  const adminPassword = "admin123"; // Change this to a strong password later!
  const adminRole = "ADMIN";

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      console.log("✅ Admin user already exists:");
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 12); // 12 is stronger than 10

    // Create the admin user
    const newAdmin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        role: adminRole
      }
    });

    console.log("🎉 Admin user created successfully!");
    console.log("   Login Credentials:");
    console.log(`   📧 Email: ${newAdmin.email}`);
    console.log(`   🔑 Password: ${adminPassword}`);
    console.log("");
    console.log("   Go to http://localhost:5173/login to log in.");
    console.log("");
    console.log("⚠️  SECURITY TIP: Change this password immediately after first login!");
  } catch (error) {
    console.error("❌ Error creating admin user:");
    console.error(error.message || error);
  } finally {
    await prisma.$disconnect();
    process.exit();
  }
}

// Run the function
createAdmin();