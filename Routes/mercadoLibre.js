const express = require('express');
const router = express.Router();
const scrapeMercadoLibrePuppeteer = require('../services/mercadoLibrePuppeteer');
const Producto = require('../Models/Producto');

router.get('/buscar', async (req, res) => {
  const { q, max } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Falta el parámetro "q" para búsqueda' });
  }

  try {
    const productos = await scrapeMercadoLibrePuppeteer(q, parseInt(max) || 10);

    if (productos.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontraron productos.' });
    }

    // Guardar o actualizar los productos en MongoDB
    const ops = productos.map(p => ({
      updateOne: {
        filter: { urlProducto: p.urlProducto },
        update: {
          $set: p,
          $push: {
            historicoPrecios: {
              precio: p.precio,
              fecha: new Date()
            }
          }
        },
        upsert: true
      }
    }));

    await Producto.bulkWrite(ops);

    res.json(productos);
  } catch (error) {
    console.error('❌ Error en /mercado-libre/buscar:', error);
    res.status(500).json({ error: 'Error al hacer scraping', detalle: error.message });
  }
});

module.exports = router;