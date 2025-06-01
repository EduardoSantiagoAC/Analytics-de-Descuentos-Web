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

      const precioDescuentoTexto = item.querySelector('.price-tag-fraction')?.innerText || '';
      const precioOriginalTexto = item.querySelector('.ui-search-price__subtitles .andes-money-amount__fraction')?.innerText || '';

      const url = item.querySelector('a')?.href || '';

      return {
        nombre,
        imagen,
        precioDescuentoTexto,
        precioOriginalTexto,
        url,
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
      url: producto.url,
      precio: producto.precioDescuentoTexto, // Campo original para compatibilidad
      precioOriginal,
      precioConDescuento,
      porcentajeDescuento,
    };
  });

  await browser.close();
  return productosFormateados;
}

module.exports = scrapeMercadoLibre;
