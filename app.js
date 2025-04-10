require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cron = require('node-cron');
const scraper = require('./Utils/Scraper.js');
const Producto = require('./Models/Producto.js');


const app = express();
app.use(express.json());


mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => {
    console.error('❌ Error de conexión a MongoDB:', err);
    process.exit(1); 
  });


app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});


cron.schedule('0 3 * * *', () => {
  console.log('⏰ Ejecutando scraping programado...');
  const scrapingTasks = [
    scraper.scrapeAmazon('PlayStation 5'),
    scraper.scrapeAmazon('Xbox Series X'),
    scraper.scrapeAmazon('Nintendo Switch OLED'),
    scraper.scrapeMercadoLibre('https://listado.mercadolibre.com.mx/consolas-videojuegos/playstation-5')
  ];

  Promise.allSettled(scrapingTasks)
    .then(results => {
      results.forEach((result, i) => {
        if (result.status === 'rejected') {
          console.error(`✖ Error en tarea ${i}:`, result.reason.message);
        }
      });
      console.log('✅ Scraping completado');
    });
}, {
  timezone: "America/Mexico_City",
  scheduled: true
});


app.get('/', (req, res) => {
  res.json({
    status: 'online',
    endpoints: {
      scraping: {
        method: 'POST',
        path: '/scraping/amazon',
        body: { producto: 'String' }
      },
      productos: {
        method: 'GET',
        path: '/productos'
      }
    }
  });
});


app.post('/scraping/amazon', async (req, res) => {
  try {
    if (!req.body.producto) {
      return res.status(400).json({ error: 'El campo "producto" es requerido' });
    }

    const resultados = await scraper.scrapeAmazon(req.body.producto);
    if (resultados.length === 0) {
      return res.status(404).json({ message: 'No se encontraron productos' });
    }

    
    const operaciones = resultados.map(item => 
      Producto.findOneAndUpdate(
        { urlProducto: item.urlProducto },
        { $set: item, $push: { historicoPrecios: { precio: item.precio } } },
        { upsert: true, new: true }
      )
    );

    const productosGuardados = await Promise.all(operaciones);
    res.json({
      success: true,
      count: productosGuardados.length,
      data: productosGuardados
    });

  } catch (error) {
    console.error('Error en scraping manual:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al realizar scraping',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


app.get('/productos', async (req, res) => {
  try {
    const { limit = 50, sort = '-fechaActualizacion' } = req.query;
    const productos = await Producto.find()
      .sort(sort)
      .limit(Number(limit));

    res.json({
      success: true,
      count: productos.length,
      data: productos
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener productos'
    });
  }
});


app.use((err, req, res, next) => {
  console.error('🔥 Error:', {
    path: req.path,
    method: req.method,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
  
  res.status(500).json({ 
    error: 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});


const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`
  🚀 Servidor escuchando en http://localhost:${PORT}
  ├─ 🔍 Scraping programado: 3:00 AM CST
  ├─ 🔄 Endpoints disponibles:
  │  ├─ POST /scraping/amazon - Body: { "producto": "Nombre del producto" }
  │  └─ GET  /productos?limit=10&sort=-precio
  └─ 📌 Ejemplo: curl -X POST http://localhost:3000/scraping/amazon -H "Content-Type: application/json" -d '{"producto":"PlayStation 5"}'
  `);
});


const shutdown = async () => {
  console.log('\n🛑 Recibida señal de apagado...');
  server.close(async () => {
    await mongoose.connection.close();
    console.log('✅ Servidores desconectados correctamente');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('unhandledRejection', (err) => {
  console.error('⚠️ Unhandled Rejection:', err.message);
});