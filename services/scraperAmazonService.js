const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const Producto = require('../Models/Producto');

puppeteer.use(StealthPlugin());

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

async function scrapeAmazon(productoNombre) {
  const browser = await puppeteer.launch({
    headless: false, // Para que puedas ver el navegador
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

    await page.screenshot({
      path: `screenshot-inicio-${productoNombre.replace(/\s+/g, '_')}-${Date.now()}.png`,
      fullPage: true
    });

    const html = await page.content();
    if (html.includes('Enter the characters you see below') || html.includes('automated access')) {
      console.log('🛑 CAPTCHA detectado. Esperando 60 segundos para resolverlo manualmente...');
      await page.screenshot({
        path: `captcha-${productoNombre.replace(/\s+/g, '_')}-${Date.now()}.png`,
        fullPage: true
      });

      // Esperar que el usuario lo resuelva manualmente
      await new Promise(r => setTimeout(r, 60000)); // 60 segundos

      const htmlAfter = await page.content();
      if (htmlAfter.includes('Enter the characters')) {
        console.log('❌ CAPTCHA no resuelto. Saltando...');
        return [];
      }

      console.log('✅ CAPTCHA resuelto. Continuando...');
    }

    await page.waitForSelector('[data-component-type="s-search-result"]', { timeout: 30000 });

    await page.screenshot({
      path: `screenshot-final-${productoNombre.replace(/\s+/g, '_')}-${Date.now()}.png`,
      fullPage: true
    });

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
          ///

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
    } else {
      console.log(`⚠️ No se encontraron productos para "${productoNombre}".`);
    }

    // Esperar entre productos para no saturar
    await new Promise(r => setTimeout(r, 8000)); // 8 segundos
    return productos;
  } catch (error) {
    console.error(`❌ Error durante scraping de "${productoNombre}":`, error.message);
    return [];
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = scrapeAmazon;
