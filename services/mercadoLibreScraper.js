const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeMercadoLibre(query, maxResults = 10) {
  const url = `https://listado.mercadolibre.com.mx/${encodeURIComponent(query)}`;

  try {
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    // Guardar el HTML para depuración
    const fs = require('fs');
    fs.writeFileSync(`ml_debug_${Date.now()}.html`, html);

    const $ = cheerio.load(html);
    const items = $('li.ui-search-layout__item');

    const productos = [];

    items.each((_, el) => {
      if (productos.length >= maxResults) return;

      const nombre = $(el).find('h2.ui-search-item__title').text().trim();
      const precioTexto = $(el).find('.andes-money-amount__fraction').first().text().replace(/[^\d]/g, '');
      const urlProducto = $(el).find('a.ui-search-link').attr('href');

      if (!nombre || !precioTexto || !urlProducto) return;

      const precio = parseFloat(precioTexto);
      const precioOriginal = precio; // Meli casi nunca lo muestra

      productos.push({
        nombre,
        precio,
        precioOriginal,
        urlProducto,
        tienda: 'MercadoLibre',
        estadoDescuento: 'Normal',
        porcentajeDescuento: 0,
        esOferta: false,
        fechaScraping: new Date()
      });
    });

    return productos;

  } catch (error) {
    console.error(`❌ Error al buscar en MercadoLibre: ${error.message}`);
    return [];
  }
}

module.exports = scrapeMercadoLibre;
