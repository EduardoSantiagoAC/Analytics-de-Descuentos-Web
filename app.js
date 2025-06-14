const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Habilitar CORS para todas las rutas y orígenes
app.use(cors());
app.use(express.json());

// Rutas
const mercadoLibreRoutes = require('./Routes/mercadoLibre');
const authRoutes = require('./Routes/auth');
app.use('/mercado-libre', mercadoLibreRoutes);
app.use('/auth', authRoutes);

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('❌ Error global:', err.stack);
  res.status(500).json({ error: 'Error interno del servidor', details: process.env.NODE_ENV === 'development' ? err.message : null });
});

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Error al conectar a MongoDB:', err.message);
  });