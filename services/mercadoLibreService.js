const puppeteer = require('puppeteer');

function extraerPrecio(texto) {
  const match = texto?.replace(/[^\d.,]/g, '').replace(',', '.').match(/\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : null;
}

async function scrapeMercadoLibre(busqueda) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  const url = `https://listado.mercadolibre.com.mx/${encodeURIComponent(busqueda)}`;
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  await page.waitForSelector('.ui-search-layout__item');

  const productos = await page.evaluate(() => {
    const items = document.querySelectorAll('.ui-search-layout__item');

    return Array.from(items).map(item => {
      const nombre = item.querySelector('.ui-search-item__title')?.innerText || '';
      const imagen = item.querySelector('img')?.src || '';
      const url = item.querySelector('a')?.href || '';

      const precioActualTexto = item.querySelector('.ui-search-price__second-line .andes-money-amount__fraction')?.innerText || '';
      const precioOriginalTexto = item.querySelector('.ui-search-price__original .andes-money-amount__fraction')?.innerText || '';

      return {
        nombre,
        imagen,
        url,
        precioActualTexto,
        precioOriginalTexto,
      };
    });
  });

  const productosFormateados = productos
    .filter(producto => producto.precioActualTexto)
    .map(producto => {
      const precio = extraerPrecio(producto.precioActualTexto);
      const precioOriginal = extraerPrecio(producto.precioOriginalTexto);

      let porcentajeDescuento = 0;
      if (precioOriginal && precio && precioOriginal > precio) {
        porcentajeDescuento = Math.round(((precioOriginal - precio) / precioOriginal) * 100);
      }

      return {
        nombre: producto.nombre,
        imagen: producto.imagen,
        urlProducto: producto.url,
        precio,
        precioOriginal: precioOriginal || null,
        porcentajeDescuento,
        estadoDescuento: precioOriginal && precioOriginal > precio ? 'Descuento' : 'Normal',
        esOferta: porcentajeDescuento > 10,
        tienda: 'MercadoLibre',
      };
    });

  await browser.close();
  return productosFormateados;
}

module.exports = scrapeMercadoLibre;
