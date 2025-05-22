const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeMercadoLibre(producto, maxResultados = 15) {
  const url = `https://listado.mercadolibre.com.mx/${encodeURIComponent(producto)}`;

  try {
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    const $ = cheerio.load(html);
    const resultados = [];

    $('[data-testid="list-item"]').each((i, el) => {
      if (i >= maxResultados) return false;

      const nombre = $(el).find('h2').text().trim();
      const precioTexto = $(el).find('span.andes-money-amount__fraction').first().text().replace(/[^\d]/g, '');
      const urlProducto = $(el).find('a').attr('href')?.split('#')[0];

      const precio = precioTexto ? parseFloat(precioTexto) : null;

      if (!nombre || !precio || !urlProducto) return;

      resultados.push({
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

    return resultados;
  } catch (error) {
    console.error(`❌ Error al hacer scraping de MercadoLibre: ${error.message}`);
    return [];
  }
}

module.exports = scrapeMercadoLibre;
