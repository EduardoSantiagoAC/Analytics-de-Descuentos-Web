const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeMercadoLibre(query, limit = 20) {
  try {
    const url = `https://listado.mercadolibre.com.mx/${encodeURIComponent(query)}`;
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept-Language': 'es-MX,es;q=0.9'
      },
      timeout: 15000
    });

    const $ = cheerio.load(html);
    const productos = [];

    $('.ui-search-layout__item').each((i, el) => {
      if (productos.length >= limit) return false;

      try {
        const nombre = $(el).find('.ui-search-item__title').text().trim();

        const urlProducto = $(el).find('a').attr('href')?.split('?')[0];

        const precioEntero = $(el).find('.price-tag-fraction').first().text().replace(/[^\d]/g, '');
        const precioDecimal = $(el).find('.price-tag-cents').first().text().replace(/[^\d]/g, '');
        const precioTexto = `${precioEntero}.${precioDecimal || '00'}`;
        const precio = parseFloat(precioTexto);

        const originalEntero = $(el).find('.price-tag__subprice .price-tag-fraction').text().replace(/[^\d]/g, '');
        const originalDecimal = $(el).find('.price-tag__subprice .price-tag-cents').text().replace(/[^\d]/g, '');
        const originalTexto = `${originalEntero}.${originalDecimal || '00'}`;
        const precioOriginal = originalEntero ? parseFloat(originalTexto) : precio;

        const porcentajeDescuento = precioOriginal > precio
          ? Math.round(((precioOriginal - precio) / precioOriginal) * 100)
          : 0;

        if (nombre && precio && urlProducto) {
          productos.push({
            nombre,
            precio,
            precioOriginal,
            urlProducto,
            tienda: 'MercadoLibre',
            estadoDescuento: porcentajeDescuento > 0 ? 'Descuento' : 'Normal',
            porcentajeDescuento,
            esOferta: porcentajeDescuento > 10,
            fechaScraping: new Date()
          });
        }
      } catch (e) {
        console.warn(`❌ Error al procesar un item: ${e.message}`);
      }
    });

    return productos;
  } catch (error) {
    console.error(`❌ Error al scrapear MercadoLibre para "${query}":`, error.message);
    return [];
  }
}

module.exports = scrapeMercadoLibre;
