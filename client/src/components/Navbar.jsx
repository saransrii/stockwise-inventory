import React, { useState } from 'react';
import { Bell, User, PlusCircle, AlertTriangle } from 'lucide-react';

export default function Navbar({
  user,
  lowStockAlerts = [],
  onOpenQuickSale,
  onOpenQuickProduct,
  onSelectAlertProduct,
}) {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="top-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0f172a' }}>
          StockWise Overview
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#10b981', background: '#ecfdf5', padding: '4px 10px', borderRadius: '999px', fontWeight: '600' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
          System Live
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Quick action buttons */}
        <button
          onClick={onOpenQuickSale}
          className="btn btn-primary btn-sm"
          style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
        >
          <PlusCircle size={16} /> New Sale
        </button>

        {/* Notifications dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              background: '#f8fafc',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <Bell size={18} color="#64748b" />
            {lowStockAlerts.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: '800',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #fff',
                }}
              >
                {lowStockAlerts.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: '48px',
                right: '0',
                width: '320px',
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 60,
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>Stock Alerts</span>
                <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: '600' }}>
                  {lowStockAlerts.length} Attention Needed
                </span>
              </div>
              {lowStockAlerts.length === 0 ? (
                <p style={{ fontSize: '0.82rem', color: '#64748b', textAlign: 'center', padding: '16px 0' }}>
                  All products are adequately stocked!
                </p>
              ) : (
                <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {lowStockAlerts.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => {
                        setShowNotifications(false);
                        if (onSelectAlertProduct) onSelectAlertProduct(item);
                      }}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        background: item.quantity === 0 ? '#fef2f2' : '#fffbeb',
                        border: '1px solid ' + (item.quantity === 0 ? '#fee2e2' : '#fef3c7'),
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <AlertTriangle size={18} color={item.quantity === 0 ? '#dc2626' : '#d97706'} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: '600', fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          Current: {item.quantity} {item.unit || 'pcs'} (Min: {item.reorderLevel})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderLeft: '1px solid var(--border)', paddingLeft: '16px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '0.9rem',
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div>
            <div style={{ fontSize: '0.86rem', fontWeight: '700', color: '#0f172a' }}>
              {user?.name || 'Administrator'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: '600', textTransform: 'capitalize' }}>
              {user?.role || 'Admin'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
