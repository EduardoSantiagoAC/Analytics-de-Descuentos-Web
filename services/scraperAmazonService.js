// services/scraperAmazonService.js
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

async function scrapeAmazon(productoNombre) {
  const proxy = '186.121.235.66:8080'; 

  const browser = await puppeteer.launch({
    headless: true,
    args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    `--proxy-server=http://${proxy}`
    ]
  });


  let page;

  try {
    page = await browser.newPage();
    await page.setUserAgent(USER_AGENT);
    await page.setViewport({ width: 1366, height: 768 });

    await page.goto(`https://www.amazon.com.mx/s?k=${encodeURIComponent(productoNombre)}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    }); //ee

    const html = await page.content();
    if (html.includes("Enter the characters you see below") || html.includes("To discuss automated access")) {
      await page.screenshot({ path: `captcha-${productoNombre.replace(/\s+/g, '_')}-${Date.now()}.png` });
      throw new Error("⚠️ Amazon mostró un CAPTCHA o bloqueo de bot");
    }


    await page.waitForSelector('[data-component-type="s-search-result"]', { timeout: 30000 });

    // Screenshot para depuración
    await page.screenshot({ path: `screenshot-${productoNombre.replace(/\s+/g, '_')}-${Date.now()}.png`, fullPage: true });

    const productos = await page.evaluate(() => {
      const items = document.querySelectorAll('[data-component-type="s-search-result"]');

      let errores = 0;

      const resultados = Array.from(items).map(item => {
        try {
          const nombre =
            item.querySelector('h2 a span')?.textContent.trim() ||
            item.querySelector('h2 a')?.textContent.trim() ||
            item.querySelector('.a-size-medium')?.textContent.trim();

          const precioTexto = item.querySelector('.a-price .a-offscreen')?.textContent.replace(/[^0-9.]/g, '');
          const precioOriginalTexto = item.querySelector('.a-text-price .a-offscreen')?.textContent.replace(/[^0-9.]/g, '');

          const url = item.querySelector('h2 a')?.href.split('?')[0];

          const precio = precioTexto ? parseFloat(precioTexto) : null;
          const precioOriginal = precioOriginalTexto ? parseFloat(precioOriginalTexto) : null;

          if (!nombre || !precio) {
            errores++;
            return null;
          }

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
        } catch (e) {
          errores++;
          return null;
        }
      }).filter(Boolean);

      console.log(`🧪 Productos descartados por error: ${errores}`);
      return resultados;
    });

    return productos;
  } catch (error) {
    console.error(`❌ Error al hacer scraping de "${productoNombre}":`, error.message);

    if (page) {
      await page.screenshot({ path: `error-${productoNombre.replace(/\s+/g, '_')}-${Date.now()}.png` });
    }

    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = scrapeAmazon;
