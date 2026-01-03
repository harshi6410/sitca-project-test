const express = require("express");
const prisma = require("../prismaClient");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// ======================== MULTER CONFIG ========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File filter - only allow images (and pdf for aadhaar)
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    photo: ["image/jpeg", "image/png", "image/jpg"],
    aadhaarPhoto: ["image/jpeg", "image/png", "image/jpg", "application/pdf"],
  };

  if (allowedTypes[file.fieldname]?.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type for ${file.fieldname}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max per file
});

// ======================== PUBLIC PLAYER REGISTRATION ========================
router.post(
  "/register-public",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "aadhaarPhoto", maxCount: 1 },
  ]),
  async (req, res) => {
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

      // Required fields validation
      const requiredFields = {
        fullName,
        dob,
        primaryPhone,
        bloodGroup,
        primaryRole,
        shirtSize,
        pantSize,
        instagram,
      };

      for (const [key, value] of Object.entries(requiredFields)) {
        if (!value?.trim()) {
          return res.status(400).json({
            success: false,
            message: `${key} is required`,
          });
        }
      }

      if (!req.files?.photo?.[0]) {
        return res.status(400).json({
          success: false,
          message: "Player photo is required",
        });
      }

      if (!req.files?.aadhaarPhoto?.[0]) {
        return res.status(400).json({
          success: false,
          message: "Aadhaar photo is required",
        });
      }

      const photoUrl = `/uploads/${req.files.photo[0].filename}`;
      const aadhaarPhotoUrl = `/uploads/${req.files.aadhaarPhoto[0].filename}`;

      const player = await prisma.player.create({
        data: {
          fullName: fullName.trim(),
          dob: new Date(dob),
          aadhaarNumber: aadhaarNumber?.trim() || null,
          primaryPhone: primaryPhone.trim(),
          alternatePhone: alternatePhone?.trim() || null,
          bloodGroup: bloodGroup.trim(),
          medicalConditions: medicalConditions?.trim() || null,
          primaryRole: primaryRole.trim(),
          battingProfile: battingProfile?.trim() || null,
          bowlingStyle: bowlingStyle?.trim() || null,
          allRounderType: allRounderType?.trim() || null,
          shirtSize: shirtSize.trim(),
          pantSize: pantSize.trim(),
          previousLeagues: previousLeagues?.trim() || null,
          instagram: instagram.trim(),
          photoUrl,
          aadhaarPhotoUrl,
          status: "PENDING",
        },
      });

      return res.status(201).json({
        success: true,
        message: "Registration successful! Waiting for admin approval.",
        player,
      });
    } catch (error) {
      console.error("PUBLIC REGISTRATION ERROR:", error);

      // Clean up uploaded files if creation failed
      if (req.files) {
        Object.values(req.files).flat().forEach((file) => {
          try {
            fs.unlinkSync(file.path);
          } catch (e) {
            console.error("Cleanup error:", e);
          }
        });
      }

      if (error instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to register player",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

module.exports = router;