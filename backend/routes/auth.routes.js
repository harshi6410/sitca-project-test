const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../prismaClient");

const router = express.Router();

/**
 * POST /api/auth/login
 * Authenticates user and returns JWT token
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Basic input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // 2. Check JWT_SECRET early
    if (!process.env.JWT_SECRET) {
      console.error("CRITICAL: JWT_SECRET environment variable is not set");
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    // 3. Find user (case-insensitive email - good practice)
    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase().trim(),
      },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        // Add more fields only if really needed in token/response
      },
    });

    // 4. Timing-safe credential check (prevent username enumeration timing attacks)
    const isPasswordValid = user
      ? await bcrypt.compare(password, user.password)
      : false;

    if (!user || !isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 5. Create JWT payload - minimal information
    const payload = {
      userId: user.id,
      role: user.role,
      // You can add more claims if needed (iat, iss, etc.)
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d", // 24 hours - reasonable for admin dashboard
      // Consider using shorter expiration + refresh tokens in serious apps
    });

    // 6. Successful response
    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    // In production, don't leak internal error details
    return res.status(500).json({
      success: false,
      message: "An error occurred during login. Please try again later.",
    });
  }
});

module.exports = router;