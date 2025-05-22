require('dotenv').config();
const mongoose = require('mongoose');
const scrapeMercadoLibre = require('./services/mercadoLibreScraper');
const Producto = require('./Models/Producto');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    const termino = 'nintendo switch'; // puedes cambiar el término
    const productos = await scrapeMercadoLibre(termino, 15);

    if (productos.length === 0) {
      console.log('⚠️ No se encontraron productos.');
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
