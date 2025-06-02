const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("../cloudinary");
const upload = require("../multer");
const Usuario = require("../Models/Usuario");

// Clave secreta para JWT (en producción, usa una variable de entorno)
const JWT_SECRET = process.env.JWT_SECRET || "tu_clave_secreta_aqui";

// Registro
router.post("/register", upload.single("foto"), async (req, res) => {
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
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "perfiles" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      fotoUrl = result.secure_url;
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
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "perfiles" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    // Actualizar la URL de la foto en la base de datos
    usuario.foto = result.secure_url;
    await usuario.save();

    res.json({ message: "Foto actualizada", foto: usuario.foto });
  } catch (error) {
    console.error("❌ Error actualizando foto:", error);
    res.status(500).json({ error: "Error al actualizar foto" });
  }
});

module.exports = router;