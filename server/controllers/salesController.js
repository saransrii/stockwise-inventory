const Sale = require('../models/Sale');
const Product = require('../models/Product');

// Helper to compute status
const calculateStatus = (quantity, reorderLevel) => {
  if (quantity <= 0) return 'out_of_stock';
  if (quantity <= reorderLevel) return 'low_stock';
  return 'in_stock';
};

// Generate Invoice Number
const generateInvoiceNumber = async () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const count = await Sale.countDocuments();
  const sequence = String(count + 1).padStart(4, '0');
  return `INV-${dateStr}-${sequence}`;
};

// @desc    Get all sales with filtering
// @route   GET /api/sales
exports.getSales = async (req, res, next) => {
  try {
    const { startDate, endDate, paymentMethod, customerName } = req.query;
    const query = {};

    if (paymentMethod && paymentMethod !== 'All') {
      query.paymentMethod = paymentMethod;
    }

    if (customerName) {
      query.customerName = { $regex: customerName, $options: 'i' };
    }

    if (startDate || endDate) {
      query.saleDate = {};
      if (startDate) query.saleDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.saleDate.$lte = end;
      }
    }

    const sales = await Sale.find(query)
      .sort({ saleDate: -1, createdAt: -1 })
      .populate('recordedBy', 'name email');

    res.json({
      success: true,
      count: sales.length,
      data: sales,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single sale by ID
// @route   GET /api/sales/:id
exports.getSaleById = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('items.product', 'name sku category sellingPrice')
      .populate('recordedBy', 'name email');

    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale not found' });
    }

    res.json({ success: true, data: sale });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new sale transaction with inventory deduction
// @route   POST /api/sales
exports.createSale = async (req, res, next) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      items,
      tax = 0,
      discount = 0,
      paymentMethod = 'cash',
      notes,
      saleDate,
    } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Sale must contain at least one item' });
    }

    // 1. Verify stock availability for all items before making any modifications
    const productUpdates = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.product} not found`,
        });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.quantity}, Requested: ${item.quantity}`,
        });
      }

      const itemSubtotal = (Number(item.unitPrice) || product.sellingPrice) * Number(item.quantity);
      calculatedSubtotal += itemSubtotal;

      productUpdates.push({
        product,
        quantityToDeduct: Number(item.quantity),
        itemData: {
          product: product._id,
          name: product.name,
          sku: product.sku,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice) || product.sellingPrice,
          subtotal: itemSubtotal,
        },
      });
    }

    // 2. Perform atomic inventory deduction
    for (const update of productUpdates) {
      const { product, quantityToDeduct } = update;
      product.quantity -= quantityToDeduct;
      product.status = calculateStatus(product.quantity, product.reorderLevel);
      await product.save();
    }

    // 3. Create Sale record
    const invoiceNumber = await generateInvoiceNumber();
    const finalTax = Number(tax) || 0;
    const finalDiscount = Number(discount) || 0;
    const totalAmount = Math.max(0, calculatedSubtotal + finalTax - finalDiscount);

    const sale = await Sale.create({
      invoiceNumber,
      customerName: customerName || 'Walk-in Customer',
      customerPhone: customerPhone || '',
      customerEmail: customerEmail || '',
      items: productUpdates.map((u) => u.itemData),
      subtotal: calculatedSubtotal,
      tax: finalTax,
      discount: finalDiscount,
      totalAmount,
      paymentMethod,
      notes: notes || '',
      saleDate: saleDate ? new Date(saleDate) : new Date(),
      recordedBy: req.user ? req.user.id : null,
    });

    res.status(201).json({
      success: true,
      message: 'Sale recorded successfully and inventory updated',
      data: sale,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top selling products summary
// @route   GET /api/sales/top-products
exports.getTopSellingProducts = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 5;

    const topProducts = await Sale.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          sku: { $first: '$items.sku' },
          totalQuantitySold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
        },
      },
      { $sort: { totalQuantitySold: -1 } },
      { $limit: limit },
    ]);

    res.json({ success: true, data: topProducts });
  } catch (error) {
    next(error);
  }
};
