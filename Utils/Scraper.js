const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const Producto = require('Models/Producto');

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

      // Extracción de datos
      const data = await page.evaluate(() => {
        const items = [];
        document.querySelectorAll('.s-result-item').forEach(item => {
          const name = item.querySelector('h2 a')?.innerText.trim();
          const price = item.querySelector('.a-price .a-offscreen')?.innerText.replace('$', '').trim();
          if (name && price) {
            items.push({
              nombre: name,
              precio: parseFloat(price.replace(',', '')),
              tienda: 'Amazon'
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
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const productos = [];

    $('.ui-search-result').each((index, el) => {
      const nombre = $(el).find('.ui-search-item__title').text().trim();
      const precio = $(el).find('.price-tag-fraction').first().text().replace(',', '');

      if (nombre && precio) {
        productos.push({
          nombre,
          precio: parseFloat(precio),
          tienda: 'MercadoLibre',
          fechaActualizacion: new Date()
        });
      }
    });

    await Producto.insertMany(productos);
    return productos;
  }
};