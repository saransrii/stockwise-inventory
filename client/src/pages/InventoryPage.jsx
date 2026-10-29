import React, { useState } from 'react';
import { Layers, AlertTriangle, CheckCircle2, XCircle, Search, Sliders, RefreshCw, ShoppingCart } from 'lucide-react';
import Badge from '../components/Badge';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';

export default function InventoryPage({
  products = [],
  onAdjustStock,
  onOpenPurchaseForProduct,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Adjust Stock Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustmentData, setAdjustmentData] = useState({
    adjustmentType: 'add',
    quantity: '',
    reason: 'Manual Restock',
  });

  const handleOpenAdjust = (prod) => {
    setSelectedProduct(prod);
    setAdjustmentData({ adjustmentType: 'add', quantity: '', reason: 'Manual Restock' });
    setIsAdjustModalOpen(true);
  };

  const handleSubmitAdjust = async (e) => {
    e.preventDefault();
    if (selectedProduct && adjustmentData.quantity) {
      await onAdjustStock(selectedProduct._id, adjustmentData);
      setIsAdjustModalOpen(false);
    }
  };

  // Metrics
  const totalUnits = products.reduce((acc, p) => acc + (p.quantity || 0), 0);
  const inStockCount = products.filter((p) => p.status === 'in_stock').length;
  const lowStockCount = products.filter((p) => p.status === 'low_stock').length;
  const outOfStockCount = products.filter((p) => p.status === 'out_of_stock' || p.quantity === 0).length;

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Stock Levels & Inventory Monitoring</h1>
          <p className="page-subtitle">Continuous threshold monitoring, low stock alerts, and replenishment tracking</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="stat-grid">
        <StatCard
          title="Total Stock Units"
          value={totalUnits}
          subtitle={`${products.length} catalog items`}
          icon={Layers}
          color="#2563eb"
          bgColor="#eff6ff"
        />
        <StatCard
          title="Healthy Stock Items"
          value={inStockCount}
          subtitle="Above threshold"
          icon={CheckCircle2}
          color="#10b981"
          bgColor="#ecfdf5"
        />
        <StatCard
          title="Low Stock Alerts"
          value={lowStockCount}
          subtitle="At or near reorder point"
          icon={AlertTriangle}
          color="#f59e0b"
          bgColor="#fffbeb"
        />
        <StatCard
          title="Out of Stock"
          value={outOfStockCount}
          subtitle="Urgent restock needed"
          icon={XCircle}
          color="#ef4444"
          bgColor="#fef2f2"
        />
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-box">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search inventory by product name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          style={{ width: '180px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Stock Levels</option>
          <option value="in_stock">In Stock ({inStockCount})</option>
          <option value="low_stock">Low Stock ({lowStockCount})</option>
          <option value="out_of_stock">Out of Stock ({outOfStockCount})</option>
        </select>
      </div>

      {/* Inventory Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Reorder Threshold</th>
              <th>Stock Health Meter</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  No inventory items match your filter.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => {
                // Stock health percentage relative to 2x reorder level
                const target = Math.max(p.reorderLevel * 2, 20);
                const pct = Math.min(100, Math.round((p.quantity / target) * 100));
                let meterColor = '#10b981';
                if (p.quantity === 0) meterColor = '#ef4444';
                else if (p.quantity <= p.reorderLevel) meterColor = '#f59e0b';

                return (
                  <tr key={p._id}>
                    <td>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.sku}</div>
                    </td>
                    <td>{p.category}</td>
                    <td>
                      <strong
                        style={{
                          fontSize: '1rem',
                          color: p.quantity === 0 ? '#ef4444' : (p.quantity <= p.reorderLevel ? '#d97706' : '#0f172a'),
                        }}
                      >
                        {p.quantity} {p.unit || 'pcs'}
                      </strong>
                    </td>
                    <td style={{ color: '#64748b' }}>
                      {p.reorderLevel} {p.unit || 'pcs'}
                    </td>
                    <td style={{ width: '180px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            flex: 1,
                            height: '8px',
                            background: '#e2e8f0',
                            borderRadius: '999px',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${pct}%`,
                              height: '100%',
                              backgroundColor: meterColor,
                              borderRadius: '999px',
                              transition: 'width 0.3s ease',
                            }}
                          ></div>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', width: '32px' }}>
                          {pct}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <Badge status={p.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenAdjust(p)}
                          className="btn btn-sm btn-secondary"
                          title="Quick Stock Adjustment"
                        >
                          <Sliders size={14} /> Adjust
                        </button>
                        <button
                          onClick={() => onOpenPurchaseForProduct && onOpenPurchaseForProduct(p)}
                          className="btn btn-sm btn-primary"
                          title="Create Purchase Order"
                        >
                          Restock
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Adjust Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title={`Stock Adjustment: ${selectedProduct?.name || ''}`}
        maxWidth="460px"
      >
        <form onSubmit={handleSubmitAdjust}>
          <div className="modal-body">
            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Current Stock:</span>
              <strong style={{ fontSize: '1rem', color: '#0f172a' }}>
                {selectedProduct?.quantity} {selectedProduct?.unit || 'pcs'}
              </strong>
            </div>

            <div className="form-group">
              <label className="form-label">Adjustment Type</label>
              <select
                className="form-select"
                value={adjustmentData.adjustmentType}
                onChange={(e) => setAdjustmentData({ ...adjustmentData, adjustmentType: e.target.value })}
              >
                <option value="add">Add Units (+ Inflow)</option>
                <option value="subtract">Deduct Units (- Outflow / Spoilage)</option>
                <option value="set">Set Exact Count (= Audit)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Units</label>
              <input
                type="number"
                min="1"
                required
                className="form-input"
                placeholder="Quantity"
                value={adjustmentData.quantity}
                onChange={(e) => setAdjustmentData({ ...adjustmentData, quantity: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Audit Reason</label>
              <input
                className="form-input"
                value={adjustmentData.reason}
                onChange={(e) => setAdjustmentData({ ...adjustmentData, reason: e.target.value })}
                placeholder="e.g. Physical inventory count, damaged box"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={() => setIsAdjustModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Adjustment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
