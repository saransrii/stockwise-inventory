const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const Purchase = require('../models/Purchase');

// @desc    Get all suppliers
// @route   GET /api/suppliers
exports.getSuppliers = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const suppliers = await Supplier.find(query).sort({ name: 1 });

    // Attach count of associated products for each supplier
    const suppliersWithCount = await Promise.all(
      suppliers.map(async (sup) => {
        const productCount = await Product.countDocuments({ supplier: sup._id });
        const purchaseCount = await Purchase.countDocuments({ supplier: sup._id });
        return {
          ...sup.toObject(),
          productCount,
          purchaseCount,
        };
      })
    );

    res.json({
      success: true,
      count: suppliersWithCount.length,
      data: suppliersWithCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single supplier by ID
// @route   GET /api/suppliers/:id
exports.getSupplierById = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    const products = await Product.find({ supplier: supplier._id });
    const purchases = await Purchase.find({ supplier: supplier._id }).sort({ purchaseDate: -1 }).limit(10);

    res.json({
      success: true,
      data: {
        ...supplier.toObject(),
        products,
        purchases,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new supplier
// @route   POST /api/suppliers
exports.createSupplier = async (req, res, next) => {
  try {
    const { name, contactPerson, email, phone, address, paymentTerms, notes, status } = req.body;

    const supplier = await Supplier.create({
      name,
      contactPerson: contactPerson || '',
      email: email || '',
      phone: phone || '',
      address: address || {},
      paymentTerms: paymentTerms || 'Net 30',
      notes: notes || '',
      status: status || 'active',
    });

    res.status(201).json({ success: true, data: supplier });
  } catch (error) {
    next(error);
  }
};

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
exports.updateSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    // Update supplierName in products
    if (req.body.name) {
      await Product.updateMany({ supplier: supplier._id }, { supplierName: req.body.name });
    }

    res.json({ success: true, data: supplier });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
exports.deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    // Unlink supplier from products
    await Product.updateMany({ supplier: req.params.id }, { supplier: null, supplierName: '' });

    await Supplier.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Supplier deleted successfully and unlinked from products' });
  } catch (error) {
    next(error);
  }
};
