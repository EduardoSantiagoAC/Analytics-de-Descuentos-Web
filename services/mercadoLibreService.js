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

      // Precio con descuento (el grande)
      const precioDescuentoTexto = item.querySelector('.andes-money-amount--cents-superscript .andes-money-amount__fraction')?.innerText || '';

      // Precio original (el tachado)
      const precioOriginalTexto = item.querySelector('.andes-money-amount--previous .andes-money-amount__fraction')?.innerText || '';

      const urlProducto = item.querySelector('a')?.href || '';

      return {
        nombre,
        imagen,
        precioDescuentoTexto,
        precioOriginalTexto,
        urlProducto,
      };
    });
  });

  const productosFormateados = productos.map(producto => {
    const precioConDescuento = extraerPrecio(producto.precioDescuentoTexto);
    const precioOriginal = extraerPrecio(producto.precioOriginalTexto);

    let porcentajeDescuento = null;

    if (precioOriginal && precioConDescuento && precioOriginal > precioConDescuento) {
      porcentajeDescuento = Math.round(((precioOriginal - precioConDescuento) / precioOriginal) * 100);
    }

    return {
      nombre: producto.nombre,
      imagen: producto.imagen,
      urlProducto: producto.urlProducto,
      precio: precioConDescuento || precioOriginal || null,
      precioOriginal: precioOriginal || null,
      precioConDescuento: precioConDescuento || null,
      porcentajeDescuento: porcentajeDescuento || 0,
    };
  });

  await browser.close();
  return productosFormateados;
}

module.exports = scrapeMercadoLibre;
