const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  adjustStock,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

router.get('/alerts/low-stock', getLowStockProducts);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, authorize('admin', 'manager'), createProduct);
router.put('/:id', protect, authorize('admin', 'manager'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);
router.post('/:id/adjust', protect, adjustStock);

module.exports = router;
