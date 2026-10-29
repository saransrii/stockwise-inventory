const Product = require('../models/Product');
const Supplier = require('../models/Supplier');

// Compute status helper
const calculateStatus = (quantity, reorderLevel) => {
  if (quantity <= 0) return 'out_of_stock';
  if (quantity <= reorderLevel) return 'low_stock';
  return 'in_stock';
};

// @desc    Get all products with filtering & search
// @route   GET /api/products
exports.getProducts = async (req, res, next) => {
  try {
    const { search, category, status, sortBy, sortOrder } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    let sort = { updatedAt: -1 };
    if (sortBy) {
      const order = sortOrder === 'asc' ? 1 : -1;
      sort = { [sortBy]: order };
    }

    const products = await Product.find(query).sort(sort).populate('supplier', 'name email phone');

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('supplier', 'name email phone address');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
exports.createProduct = async (req, res, next) => {
  try {
    const {
      name,
      sku,
      category,
      description,
      costPrice,
      sellingPrice,
      quantity,
      reorderLevel,
      unit,
      barcode,
      supplier,
    } = req.body;

    const existingSku = await Product.findOne({ sku: sku.toUpperCase() });
    if (existingSku) {
      return res.status(400).json({ success: false, message: `Product with SKU "${sku}" already exists` });
    }

    let supplierName = '';
    if (supplier) {
      const sup = await Supplier.findById(supplier);
      if (sup) supplierName = sup.name;
    }

    const status = calculateStatus(Number(quantity) || 0, Number(reorderLevel) || 10);

    const product = await Product.create({
      name,
      sku: sku.toUpperCase(),
      category,
      description: description || '',
      costPrice: Number(costPrice) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      quantity: Number(quantity) || 0,
      reorderLevel: Number(reorderLevel) || 10,
      unit: unit || 'pcs',
      barcode: barcode || '',
      supplier: supplier || null,
      supplierName,
      status,
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const {
      name,
      sku,
      category,
      description,
      costPrice,
      sellingPrice,
      quantity,
      reorderLevel,
      unit,
      barcode,
      supplier,
    } = req.body;

    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (sku && sku.toUpperCase() !== product.sku) {
      const existingSku = await Product.findOne({ sku: sku.toUpperCase(), _id: { $ne: req.params.id } });
      if (existingSku) {
        return res.status(400).json({ success: false, message: `Product with SKU "${sku}" already exists` });
      }
      product.sku = sku.toUpperCase();
    }

    if (name !== undefined) product.name = name;
    if (category !== undefined) product.category = category;
    if (description !== undefined) product.description = description;
    if (costPrice !== undefined) product.costPrice = Number(costPrice);
    if (sellingPrice !== undefined) product.sellingPrice = Number(sellingPrice);
    if (quantity !== undefined) product.quantity = Number(quantity);
    if (reorderLevel !== undefined) product.reorderLevel = Number(reorderLevel);
    if (unit !== undefined) product.unit = unit;
    if (barcode !== undefined) product.barcode = barcode;

    if (supplier !== undefined) {
      product.supplier = supplier || null;
      if (supplier) {
        const sup = await Supplier.findById(supplier);
        if (sup) product.supplierName = sup.name;
      } else {
        product.supplierName = '';
      }
    }

    product.status = calculateStatus(product.quantity, product.reorderLevel);

    await product.save();

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product deleted successfully', data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Get low stock and out-of-stock products
// @route   GET /api/products/alerts/low-stock
exports.getLowStockProducts = async (req, res, next) => {
  try {
    const products = await Product.find({
      $or: [{ status: 'low_stock' }, { status: 'out_of_stock' }],
    }).sort({ quantity: 1 });

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Adjust product stock manually (audit, damaged, return)
// @route   POST /api/products/:id/adjust
exports.adjustStock = async (req, res, next) => {
  try {
    const { adjustmentType, quantity, reason } = req.body;
    // adjustmentType: 'add' | 'subtract' | 'set'
    const adjQty = Number(quantity);
    if (isNaN(adjQty) || adjQty < 0) {
      return res.status(400).json({ success: false, message: 'Invalid quantity' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let newQty = product.quantity;
    if (adjustmentType === 'add') {
      newQty += adjQty;
    } else if (adjustmentType === 'subtract') {
      newQty = Math.max(0, newQty - adjQty);
    } else if (adjustmentType === 'set') {
      newQty = adjQty;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid adjustment type' });
    }

    product.quantity = newQty;
    product.status = calculateStatus(product.quantity, product.reorderLevel);
    await product.save();

    res.json({
      success: true,
      message: `Stock updated successfully to ${product.quantity}`,
      data: product,
      adjustment: {
        adjustmentType,
        quantity: adjQty,
        reason: reason || 'Manual adjustment',
        timestamp: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};
