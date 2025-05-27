const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config(); // Asegúrate de tener el archivo .env con MONGODB_URI

const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Importar rutas
const mercadoLibreRoutes = require('./Routes/mercadoLibre');
app.use('/mercado-libre', mercadoLibreRoutes);

// Puerto por defecto
const PORT = process.env.PORT || 3000;

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ Conectado a MongoDB');

  // Iniciar servidor SOLO si la DB está conectada
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
  });
})
.catch((err) => {
  console.error('❌ Error al conectar a MongoDB:', err.message);
});
