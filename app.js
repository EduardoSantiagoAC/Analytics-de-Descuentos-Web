require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cron = require('node-cron');
const scraper = require('./Utils/Scraper.js');
const Producto = require('./Models/Producto.js');

// Inicializar Express
const app = express();
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
})
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error de conexión:', err));

// Middleware básico
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- Tareas programadas ---
cron.schedule('0 3 * * *', async () => {
  console.log('⏰ Iniciando scraping programado...');
  try {
    const productos = ['PlayStation 5', 'Xbox Series X', 'Nintendo Switch OLED'];
    
    for (const producto of productos) {
      try {
        await scraper.scrapeAmazon(producto);
        console.log(`✔ ${producto} scrapeado correctamente`);
      } catch (error) {
        console.error(`✖ Error con ${producto}:`, error.message);
      }
    }

    await scraper.scrapeMercadoLibre('https://listado.mercadolibre.com.mx/consolas-videojuegos/playstation-5');
    
    console.log('✅ Scraping completado exitosamente');
  } catch (error) {
    console.error('❌ Error en scraping programado:', error);
  }
}, {
  scheduled: true,
  timezone: "America/Mexico_City"
});

// --- Rutas existentes ---
app.get('/', (req, res) => {
  res.json({ 
    status: 'online',
    services: {
      scraping: '/scraping',
      productos: '/productos'
    }
  });
});

// --- Importar rutas MANUALMENTE (sin archivo apiRoutes) ---
// 1. Ruta para el scraping de Amazon
app.post('/scraping/amazon', async (req, res) => {
  try {
    const { producto } = req.body;
    const resultados = await scraper.scrapeAmazon(producto);
    res.json({ success: true, data: resultados });
  } catch (error) {
    console.error('Error en scraping manual:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Ruta para obtener productos
app.get('/productos', async (req, res) => {
  try {
    const productos = await Producto.find().sort({ fechaActualizacion: -1 });
    res.json({ success: true, data: productos });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- Manejo de errores ---
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.stack);
  res.status(500).json({ error: 'Algo salió mal' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
  🚀 Servidor escuchando en http://localhost:${PORT}
  ├─ 🔍 Scraping programado: 3:00 AM CST
  ├─ 🔄 Endpoints disponibles:
  │  ├─ POST /scraping/amazon
  │  └─ GET  /productos
  └─ 📊 Prueba con: curl -X POST http://localhost:3000/scraping/amazon -H "Content-Type: application/json" -d '{"producto":"PlayStation 5"}'
  `);
});

// Manejo de cierre limpio
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🛑 MongoDB desconectado');
  process.exit(0);
});