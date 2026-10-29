import React, { useState, useEffect } from 'react';
import { FileBarChart, Download, Printer, Filter, TrendingUp, DollarSign, Layers } from 'lucide-react';
import { api } from '../services/api';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('sales');
  const [salesReport, setSalesReport] = useState(null);
  const [inventoryReport, setInventoryReport] = useState(null);
  const [movementReport, setMovementReport] = useState(null);
  const [loading, setLoading] = useState(false);

  // Date filters for sales report
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadSalesReport = async () => {
    try {
      setLoading(true);
      const res = await api.reports.getSales({ startDate, endDate });
      if (res.success) setSalesReport(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadInventoryReport = async () => {
    try {
      setLoading(true);
      const res = await api.reports.getInventory();
      if (res.success) setInventoryReport(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMovementReport = async () => {
    try {
      setLoading(true);
      const res = await api.reports.getMovement();
      if (res.success) setMovementReport(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'sales') loadSalesReport();
    else if (activeTab === 'inventory') loadInventoryReport();
    else if (activeTab === 'movement') loadMovementReport();
  }, [activeTab]);

  // CSV Exporter
  const exportToCSV = (data, filename) => {
    if (!data || !data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((obj) => Object.values(obj).map((v) => `"${v}"`).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Business Analytics & Inventory Reports</h1>
          <p className="page-subtitle">Exportable sales summaries, valuation breakdown, and stock velocity</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => window.print()} className="btn btn-secondary">
            <Printer size={16} /> Print Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
        <button
          className={`nav-link ${activeTab === 'sales' ? 'active' : ''}`}
          style={{ width: 'auto', borderRadius: '8px 8px 0 0', padding: '10px 20px', borderBottom: activeTab === 'sales' ? '2px solid var(--primary)' : 'none' }}
          onClick={() => setActiveTab('sales')}
        >
          Sales Performance Report
        </button>
        <button
          className={`nav-link ${activeTab === 'inventory' ? 'active' : ''}`}
          style={{ width: 'auto', borderRadius: '8px 8px 0 0', padding: '10px 20px', borderBottom: activeTab === 'inventory' ? '2px solid var(--primary)' : 'none' }}
          onClick={() => setActiveTab('inventory')}
        >
          Inventory Valuation Report
        </button>
        <button
          className={`nav-link ${activeTab === 'movement' ? 'active' : ''}`}
          style={{ width: 'auto', borderRadius: '8px 8px 0 0', padding: '10px 20px', borderBottom: activeTab === 'movement' ? '2px solid var(--primary)' : 'none' }}
          onClick={() => setActiveTab('movement')}
        >
          Fast vs Slow Moving Products
        </button>
      </div>

      {/* Sales Report Tab */}
      {activeTab === 'sales' && (
        <div>
          {/* Date Filter & Export */}
          <div className="card" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>From Date</label>
                <input
                  type="date"
                  className="form-input"
                  style={{ width: '160px' }}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>To Date</label>
                <input
                  type="date"
                  className="form-input"
                  style={{ width: '160px' }}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <button onClick={loadSalesReport} className="btn btn-secondary" style={{ marginTop: '16px' }}>
                <Filter size={14} /> Filter Range
              </button>
            </div>

            <button
              onClick={() => {
                if (salesReport?.sales) {
                  const exportData = salesReport.sales.map((s) => ({
                    Invoice: s.invoiceNumber,
                    Date: new Date(s.saleDate).toLocaleDateString(),
                    Customer: s.customerName,
                    Subtotal: s.subtotal,
                    Tax: s.tax,
                    Discount: s.discount,
                    Total: s.totalAmount,
                    Payment: s.paymentMethod,
                  }));
                  exportToCSV(exportData, 'stockwise_sales_report');
                }
              }}
              className="btn btn-secondary"
            >
              <Download size={14} /> Export CSV
            </button>
          </div>

          {/* Sales Summary KPIs */}
          <div className="stat-grid">
            <div className="card">
              <span className="stat-label">Total Completed Orders</span>
              <div className="stat-value">{salesReport?.totalOrders || 0}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                {salesReport?.totalItemsSold || 0} product units sold
              </div>
            </div>
            <div className="card">
              <span className="stat-label">Net Sales Revenue</span>
              <div className="stat-value" style={{ color: '#10b981' }}>
                ${(salesReport?.totalNet || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                Discounts applied: ${salesReport?.totalDiscount?.toFixed(2) || '0.00'}
              </div>
            </div>
            <div className="card">
              <span className="stat-label">Average Order Value</span>
              <div className="stat-value" style={{ color: '#2563eb' }}>
                ${salesReport?.totalOrders ? (salesReport.totalNet / salesReport.totalOrders).toFixed(2) : '0.00'}
              </div>
            </div>
          </div>

          {/* Detailed Sales Orders Table */}
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Units</th>
                  <th>Subtotal</th>
                  <th>Tax</th>
                  <th>Discount</th>
                  <th>Net Total</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {salesReport?.sales?.map((s) => (
                  <tr key={s._id}>
                    <td style={{ fontWeight: '700', color: '#2563eb' }}>{s.invoiceNumber}</td>
                    <td>{new Date(s.saleDate).toLocaleDateString()}</td>
                    <td>{s.customerName}</td>
                    <td>{s.items?.reduce((acc, i) => acc + i.quantity, 0)}</td>
                    <td>${s.subtotal.toFixed(2)}</td>
                    <td>${s.tax.toFixed(2)}</td>
                    <td>${s.discount.toFixed(2)}</td>
                    <td>
                      <strong>${s.totalAmount.toFixed(2)}</strong>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: '700' }}>
                        {s.paymentMethod}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inventory Valuation Tab */}
      {activeTab === 'inventory' && (
        <div>
          <div className="stat-grid">
            <div className="card">
              <span className="stat-label">Cost Basis Valuation</span>
              <div className="stat-value">
                ${(inventoryReport?.totalCostValuation || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                Total procurement investment
              </div>
            </div>
            <div className="card">
              <span className="stat-label">Retail Market Valuation</span>
              <div className="stat-value" style={{ color: '#2563eb' }}>
                ${(inventoryReport?.totalRetailValuation || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                Expected sales realization
              </div>
            </div>
            <div className="card">
              <span className="stat-label">Projected Margin</span>
              <div className="stat-value" style={{ color: '#10b981' }}>
                {inventoryReport?.overallMargin || 0}%
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                Potential Gross Profit: ${(inventoryReport?.potentialProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '12px' }}>
              Valuation Breakdown by Category
            </h3>
            <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Products</th>
                    <th>Total Units</th>
                    <th>Cost Valuation</th>
                    <th>Retail Valuation</th>
                    <th>Potential Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryReport?.categoryBreakdown?.map((cat) => (
                    <tr key={cat.category}>
                      <td style={{ fontWeight: '700' }}>{cat.category}</td>
                      <td>{cat.productCount}</td>
                      <td>{cat.totalQuantity} units</td>
                      <td>${cat.totalCost.toFixed(2)}</td>
                      <td>${cat.totalRetail.toFixed(2)}</td>
                      <td style={{ fontWeight: '700', color: '#10b981' }}>
                        ${(cat.totalRetail - cat.totalCost).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Movement Velocity Tab */}
      {activeTab === 'movement' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Fast Moving */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <TrendingUp size={20} color="#10b981" />
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0f172a' }}>
                  Fast-Moving Products (High Velocity)
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b' }}>Top unit velocity in recent 30-day window</p>
              </div>
            </div>

            <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Units Sold (30d)</th>
                    <th>In Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {movementReport?.fastMoving?.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <div style={{ fontWeight: '600' }}>{p.name}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{p.sku}</div>
                      </td>
                      <td>{p.category}</td>
                      <td>
                        <strong style={{ color: '#10b981', fontSize: '1rem' }}>
                          {p.unitsSoldLast30Days} units
                        </strong>
                      </td>
                      <td>{p.currentStock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Slow Moving */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Layers size={20} color="#f59e0b" />
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0f172a' }}>
                  Slow-Moving Products (Low Velocity)
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b' }}>Candidates for promotional discount / bundling</p>
              </div>
            </div>

            <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Units Sold (30d)</th>
                    <th>In Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {movementReport?.slowMoving?.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <div style={{ fontWeight: '600' }}>{p.name}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{p.sku}</div>
                      </td>
                      <td>{p.category}</td>
                      <td style={{ color: '#ef4444', fontWeight: '600' }}>
                        {p.unitsSoldLast30Days} units
                      </td>
                      <td>{p.currentStock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
