require('dotenv').config();
const mongoose = require('mongoose');
const scrapeMercadoLibre = require('./services/mercadoLibreScraper');
const scrapeMercadoLibre = require('./services/mercadoLibrePuppeteer');
const Producto = require('./Models/Producto');
const axios = require('axios');
const fs = require('fs');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    const termino = 'nintendo switch'; // puedes cambiar el término
    const productos = await scrapeMercadoLibre(termino, 15);

    if (productos.length === 0) {
      console.log('⚠️ No se encontraron productos.');

      // 🔎 Guardar HTML para inspección manual
      const { data: html } = await axios.get(`https://listado.mercadolibre.com.mx/${encodeURIComponent(termino)}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept-Language': 'es-MX,es;q=0.9'
        },
        timeout: 15000
      });
      fs.writeFileSync('ml_debug.html', html);
      console.log('🧪 HTML guardado como "ml_debug.html". Ábrelo en tu navegador para revisar.');
      return;
    }

    const ops = productos.map(p => ({
      updateOne: {
        filter: { urlProducto: p.urlProducto },
        update: {
          $set: p,
          $push: {
            historicoPrecios: {
              precio: p.precio,
              fecha: new Date()
            }
          }
        },
        upsert: true
      }
    }));

    await Producto.bulkWrite(ops);
    console.log(`✅ Guardados ${productos.length} productos de "${termino}"`);

    productos.forEach((p, i) => {
      console.log(`${i + 1}. ${p.nombre} - $${p.precio} (${p.estadoDescuento})`);
    });

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
})();
