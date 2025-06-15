const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configurar CORS para permitir orígenes específicos (ajusta en producción)
const allowedOrigins = ['http://localhost:8081', 'https://tu-dominio.com']; // Ajusta según tu frontend
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json());

// Rutas
const mercadoLibreRoutes = require('./Routes/mercadoLibre');
const authRoutes = require('./Routes/auth');
app.use('/mercado-libre', mercadoLibreRoutes);
app.use('/auth', authRoutes);

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('❌ Error global:', err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Conectado a MongoDB');
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor escuchando en http://0.0.0.0:${PORT}`);
  });
}).catch((err) => {
  console.error('❌ Error al conectar a MongoDB:', err.message);
});