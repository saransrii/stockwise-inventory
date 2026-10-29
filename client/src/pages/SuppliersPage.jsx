import React, { useState } from 'react';
import { Users, Plus, Search, Edit2, Trash2, Mail, Phone, MapPin, Eye } from 'lucide-react';
import Modal from '../components/Modal';

export default function SuppliersPage({
  suppliers = [],
  onAddSupplier,
  onUpdateSupplier,
  onDeleteSupplier,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [viewingSupplier, setViewingSupplier] = useState(null);

  const initialForm = {
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    paymentTerms: 'Net 30',
    address: { street: '', city: '', state: '', postalCode: '', country: 'USA' },
    notes: '',
  };
  const [formData, setFormData] = useState(initialForm);

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setFormData(initialForm);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (sup) => {
    setEditingSupplier(sup);
    setFormData({
      name: sup.name,
      contactPerson: sup.contactPerson || '',
      email: sup.email || '',
      phone: sup.phone || '',
      paymentTerms: sup.paymentTerms || 'Net 30',
      address: sup.address || { street: '', city: '', state: '', postalCode: '', country: 'USA' },
      notes: sup.notes || '',
    });
    setIsFormModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingSupplier) {
      await onUpdateSupplier(editingSupplier._id, formData);
    } else {
      await onAddSupplier(formData);
    }
    setIsFormModalOpen(false);
  };

  const filteredSuppliers = suppliers.filter((s) => {
    return (
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.contactPerson && s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Supplier & Vendor Directory</h1>
          <p className="page-subtitle">Manage partner contacts, terms, procurement history, and linked goods</p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={16} /> Add Supplier
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-box">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search suppliers by company name, contact, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Supplier Name</th>
              <th>Primary Contact</th>
              <th>Contact Details</th>
              <th>Payment Terms</th>
              <th>Active Products</th>
              <th>Purchase Orders</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  No suppliers found matching your query.
                </td>
              </tr>
            ) : (
              filteredSuppliers.map((s) => (
                <tr key={s._id}>
                  <td>
                    <div style={{ fontWeight: '700', color: '#0f172a' }}>{s.name}</div>
                    {s.address?.city && (
                      <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} /> {s.address.city}, {s.address.state || s.address.country}
                      </div>
                    )}
                  </td>
                  <td style={{ fontWeight: '600' }}>{s.contactPerson || 'Sales Team'}</td>
                  <td>
                    <div style={{ fontSize: '0.8rem' }}>{s.email}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.phone}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.78rem', background: '#eff6ff', color: '#1e40af', padding: '3px 8px', borderRadius: '4px', fontWeight: '600' }}>
                      {s.paymentTerms}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: '700' }}>{s.productCount || 0}</span> products
                  </td>
                  <td>
                    <span style={{ fontWeight: '700' }}>{s.purchaseCount || 0}</span> orders
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        onClick={() => handleOpenEdit(s)}
                        className="btn btn-sm btn-secondary"
                        title="Edit Supplier"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete supplier "${s.name}"?`)) {
                            onDeleteSupplier(s._id);
                          }
                        }}
                        className="btn btn-sm btn-danger"
                        title="Delete Supplier"
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

      {/* Add / Edit Supplier Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
        maxWidth="600px"
      >
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Company / Supplier Name *</label>
              <input
                className="form-input"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Apex Global Electronics Ltd"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Person</label>
              <input
                className="form-input"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="e.g. Marcus Vance"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Terms</label>
              <select
                className="form-select"
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
              >
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 45">Net 45</option>
                <option value="Due on Receipt">Due on Receipt</option>
                <option value="Advance">Advance Payment</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="supplier@company.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                className="form-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Street Address</label>
              <input
                className="form-input"
                value={formData.address?.street || ''}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                placeholder="100 Technology Parkway"
              />
            </div>

            <div className="form-group">
              <label className="form-label">City</label>
              <input
                className="form-input"
                value={formData.address?.city || ''}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                placeholder="San Jose"
              />
            </div>

            <div className="form-group">
              <label className="form-label">State / Postal Code</label>
              <input
                className="form-input"
                value={formData.address?.state || ''}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                placeholder="CA 95134"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={() => setIsFormModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingSupplier ? 'Save Changes' : 'Create Supplier'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
