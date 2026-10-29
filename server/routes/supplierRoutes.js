const express = require('express');
const router = express.Router();
const {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} = require('../controllers/supplierController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getSuppliers);
router.get('/:id', getSupplierById);
router.post('/', protect, authorize('admin', 'manager'), createSupplier);
router.put('/:id', protect, authorize('admin', 'manager'), updateSupplier);
router.delete('/:id', protect, authorize('admin'), deleteSupplier);

module.exports = router;
