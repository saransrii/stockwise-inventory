import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Sliders,
  AlertTriangle,
  Package,
} from 'lucide-react';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

export default function ProductsPage({
  products = [],
  suppliers = [],
  categories = [],
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAdjustStock,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [adjustingProduct, setAdjustingProduct] = useState(null);

  // Form State
  const initialFormState = {
    name: '',
    sku: '',
    category: categories[0]?.name || 'Electronics',
    description: '',
    costPrice: '',
    sellingPrice: '',
    quantity: '',
    reorderLevel: '10',
    unit: 'pcs',
    barcode: '',
    supplier: suppliers[0]?._id || '',
  };
  const [formData, setFormData] = useState(initialFormState);

  // Adjust Stock State
  const [adjustmentData, setAdjustmentData] = useState({
    adjustmentType: 'add',
    quantity: '',
    reason: 'Restock / Delivery',
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData(initialFormState);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      sku: prod.sku,
      category: prod.category,
      description: prod.description || '',
      costPrice: prod.costPrice,
      sellingPrice: prod.sellingPrice,
      quantity: prod.quantity,
      reorderLevel: prod.reorderLevel,
      unit: prod.unit || 'pcs',
      barcode: prod.barcode || '',
      supplier: prod.supplier?._id || prod.supplier || '',
    });
    setIsFormModalOpen(true);
  };

  const handleOpenAdjust = (prod) => {
    setAdjustingProduct(prod);
    setAdjustmentData({ adjustmentType: 'add', quantity: '', reason: 'Restock / Delivery' });
    setIsAdjustModalOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (editingProduct) {
      await onUpdateProduct(editingProduct._id, formData);
    } else {
      await onAddProduct(formData);
    }
    setIsFormModalOpen(false);
  };

  const handleSubmitAdjust = async (e) => {
    e.preventDefault();
    if (adjustingProduct && adjustmentData.quantity) {
      await onAdjustStock(adjustingProduct._id, adjustmentData);
      setIsAdjustModalOpen(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchTerm));
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Product Catalog & Inventory</h1>
          <p className="page-subtitle">Manage items, pricing, inventory thresholds, and suppliers</p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Filters Bar */}
      <div className="filter-bar">
        <div className="search-box">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search by product name, SKU, or barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          style={{ width: '180px' }}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          {categories.map((c) => (
            <option key={c._id || c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          className="form-select"
          style={{ width: '160px' }}
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Product & SKU</th>
              <th>Category</th>
              <th>Cost Price</th>
              <th>Selling Price</th>
              <th>In Stock</th>
              <th>Min Threshold</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  No products found matching your search criteria.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div style={{ fontWeight: '700', color: '#0f172a' }}>{p.name}</div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', fontFamily: 'monospace' }}>
                      {p.sku} {p.barcode ? `• Barcode: ${p.barcode}` : ''}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontWeight: '600' }}>
                      {p.category}
                    </span>
                  </td>
                  <td>${Number(p.costPrice).toFixed(2)}</td>
                  <td style={{ fontWeight: '600', color: '#059669' }}>
                    ${Number(p.sellingPrice).toFixed(2)}
                  </td>
                  <td>
                    <span style={{ fontWeight: '700', fontSize: '0.95rem', color: p.quantity === 0 ? '#ef4444' : (p.quantity <= p.reorderLevel ? '#d97706' : '#0f172a') }}>
                      {p.quantity} {p.unit || 'pcs'}
                    </span>
                  </td>
                  <td style={{ color: '#64748b' }}>{p.reorderLevel} {p.unit || 'pcs'}</td>
                  <td>
                    <Badge status={p.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        onClick={() => handleOpenAdjust(p)}
                        className="btn btn-sm btn-secondary"
                        title="Adjust Stock Quantity"
                      >
                        <Sliders size={14} /> Adjust
                      </button>
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="btn btn-sm btn-secondary"
                        title="Edit Product"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete product "${p.name}"?`)) {
                            onDeleteProduct(p._id);
                          }
                        }}
                        className="btn btn-sm btn-danger"
                        title="Delete Product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingProduct ? 'Edit Product Details' : 'Add New Product'}
        maxWidth="680px"
      >
        <form onSubmit={handleSubmitForm}>
          <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Product Name *</label>
              <input
                className="form-input"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Ergonomic Office Chair"
              />
            </div>

            <div className="form-group">
              <label className="form-label">SKU / Code *</label>
              <input
                className="form-input"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                placeholder="e.g. OFF-CHR-001"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map((c) => (
                  <option key={c._id || c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Cost Price ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                required
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Selling Price ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                required
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Initial Quantity *</label>
              <input
                type="number"
                min="0"
                className="form-input"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Reorder Level Threshold</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={formData.reorderLevel}
                onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                placeholder="10"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Unit of Measure</label>
              <input
                className="form-input"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="pcs, box, pack, kg..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Barcode / QR</label>
              <input
                className="form-input"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="Optional barcode number"
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Preferred Supplier</label>
              <select
                className="form-select"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              >
                <option value="">No Supplier Assigned</option>
                {suppliers.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                rows="2"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Product specifications, notes..."
              ></textarea>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={() => setIsFormModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Adjust Stock Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title={`Adjust Stock: ${adjustingProduct?.name || ''}`}
        maxWidth="480px"
      >
        <form onSubmit={handleSubmitAdjust}>
          <div className="modal-body">
            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Current Stock:</span>
              <strong style={{ fontSize: '1rem', color: '#0f172a' }}>
                {adjustingProduct?.quantity} {adjustingProduct?.unit || 'pcs'}
              </strong>
            </div>

            <div className="form-group">
              <label className="form-label">Adjustment Mode</label>
              <select
                className="form-select"
                value={adjustmentData.adjustmentType}
                onChange={(e) => setAdjustmentData({ ...adjustmentData, adjustmentType: e.target.value })}
              >
                <option value="add">Add (+ Replenishment / Return)</option>
                <option value="subtract">Subtract (- Damaged / Lost / Expired)</option>
                <option value="set">Set to Exact Count (= Physical Audit)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                min="1"
                required
                className="form-input"
                placeholder="Enter units"
                value={adjustmentData.quantity}
                onChange={(e) => setAdjustmentData({ ...adjustmentData, quantity: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Reason / Notes</label>
              <input
                className="form-input"
                value={adjustmentData.reason}
                onChange={(e) => setAdjustmentData({ ...adjustmentData, reason: e.target.value })}
                placeholder="e.g. Audit reconciliation, damaged goods"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={() => setIsAdjustModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Confirm Adjustment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
