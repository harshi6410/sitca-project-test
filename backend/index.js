// backend/src/index.js
const express = require("express");
const cors = require("cors");
const path = require("path");

// ✅ Load .env ONLY in local development
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// ==================== IMPORT ROUTES ====================
const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const playerRoutes = require("./routes/player.routes");

const app = express();

// ==================== TRUST PROXY (RAILWAY REQUIRED) ====================
app.set("trust proxy", 1);

// ==================== CORS CONFIG ====================
const allowedOrigins = [
  "http://localhost:5173", // Dev
  process.env.CLIENT_URL   // Prod (Vercel)
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow Postman / server-to-server
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // ❌ Instead of crashing server, return controlled error
      return callback(null, false);
    },
    credentials: true
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
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "SITCA Backend API",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString()
  });
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
  console.error("❌ SERVER ERROR:", err);

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
