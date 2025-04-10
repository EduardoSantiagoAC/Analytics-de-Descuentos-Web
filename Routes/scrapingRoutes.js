const express = require('express');
const scrapingController = require('../controllers/scrapingController');
const router = express.Router();


router.post('/amazon', scrapingController.scrapeAndSave);

module.exports = router;