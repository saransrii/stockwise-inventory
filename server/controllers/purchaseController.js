const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');

// Compute status helper
const calculateStatus = (quantity, reorderLevel) => {
  if (quantity <= 0) return 'out_of_stock';
  if (quantity <= reorderLevel) return 'low_stock';
  return 'in_stock';
};

// Generate PO Number
const generatePONumber = async () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const count = await Purchase.countDocuments();
  const sequence = String(count + 1).padStart(4, '0');
  return `PO-${dateStr}-${sequence}`;
};

// @desc    Get all purchases
// @route   GET /api/purchases
exports.getPurchases = async (req, res, next) => {
  try {
    const { supplier, status, startDate, endDate } = req.query;
    const query = {};

    if (supplier && supplier !== 'All') {
      query.supplier = supplier;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (startDate || endDate) {
      query.purchaseDate = {};
      if (startDate) query.purchaseDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.purchaseDate.$lte = end;
      }
    }

    const purchases = await Purchase.find(query)
      .sort({ purchaseDate: -1, createdAt: -1 })
      .populate('supplier', 'name email phone contactPerson')
      .populate('recordedBy', 'name email');

    res.json({
      success: true,
      count: purchases.length,
      data: purchases,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single purchase by ID
// @route   GET /api/purchases/:id
exports.getPurchaseById = async (req, res, next) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('supplier', 'name email phone address contactPerson')
      .populate('items.product', 'name sku category costPrice sellingPrice')
      .populate('recordedBy', 'name email');

    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    res.json({ success: true, data: purchase });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new purchase and replenish stock
// @route   POST /api/purchases
exports.createPurchase = async (req, res, next) => {
  try {
    const { supplier, items, paymentStatus = 'paid', status = 'received', notes, purchaseDate } = req.body;

    if (!supplier) {
      return res.status(400).json({ success: false, message: 'Supplier is required' });
    }

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Purchase must contain at least one item' });
    }

    const supplierDoc = await Supplier.findById(supplier);
    if (!supplierDoc) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    let calculatedTotal = 0;
    const itemRecords = [];

    // Verify products and calculate totals
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.product} not found` });
      }

      const unitCost = Number(item.unitCost) >= 0 ? Number(item.unitCost) : product.costPrice;
      const quantity = Number(item.quantity) || 1;
      const subtotal = unitCost * quantity;
      calculatedTotal += subtotal;

      itemRecords.push({
        product: product._id,
        name: product.name,
        sku: product.sku,
        quantity,
        unitCost,
        subtotal,
      });

      // If status is 'received', replenish product inventory and update cost price
      if (status === 'received') {
        product.quantity += quantity;
        if (unitCost > 0) {
          product.costPrice = unitCost;
        }
        product.supplier = supplierDoc._id;
        product.supplierName = supplierDoc.name;
        product.status = calculateStatus(product.quantity, product.reorderLevel);
        await product.save();
      }
    }

    const purchaseOrderNumber = await generatePONumber();

    const purchase = await Purchase.create({
      purchaseOrderNumber,
      supplier: supplierDoc._id,
      supplierName: supplierDoc.name,
      items: itemRecords,
      totalCost: calculatedTotal,
      status,
      paymentStatus,
      notes: notes || '',
      purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
      recordedBy: req.user ? req.user.id : null,
    });

    res.status(201).json({
      success: true,
      message: 'Purchase order created and stock replenished successfully',
      data: purchase,
    });
  } catch (error) {
    next(error);
  }
};
