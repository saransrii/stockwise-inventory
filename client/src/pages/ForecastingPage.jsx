import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  TrendingUp,
  AlertOctagon,
  PackageCheck,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  ShoppingCart,
  CheckCircle2,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import DemandForecastChart from '../charts/DemandForecastChart';
import { api } from '../services/api';

export default function ForecastingPage({
  products = [],
  onOpenPurchaseForProduct,
}) {
  const [catalogSummary, setCatalogSummary] = useState([]);
  const [meta, setMeta] = useState({});
  const [selectedProductId, setSelectedProductId] = useState('');
  const [productForecast, setProductForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [leadTime, setLeadTime] = useState(7);

  // Load catalog forecast summary
  const loadSummary = async () => {
    try {
      setLoading(true);
      const res = await api.forecasting.getCatalogSummary();
      if (res.success) {
        setCatalogSummary(res.data);
        setMeta(res.meta);
        if (res.data.length > 0 && !selectedProductId) {
          setSelectedProductId(res.data[0].product._id);
        }
      }
    } catch (err) {
      console.error('Failed to load forecast summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  // Load single product deep-dive forecast
  const loadProductForecast = async (pId, lt) => {
    if (!pId) return;
    try {
      setForecastLoading(true);
      const res = await api.forecasting.getProductForecast(pId, lt);
      if (res.success) {
        setProductForecast(res.data);
      }
    } catch (err) {
      console.error('Failed to load single forecast:', err);
    } finally {
      setForecastLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProductId) {
      loadProductForecast(selectedProductId, leadTime);
    }
  }, [selectedProductId, leadTime]);

  const pData = productForecast?.product;
  const fc = productForecast?.forecast;

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="page-title">AI Demand Forecasting & Inventory Planning</h1>
            <span
              style={{
                fontSize: '0.72rem',
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: '999px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Sparkles size={12} /> ML Time-Series Model
            </span>
          </div>
          <p className="page-subtitle">
            Analyzes sales velocity, trends, and seasonal momentum to optimize stock levels and prevent stockouts
          </p>
        </div>
      </div>

      {/* Top AI Metrics */}
      <div className="stat-grid">
        <StatCard
          title="Catalog Analyzed"
          value={meta.totalProductsAnalyzed || products.length || 0}
          subtitle="Continuous time-series tracking"
          icon={BrainCircuit}
          color="#8b5cf6"
          bgColor="#f5f3ff"
        />
        <StatCard
          title="Critical Stockouts"
          value={meta.criticalCount || 0}
          subtitle="≤ 3 days of stock remaining"
          icon={AlertOctagon}
          color="#ef4444"
          bgColor="#fef2f2"
        />
        <StatCard
          title="Suggested Restock"
          value={`${meta.totalItemsToReorder || 0} units`}
          subtitle="Buffer to prevent shortages"
          icon={PackageCheck}
          color="#2563eb"
          bgColor="#eff6ff"
        />
        <StatCard
          title="Estimated Restock Cost"
          value={`$${(meta.totalReorderCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="Recommended replenishment capital"
          icon={TrendingUp}
          color="#10b981"
          bgColor="#ecfdf5"
        />
      </div>

      {/* Deep-Dive Product Forecast Card */}
      <div className="card" style={{ marginBottom: '28px', border: '1px solid #e0e7ff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>
                Product Demand Trajectory: {pData?.name || 'Loading...'}
              </h3>
              {fc && <Badge status={fc.riskLevel} />}
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Historical actual sales vs 14-day machine-learning demand projections with 95% confidence intervals
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Select Product:</label>
            <select
              className="form-select"
              style={{ width: '280px' }}
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
            >
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.quantity} in stock)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Chart */}
        {forecastLoading ? (
          <div style={{ padding: '80px', textAlign: 'center', color: '#64748b' }}>
            Running forecasting regression models...
          </div>
        ) : (
          <DemandForecastChart timeline={fc?.timeline} productName={pData?.name} />
        )}

        {/* AI Actionable Insights Grid */}
        {fc && (
          <div
            style={{
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid var(--border)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
            }}
          >
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>Daily Sales Velocity</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
                {fc.dailyRunRate} units/day
              </div>
              <div style={{ fontSize: '0.74rem', color: fc.trend === 'INCREASING' ? '#059669' : '#64748b' }}>
                Trend: {fc.trend} ({fc.trendPercentage > 0 ? `+${fc.trendPercentage}%` : `${fc.trendPercentage}%`})
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>Stock Runway</div>
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '800',
                  color: fc.daysRemaining <= 3 ? '#ef4444' : (fc.daysRemaining <= 7 ? '#d97706' : '#059669'),
                }}
              >
                {fc.daysRemaining < 365 ? `${fc.daysRemaining} days` : '> 1 Year'}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                {fc.stockoutDate ? `Est. Stockout: ${fc.stockoutDate}` : 'Adequately Stocked'}
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>30-Day Demand</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#2563eb' }}>
                {fc.forecast30Days} units
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Safety Buffer: {fc.safetyStock} units</div>
            </div>

            <div style={{ background: '#eff6ff', padding: '14px', borderRadius: '10px', border: '1px solid #dbeafe' }}>
              <div style={{ fontSize: '0.78rem', color: '#1e40af', fontWeight: '700' }}>Recommended Order</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e40af' }}>
                {fc.suggestedReorderQuantity} units
              </div>
              <div style={{ fontSize: '0.74rem', color: '#2563eb' }}>
                Cost: ${fc.estimatedReorderCost.toFixed(2)}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <button
                onClick={() =>
                  onOpenPurchaseForProduct &&
                  onOpenPurchaseForProduct({
                    ...pData,
                    suggestedQty: fc.suggestedReorderQuantity || 20,
                  })
                }
                className="btn btn-primary"
                style={{ width: '100%', height: '100%', maxHeight: '60px', justifyContent: 'center' }}
              >
                <ShoppingCart size={16} /> Create PO ({fc.suggestedReorderQuantity} units)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Catalog Replenishment Matrix Table */}
      <div className="card">
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a' }}>
            Catalog Replenishment Prioritization Matrix
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Ranked by stockout urgency to guide purchasing decisions and prevent inventory shortages
          </p>
        </div>

        <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>In Stock</th>
                <th>Daily Run Rate</th>
                <th>30-Day Forecast</th>
                <th>Days Runway</th>
                <th>Suggested Order</th>
                <th>Est. Cost</th>
                <th>Urgency Risk</th>
                <th style={{ textAlign: 'right' }}>Replenish</th>
              </tr>
            </thead>
            <tbody>
              {catalogSummary.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    Loading catalog forecasting metrics...
                  </td>
                </tr>
              ) : (
                catalogSummary.map((item) => {
                  const p = item.product;
                  const isCurrent = p._id === selectedProductId;
                  return (
                    <tr
                      key={p._id}
                      style={isCurrent ? { backgroundColor: '#f5f3ff' } : {}}
                      onClick={() => setSelectedProductId(p._id)}
                    >
                      <td style={{ cursor: 'pointer' }}>
                        <div style={{ fontWeight: '700', color: '#0f172a' }}>{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.sku}</div>
                      </td>
                      <td>{p.category}</td>
                      <td>
                        <strong
                          style={{
                            color: p.currentStock === 0 ? '#ef4444' : (p.currentStock <= p.reorderLevel ? '#d97706' : '#0f172a'),
                          }}
                        >
                          {p.currentStock}
                        </strong>
                      </td>
                      <td>{item.dailyRunRate}/day</td>
                      <td style={{ fontWeight: '600' }}>{item.forecast30Days} units</td>
                      <td>
                        <span
                          style={{
                            fontWeight: '700',
                            color: item.daysRemaining <= 3 ? '#ef4444' : (item.daysRemaining <= 7 ? '#d97706' : '#059669'),
                          }}
                        >
                          {item.daysRemaining < 365 ? `${item.daysRemaining} days` : '> 1 yr'}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: item.suggestedReorderQuantity > 0 ? '#2563eb' : '#64748b' }}>
                          {item.suggestedReorderQuantity} units
                        </strong>
                      </td>
                      <td>${item.estimatedReorderCost.toFixed(2)}</td>
                      <td>
                        <Badge status={item.riskLevel} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenPurchaseForProduct &&
                              onOpenPurchaseForProduct({
                                ...p,
                                suggestedQty: item.suggestedReorderQuantity || 20,
                              });
                          }}
                          className={`btn btn-sm ${item.suggestedReorderQuantity > 0 ? 'btn-primary' : 'btn-secondary'}`}
                        >
                          Restock
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
