// runScrapingManual.js
const mongoose = require('mongoose');
require('dotenv').config();
const scrapingDiario = require('./services/scrapingDiario');

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
    await scrapingDiario();
    console.log('🎉 Scraping diario ejecutado exitosamente');
  } catch (error) {
    console.error('❌ Error ejecutando scraping manual:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
