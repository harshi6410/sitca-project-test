// backend/routes/player.routes.js
const express = require("express");
const prisma = require("../prismaClient");
const authMiddleware = require("../middleware/auth.middleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// ======================== MULTER SETUP (File Upload) ========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ======================== PUBLIC REGISTRATION (NO LOGIN NEEDED) ========================
router.post("/register-public", upload.fields([
  { name: "photo", maxCount: 1 },
  { name: "aadhaarPhoto", maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      fullName,
      dob,
      aadhaarNumber,
      primaryPhone,
      alternatePhone,
      bloodGroup,
      medicalConditions,
      primaryRole,
      battingProfile,
      bowlingStyle,
      allRounderType,
      shirtSize,
      pantSize,
      previousLeagues,
      instagram,
    } = req.body;

    // Required field validation
    if (
      !fullName || !dob || !primaryPhone || !bloodGroup ||
      !primaryRole || !shirtSize || !pantSize || !instagram ||
      !req.files.photo || !req.files.aadhaarPhoto
    ) {
      return res.status(400).json({ message: "All required fields and photos must be provided" });
    }

    const photoUrl = `/uploads/${req.files.photo[0].filename}`;
    const aadhaarPhotoUrl = `/uploads/${req.files.aadhaarPhoto[0].filename}`;

    // Create player directly (no user linked)
    const player = await prisma.player.create({
      data: {
        fullName,
        dob: new Date(dob),
        aadhaarNumber: aadhaarNumber || null,
        primaryPhone,
        alternatePhone: alternatePhone || null,
        bloodGroup,
        medicalConditions: medicalConditions || null,
        primaryRole,
        battingProfile: battingProfile || null,
        bowlingStyle: bowlingStyle || null,
        allRounderType: allRounderType || null,
        shirtSize,
        pantSize,
        previousLeagues: previousLeagues || null,
        instagram,
        photoUrl,
        aadhaarPhotoUrl,
        status: "PENDING",
        // Note: userId remains null since no login
      },
    });

    return res.status(201).json({
      message: "Player registration successful! Waiting for admin approval.",
      player,
    });
  } catch (error) {
    console.error("PUBLIC REGISTRATION ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Keep old protected route if needed later
// router.post("/register", authMiddleware, async (req, res) => { ... });

module.exports = router;