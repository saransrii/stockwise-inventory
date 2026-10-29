const express = require('express');
const router = express.Router();
const {
  getPurchases,
  getPurchaseById,
  createPurchase,
} = require('../controllers/purchaseController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getPurchases);
router.get('/:id', getPurchaseById);
router.post('/', protect, authorize('admin', 'manager'), createPurchase);

module.exports = router;
