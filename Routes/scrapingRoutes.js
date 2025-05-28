const express = require('express');
const scrapingController = require('../controllers/scrapingController');
const router = express.Router();

// Ruta para MercadoLibre (ya que solo usamos MercadoLibre en el controlador)
router.post('/mercadolibre', scrapingController.scrapeAndSave);

module.exports = router;
