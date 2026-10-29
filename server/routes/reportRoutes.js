const express = require('express');
const router = express.Router();
const {
  getSalesReport,
  getInventoryReport,
  getProductMovementReport,
} = require('../controllers/reportController');

router.get('/sales', getSalesReport);
router.get('/inventory', getInventoryReport);
router.get('/movement', getProductMovementReport);

module.exports = router;
