const axios = require('axios');

async function buscarEnMercadoLibre(query, limit = 20) {
  try {
    const url = `https://api.mercadolibre.com/sites/MLM/search?q=${encodeURIComponent(query)}&limit=${limit}`;
    const { data } = await axios.get(url, {
     headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
      }
    });


    const resultados = data.results.map(item => {
      const porcentajeDescuento = item.original_price && item.original_price > item.price
        ? Math.round(((item.original_price - item.price) / item.original_price) * 100)
        : 0;

      return {
        nombre: item.title,
        precio: item.price,
        precioOriginal: item.original_price || item.price,
        urlProducto: item.permalink,
        tienda: 'MercadoLibre',
        estadoDescuento: porcentajeDescuento > 0 ? 'Descuento' : 'Normal',
        porcentajeDescuento,
        esOferta: porcentajeDescuento > 10,
        fechaScraping: new Date(),
        disponible: item.available_quantity > 0,
        vendedor: item.seller?.id || null,
        ubicacion: item.address?.state_name || 'Desconocido'
      };
    });

    return resultados;
  } catch (err) {
    console.error(`❌ Error al buscar "${query}" en MercadoLibre:`, err.message);
    return [];
  }
}

module.exports = buscarEnMercadoLibre;
