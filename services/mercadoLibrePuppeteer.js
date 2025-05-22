const puppeteer = require('puppeteer');

async function scrapeMercadoLibrePuppeteer(query, maxResults = 15) {
  const url = `https://listado.mercadolibre.com.mx/${encodeURIComponent(query)}`;
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  await page.setViewport({ width: 1366, height: 768 });

  try {
    console.log(`🌐 Abriendo: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    await page.waitForSelector('li.ui-search-layout__item', { timeout: 10000 });

    // Reemplazamos waitForTimeout con setTimeout manual
    await new Promise(resolve => setTimeout(resolve, 2000));

    await page.screenshot({ path: 'debug-mercadolibre.png', fullPage: true });

    const productos = await page.evaluate((max) => {
      const items = document.querySelectorAll('li.ui-search-layout__item');
      // Evitamos console.log dentro de evaluate
      // console.log('Items encontrados:', items.length);

      const resultado = [];

      for (let item of items) {
        if (resultado.length >= max) break;

        try {
          const nombre = item.querySelector('h2.ui-search-item__title')?.innerText.trim();
          const urlProducto = item.querySelector('a.ui-search-link')?.href?.split('?')[0] || '';
          const entero = item.querySelector('.andes-money-amount__fraction')?.innerText.replace(/[^\d]/g, '');
          const decimal = item.querySelector('.andes-money-amount__cents')?.innerText.replace(/[^\d]/g, '') || '00';
          const precio = parseFloat(`${entero}.${decimal}`);

          if (nombre && urlProducto && precio) {
            resultado.push({
              nombre,
              precio,
              precioOriginal: precio,
              urlProducto,
              tienda: 'MercadoLibre',
              estadoDescuento: 'Normal',
              porcentajeDescuento: 0,
              esOferta: false,
              fechaScraping: new Date().toISOString()
            });
          }
        } catch (err) {
          continue;
        }
      }
      return resultado;
    }, maxResults);

    console.log(`🧪 Productos encontrados: ${productos.length}`);
    return productos;
  } catch (err) {
    console.error(`❌ Error en scraping MercadoLibre con Puppeteer:`, err.message);
    return [];
  } finally {
    await browser.close();
  }
}

module.exports = scrapeMercadoLibrePuppeteer;
