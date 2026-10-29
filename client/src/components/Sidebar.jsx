import React from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingCart,
  Truck,
  Users,
  BrainCircuit,
  FileBarChart,
  Boxes,
  LogOut,
} from 'lucide-react';

export default function Sidebar({ activePage, setActivePage, lowStockCount = 0, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'inventory', label: 'Stock Levels', icon: Layers, badge: lowStockCount > 0 ? lowStockCount : null },
    { id: 'sales', label: 'Sales & POS', icon: ShoppingCart },
    { id: 'purchases', label: 'Purchases', icon: Truck },
    { id: 'suppliers', label: 'Suppliers', icon: Users },
    { id: 'forecasting', label: 'AI Forecasting', icon: BrainCircuit, special: true },
    { id: 'reports', label: 'Reports', icon: FileBarChart },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-icon">
          <Boxes size={24} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="brand-title">StockWise</span>
            <span className="brand-badge">AI 2.0</span>
          </div>
          <p style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '500' }}>
            Smart Inventory Manager
          </p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              className={`nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
              style={
                item.special && !isActive
                  ? {
                      background: 'linear-gradient(90deg, #f5f3ff, #ede9fe)',
                      color: '#7c3aed',
                      fontWeight: '700',
                    }
                  : {}
              }
            >
              <Icon size={19} color={isActive ? '#2563eb' : (item.special ? '#7c3aed' : '#64748b')} />
              <span>{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
              {item.special && !item.badge && (
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: '0.65rem',
                    background: '#8b5cf6',
                    color: '#fff',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: '800',
                  }}
                >
                  AI
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={onLogout}
          className="btn btn-secondary"
          style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
