const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeMercadoLibre(query, maxResultados = 15) {
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

    $('.ui-search-layout__item').each((i, el) => {
      if (productos.length >= maxResultados) return false;

      const nombre = $(el).find('.ui-search-item__title').text().trim();
      const urlProducto = $(el).find('a').attr('href')?.split('?')[0];

      const precioEntero = $(el).find('.price-tag-fraction').first().text().replace(/[^\d]/g, '');
      const precioDecimal = $(el).find('.price-tag-cents').first().text().replace(/[^\d]/g, '');
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
        fechaScraping: new Date(),
      });
    });

    console.log(`🧪 Productos extraídos: ${productos.length}`);
    return productos;
  } catch (error) {
    console.error(`❌ Error al hacer scraping de MercadoLibre: ${error.message}`);
    return [];
  }
}

module.exports = scrapeMercadoLibre;
