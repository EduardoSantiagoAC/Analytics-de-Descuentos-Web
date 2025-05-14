// services/scrapingDiario.js

const scrapeAmazon = require('./scraperAmazonService');
console.log('📦 Tipo de scrapeAmazon:', typeof scrapeAmazon);

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

    console.log(`📦 Productos encontrados para "${termino}":`, productos.length);

    if (productos.length > 0) {
      console.log('🧪 Primer producto:', productos[0]); // Verificar estructura

      const guardados = await guardarProductos(productos);

      console.log(`✅ Guardados ${guardados.length} productos de: ${termino}`);
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
