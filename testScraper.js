require('dotenv').config();
const mongoose = require('mongoose');
const scrapeAmazon = require('./services/scraperAmazonService');

async function testScraper() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    const termino = 'Nintendo Switch'; // Puedes cambiar el término aquí
    console.log(`🔍 Probando búsqueda de: "${termino}"`);

    const productos = await scrapeAmazon(termino);

    console.log(`📦 Productos encontrados: ${productos.length}`);
    productos.forEach((p, i) => {
      console.log(`${i + 1}. ${p.nombre} - $${p.precio} (${p.estadoDescuento})`);
    });

  } catch (err) {
    console.error('❌ Error durante la prueba:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

testScraper();
