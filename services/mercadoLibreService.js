const puppeteer = require('puppeteer');

async function scrapeMercadoLibre(busqueda, limite = 10) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  const url = `https://listado.mercadolibre.com.mx/${encodeURIComponent(busqueda)}`;
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  const productos = await page.$$eval('.ui-search-result', (items, limite) => {
    return items.slice(0, limite).map(item => {
      const nombre = item.querySelector('h2')?.innerText || 'Sin nombre';
      const precioTexto = item.querySelector('.price-tag-fraction')?.innerText || '0';
      const precio = parseFloat(precioTexto.replace(/[^\d]/g, '')) || 0;

      // Obtener la imagen
      const imgElement = item.querySelector('img.poly-component__picture');
      const imagen = imgElement?.getAttribute('src') || '';

      return {
        nombre,
        precio,
        imagen,
        tienda: 'MercadoLibre',
      };
    });
  }, limite);

  await browser.close();
  return productos;
}

module.exports = { scrapeMercadoLibre };
