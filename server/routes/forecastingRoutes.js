const express = require('express');
const router = express.Router();
const {
  getProductForecast,
  getCatalogForecastSummary,
} = require('../controllers/forecastingController');

router.get('/catalog-summary', getCatalogForecastSummary);
router.get('/product/:productId', getProductForecast);

module.exports = router;
