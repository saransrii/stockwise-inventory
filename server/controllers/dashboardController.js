const Product = require('../models/Product');
const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Supplier = require('../models/Supplier');

// @desc    Get dashboard metrics and chart summaries
// @route   GET /api/dashboard/stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    // 1. Basic counts
    const totalProducts = await Product.countDocuments();
    const totalSuppliers = await Supplier.countDocuments();

    // 2. Products inventory aggregation
    const products = await Product.find();
    let totalStockUnits = 0;
    let inventoryCostValue = 0;
    let inventoryRetailValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    const categoryMap = {};

    products.forEach((p) => {
      totalStockUnits += p.quantity;
      inventoryCostValue += p.quantity * p.costPrice;
      inventoryRetailValue += p.quantity * p.sellingPrice;

      if (p.quantity <= 0 || p.status === 'out_of_stock') {
        outOfStockCount++;
      } else if (p.quantity <= p.reorderLevel || p.status === 'low_stock') {
        lowStockCount++;
      }

      if (!categoryMap[p.category]) {
        categoryMap[p.category] = { count: 0, stock: 0, value: 0 };
      }
      categoryMap[p.category].count++;
      categoryMap[p.category].stock += p.quantity;
      categoryMap[p.category].value += p.quantity * p.sellingPrice;
    });

    // 3. Sales statistics
    const sales = await Sale.find();
    let totalRevenue = 0;
    let totalCOGS = 0; // Cost of goods sold

    // Map product cost for profit estimation
    const productCostMap = {};
    products.forEach((p) => {
      productCostMap[p._id.toString()] = p.costPrice;
    });

    sales.forEach((s) => {
      if (s.status === 'completed') {
        totalRevenue += s.totalAmount;
        if (s.items && s.items.length) {
          s.items.forEach((item) => {
            const cost = productCostMap[item.product?.toString()] || (item.unitPrice * 0.7);
            totalCOGS += cost * item.quantity;
          });
        }
      }
    });

    const totalProfit = Math.max(0, totalRevenue - totalCOGS);
    const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0;

    // 4. Purchases statistics
    const purchases = await Purchase.find();
    let totalPurchaseExpenditure = 0;
    purchases.forEach((p) => {
      totalPurchaseExpenditure += p.totalCost;
    });

    // 5. Monthly Sales Trend (Last 6 Months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTrends = {};
    const now = new Date();

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      monthlyTrends[key] = { month: key, revenue: 0, orders: 0, units: 0 };
    }

    sales.forEach((s) => {
      if (s.status === 'completed' && s.saleDate) {
        const d = new Date(s.saleDate);
        const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        if (monthlyTrends[key]) {
          monthlyTrends[key].revenue += s.totalAmount;
          monthlyTrends[key].orders += 1;
          s.items?.forEach((item) => {
            monthlyTrends[key].units += item.quantity;
          });
        }
      }
    });

    const monthlySalesTrend = Object.values(monthlyTrends);

    // 6. Category breakdown for chart
    const categoryDistribution = Object.keys(categoryMap).map((cat) => ({
      category: cat,
      count: categoryMap[cat].count,
      stock: categoryMap[cat].stock,
      value: categoryMap[cat].value,
    }));

    // 7. Low stock alerts (top 6 urgent)
    const lowStockAlerts = await Product.find({
      $or: [{ status: 'low_stock' }, { status: 'out_of_stock' }],
    })
      .sort({ quantity: 1 })
      .limit(6);

    // 8. Recent transactions
    const recentSales = await Sale.find().sort({ saleDate: -1, createdAt: -1 }).limit(5);
    const recentPurchases = await Purchase.find().sort({ purchaseDate: -1, createdAt: -1 }).limit(5);

    res.json({
      success: true,
      data: {
        summary: {
          totalProducts,
          totalSuppliers,
          totalStockUnits,
          inventoryCostValue,
          inventoryRetailValue,
          totalRevenue,
          totalSalesCount: sales.length,
          totalProfit,
          profitMargin: Number(profitMargin),
          totalPurchasesCount: purchases.length,
          totalPurchaseExpenditure,
          lowStockCount,
          outOfStockCount,
        },
        monthlySalesTrend,
        categoryDistribution,
        lowStockAlerts,
        recentSales,
        recentPurchases,
      },
    });
  } catch (error) {
    next(error);
  }
};
