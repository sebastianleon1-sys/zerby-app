require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

//endpoint
app.get("/", (req, res) => {
  res.json({ message: "BACKEND FUNCIONANDOOOOOOOOOOOOOOOOO" });
});

//rutas
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");

app.use("/auth", authRoutes);
app.use("/users", userRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
