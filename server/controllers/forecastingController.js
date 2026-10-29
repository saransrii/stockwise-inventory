const Product = require('../models/Product');
const Sale = require('../models/Sale');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Perform statistical time-series forecasting & demand prediction:
 * - Linear trend regression (Ordinary Least Squares)
 * - Exponential smoothing for recent weighting
 * - Moving average aggregation
 * - Safety stock & Reorder Point (ROP) calculation
 */
function computeForecast(historicalData, currentStock, costPrice = 0, leadTimeDays = 7) {
  // If no sales history, provide sensible baseline
  if (!historicalData || historicalData.length === 0) {
    const dailyDemand = 0;
    return {
      dailyRunRate: 0,
      forecast7Days: 0,
      forecast14Days: 0,
      forecast30Days: 0,
      forecast60Days: 0,
      daysRemaining: currentStock > 0 ? 999 : 0,
      stockoutDate: null,
      safetyStock: 5,
      suggestedReorderQuantity: Math.max(0, 10 - currentStock),
      estimatedReorderCost: Math.max(0, 10 - currentStock) * costPrice,
      riskLevel: currentStock === 0 ? 'CRITICAL' : 'OPTIMAL',
      trend: 'STABLE',
      trendPercentage: 0,
      timeline: [],
    };
  }

  // 1. Calculate basic statistics
  const n = historicalData.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  historicalData.forEach((point, i) => {
    const x = i + 1; // day index
    const y = point.quantity;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  });

  // Linear Regression: y = slope * x + intercept
  const denominator = n * sumXX - sumX * sumX;
  const slope = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0;
  const intercept = (sumY - slope * sumX) / n;

  // Exponential Smoothing (alpha = 0.3 for recent momentum)
  const alpha = 0.3;
  let expSmooth = historicalData[0].quantity;
  for (let i = 1; i < n; i++) {
    expSmooth = alpha * historicalData[i].quantity + (1 - alpha) * expSmooth;
  }

  // Blended Daily Run Rate (weighted between regression trend and exponential smoothing)
  const latestTrendPoint = Math.max(0.1, slope * n + intercept);
  const dailyRunRate = Math.max(0.05, Number(((expSmooth * 0.6) + (latestTrendPoint * 0.4)).toFixed(2)));

  // Future period predictions
  const forecast7Days = Math.ceil(dailyRunRate * 7);
  const forecast14Days = Math.ceil(dailyRunRate * 14);
  const forecast30Days = Math.ceil(dailyRunRate * 30);
  const forecast60Days = Math.ceil(dailyRunRate * 60);

  // Runway & Stockout date calculation
  const daysRemaining = dailyRunRate > 0 ? Math.floor(currentStock / dailyRunRate) : 999;
  let stockoutDate = null;
  if (daysRemaining < 365) {
    const d = new Date();
    d.setDate(d.getDate() + daysRemaining);
    stockoutDate = d.toISOString().slice(0, 10);
  }

  // Safety Stock & Suggested Reorder:
  // Safety Stock = Daily Demand * Lead Time * Safety Factor (1.5 for 95% service level)
  const safetyStock = Math.ceil(dailyRunRate * leadTimeDays * 1.5);
  // Reorder target: buffer to cover 30 days + safety stock
  const targetInventory = forecast30Days + safetyStock;
  const suggestedReorderQuantity = Math.max(0, targetInventory - currentStock);
  const estimatedReorderCost = suggestedReorderQuantity * costPrice;

  // Urgency Risk Level
  let riskLevel = 'OPTIMAL';
  if (currentStock === 0) {
    riskLevel = 'CRITICAL';
  } else if (daysRemaining <= 3) {
    riskLevel = 'CRITICAL';
  } else if (daysRemaining <= 7) {
    riskLevel = 'HIGH';
  } else if (daysRemaining <= 15) {
    riskLevel = 'MODERATE';
  } else if (daysRemaining > 75) {
    riskLevel = 'OVERSTOCKED';
  }

  // Trend direction
  let trend = 'STABLE';
  const trendPercentage = Number((slope * 10).toFixed(1));
  if (slope > 0.05) trend = 'INCREASING';
  else if (slope < -0.05) trend = 'DECREASING';

  // Generate 30-day projected timeline for Chart visualization
  const timeline = [];
  const today = new Date();

  // Past 14 days history in timeline
  const recentHistory = historicalData.slice(-14);
  recentHistory.forEach((pt) => {
    timeline.push({
      date: pt.date,
      actualSales: pt.quantity,
      predictedDemand: null,
      type: 'historical',
    });
  });

  // Next 14 days projections
  for (let i = 1; i <= 14; i++) {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + i);
    const dateStr = nextDate.toISOString().slice(0, 10);
    const futureX = n + i;
    const projectedQty = Math.max(0.1, Number((slope * futureX + intercept).toFixed(1)));
    const smoothedQty = Math.max(0.1, Number((dailyRunRate * (1 + (i * slope * 0.05))).toFixed(1)));
    const finalPredicted = Number(((projectedQty * 0.3) + (smoothedQty * 0.7)).toFixed(1));

    timeline.push({
      date: dateStr,
      actualSales: null,
      predictedDemand: finalPredicted,
      upperBound: Number((finalPredicted * 1.25).toFixed(1)),
      lowerBound: Math.max(0, Number((finalPredicted * 0.75).toFixed(1))),
      type: 'forecast',
    });
  }

  return {
    dailyRunRate,
    forecast7Days,
    forecast14Days,
    forecast30Days,
    forecast60Days,
    daysRemaining,
    stockoutDate,
    safetyStock,
    suggestedReorderQuantity,
    estimatedReorderCost,
    riskLevel,
    trend,
    trendPercentage,
    timeline,
  };
}

