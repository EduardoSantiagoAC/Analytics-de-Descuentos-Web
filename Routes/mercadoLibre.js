const express = require('express');
const router = express.Router();

const scrapeML = require('../services/mercadoLibrePuppeteer');
const Producto = require('../Models/Producto');

router.get('/buscar', async (req, res) => {
  const { q, max } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Falta el parámetro "q" para búsqueda' });
  }

  try {
    const productosScrapeados = await scrapeML(q, parseInt(max) || 10);

    if (productosScrapeados.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontraron productos.' });
    }

    const productos = productosScrapeados.map(p => {
      const precioFinal = p.precioConDescuento || p.precioOriginal;

      return {
        nombre: p.nombre,
        imagen: p.imagen,
        urlProducto: p.url,
        precio: precioFinal, // <--- 🔥 importante
        precioOriginal: p.precioOriginal,
        precioConDescuento: p.precioConDescuento || null,
        porcentajeDescuento: p.porcentajeDescuento || 0,
        tienda: 'MercadoLibre',
        estadoDescuento: p.porcentajeDescuento && p.porcentajeDescuento > 0 ? 'Descuento' : 'Normal',
        esOferta: p.porcentajeDescuento && p.porcentajeDescuento > 10
      };
    });

    // Guardar o actualizar en MongoDB
    const ops = productos.map(p => ({
      updateOne: {
        filter: { urlProducto: p.urlProducto },
        update: {
          $set: {
            ...p,
            fechaActualizacion: new Date()
          },
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
