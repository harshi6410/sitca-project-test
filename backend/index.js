// backend/src/index.js
const express = require("express");
const cors = require("cors");
const path = require("path");

// ==================== LOAD ENV ====================
// Load .env ONLY in local development
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// ==================== PRISMA ====================
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ==================== IMPORT ROUTES ====================
const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const playerRoutes = require("./routes/player.routes");

const app = express();

// ==================== TRUST PROXY ====================
app.set("trust proxy", 1);

// ==================== CORS CONFIG (FIXED) ====================
// IMPORTANT: frontend origin must match EXACTLY
const allowedOrigins = [
  "http://localhost:5173",
  "https://sitca-project-test.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow Postman / curl
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS blocked: " + origin));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
    // ❌ DO NOT enable credentials (you are not using cookies)
  })
);

// ==================== BODY PARSERS ====================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ==================== STATIC FILES ====================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==================== API ROUTES ====================
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/player", playerRoutes);

// ==================== HEALTH CHECK ====================
app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: "OK",
      service: "SITCA Backend API",
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: "DB NOT CONNECTED",
      error: error.message
    });
  }
});

// ==================== ROOT ====================
app.get("/", (req, res) => {
  res.json({
    message: "SITCA 2025 Backend API",
    version: "1.0.0"
  });
});

// ==================== 404 HANDLER ====================
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ==================== GLOBAL ERROR HANDLER ====================
app.use((err, req, res, next) => {
  console.error("❌ SERVER ERROR:", err.message);

  res.status(500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : err.message
  });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("🚀 Backend server started");
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📡 Listening on port: ${PORT}`);
});
