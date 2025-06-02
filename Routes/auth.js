const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2; // Importa directamente desde la librería
const upload = require("../multer");
const Usuario = require("../Models/Usuario");

// Clave secreta para JWT (en producción, usa una variable de entorno)
const JWT_SECRET = process.env.JWT_SECRET || "tu_clave_secreta_aqui";

// Registro
router.post("/register", upload.single("foto"), async (req, res) => {
  console.log("📥 Solicitud recibida en /register");
  console.log("Cuerpo de la solicitud:", req.body);
  console.log("Archivo recibido:", req.file);

  const { nombre, email, password } = req.body;

  try {
    // Verificar si el usuario ya existe
    let usuario = await Usuario.findOne({ email });
    if (usuario) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    // Subir foto a Cloudinary si se proporcionó
    let fotoUrl = "https://randomuser.me/api/portraits/lego/1.jpg"; // Valor por defecto
    if (req.file) {
      console.log("📤 Subiendo foto a Cloudinary...");
      const base64Image = req.file.buffer.toString("base64");
      const dataUri = `data:${req.file.mimetype};base64,${base64Image}`;
      const result = await cloudinary.uploader.upload(dataUri, { folder: "perfiles" });
      fotoUrl = result.secure_url;
      console.log("✅ Foto subida, URL:", fotoUrl);
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear usuario
    usuario = new Usuario({
      nombre,
      email,
      password: hashedPassword,
      foto: fotoUrl,
    });

    await usuario.save();

    // Generar token
    const token = jwt.sign({ id: usuario._id }, JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({ token, usuario: { id: usuario._id, nombre, email, foto: fotoUrl } });
  } catch (error) {
    console.error("❌ Error en registro:", error);
    res.status(500).json({ error: "Error al registrar usuario", details: error.message });
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

// Actualizar foto de perfil
router.post("/update-photo", upload.single("foto"), async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  if (!req.file) {
    return res.status(400).json({ error: "No se proporcionó una foto" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const usuario = await Usuario.findById(decoded.id);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Subir nueva foto a Cloudinary
    const base64Image = req.file.buffer.toString("base64");
    const dataUri = `data:${req.file.mimetype};base64,${base64Image}`;
    const result = await cloudinary.uploader.upload(dataUri, { folder: "perfiles" });

    // Actualizar la URL de la foto en la base de datos
    usuario.foto = result.secure_url;
    await usuario.save();

    res.json({ message: "Foto actualizada", foto: usuario.foto });
  } catch (error) {
    console.error("❌ Error actualizando foto:", error);
    res.status(500).json({ error: "Error al actualizar foto", details: error.message });
  }
});

module.exports = router;