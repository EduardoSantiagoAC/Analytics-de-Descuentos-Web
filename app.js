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
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error de conexión:', err));

// Middleware básico
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Tareas programadas con node-cron
cron.schedule('0 3 * * *', async () => {
  console.log('⏰ Iniciando scraping programado...');
  try {
    // Scraping para productos clave
    await scraper.scrapeAmazon('PlayStation 5');
    await scraper.scrapeAmazon('Xbox Series X');
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
  const productosEscasos = await Producto.find({ 
    stock: { $lt: '$umbralEscasez' },
    fechaActualizacion: { $gte: new Date(Date.now() - 24*60*60*1000) }
  });
  
  if (productosEscasos.length > 0) {
    console.log('⚠️ Productos con bajo stock:', productosEscasos.map(p => p.nombre));
    // Aquí podrías integrar un servicio de notificaciones
  }
});

// Rutas básicas
app.get('/', (req, res) => {
  res.json({ 
    status: 'online',
    services: {
      scraping: '/Scraping',
      productos: '/Productos'
    }
  });
});

// Importar rutas
const scrapingRoutes = require('Routes/Scraping');
app.use('/Scraping', scrapingRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.stack);
  res.status(500).json({ error: 'Algo salió mal' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
  console.log('🔍 Scraping programado para ejecutarse diariamente a las 3:00 AM CST');
});

// Manejo de cierre limpio
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🛑 MongoDB desconectado');
  process.exit(0);
});