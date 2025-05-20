const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const Producto = require('../Models/Producto');

puppeteer.use(StealthPlugin());

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

async function scrapeAmazon(productoNombre) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  let page;

  try {
    page = await browser.newPage();
    await page.setUserAgent(USER_AGENT);
    await page.setViewport({ width: 1366, height: 768 });

    const urlBusqueda = `https://www.amazon.com.mx/s?k=${encodeURIComponent(productoNombre)}`;
    console.log(`🌐 Navegando a: ${urlBusqueda}`);
    await page.goto(urlBusqueda, {
      waitUntil: 'domcontentloaded',
      timeout: 40000
    });

    // Tomar screenshot para verificar
    await page.screenshot({ path: `screenshot-${productoNombre.replace(/\s+/g, '_')}-${Date.now()}.png`, fullPage: true });

    // Esperar por resultados
    await page.waitForSelector('[data-component-type="s-search-result"]', { timeout: 30000 });

    const productos = await page.evaluate(() => {
      const items = document.querySelectorAll('[data-component-type="s-search-result"]');

      return Array.from(items).map(item => {
        try {
          const nombre = item.querySelector('h2 a span')?.textContent.trim();
          const precioTexto = item.querySelector('.a-price .a-offscreen')?.textContent.replace(/[^0-9.]/g, '');
          const precioOriginalTexto = item.querySelector('.a-text-price .a-offscreen')?.textContent.replace(/[^0-9.]/g, '');
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
        } catch {
          return null;
        }
      }).filter(Boolean);
    });

    console.log(`📦 Productos encontrados: ${productos.length}`);

    if (productos.length > 0) {
      const operaciones = productos.map(item => ({
        updateOne: {
          filter: { urlProducto: item.urlProducto },
          update: {
            $set: item,
            $push: {
              historicoPrecios: {
                precio: item.precio,
                fecha: new Date()
              }
            }
          },
          upsert: true
        }
      }));

      await Producto.bulkWrite(operaciones);
      console.log(`✅ Guardados ${productos.length} productos en la base de datos.`);
    }

    return productos;
  } catch (error) {
    console.error(`❌ Error al hacer scraping de "${productoNombre}":`, error.message);
    return [];
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = scrapeAmazon;
