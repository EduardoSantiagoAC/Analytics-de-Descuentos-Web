const scrapeMercadoLibre = require('../services/mercadoLibrePuppeter');
const guardarProductos = require('../services/guardarProductoService');
const Producto = require('../Models/Producto');

exports.scrapeAndSave = async (req, res) => {
  try {
    const { producto } = req.body;

    if (!producto || typeof producto !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'El campo "producto" es requerido y debe ser un string'
      });
    }

    const productosExistentes = await Producto.find({
      nombre: new RegExp(producto, 'i'),
      tienda: 'MercadoLibre'
    });

    const productosRecientes = productosExistentes.filter(p => {
      const haceMenosDeUnDia = new Date() - new Date(p.fechaScraping) < 24 * 60 * 60 * 1000;
      return haceMenosDeUnDia;
    });

    if (productosRecientes.length > 0) {
      return res.json({
        success: true,
        fuente: 'base de datos',
        productos: productosRecientes
      });
    }

    const productosScrapeados = await scrapeMercadoLibre(producto);

    if (productosScrapeados.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron productos o el scraping falló.'
      });
    }

    const guardados = await guardarProductos(productosScrapeados);

    res.json({
      success: true,
      fuente: 'scraping',
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