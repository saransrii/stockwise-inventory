const express = require('express');
const router = express.Router();
const {
  getSales,
  getSaleById,
  createSale,
  getTopSellingProducts,
} = require('../controllers/salesController');
const { protect } = require('../middleware/auth');

router.get('/top-products', getTopSellingProducts);
router.get('/', getSales);
router.get('/:id', getSaleById);
router.post('/', protect, createSale);

module.exports = router;