// @desc    Get demand forecast for a single product
// @route   GET /api/forecasting/product/:productId
exports.getProductForecast = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { leadTime = 7 } = req.query;

    const product = await Product.findById(productId).populate('supplier', 'name email phone');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // 1. Collect past 90 days sales for this product
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const sales = await Sale.find({
      'items.product': product._id,
      saleDate: { $gte: ninetyDaysAgo },
      status: 'completed',
    }).sort({ saleDate: 1 });

    // Group sales by day
    const salesByDate = {};
    sales.forEach((s) => {
      const dateStr = new Date(s.saleDate).toISOString().slice(0, 10);
      s.items.forEach((item) => {
        if (item.product?.toString() === product._id.toString()) {
          salesByDate[dateStr] = (salesByDate[dateStr] || 0) + item.quantity;
        }
      });
    });

    // Create continuous daily series for last 30 days
    const historicalData = [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    for (let d = new Date(thirtyDaysAgo); d <= new Date(); d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().slice(0, 10);
      historicalData.push({
        date: dateStr,
        quantity: salesByDate[dateStr] || 0,
      });
    }

    const forecast = computeForecast(
      historicalData,
      product.quantity,
      product.costPrice,
      Number(leadTime)
    );

    res.json({
      success: true,
      data: {
        product: {
          _id: product._id,
          name: product.name,
          sku: product.sku,
          category: product.category,
          currentStock: product.quantity,
          reorderLevel: product.reorderLevel,
          costPrice: product.costPrice,
          sellingPrice: product.sellingPrice,
          unit: product.unit,
          status: product.status,
          supplierName: product.supplierName || product.supplier?.name || 'Unassigned',
        },
        forecast,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get demand forecasts & replenishment suggestions for all products
// @route   GET /api/forecasting/catalog-summary
exports.getCatalogForecastSummary = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ category: 1, name: 1 });

    // Collect past 60 days sales
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const sales = await Sale.find({
      saleDate: { $gte: sixtyDaysAgo },
      status: 'completed',
    });

    // Map sales by product and date
    const productSalesMap = {};
    sales.forEach((s) => {
      const dateStr = new Date(s.saleDate).toISOString().slice(0, 10);
      s.items?.forEach((item) => {
        const pId = item.product?.toString();
        if (pId) {
          if (!productSalesMap[pId]) productSalesMap[pId] = {};
          productSalesMap[pId][dateStr] = (productSalesMap[pId][dateStr] || 0) + item.quantity;
        }
      });
    });

    // Generate date list for past 30 days
    const dateList = [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    for (let d = new Date(thirtyDaysAgo); d <= new Date(); d.setDate(d.getDate() + 1)) {
      dateList.push(d.toISOString().slice(0, 10));
    }

    const summaryList = products.map((prod) => {
      const pId = prod._id.toString();
      const pSales = productSalesMap[pId] || {};

      const history = dateList.map((dt) => ({
        date: dt,
        quantity: pSales[dt] || 0,
      }));

      const fc = computeForecast(history, prod.quantity, prod.costPrice, 7);

      return {
        product: {
          _id: prod._id,
          name: prod.name,
          sku: prod.sku,
          category: prod.category,
          currentStock: prod.quantity,
          reorderLevel: prod.reorderLevel,
          costPrice: prod.costPrice,
          sellingPrice: prod.sellingPrice,
          supplierName: prod.supplierName || 'Unassigned',
          status: prod.status,
        },
        dailyRunRate: fc.dailyRunRate,
        forecast30Days: fc.forecast30Days,
        daysRemaining: fc.daysRemaining,
        suggestedReorderQuantity: fc.suggestedReorderQuantity,
        estimatedReorderCost: fc.estimatedReorderCost,
        riskLevel: fc.riskLevel,
        trend: fc.trend,
        trendPercentage: fc.trendPercentage,
      };
    });

    // Sort by risk priority: CRITICAL first, then HIGH, MODERATE, OVERSTOCKED, OPTIMAL
    const riskPriority = { CRITICAL: 1, HIGH: 2, MODERATE: 3, OVERSTOCKED: 4, OPTIMAL: 5 };
    summaryList.sort((a, b) => (riskPriority[a.riskLevel] || 99) - (riskPriority[b.riskLevel] || 99));

    // Summary aggregates
    const criticalCount = summaryList.filter((s) => s.riskLevel === 'CRITICAL').length;
    const highRiskCount = summaryList.filter((s) => s.riskLevel === 'HIGH').length;
    const totalReorderCost = summaryList.reduce((acc, curr) => acc + curr.estimatedReorderCost, 0);
    const totalItemsToReorder = summaryList.reduce((acc, curr) => acc + curr.suggestedReorderQuantity, 0);

    res.json({
      success: true,
      meta: {
        totalProductsAnalyzed: products.length,
        criticalCount,
        highRiskCount,
        totalItemsToReorder,
        totalReorderCost,
      },
      data: summaryList,
    });
  } catch (error) {
    next(error);
  }
};
