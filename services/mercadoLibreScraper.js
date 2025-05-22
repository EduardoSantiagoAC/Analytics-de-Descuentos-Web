const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeMercadoLibre(query, maxResults = 15) {
  const url = `https://listado.mercadolibre.com.mx/${encodeURIComponent(query)}`;

  try {
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept-Language': 'es-MX,es;q=0.9'
      },
    });

    const $ = cheerio.load(html);
    const productos = [];

    $('li.ui-search-layout__item').each((index, el) => {
      if (productos.length >= maxResults) return false;

      try {
        const contenedor = $(el);

        const nombre = contenedor.find('h2.ui-search-item__title').text().trim();
        const urlProducto = contenedor.find('a.ui-search-link').attr('href')?.split('?')[0] || '';

        const precioEntero = contenedor.find('.andes-money-amount__fraction').first().text().replace(/[^\d]/g, '');
        const precioDecimal = contenedor.find('.andes-money-amount__cents').first().text().replace(/[^\d]/g, '');
        const precioTexto = `${precioEntero}.${precioDecimal || '00'}`;
        const precio = parseFloat(precioTexto);

        if (!nombre || !precio || !urlProducto) return;

        productos.push({
          nombre,
          precio,
          precioOriginal: precio,
          urlProducto,
          tienda: 'MercadoLibre',
          estadoDescuento: 'Normal',
          porcentajeDescuento: 0,
          esOferta: false,
          fechaScraping: new Date()
        });

      } catch (e) {
        console.warn(`❌ Error al procesar item ${index}: ${e.message}`);
      }
    });

    console.log(`🧪 Productos encontrados: ${productos.length}`);
    return productos;

  } catch (error) {
    console.error(`❌ Error al scrapear MercadoLibre: ${error.message}`);
    return [];
  }
}

module.exports = scrapeMercadoLibre;
