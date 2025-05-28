const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const cheerio = require('cheerio');
const axios = require('axios');
const Producto = require('../Models/Producto.js');
const calcularDescuento = require('./utils/descuentos');

puppeteer.use(StealthPlugin());

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

const WAIT_OPTIONS = { waitUntil: 'domcontentloaded', timeout: 60000 };
const SELECTOR_TIMEOUT = 30000;

const extractFloatFromText = (text) => {
  if (!text) return null;
  const cleaned = text.replace(/[^\d.,]/g, '').replace(',', '');
  const number = parseFloat(cleaned);
  return isNaN(number) ? null : number;
};

module.exports = {
  async scrapeAmazon(productoBusqueda) {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--window-position=0,0',
        '--ignore-certificate-errors',
        '--ignore-certificate-errors-spki-list',
        '--user-agent=' + USER_AGENT
      ],
      ignoreHTTPSErrors: true
    });

    try {
      const page = await browser.newPage();
      await page.setUserAgent(USER_AGENT);
      await page.setViewport({ width: 1366, height: 768 });
      await page.setJavaScriptEnabled(true);
      await page.setDefaultNavigationTimeout(60000);

      const searchURL = `https://www.amazon.com.mx/s?k=${encodeURIComponent(productoBusqueda)}`;
      await page.goto(searchURL, WAIT_OPTIONS);

      await page.waitForSelector('.s-result-item', { timeout: SELECTOR_TIMEOUT }).catch(() => {
        console.log('No se encontraron resultados o la página cargó diferente');
      });

      const data = await page.evaluate(() => {
        const extractPrice = (element) => {
          if (!element) return null;
          const priceText = element.innerText.replace(/[^\d.,]/g, '').replace(',', '');
          return parseFloat(priceText) || null;
        };

        return Array.from(document.querySelectorAll('.s-result-item, [data-component-type="s-search-result"]')).map(item => {
          try {
            const nameElement = item.querySelector('h2 a span') ||
                                item.querySelector('h2 a') ||
                                item.querySelector('.a-size-medium');

            const priceElement = item.querySelector('.a-price .a-offscreen') ||
                                 item.querySelector('.a-price-whole') ||
                                 item.querySelector('.a-color-price');

            const originalPriceElement = item.querySelector('.a-text-price .a-offscreen') ||
                                         item.querySelector('.a-price[data-a-strike="true"]');

            if (!nameElement || !priceElement) return null;

            const name = nameElement.innerText.trim();
            const price = extractPrice(priceElement);
            const originalPrice = extractPrice(originalPriceElement);
            const url = item.querySelector('h2 a')?.href?.split('?')[0] || '';

            return {
              nombre: name,
              precio: price,
              precioOriginal: originalPrice || price,
              urlProducto: url,
              tienda: 'Amazon',
              fechaScraping: new Date()
            };
          } catch {
            return null;
          }
        }).filter(item => item !== null);
      });

      // Aplicar descuentos aquí
      const dataConDescuento = data.map((item) => {
        const descuento = calcularDescuento(item.precio, item.precioOriginal);
        return {
          ...item,
          ...descuento
        };
      });

      if (dataConDescuento.length > 0) {
        const bulkOps = dataConDescuento.map(item => ({
          updateOne: {
            filter: { urlProducto: item.urlProducto },
            update: { $set: item },
            upsert: true
          }
        }));
        await Producto.bulkWrite(bulkOps);
      }

      return dataConDescuento;
    } catch (error) {
      console.error('Error en scrapeAmazon:', error);
      return [];
    } finally {
      await browser.close();
    }
  },

  async scrapeMercadoLibre(url) {
    try {
      const headers = {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-MX,es;q=0.8,en-US;q=0.5,en;q=0.3'
      };

      const { data } = await axios.get(url, { headers });
      const $ = cheerio.load(data);
      const productos = [];

      $('.ui-search-result, .andes-card').each((index, el) => {
        try {
          const nombre = $(el).find('.ui-search-item__title, .ui-search-item__group__element').text().trim();
          const priceText = $(el).find('.price-tag-fraction, .andes-money-amount__fraction').first().text();
          const originalPriceText = $(el).find('.ui-search-price__original-value, .andes-money-amount__previous').text();
          const urlProducto = $(el).find('a').attr('href')?.split('?')[0] || '';

          const precio = extractFloatFromText(priceText);
          const precioOriginal = extractFloatFromText(originalPriceText) || precio;

          if (nombre && precio) {
            const descuento = calcularDescuento(precio, precioOriginal);

            productos.push({
              nombre,
              precio,
              precioOriginal,
              urlProducto,
              tienda: 'MercadoLibre',
              ...descuento,
              fechaScraping: new Date()
            });
          }
        } catch (e) {
          console.log('Error procesando item de MercadoLibre:', e);
        }
      });

      if (productos.length > 0) {
        const bulkOps = productos.map(item => ({
          updateOne: {
            filter: { urlProducto: item.urlProducto },
            update: { $set: item },
            upsert: true
          }
        }));
        await Producto.bulkWrite(bulkOps);
      }

      return productos;
    } catch (error) {
      console.error('Error en scrapeMercadoLibre:', error);
      return [];
    }
  }
};
