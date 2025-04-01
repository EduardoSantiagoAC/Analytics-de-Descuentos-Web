const express = require('express');
const router = express.Router();
const scraper = require('/Utils/Scraper');

// Endpoint para scraping programado
router.post('/amazon', async (req, res) => {
  try {
    const { producto } = req.body;
    const results = await scraper.scrapeAmazon(producto);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para Mercado Libre
router.post('/mercadolibre', async (req, res) => {
  try {
    const { url } = req.body;
    const results = await scraper.scrapeMercadoLibre(url);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Error en scraping .' });
  }
});

module.exports = router;