const express = require("express");
const prisma = require("../prismaClient");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * GET /api/admin/players/pending
 * ADMIN only
 */
router.get("/players/pending", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admins only" });
    }

    const players = await prisma.player.findMany({
      where: { status: "PENDING" },
      include: {
        user: {
          select: { email: true }
        }
      }
    });

    res.json(players);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PATCH /api/admin/player/:id/status
 * ADMIN only
 */
router.patch("/player/:id/status", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admins only" });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const player = await prisma.player.update({
      where: { id },
      data: { status }
    });

    res.json({
      message: `Player ${status.toLowerCase()} successfully`,
      player
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/players/all", authMiddleware, async (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admins only" });
  }

  const players = await prisma.player.findMany({
    include: {
      user: { select: { email: true } }
    }
  });

  res.json(players);
});

module.exports = router;
