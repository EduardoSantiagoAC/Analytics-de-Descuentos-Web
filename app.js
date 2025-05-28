const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');  // <-- Importar cors
require('dotenv').config();

const app = express();

// Habilitar CORS para todas las rutas y orígenes
app.use(cors());

app.use(express.json());

const mercadoLibreRoutes = require('./Routes/mercadoLibre');
app.use('/mercado-libre', mercadoLibreRoutes);

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
