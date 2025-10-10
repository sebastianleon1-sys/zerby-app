const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const authenticateToken = require("../middlewares/authMiddleware");

const prisma = new PrismaClient();

//perfil autenticado
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const { userId, role } = req.user;

    let userData = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        cliente: true,
        proveedor: true,
      },
    });

    res.json(userData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener perfil" });
  }
});

module.exports = router;
