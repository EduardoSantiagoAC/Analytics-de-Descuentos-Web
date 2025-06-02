const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

// Clave secreta para JWT (en producción, usa una variable de entorno)
const JWT_SECRET = "tu_clave_secreta_aqui";

// Registro
router.post("/register", async (req, res) => {
  const { nombre, email, password, foto } = req.body;

  try {
    // Verificar si el usuario ya existe
    let usuario = await Usuario.findOne({ email });
    if (usuario) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear usuario
    usuario = new Usuario({
      nombre,
      email,
      password: hashedPassword,
      foto: foto || "https://randomuser.me/api/portraits/lego/1.jpg",
    });

    await usuario.save();

    // Generar token
    const token = jwt.sign({ id: usuario._id }, JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({ token, usuario: { id: usuario._id, nombre, email, foto } });
  } catch (error) {
    console.error("❌ Error en registro:", error);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
});

// Inicio de sesión
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verificar si el usuario existe
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(400).json({ error: "Email o contraseña incorrectos" });
    }

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, usuario.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Email o contraseña incorrectos" });
    }

    // Generar token
    const token = jwt.sign({ id: usuario._id }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, usuario: { id: usuario._id, nombre: usuario.nombre, email, foto: usuario.foto } });
  } catch (error) {
    console.error("❌ Error en login:", error);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

// Obtener datos del usuario autenticado
router.get("/me", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const usuario = await Usuario.findById(decoded.id).select("-password");
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(usuario);
  } catch (error) {
    console.error("❌ Error obteniendo usuario:", error);
    res.status(401).json({ error: "Token inválido" });
  }
});

module.exports = router;