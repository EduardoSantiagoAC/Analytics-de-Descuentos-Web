const express = require('express');
const router = express.Router();
const scraper = require('../Utils/Scraper.js');
const Producto = require('../Models/Producto.js');

/**
 * @swagger
 * /scraping/amazon:
 *   post:
 *     summary: Scrapea productos de Amazon
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               producto:
 *                 type: string
 *                 example: "PlayStation 5"
 *     responses:
 *       200:
 *         description: Lista de productos scrapeados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 total:
 *                   type: integer
 *                 conDescuento:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Producto'
 */
router.post('/amazon', async (req, res) => {
  try {
    const { producto } = req.body;
    
    if (!producto || typeof producto !== 'string') {
      return res.status(400).json({ 
        success: false,
        error: 'El parámetro "producto" es requerido y debe ser un string' 
      });
    }

    const results = await scraper.scrapeAmazon(producto);
    
    // Estadísticas avanzadas
    const conDescuento = results.filter(p => p.estadoDescuento === 'Descuento');
    const mayorDescuento = [...conDescuento].sort((a, b) => b.porcentajeDescuento - a.porcentajeDescuento)[0];
    const precioPromedio = results.reduce((acc, curr) => acc + curr.precio, 0) / results.length;

    res.json({ 
      success: true,
      stats: {
        total: results.length,
        conDescuento: conDescuento.length,
        porcentajeDescuentos: Math.round((conDescuento.length / results.length) * 100),
        mayorDescuento: mayorDescuento ? {
          nombre: mayorDescuento.nombre,
          porcentaje: mayorDescuento.porcentajeDescuento
        } : null,
        precioPromedio: Math.round(precioPromedio * 100) / 100
      },
      data: results 
    });

  } catch (error) {
    console.error('Error en /scraping/amazon:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * @swagger
 * /scraping/mercadolibre:
 *   post:
 *     summary: Scrapea productos de MercadoLibre
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 example: "https://listado.mercadolibre.com.mx/consolas-videojuegos/playstation-5"
 *     responses:
 *       200:
 *         description: Lista de productos scrapeados
 */
router.post('/mercadolibre', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url || !url.includes('mercadolibre')) {
      return res.status(400).json({ 
        success: false,
        error: 'URL válida de MercadoLibre es requerida' 
      });
    }

    const results = await scraper.scrapeMercadoLibre(url);
    
    // Análisis de descuentos
    const analisisDescuentos = results.reduce((acc, curr) => {
      if (curr.estadoDescuento === 'Descuento') {
        acc.total++;
        acc.sumDescuento += curr.porcentajeDescuento;
        if (curr.porcentajeDescuento > acc.maxDescuento) {
          acc.maxDescuento = curr.porcentajeDescuento;
        }
      }
      return acc;
    }, { total: 0, sumDescuento: 0, maxDescuento: 0 });

    res.json({
      success: true,
      metadata: {
        count: results.length,
        discountStats: {
          ...analisisDescuentos,
          avgDescuento: analisisDescuentos.total > 0 
            ? Math.round(analisisDescuentos.sumDescuento / analisisDescuentos.total)
            : 0
        },
        tiendas: [...new Set(results.map(p => p.tienda))]
      },
      productos: results
    });

  } catch (error) {
    console.error('Error en /scraping/mercadolibre:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al procesar MercadoLibre',
      details: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
});

/**
 * @swagger
 * /scraping/estadisticas:
 *   get:
 *     summary: Obtiene estadísticas de productos scrapeados
 *     parameters:
 *       - in: query
 *         name: horas
 *         schema:
 *           type: integer
 *           default: 24
 *     responses:
 *       200:
 *         description: Estadísticas agregadas
 */
router.get('/estadisticas', async (req, res) => {
  try {
    const { horas = 24 } = req.query;
    const fechaLimite = new Date(Date.now() - horas * 60 * 60 * 1000);

    const stats = await Producto.aggregate([
      {
        $match: {
          fechaActualizacion: { $gte: fechaLimite }
        }
      },
      {
        $group: {
          _id: "$tienda",
          total: { $sum: 1 },
          conDescuento: {
            $sum: {
              $cond: [{ $eq: ["$estadoDescuento", "Descuento"] }, 1, 0]
            }
          },
          avgPrecio: { $avg: "$precio" },
          maxDescuento: { $max: "$porcentajeDescuento" }
        }
      }
    ]);

    res.json({ 
      success: true,
      stats 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

module.exports = router;