// services/scraperAmazonService.js
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

async function scrapeAmazon(productoNombre) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(USER_AGENT);
    await page.setViewport({ width: 1366, height: 768 });

    await page.goto(`https://www.amazon.com.mx/s?k=${encodeURIComponent(productoNombre)}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await page.waitForSelector('.s-result-item', { timeout: 15000 });

    const productos = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.s-result-item')).map(item => {
        const nombre = item.querySelector('h2 a span')?.textContent.trim();
        const precioTexto = item.querySelector('.a-price .a-offscreen')?.textContent.replace(/[^0-9.]/g, '');
        const precioOriginalTexto = item.querySelector('.a-price[data-a-strike="true"] .a-offscreen')?.textContent.replace(/[^0-9.]/g, '');
        const url = item.querySelector('h2 a')?.href.split('?')[0];

        const precio = precioTexto ? parseFloat(precioTexto) : null;
        const precioOriginal = precioOriginalTexto ? parseFloat(precioOriginalTexto) : null;

        if (!nombre || !precio) return null;

        const porcentajeDescuento = precioOriginal && precioOriginal > precio
          ? Math.round(((precioOriginal - precio) / precioOriginal) * 100)
          : 0;

        return {
          nombre,
          precio,
          precioOriginal: precioOriginal || precio,
          urlProducto: url,
          tienda: 'Amazon',
          estadoDescuento: porcentajeDescuento > 0 ? 'Descuento' : 'Normal',
          porcentajeDescuento,
          esOferta: porcentajeDescuento > 10,
          fechaScraping: new Date()
        };
      }).filter(Boolean);
    });

    return productos;
  } catch (error) {
    console.error('❌ Error al hacer scraping de Amazon:', error.message);
    return [];
  } finally {
    await page.screenshot({ path: `screenshot-${Date.now()}.png`, fullPage: true });

    await browser.close();
  }
}

module.exports = scrapeAmazon; // pipi 
