import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Search,
  Calendar,
  FileText,
  Trash2,
  CheckCircle,
  Eye,
} from 'lucide-react';
import Modal from '../components/Modal';

export default function SalesPage({
  sales = [],
  products = [],
  onRecordSale,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('All');

  // New Sale Modal State
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discount, setDiscount] = useState('0');
  const [taxRate, setTaxRate] = useState('5'); // 5% default
  const [notes, setNotes] = useState('');

  // Selected cart items
  const [cartItems, setCartItems] = useState([]);

  // Invoice Details Modal
  const [viewingSale, setViewingSale] = useState(null);

  const handleOpenSaleModal = () => {
    setCustomerName('Walk-in Customer');
    setCustomerPhone('');
    setCustomerEmail('');
    setPaymentMethod('cash');
    setDiscount('0');
    setTaxRate('5');
    setNotes('');
    // Default 1 item row
    const available = products.filter((p) => p.quantity > 0);
    if (available.length > 0) {
      setCartItems([
        {
          product: available[0]._id,
          name: available[0].name,
          sku: available[0].sku,
          price: available[0].sellingPrice,
          maxStock: available[0].quantity,
          quantity: 1,
        },
      ]);
    } else {
      setCartItems([]);
    }
    setIsSaleModalOpen(true);
  };

  const handleAddCartRow = () => {
    const available = products.filter((p) => p.quantity > 0);
    if (available.length === 0) return;
    setCartItems([
      ...cartItems,
      {
        product: available[0]._id,
        name: available[0].name,
        sku: available[0].sku,
        price: available[0].sellingPrice,
        maxStock: available[0].quantity,
        quantity: 1,
      },
    ]);
  };

  const handleCartProductChange = (index, productId) => {
    const p = products.find((item) => item._id === productId);
    if (!p) return;
    const updated = [...cartItems];
    updated[index] = {
      product: p._id,
      name: p.name,
      sku: p.sku,
      price: p.sellingPrice,
      maxStock: p.quantity,
      quantity: 1,
    };
    setCartItems(updated);
  };

  const handleCartQtyChange = (index, qty) => {
    const updated = [...cartItems];
    const val = parseInt(qty, 10);
    if (isNaN(val) || val < 1) {
      updated[index].quantity = 1;
    } else {
      updated[index].quantity = Math.min(val, updated[index].maxStock);
    }
    setCartItems(updated);
  };

  const handleRemoveCartRow = (index) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const taxAmount = (subtotal * (parseFloat(taxRate) || 0)) / 100;
  const discountAmount = parseFloat(discount) || 0;
  const grandTotal = Math.max(0, subtotal + taxAmount - discountAmount);

  const handleSubmitSale = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert('Please add at least one product to the sale');
      return;
    }

    const payload = {
      customerName,
      customerPhone,
      customerEmail,
      paymentMethod,
      discount: discountAmount,
      tax: taxAmount,
      notes,
      items: cartItems.map((item) => ({
        product: item.product,
        name: item.name,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.price,
      })),
    };

    try {
      await onRecordSale(payload);
      setIsSaleModalOpen(false);
    } catch (err) {
      alert(err.message);
    }
  };

  // Filter sales
  const filteredSales = sales.filter((s) => {
    const matchesSearch =
      s.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.customerName && s.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPayment = paymentFilter === 'All' || s.paymentMethod === paymentFilter;
    return matchesSearch && matchesPayment;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Sales Management & Transactions</h1>
          <p className="page-subtitle">Process customer sales, generate invoices, and trace order history</p>
        </div>
        <button onClick={handleOpenSaleModal} className="btn btn-primary">
          <Plus size={16} /> Record Sale (POS)
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-box">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search by invoice number or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          style={{ width: '180px' }}
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
        >
          <option value="All">All Payment Methods</option>
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="upi">UPI</option>
          <option value="bank_transfer">Bank Transfer</option>
        </select>
      </div>

      {/* Sales History Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Items Sold</th>
              <th>Subtotal</th>
              <th>Total Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  No sales transactions found.
                </td>
              </tr>
            ) : (
              filteredSales.map((s) => (
                <tr key={s._id}>
                  <td style={{ fontWeight: '700', color: '#2563eb' }}>{s.invoiceNumber}</td>
                  <td>{new Date(s.saleDate || s.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ fontWeight: '600' }}>{s.customerName}</div>
                    {s.customerPhone && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.customerPhone}</div>}
                  </td>
                  <td>{s.items?.reduce((acc, i) => acc + i.quantity, 0) || 0} items</td>
                  <td>${Number(s.subtotal).toFixed(2)}</td>
                  <td>
                    <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
                      ${Number(s.totalAmount).toFixed(2)}
                    </strong>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.76rem', background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: '700', color: '#475569' }}>
                      {s.paymentMethod}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.76rem', background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: '4px', fontWeight: '700' }}>
                      COMPLETED
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => setViewingSale(s)}
                      className="btn btn-sm btn-secondary"
                      title="View Invoice Details"
                    >
                      <Eye size={14} /> View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* POS / Record Sale Modal */}
      <Modal
        isOpen={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        title="Record New Sale (Point of Sale)"
        maxWidth="740px"
      >
        <form onSubmit={handleSubmitSale}>
          <div className="modal-body">
            {/* Customer Information */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Customer Name</label>
                <input
                  className="form-input"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Acme Corp / Walk-in"
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Phone</label>
                <input
                  className="form-input"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Optional phone"
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Payment Method</label>
                <select
                  className="form-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="cash">Cash</option>
                  <option value="card">Credit / Debit Card</option>
                  <option value="upi">UPI / Instant Pay</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
            </div>

            {/* Cart Items */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0f172a' }}>Items to Sell</span>
                <button
                  type="button"
                  onClick={handleAddCartRow}
                  className="btn btn-sm btn-secondary"
                  disabled={products.filter((p) => p.quantity > 0).length === 0}
                >
                  <Plus size={14} /> Add Another Item
                </button>
              </div>

              {cartItems.map((item, idx) => (
                <div key={idx} className="sale-item-row">
                  <div style={{ flex: 3 }}>
                    <select
                      className="form-select"
                      value={item.product}
                      onChange={(e) => handleCartProductChange(idx, e.target.value)}
                    >
                      {products
                        .filter((p) => p.quantity > 0 || p._id === item.product)
                        .map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name} (${p.sellingPrice.toFixed(2)}) — {p.quantity} {p.unit || 'pcs'} in stock
                          </option>
                        ))}
                    </select>
                  </div>

                  <div style={{ flex: 1 }}>
                    <input
                      type="number"
                      min="1"
                      max={item.maxStock}
                      className="form-input"
                      value={item.quantity}
                      onChange={(e) => handleCartQtyChange(idx, e.target.value)}
                      title={`Max available: ${item.maxStock}`}
                    />
                  </div>

                  <div style={{ flex: 1, textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>

                  {cartItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCartRow(idx)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.88rem' }}>
                <span style={{ color: '#64748b' }}>Subtotal:</span>
                <strong>${subtotal.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '0.88rem' }}>
                <span style={{ color: '#64748b' }}>Tax ({taxRate}%):</span>
                <span>+${taxAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.88rem' }}>
                <span style={{ color: '#64748b' }}>Discount ($):</span>
                <input
                  type="number"
                  min="0"
                  style={{ width: '80px', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', textAlign: 'right' }}
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '10px', fontSize: '1.15rem' }}>
                <span style={{ fontWeight: '800', color: '#0f172a' }}>Total Due:</span>
                <strong style={{ fontWeight: '800', color: '#2563eb' }}>${grandTotal.toFixed(2)}</strong>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={() => setIsSaleModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ minWidth: '140px' }}>
              <CheckCircle size={16} /> Complete Sale
            </button>
          </div>
        </form>
      </Modal>

      {/* Invoice Details Modal */}
      <Modal
        isOpen={!!viewingSale}
        onClose={() => setViewingSale(null)}
        title={`Invoice Receipt: ${viewingSale?.invoiceNumber || ''}`}
        maxWidth="600px"
      >
        {viewingSale && (
          <div className="modal-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Customer:</div>
                <div style={{ fontWeight: '700' }}>{viewingSale.customerName}</div>
                {viewingSale.customerPhone && <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{viewingSale.customerPhone}</div>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Sale Date:</div>
                <div style={{ fontWeight: '600' }}>{new Date(viewingSale.saleDate).toLocaleString()}</div>
                <div style={{ fontSize: '0.75rem', color: '#2563eb', textTransform: 'uppercase', fontWeight: '700' }}>
                  Paid via {viewingSale.paymentMethod}
                </div>
              </div>
            </div>

            <table style={{ marginBottom: '16px' }}>
              <thead>
                <tr>
                  <th>Item</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Price</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {viewingSale.items?.map((item, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ fontWeight: '600' }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.sku}</div>
                    </td>
                    <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right' }}>${item.unitPrice.toFixed(2)}</td>
                    <td style={{ textAlign: 'right', fontWeight: '600' }}>${item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                <span>Subtotal:</span>
                <span>${viewingSale.subtotal.toFixed(2)}</span>
              </div>
              {viewingSale.tax > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                  <span>Tax:</span>
                  <span>+${viewingSale.tax.toFixed(2)}</span>
                </div>
              )}
              {viewingSale.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                  <span>Discount:</span>
                  <span>-${viewingSale.discount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '8px', fontSize: '1.05rem', fontWeight: '800' }}>
                <span>Grand Total:</span>
                <span style={{ color: '#2563eb' }}>${viewingSale.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
        <div className="modal-footer">
          <button onClick={() => window.print()} className="btn btn-secondary">
            <FileText size={16} /> Print Receipt
          </button>
          <button onClick={() => setViewingSale(null)} className="btn btn-primary">
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
}
