const puppeteer = require('puppeteer');

async function scrapeMercadoLibrePuppeteer(query, maxResults = 15) {
  const url = `https://listado.mercadolibre.com.mx/${encodeURIComponent(query)}`;
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  );
  await page.setViewport({ width: 1366, height: 768 });

  try {
    console.log(`🌐 Abriendo: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    await page.waitForSelector('li.ui-search-layout__item', { timeout: 15000 });
    await new Promise(resolve => setTimeout(resolve, 3000)); // tiempo extra para que cargue todo

    const productos = await page.evaluate((max) => {
      const items = document.querySelectorAll('li.ui-search-layout__item');
      const resultado = [];

      for (let i = 0; i < items.length && resultado.length < max; i++) {
        const item = items[i];

        try {
          // Título y URL
          const nombre = item.querySelector('h2.ui-search-item__title')?.innerText.trim() || null;
          const urlProducto = item.querySelector('a.ui-search-link')?.href || null;

          // Precio actual
          const entero = item.querySelector('.andes-money-amount__fraction')?.innerText.replace(/[^\d]/g, '') || null;
          const decimal = item.querySelector('.andes-money-amount__cents')?.innerText.replace(/[^\d]/g, '') || '00';
          const precio = entero ? parseFloat(`${entero}.${decimal}`) : null;

          // Precio original tachado (si existe)
          const originalEntero = item.querySelector('.andes-money-amount--previous .andes-money-amount__fraction')?.innerText.replace(/[^\d]/g, '');
          const originalDecimal = item.querySelector('.andes-money-amount--previous .andes-money-amount__cents')?.innerText.replace(/[^\d]/g, '') || '00';
          const precioOriginal = originalEntero ? parseFloat(`${originalEntero}.${originalDecimal}`) : precio;

          // Porcentaje descuento
          let porcentajeDescuento = 0;
          if (precioOriginal && precio && precioOriginal > precio) {
            porcentajeDescuento = Math.round(((precioOriginal - precio) / precioOriginal) * 100);
          }

          // Imagen
          const imgTag = item.querySelector('img');
          let imagen = '';
          if (imgTag) {
            imagen = imgTag.getAttribute('src')?.trim() || '';
            if (!imagen || imagen.startsWith('data:image') || imagen.includes('placeholder.com')) {
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
              precioOriginal,
              urlProducto,
              imagen: imagen || 'https://via.placeholder.com/150',
              tienda: 'MercadoLibre',
              estadoDescuento: porcentajeDescuento > 0 ? 'Descuento' : 'Normal',
              porcentajeDescuento,
              esOferta: porcentajeDescuento >= 10,
              fechaScraping: new Date().toISOString()
            });
          }
        } catch (e) {
          console.warn('Error procesando producto:', e);
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
