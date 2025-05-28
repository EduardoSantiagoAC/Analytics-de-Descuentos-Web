const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function scrapeMercadoLibrePuppeteer(query, maxResults = 15) {
  const debugHtml = 'ml_debug.html';
  const debugPng = 'debug-mercadolibre.png';

  // 🧹 Eliminar archivos anteriores si existen
  [debugHtml, debugPng].forEach(file => {
    try {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        console.log(`🗑️ Archivo eliminado: ${file}`);
      }
    } catch (err) {
      console.warn(`⚠️ No se pudo borrar el archivo ${file}:`, err.message);
    }
  });

  const url = `https://listado.mercadolibre.com.mx/${encodeURIComponent(query)}`;
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  await page.setViewport({ width: 1366, height: 768 });

  try {
    console.log(`🌐 Abriendo: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    await page.waitForSelector('li.ui-search-layout__item', { timeout: 15000 });
    await new Promise(resolve => setTimeout(resolve, 2500));

    const html = await page.content();
    fs.writeFileSync(debugHtml, html);
    console.log(`🧪 HTML guardado como "${debugHtml}".`);
    await page.screenshot({ path: debugPng, fullPage: true });

    const productos = await page.evaluate((max) => {
      const items = document.querySelectorAll('li.ui-search-layout__item');
      const resultado = [];

      for (let i = 0; i < items.length && resultado.length < max; i++) {
        const item = items[i];

        try {
          const nombre = item.querySelector('a.poly-component__title')?.innerText.trim() || null;
          const urlProducto = item.querySelector('a.poly-component__title')?.href || null;
          const entero = item.querySelector('.andes-money-amount__fraction')?.innerText?.replace(/[^\d]/g, '') || null;
          const decimal = item.querySelector('.andes-money-amount__cents')?.innerText?.replace(/[^\d]/g, '') || '00';
          const precio = (entero !== null) ? parseFloat(`${entero}.${decimal}`) : null;

          const imgTag = item.querySelector('img');
          let imagen = '';

          if (imgTag) {
            imagen = imgTag.getAttribute('src')?.trim() || '';

            if (
              !imagen ||
              imagen.startsWith('data:image') ||
              imagen.includes('placeholder.com')
            ) {
              imagen = imgTag.getAttribute('data-src')?.trim()
                    || imgTag.getAttribute('data-srcset')?.trim()
                    || '';
            }

            if (imagen.includes(' ')) {
              imagen = imagen.split(' ')[0];
            }
          }

          if (nombre && urlProducto && !isNaN(precio)) {
            resultado.push({
              nombre,
              precio,
              precioOriginal: precio,
              urlProducto,
              imagen: imagen || 'https://via.placeholder.com/150',
              tienda: 'MercadoLibre',
              estadoDescuento: 'Normal',
              porcentajeDescuento: 0,
              esOferta: false,
              fechaScraping: new Date().toISOString()
            });
          }
        } catch (_) {
          continue;
        }
      }

      return resultado;
    }, maxResults);

    console.log(`✅ Productos encontrados: ${productos.length}`);
    return productos;
  } catch (err) {
    console.error(`❌ Error en scraping MercadoLibre con Puppeteer:`, err.stack);
    return [];
  } finally {
    await browser.close();
  }
}

module.exports = scrapeMercadoLibrePuppeteer;
