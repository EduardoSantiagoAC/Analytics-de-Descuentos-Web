const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');
const Producto = require('../Models/Producto.js');

// Configuración de user-agent para evitar bloqueos
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

module.exports = {
  async scrapeAmazon(productoBusqueda) {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      await page.setUserAgent(USER_AGENT);
      await page.goto(`https://www.amazon.com.mx/s?k=${encodeURIComponent(productoBusqueda)}`, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Extracción de datos mejorada
      const data = await page.evaluate(() => {
        const items = [];
        document.querySelectorAll('.s-result-item').forEach(item => {
          const name = item.querySelector('h2 a')?.innerText.trim();
          const priceElement = item.querySelector('.a-price .a-offscreen');
          const originalPriceElement = item.querySelector('.a-text-price .a-offscreen');
          
          if (name && priceElement) {
            const price = parseFloat(priceElement.innerText.replace('$', '').replace(',', ''));
            const originalPrice = originalPriceElement 
              ? parseFloat(originalPriceElement.innerText.replace('$', '').replace(',', '')) 
              : null;
            
            items.push({
              nombre: name,
              precio: price,
              precioOriginal: originalPrice,
              tienda: 'Amazon',
              estadoDescuento: originalPrice && originalPrice > price ? 'Descuento' : 'Normal',
              porcentajeDescuento: originalPrice && originalPrice > price 
                ? Math.round(((originalPrice - price) / originalPrice) * 100) 
                : 0
            });
          }
        });
        return items;
      });

      // Guardar en MongoDB
      await Producto.insertMany(data.map(item => ({
        ...item,
        categoria: productoBusqueda,
        fechaActualizacion: new Date()
      })));

      return data;
    } finally {
      await browser.close();
    }
  },

  async scrapeMercadoLibre(url) {
    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);
      const productos = [];

      $('.ui-search-result').each((index, el) => {
        const nombre = $(el).find('.ui-search-item__title').text().trim();
        const precioElement = $(el).find('.price-tag-fraction').first();
        const originalPriceElement = $(el).find('.ui-search-price__original-value');

        if (nombre && precioElement.length) {
          const precio = parseFloat(precioElement.text().replace(/[^0-9]/g, ''));
          const originalPrice = originalPriceElement.length 
            ? parseFloat(originalPriceElement.text().replace(/[^0-9]/g, '')) 
            : null;

          productos.push({
            nombre,
            precio,
            precioOriginal: originalPrice,
            tienda: 'MercadoLibre',
            estadoDescuento: originalPrice && originalPrice > precio ? 'Descuento' : 'Normal',
            porcentajeDescuento: originalPrice && originalPrice > precio
              ? Math.round(((originalPrice - precio) / originalPrice) * 100)
              : 0,
            fechaActualizacion: new Date()
          });
        }
      });

      await Producto.insertMany(productos);
      return productos;
    } catch (error) {
      console.error('Error en scrapeMercadoLibre:', error);
      throw error;
    }
  },

  // Métodos auxiliares (se mantienen igual)
  async closeBrowser(browser) {
    if (browser) await browser.close();
  }
};