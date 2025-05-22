const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeMercadoLibrePuppeteer(query, maxResults = 15) {
  const url = `https://listado.mercadolibre.com.mx/${encodeURIComponent(query)}`;
  const browser = await puppeteer.launch({
    headless: false, // true si deseas ocultar el navegador
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  await page.setViewport({ width: 1366, height: 768 });

  try {
    console.log(`🌐 Abriendo: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Espera explícita a los productos
    await page.waitForSelector('li.ui-search-layout__item', { timeout: 15000 });

    // Esperar manualmente unos segundos más para cargar dinámicamente
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Guardar HTML para depuración
    const html = await page.content();
    fs.writeFileSync('ml_debug.html', html);
    console.log('🧪 HTML guardado como "ml_debug.html". Ábrelo en tu navegador para revisar.');

    // Guardar captura de pantalla
    await page.screenshot({ path: 'debug-mercadolibre.png', fullPage: true });

    // Extraer productos
    const productos = await page.evaluate((max) => {
      const items = document.querySelectorAll('li.ui-search-layout__item');
      const resultado = [];

      console.log('📦 Total de elementos detectados:', items.length);

      for (let i = 0; i < items.length && resultado.length < max; i++) {
        const item = items[i];

        try {
          const nombre = item.querySelector('a.poly-component__title')?.innerText.trim() || null;
          const urlProducto = item.querySelector('a.poly-component__title')?.href || null;
          const entero = item.querySelector('.andes-money-amount__fraction')?.innerText?.replace(/[^\d]/g, '') || null;
          const decimal = item.querySelector('.andes-money-amount__cents')?.innerText?.replace(/[^\d]/g, '') || '00';
          const precio = (entero !== null) ? parseFloat(`${entero}.${decimal}`) : null;

          // Opcional: capturar imagen
          const imagen = item.querySelector('img.ui-search-result-image__element')?.src || null;

          console.log(`🕵️‍♂️ Producto ${i + 1}:`);
          console.log(`- nombre: ${nombre}`);
          console.log(`- urlProducto: ${urlProducto}`);
          console.log(`- precio: ${precio}`);
          if (imagen) console.log(`- imagen: ${imagen}`);

          if (nombre && urlProducto && !isNaN(precio)) {
            resultado.push({
              nombre,
              precio,
              precioOriginal: precio,
              urlProducto,
              imagen,
              tienda: 'MercadoLibre',
              estadoDescuento: 'Normal',
              porcentajeDescuento: 0,
              esOferta: false,
              fechaScraping: new Date().toISOString()
            });
          }
        } catch (err) {
          console.log(`⚠️ Error procesando producto ${i + 1}: ${err.message}`);
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
