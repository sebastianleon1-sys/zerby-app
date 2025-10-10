const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

//registro con login automático
router.post("/register", async (req, res) => {
  try {
    const { email, password, role, nombre, telefono, direccion, servicios } = req.body;

    //validar rol
    if (!["CLIENTE", "PROVEEDOR"].includes(role)) {
      return res.status(400).json({ error: "Rol invalido" });
    }

    // Verificar si ya existe el usuario
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    //hash
    const hashedPassword = await bcrypt.hash(password, 10);

    //crear usuario base
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
      },
    });

    //crear entidad 
    if (role === "CLIENTE") {
      await prisma.cliente.create({
        data: {
          userId: user.id,
          nombre,
          telefono,
          direccion,
        },
      });
    } else if (role === "PROVEEDOR") {
      await prisma.proveedor.create({
        data: {
          userId: user.id,
          nombre,
          servicios,
        },
      });
    }

    //generar token 
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Usuario registrado correctamente",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el registro" });
  }
});

//  Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "Credenciales invalidas" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Credenciales invalidas" });
    }

    // Generar token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login exitoso",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el login" });
  }
});

module.exports = router;
