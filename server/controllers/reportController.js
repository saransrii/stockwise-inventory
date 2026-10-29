const Product = require('../models/Product');
const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');

// @desc    Generate Sales Summary Report
// @route   GET /api/reports/sales
exports.getSalesReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { status: 'completed' };

    if (startDate || endDate) {
      query.saleDate = {};
      if (startDate) query.saleDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.saleDate.$lte = end;
      }
    }

    const sales = await Sale.find(query).sort({ saleDate: -1 });

    let totalGross = 0;
    let totalDiscount = 0;
    let totalTax = 0;
    let totalNet = 0;
    let totalItemsSold = 0;
    const paymentMethods = { cash: 0, card: 0, upi: 0, bank_transfer: 0 };

    sales.forEach((s) => {
      totalGross += s.subtotal;
      totalDiscount += s.discount;
      totalTax += s.tax;
      totalNet += s.totalAmount;
      if (paymentMethods[s.paymentMethod] !== undefined) {
        paymentMethods[s.paymentMethod] += s.totalAmount;
      }
      s.items.forEach((item) => {
        totalItemsSold += item.quantity;
      });
    });

    res.json({
      success: true,
      data: {
        totalOrders: sales.length,
        totalItemsSold,
        totalGross,
        totalDiscount,
        totalTax,
        totalNet,
        paymentMethods,
        sales,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate Inventory Valuation Report
// @route   GET /api/reports/inventory
exports.getInventoryReport = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ category: 1, name: 1 });

    let totalStockUnits = 0;
    let totalCostValuation = 0;
    let totalRetailValuation = 0;
    const categoryBreakdown = {};

    products.forEach((p) => {
      const costVal = p.quantity * p.costPrice;
      const retailVal = p.quantity * p.sellingPrice;
      totalStockUnits += p.quantity;
      totalCostValuation += costVal;
      totalRetailValuation += retailVal;

      if (!categoryBreakdown[p.category]) {
        categoryBreakdown[p.category] = {
          category: p.category,
          productCount: 0,
          totalQuantity: 0,
          totalCost: 0,
          totalRetail: 0,
        };
      }
      categoryBreakdown[p.category].productCount++;
      categoryBreakdown[p.category].totalQuantity += p.quantity;
      categoryBreakdown[p.category].totalCost += costVal;
      categoryBreakdown[p.category].totalRetail += retailVal;
    });

    const potentialProfit = Math.max(0, totalRetailValuation - totalCostValuation);
    const overallMargin = totalRetailValuation > 0 ? ((potentialProfit / totalRetailValuation) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        totalProducts: products.length,
        totalStockUnits,
        totalCostValuation,
        totalRetailValuation,
        potentialProfit,
        overallMargin: Number(overallMargin),
        categoryBreakdown: Object.values(categoryBreakdown),
        products,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate Fast-Moving vs Slow-Moving Products Report
// @route   GET /api/reports/movement
exports.getProductMovementReport = async (req, res, next) => {
  try {
    const products = await Product.find();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sales = await Sale.find({
      saleDate: { $gte: thirtyDaysAgo },
      status: 'completed',
    });

    const soldMap = {};
    sales.forEach((s) => {
      s.items.forEach((item) => {
        const id = item.product?.toString();
        if (id) {
          soldMap[id] = (soldMap[id] || 0) + item.quantity;
        }
      });
    });

    const analyzed = products.map((p) => {
      const unitsSold = soldMap[p._id.toString()] || 0;
      let turnoverCategory = 'MODERATE';
      if (unitsSold >= 25) turnoverCategory = 'FAST_MOVING';
      else if (unitsSold <= 2) turnoverCategory = 'SLOW_MOVING';

      return {
        _id: p._id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        currentStock: p.quantity,
        unitsSoldLast30Days: unitsSold,
        turnoverCategory,
      };
    });

    analyzed.sort((a, b) => b.unitsSoldLast30Days - a.unitsSoldLast30Days);

    const fastMoving = analyzed.filter((p) => p.turnoverCategory === 'FAST_MOVING');
    const slowMoving = analyzed.filter((p) => p.turnoverCategory === 'SLOW_MOVING');

    res.json({
      success: true,
      data: {
        fastMoving,
        slowMoving,
        all: analyzed,
      },
    });
  } catch (error) {
    next(error);
  }
};
