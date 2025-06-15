const express = require('express');
const router = express.Router();
const scrapeML = require('../services/mercadoLibrePuppeter');

router.get('/buscar', async (req, res) => {
  const { q, max } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Falta el parámetro "q" para búsqueda' });
  }

  try {
    const productos = await scrapeML(q, parseInt(max) || 5);

    if (productos.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontraron productos.' });
    }

    res.json(productos);
  } catch (error) {
    console.error('❌ Error en /mercado-libre/buscar:', error);
    res.status(500).json({ error: 'Error al hacer scraping', detalle: error.message });
  }
});

module.exports = router;