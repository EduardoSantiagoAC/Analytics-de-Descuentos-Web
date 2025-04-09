require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cron = require('node-cron');
const scraper = require('./Utils/Scraper.js');
const Producto = require('./Models/Producto.js');
const path = require('path');

// Inicializar Express
const app = express();
app.use(express.json());

// Conexión a MongoDB (configuración mejorada)
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  retryWrites: true,
  w: 'majority'
})
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error de conexión:', err));

// Middleware básico
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- Tareas programadas con node-cron (actualizadas) ---
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

// Tarea cada 6 horas para verificar escasez
cron.schedule('0 */6 * * *', async () => {
  try {
    const productosEscasos = await Producto.aggregate([
      {
        $match: {
          $expr: { $lt: ["$stock", "$umbralEscasez"] },
          fechaActualizacion: { $gte: new Date(Date.now() - 24*60*60*1000) }
        }
      },
      { $project: { nombre: 1, stock: 1, umbralEscasez: 1 } }
    ]);
    
    if (productosEscasos.length > 0) {
      console.log('⚠️ Productos con bajo stock:');
      productosEscasos.forEach(p => {
        console.log(`- ${p.nombre} (Stock: ${p.stock} < ${p.umbralEscasez})`);
      });
    }
  } catch (error) {
    console.error('Error en verificación de stock:', error);
  }
});

// --- Rutas básicas (actualizadas) ---
app.get('/', (req, res) => {
  res.json({ 
    status: 'online',
    services: {
      scraping: '/api/scraping',
      productos: '/api/productos'
    },
    version: '1.1.0'
  });
});

// --- Importar rutas (sistema unificado) ---
const apiRoutes = require('./Routes/apiRoutes'); // Archivo principal de rutas
app.use('/api', apiRoutes);

// --- Manejo de errores mejorado ---
app.use((err, req, res, next) => {
  console.error('🔥 Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    timestamp: new Date().toISOString()
  });
  
  res.status(500).json({ 
    error: 'Algo salió mal',
    detalle: process.env.NODE_ENV === 'development' ? err.message : null
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
  🚀 Servidor escuchando en http://localhost:${PORT}
  ├─ 🔍 Scraping programado: 3:00 AM CST
  ├─ 🔄 Verificación de stock: Cada 6 horas
  └─ 📊 Endpoints disponibles:
     ├─ POST /api/scraping/amazon
     ├─ GET  /api/productos
     └─ GET  /api/scraping/history
  `);
});

// Manejo de cierre limpio
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('🛑 MongoDB desconectado correctamente');
    process.exit(0);
  } catch (error) {
    console.error('Error al desconectar MongoDB:', error);
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Rejection at:', promise, 'reason:', reason);
});