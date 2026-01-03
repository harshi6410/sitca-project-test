const express = require("express");
const prisma = require("../prismaClient");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * GET /api/admin/players/pending
 * Returns only PENDING players - Admin only
 */
router.get("/players/pending", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const players = await prisma.player.findMany({
      where: { status: "PENDING" },
      include: {
        user: {
          select: {
            email: true,
            // Add more fields if needed later
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      success: true,
      count: players.length,
      data: players,
    });
  } catch (error) {
    console.error("Error fetching pending players:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending players",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * GET /api/admin/players/all
 * Returns ALL players - Admin only
 */
router.get("/players/all", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const players = await prisma.player.findMany({
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      success: true,
      count: players.length,
      data: players,
    });
  } catch (error) {
    console.error("Error fetching all players:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch players",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * PATCH /api/admin/player/:id/status
 * Update player status (APPROVED / REJECTED) - Admin only
 */
router.patch("/player/:id/status", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be APPROVED or REJECTED.",
      });
    }

    const player = await prisma.player.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        fullName: true,
        status: true,
        primaryPhone: true,
        email: true, // if you later add relation
      },
    });

    return res.json({
      success: true,
      message: `Player ${status.toLowerCase()} successfully`,
      data: player,
    });
  } catch (error) {
    console.error("Error updating player status:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Player not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update player status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;