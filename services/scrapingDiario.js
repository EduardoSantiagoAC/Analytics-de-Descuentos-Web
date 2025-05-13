// services/scrapingDiario.js
const scrapeAmazon = require('./scraperAmazonService.js');
const guardarProductos = require('./guardarProductosService.js');

const terminosPopulares = [
  "Nintendo Switch",
  "PlayStation 5",
  "iPhone 15",
  "Smart TV",
  "Laptop gamer",
  "Audífonos bluetooth",
  "Refrigerador",
  "Aire acondicionado",
  "Cámara digital",
  "Auto eléctrico"
];

async function scrapingDiario() {
  console.log('🚀 Iniciando scraping diario...');
  for (const termino of terminosPopulares) {
    try {
      console.log(`🔍 Buscando: ${termino}`);
      const productos = await scrapeAmazon(termino);
      if (productos.length > 0) {
        await guardarProductos(productos);
        console.log(`✅ Guardados ${productos.length} productos de: ${termino}`);
      } else {
        console.warn(`⚠️ Sin resultados para: ${termino}`);
      }
    } catch (error) {
      console.error(`❌ Error al procesar "${termino}":`, error.message);
    }
  }
  console.log('🎉 Scraping diario finalizado.\n');
}

module.exports = scrapingDiario;
