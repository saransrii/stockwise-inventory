import React from 'react';
import {
  Package,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
  Truck,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import SalesTrendChart from '../charts/SalesTrendChart';
import TopProductsChart from '../charts/TopProductsChart';
import CategoryPieChart from '../charts/CategoryPieChart';

export default function DashboardPage({
  stats,
  onNavigate,
  onOpenQuickSale,
  onOpenPurchaseForProduct,
}) {
  const summary = stats?.summary || {};
  const monthlySalesTrend = stats?.monthlySalesTrend || [];
  const categoryDistribution = stats?.categoryDistribution || [];
  const lowStockAlerts = stats?.lowStockAlerts || [];
  const recentSales = stats?.recentSales || [];

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive Dashboard</h1>
          <p className="page-subtitle">Real-time inventory levels, sales analytics, and business health</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => onNavigate('forecasting')} className="btn btn-secondary">
            View AI Forecasts <ArrowRight size={16} />
          </button>
          <button onClick={onOpenQuickSale} className="btn btn-primary">
            <ShoppingCart size={16} /> Record Sale
          </button>
        </div>
      </div>

      {/* Critical Stock Alert Banner if needed */}
      {lowStockAlerts.length > 0 && (
        <div className="alert-banner alert-warning">
          <AlertTriangle size={20} color="#d97706" />
          <div style={{ flex: 1 }}>
            <strong>Inventory Alert:</strong> {lowStockAlerts.length} product(s) have reached or fallen below their reorder threshold.
          </div>
          <button
            onClick={() => onNavigate('forecasting')}
            className="btn btn-sm btn-secondary"
            style={{ borderColor: '#fde68a', background: '#fff' }}
          >
            Review AI Reorders
          </button>
        </div>
      )}

      {/* Top KPI Metrics */}
      <div className="stat-grid">
        <StatCard
          title="Total Products"
          value={summary.totalProducts ?? 0}
          subtitle={`${summary.totalStockUnits ?? 0} total units in stock`}
          icon={Package}
          color="#2563eb"
          bgColor="#eff6ff"
        />
        <StatCard
          title="Total Revenue"
          value={`$${(summary.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`${summary.totalSalesCount || 0} completed orders`}
          icon={DollarSign}
          color="#10b981"
          bgColor="#ecfdf5"
        />
        <StatCard
          title="Gross Profit"
          value={`$${(summary.totalProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`${summary.profitMargin || 0}% average profit margin`}
          icon={TrendingUp}
          color="#8b5cf6"
          bgColor="#f5f3ff"
        />
        <StatCard
          title="Stock Alerts"
          value={summary.lowStockCount + summary.outOfStockCount || 0}
          subtitle={`${summary.outOfStockCount || 0} out of stock`}
          icon={AlertTriangle}
          color="#ef4444"
          bgColor="#fef2f2"
        />
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '28px' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>Sales Performance & Revenue Trend</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Monthly revenue ($) and transaction volume</p>
            </div>
            <button onClick={() => onNavigate('sales')} className="btn btn-sm btn-secondary">
              All Sales
            </button>
          </div>
          <SalesTrendChart trendData={monthlySalesTrend} />
        </div>

        <div className="card">
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>Stock by Category</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Inventory distribution across segments</p>
          </div>
          <CategoryPieChart categoryData={categoryDistribution} />
        </div>
      </div>

      {/* Lower Section: Urgent Replenishments & Recent Orders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Urgent Restock List */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>Urgent Restock Requirements</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Products at or below reorder threshold</p>
            </div>
            <button onClick={() => onNavigate('forecasting')} className="btn btn-sm btn-secondary">
              Forecasting Matrix
            </button>
          </div>

          {lowStockAlerts.length === 0 ? (
            <p style={{ color: '#10b981', fontSize: '0.88rem', padding: '20px 0', textAlign: 'center' }}>
              ✓ All inventory levels are optimal.
            </p>
          ) : (
            <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Current</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockAlerts.map((prod) => (
                    <tr key={prod._id}>
                      <td>
                        <div style={{ fontWeight: '600' }}>{prod.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{prod.sku}</div>
                      </td>
                      <td style={{ fontWeight: '700', color: prod.quantity === 0 ? '#ef4444' : '#d97706' }}>
                        {prod.quantity} {prod.unit || 'pcs'}
                      </td>
                      <td>
                        <Badge status={prod.status} />
                      </td>
                      <td>
                        <button
                          onClick={() => onOpenPurchaseForProduct && onOpenPurchaseForProduct(prod)}
                          className="btn btn-sm btn-primary"
                        >
                          Restock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Sales Table */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>Recent Sales Transactions</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Latest customer purchases</p>
            </div>
            <button onClick={() => onNavigate('sales')} className="btn btn-sm btn-secondary">
              View All
            </button>
          </div>

          <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Method</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((sale) => (
                  <tr key={sale._id}>
                    <td style={{ fontWeight: '600', color: '#2563eb' }}>{sale.invoiceNumber}</td>
                    <td>{sale.customerName || 'Walk-in'}</td>
                    <td style={{ fontWeight: '700' }}>
                      ${sale.totalAmount.toFixed(2)}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: '700', color: '#475569' }}>
                        {sale.paymentMethod}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
