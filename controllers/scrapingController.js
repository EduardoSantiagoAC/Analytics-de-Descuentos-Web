// controllers/scrapingController.js
const scrapeAmazon = require('../services/scraperAmazonService');
const guardarProductos = require('../services/guardarProductosService');

exports.scrapeAndSave = async (req, res) => {
  try {
    const { producto } = req.body;

    if (!producto || typeof producto !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'El campo "producto" es requerido y debe ser un string'
      });
    }

    const productosScrapeados = await scrapeAmazon(producto);

    if (productosScrapeados.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron productos o el scraping falló.'
      });
    }

    const guardados = await guardarProductos(productosScrapeados);

    const stats = {
      total: guardados.length,
      conDescuento: guardados.filter(p => p.estadoDescuento === 'Descuento').length,
      precioPromedio: Math.round(
        (guardados.reduce((sum, p) => sum + p.precio, 0) / guardados.length) * 100
      ) / 100,
      mayorDescuento: Math.max(...guardados.map(p => p.porcentajeDescuento))
    };

    res.json({
      success: true,
      stats,
      productos: guardados
    });
  } catch (error) {
    console.error('Error en scrapeAndSave:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      detalle: error.message
    });
  }
};
