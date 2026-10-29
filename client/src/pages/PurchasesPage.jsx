import React, { useState } from 'react';
import { Truck, Plus, Search, CheckCircle, Calendar, Eye, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';

export default function PurchasesPage({
  purchases = [],
  products = [],
  suppliers = [],
  onRecordPurchase,
  prefilledProduct = null,
  clearPrefill,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('All');

  // New Purchase Modal
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(suppliers[0]?._id || '');
  const [purchaseItems, setPurchaseItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [viewingPurchase, setViewingPurchase] = useState(null);

  // If a prefilled product was triggered (e.g. from low stock alert or AI replenishment matrix)
  React.useEffect(() => {
    if (prefilledProduct) {
      setSelectedSupplier(prefilledProduct.supplier?._id || prefilledProduct.supplier || suppliers[0]?._id || '');
      setPurchaseItems([
        {
          product: prefilledProduct._id,
          name: prefilledProduct.name,
          sku: prefilledProduct.sku,
          unitCost: prefilledProduct.costPrice || 0,
          quantity: prefilledProduct.suggestedQty || 20,
        },
      ]);
      setIsPurchaseModalOpen(true);
      if (clearPrefill) clearPrefill();
    }
  }, [prefilledProduct]);

  const handleOpenNewPurchase = () => {
    setSelectedSupplier(suppliers[0]?._id || '');
    setNotes('');
    if (products.length > 0) {
      setPurchaseItems([
        {
          product: products[0]._id,
          name: products[0].name,
          sku: products[0].sku,
          unitCost: products[0].costPrice,
          quantity: 25,
        },
      ]);
    } else {
      setPurchaseItems([]);
    }
    setIsPurchaseModalOpen(true);
  };

  const handleAddItemRow = () => {
    if (products.length === 0) return;
    setPurchaseItems([
      ...purchaseItems,
      {
        product: products[0]._id,
        name: products[0].name,
        sku: products[0].sku,
        unitCost: products[0].costPrice,
        quantity: 20,
      },
    ]);
  };

  const handleItemProductChange = (index, prodId) => {
    const p = products.find((prod) => prod._id === prodId);
    if (!p) return;
    const updated = [...purchaseItems];
    updated[index] = {
      product: p._id,
      name: p.name,
      sku: p.sku,
      unitCost: p.costPrice,
      quantity: updated[index].quantity || 20,
    };
    setPurchaseItems(updated);
  };

  const handleItemQtyChange = (index, val) => {
    const updated = [...purchaseItems];
    updated[index].quantity = Math.max(1, parseInt(val, 10) || 1);
    setPurchaseItems(updated);
  };

  const handleItemCostChange = (index, val) => {
    const updated = [...purchaseItems];
    updated[index].unitCost = Math.max(0, parseFloat(val) || 0);
    setPurchaseItems(updated);
  };

  const handleRemoveRow = (index) => {
    setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
  };

  const totalCost = purchaseItems.reduce((acc, item) => acc + item.unitCost * item.quantity, 0);

  const handleSubmitPurchase = async (e) => {
    e.preventDefault();
    if (!selectedSupplier) {
      alert('Please select a supplier');
      return;
    }
    if (purchaseItems.length === 0) {
      alert('Please add at least one product item');
      return;
    }

    const payload = {
      supplier: selectedSupplier,
      status: 'received', // Immediately replenishes stock in inventory
      paymentStatus: 'paid',
      notes,
      items: purchaseItems.map((item) => ({
        product: item.product,
        name: item.name,
        sku: item.sku,
        quantity: item.quantity,
        unitCost: item.unitCost,
      })),
    };

    try {
      await onRecordPurchase(payload);
      setIsPurchaseModalOpen(false);
    } catch (err) {
      alert(err.message);
    }
  };

  // Filter purchases
  const filteredPurchases = purchases.filter((p) => {
    const matchesSearch =
      p.purchaseOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.supplierName && p.supplierName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSupplier = supplierFilter === 'All' || p.supplier?._id === supplierFilter || p.supplier === supplierFilter;
    return matchesSearch && matchesSupplier;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Purchase Orders & Replenishment</h1>
          <p className="page-subtitle">Procure inventory from suppliers, replenish depleted stock, and track costs</p>
        </div>
        <button onClick={handleOpenNewPurchase} className="btn btn-primary">
          <Plus size={16} /> New Purchase Order
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-box">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search by PO number or supplier name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          style={{ width: '220px' }}
          value={supplierFilter}
          onChange={(e) => setSupplierFilter(e.target.value)}
        >
          <option value="All">All Suppliers</option>
          {suppliers.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Purchase Orders Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>PO Number</th>
              <th>Order Date</th>
              <th>Supplier</th>
              <th>Units Received</th>
              <th>Total Cost</th>
              <th>Order Status</th>
              <th>Payment</th>
              <th style={{ textAlign: 'right' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredPurchases.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  No purchase orders recorded yet.
                </td>
              </tr>
            ) : (
              filteredPurchases.map((po) => {
                const totalUnits = po.items?.reduce((acc, i) => acc + i.quantity, 0) || 0;
                return (
                  <tr key={po._id}>
                    <td style={{ fontWeight: '700', color: '#2563eb' }}>{po.purchaseOrderNumber}</td>
                    <td>{new Date(po.purchaseDate || po.createdAt).toLocaleDateString()}</td>
                    <td style={{ fontWeight: '600' }}>{po.supplierName || po.supplier?.name}</td>
                    <td>{totalUnits} units</td>
                    <td>
                      <strong style={{ color: '#0f172a' }}>${Number(po.totalCost).toFixed(2)}</strong>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.76rem', background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: '4px', fontWeight: '700' }}>
                        RECEIVED & RESTOCKED
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.76rem', background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: '700' }}>
                        {po.paymentStatus || 'PAID'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => setViewingPurchase(po)}
                        className="btn btn-sm btn-secondary"
                        title="View PO Details"
                      >
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* New Purchase Modal */}
      <Modal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        title="Create Purchase Order (Restock)"
        maxWidth="740px"
      >
        <form onSubmit={handleSubmitPurchase}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Select Supplier *</label>
              <select
                className="form-select"
                required
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
              >
                {suppliers.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.contactPerson ? `Contact: ${s.contactPerson}` : s.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Items */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0f172a' }}>Items to Order</span>
                <button
                  type="button"
                  onClick={handleAddItemRow}
                  className="btn btn-sm btn-secondary"
                >
                  <Plus size={14} /> Add Product
                </button>
              </div>

              {purchaseItems.map((item, idx) => (
                <div key={idx} className="sale-item-row">
                  <div style={{ flex: 3 }}>
                    <select
                      className="form-select"
                      value={item.product}
                      onChange={(e) => handleItemProductChange(idx, e.target.value)}
                    >
                      {products.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} (Current Stock: {p.quantity} {p.unit || 'pcs'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ flex: 1.2 }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '2px' }}>Order Units</div>
                    <input
                      type="number"
                      min="1"
                      className="form-input"
                      value={item.quantity}
                      onChange={(e) => handleItemQtyChange(idx, e.target.value)}
                    />
                  </div>

                  <div style={{ flex: 1.2 }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '2px' }}>Cost/Unit ($)</div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-input"
                      value={item.unitCost}
                      onChange={(e) => handleItemCostChange(idx, e.target.value)}
                    />
                  </div>

                  <div style={{ flex: 1.2, textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '2px' }}>Subtotal</div>
                    ${(item.unitCost * item.quantity).toFixed(2)}
                  </div>

                  {purchaseItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(idx)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="form-group">
              <label className="form-label">Notes / Instructions</label>
              <input
                className="form-input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Standard shipment via express courier"
              />
            </div>

            {/* Total Cost Display */}
            <div style={{ background: '#eff6ff', padding: '16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: '700', color: '#1e40af' }}>Total Purchase Cost:</span>
                <p style={{ fontSize: '0.76rem', color: '#3b82f6' }}>Inventory will be automatically updated immediately upon receipt</p>
              </div>
              <strong style={{ fontSize: '1.3rem', color: '#1e40af' }}>${totalCost.toFixed(2)}</strong>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={() => setIsPurchaseModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle size={16} /> Confirm & Replenish Stock
            </button>
          </div>
        </form>
      </Modal>

      {/* PO View Modal */}
      <Modal
        isOpen={!!viewingPurchase}
        onClose={() => setViewingPurchase(null)}
        title={`Purchase Order: ${viewingPurchase?.purchaseOrderNumber || ''}`}
        maxWidth="600px"
      >
        {viewingPurchase && (
          <div className="modal-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Supplier:</div>
                <div style={{ fontWeight: '700' }}>{viewingPurchase.supplierName}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Date Received:</div>
                <div style={{ fontWeight: '600' }}>{new Date(viewingPurchase.purchaseDate).toLocaleDateString()}</div>
              </div>
            </div>

            <table style={{ marginBottom: '16px' }}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Unit Cost</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {viewingPurchase.items?.map((item, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ fontWeight: '600' }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.sku}</div>
                    </td>
                    <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right' }}>${item.unitCost.toFixed(2)}</td>
                    <td style={{ textAlign: 'right', fontWeight: '600' }}>${item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '10px', fontSize: '1.15rem' }}>
              <span style={{ fontWeight: '800' }}>Total Cost:</span>
              <strong style={{ color: '#2563eb' }}>${viewingPurchase.totalCost.toFixed(2)}</strong>
            </div>
          </div>
        )}
        <div className="modal-footer">
          <button onClick={() => setViewingPurchase(null)} className="btn btn-primary">
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
}
