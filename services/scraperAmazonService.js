const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

const proxyList = [
  '45.174.76.85:999',
  '103.178.43.182:8181',
  '159.192.97.165:8080'
];

function getRandomProxy(exclude = []) {
  const available = proxyList.filter(p => !exclude.includes(p));
  return available.length ? available[Math.floor(Math.random() * available.length)] : null;
}

async function launchBrowser(proxy = null) {
  const args = ['--no-sandbox', '--disable-setuid-sandbox'];
  if (proxy) args.push(`--proxy-server=http://${proxy}`);

  return puppeteer.launch({
    headless: true,
    args
  });
}

async function scrapeAmazon(productoNombre, intento = 0, usados = []) {
  const MAX_RETRIES = 3;
  const proxy = getRandomProxy(usados);

  const usarProxy = proxy !== null;
  if (usarProxy) usados.push(proxy);

  console.log(`🔁 Intento ${intento + 1} - Usando ${usarProxy ? `proxy ${proxy}` : 'modo directo (sin proxy)'}`);

  let browser;
  let page;

  try {
    browser = await launchBrowser(proxy);
    page = await browser.newPage();
    await page.setUserAgent(USER_AGENT);
    await page.setViewport({ width: 1366, height: 768 });

    await page.goto(`https://www.amazon.com.mx/s?k=${encodeURIComponent(productoNombre)}`, {
      waitUntil: 'domcontentloaded',
      timeout: 40000
    });

    const html = await page.content();
    if (html.includes('Enter the characters you see below') || html.includes('automated access')) {
      await page.screenshot({ path: `captcha-${productoNombre.replace(/\s+/g, '_')}-${Date.now()}.png` });
      throw new Error('⚠️ Amazon mostró un CAPTCHA o bloqueo de bot');
    }

    await page.waitForSelector('[data-component-type="s-search-result"]', { timeout: 30000 });

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

          const porcentajeDescuento =
            precioOriginal && precioOriginal > precio
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
        } catch {
          errores++;
          return null;
        }
      }).filter(Boolean);

      console.log(`🧪 Productos descartados por error: ${errores}`);
      return resultados;
    });

    return productos;
  } catch (error) {
    console.error(`❌ Error con ${usarProxy ? `proxy ${proxy}` : 'modo directo'}:`, error.message);

    if (page && typeof page.screenshot === 'function') {
      await page.screenshot({ path: `error-${productoNombre.replace(/\s+/g, '_')}-${Date.now()}.png` });
    }

    if (browser) await browser.close();

    if (usarProxy && intento + 1 < MAX_RETRIES) {
      return scrapeAmazon(productoNombre, intento + 1, usados);
    }

    // Reintento final sin proxy si todos fallan
    if (usarProxy && intento + 1 === MAX_RETRIES) {
      console.warn('🔁 Todos los proxies fallaron. Probando sin proxy...');
      return scrapeAmazon(productoNombre, 0, []);
    }

    console.error(`❌ No se pudo hacer scraping de: ${productoNombre}`);
    return [];
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = scrapeAmazon;
