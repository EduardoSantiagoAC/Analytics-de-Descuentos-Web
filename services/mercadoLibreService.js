const puppeteer = require('puppeteer');

async function scrapeProductoMercadoLibre(url) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    await page.waitForSelector('h1', { timeout: 10000 });

    const producto = await page.evaluate(() => {
      const obtenerTexto = (selector) => {
        const el = document.querySelector(selector);
        return el ? el.innerText.trim() : null;
      };

      const obtenerFloat = (selector) => {
        const el = document.querySelector(selector);
        if (!el) return null;
        const texto = el.innerText.replace(/[^\d.,]/g, '').replace(',', '');
        return parseFloat(texto);
      };

      return {
        nombre: obtenerTexto('h1'),
        precio: obtenerFloat('.ui-pdp-price__second-line span span'),
        precioOriginal: obtenerFloat('.ui-pdp-price__original-value'),
      };
    });

    // 🔍 Intentamos obtener una imagen válida
    let imagen = null;

    try {
      await page.waitForSelector('img.ui-pdp-image', { timeout: 5000 });
      imagen = await page.$eval('img.ui-pdp-image', img => img.src);
    } catch {
      console.warn('⚠️ No se encontró imagen real, usando placeholder.');
      imagen = 'https://via.placeholder.com/150';
    }

    await browser.close();

    return {
      ...producto,
      imagen,
      urlProducto: url,
      stock: true,
      porcentajeDescuento:
        producto.precioOriginal && producto.precioOriginal > producto.precio
          ? Math.round(
              ((producto.precioOriginal - producto.precio) / producto.precioOriginal) * 100
            )
          : 0,
      estadoDescuento:
        producto.precioOriginal && producto.precioOriginal > producto.precio
          ? 'Con descuento'
          : 'Normal',
      tienda: 'MercadoLibre',
      fechaActualizacion: new Date(),
    };
  } catch (error) {
    console.error('❌ Error al scrapear producto:', error);
    await browser.close();
    throw error;
  }
}

module.exports = { scrapeProductoMercadoLibre };
