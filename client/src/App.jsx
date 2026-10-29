import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import InventoryPage from './pages/InventoryPage';
import SalesPage from './pages/SalesPage';
import PurchasesPage from './pages/PurchasesPage';
import SuppliersPage from './pages/SuppliersPage';
import ForecastingPage from './pages/ForecastingPage';
import ReportsPage from './pages/ReportsPage';
import LoginPage from './pages/LoginPage';
import { api } from './services/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Core Data States
  const [dashboardStats, setDashboardStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [categories, setCategories] = useState([
    { name: 'Electronics' },
    { name: 'Office Supplies' },
    { name: 'Hardware' },
    { name: 'Stationery' },
    { name: 'Accessories' },
  ]);

  // Prefilled product for Purchase Order (from restock button)
  const [prefilledPurchaseProduct, setPrefilledPurchaseProduct] = useState(null);

  // Check login token
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('stockwise_token');
      if (token) {
        try {
          const res = await api.auth.getMe();
          if (res.success && res.data) {
            setUser(res.data);
          } else {
            // Fallback demo user
            setUser({ name: 'Demo Administrator', role: 'admin', email: 'admin@stockwise.com' });
          }
        } catch (err) {
          // Token expired or server unreachable, fallback to demo user
          setUser({ name: 'Demo Administrator', role: 'admin', email: 'admin@stockwise.com' });
        }
      } else {
        // Auto demo session for frictionless testing & presentation
        setUser({ name: 'Alex Rivera (Admin)', role: 'admin', email: 'admin@stockwise.com' });
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Refresh All Core Data
  const refreshData = async () => {
    try {
      const [statsRes, prodRes, supRes, salesRes, purchRes] = await Promise.all([
        api.dashboard.getStats().catch(() => ({ success: false })),
        api.products.getAll().catch(() => ({ success: false })),
        api.suppliers.getAll().catch(() => ({ success: false })),
        api.sales.getAll().catch(() => ({ success: false })),
        api.purchases.getAll().catch(() => ({ success: false })),
      ]);

      if (statsRes.success) setDashboardStats(statsRes.data);
      if (prodRes.success) setProducts(prodRes.data);
      if (supRes.success) setSuppliers(supRes.data);
      if (salesRes.success) setSales(salesRes.data);
      if (purchRes.success) setPurchases(purchRes.data);
    } catch (err) {
      console.error('Error refreshing app data:', err);
    }
  };

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('stockwise_token');
    setUser(null);
  };

  // Product Actions
  const handleAddProduct = async (productData) => {
    await api.products.create(productData);
    await refreshData();
  };

  const handleUpdateProduct = async (id, productData) => {
    await api.products.update(id, productData);
    await refreshData();
  };

  const handleDeleteProduct = async (id) => {
    await api.products.delete(id);
    await refreshData();
  };

  const handleAdjustStock = async (id, adjustmentData) => {
    await api.products.adjustStock(id, adjustmentData);
    await refreshData();
  };

  // Sales Action
  const handleRecordSale = async (saleData) => {
    await api.sales.create(saleData);
    await refreshData();
  };

  // Purchases Action
  const handleRecordPurchase = async (purchaseData) => {
    await api.purchases.create(purchaseData);
    await refreshData();
  };

  // Suppliers Actions
  const handleAddSupplier = async (supplierData) => {
    await api.suppliers.create(supplierData);
    await refreshData();
  };

  const handleUpdateSupplier = async (id, supplierData) => {
    await api.suppliers.update(id, supplierData);
    await refreshData();
  };

  const handleDeleteSupplier = async (id) => {
    await api.suppliers.delete(id);
    await refreshData();
  };

  // Cross-page Restock Action: Navigates to Purchases with prefilled product
  const handleOpenPurchaseForProduct = (prod) => {
    setPrefilledPurchaseProduct(prod);
    setActivePage('purchases');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
        Loading StockWise System...
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLoginSuccess={(userData) => setUser(userData)} />;
  }

  const lowStockAlerts = dashboardStats?.lowStockAlerts || products.filter((p) => p.status === 'low_stock' || p.status === 'out_of_stock');

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        lowStockCount={lowStockAlerts.length}
        onLogout={handleLogout}
      />

      {/* Main App Content Area */}
      <div className="main-content">
        <Navbar
          user={user}
          lowStockAlerts={lowStockAlerts}
          onOpenQuickSale={() => setActivePage('sales')}
          onOpenQuickProduct={() => setActivePage('products')}
          onSelectAlertProduct={(prod) => handleOpenPurchaseForProduct(prod)}
        />

        {/* Dynamic Page Router */}
        {activePage === 'dashboard' && (
          <DashboardPage
            stats={dashboardStats}
            onNavigate={(page) => setActivePage(page)}
            onOpenQuickSale={() => setActivePage('sales')}
            onOpenPurchaseForProduct={handleOpenPurchaseForProduct}
          />
        )}

        {activePage === 'products' && (
          <ProductsPage
            products={products}
            suppliers={suppliers}
            categories={categories}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onAdjustStock={handleAdjustStock}
          />
        )}

        {activePage === 'inventory' && (
          <InventoryPage
            products={products}
            onAdjustStock={handleAdjustStock}
            onOpenPurchaseForProduct={handleOpenPurchaseForProduct}
          />
        )}

        {activePage === 'sales' && (
          <SalesPage
            sales={sales}
            products={products}
            onRecordSale={handleRecordSale}
          />
        )}

        {activePage === 'purchases' && (
          <PurchasesPage
            purchases={purchases}
            products={products}
            suppliers={suppliers}
            onRecordPurchase={handleRecordPurchase}
            prefilledProduct={prefilledPurchaseProduct}
            clearPrefill={() => setPrefilledPurchaseProduct(null)}
          />
        )}

        {activePage === 'suppliers' && (
          <SuppliersPage
            suppliers={suppliers}
            onAddSupplier={handleAddSupplier}
            onUpdateSupplier={handleUpdateSupplier}
            onDeleteSupplier={handleDeleteSupplier}
          />
        )}

        {activePage === 'forecasting' && (
          <ForecastingPage
            products={products}
            onOpenPurchaseForProduct={handleOpenPurchaseForProduct}
          />
        )}

        {activePage === 'reports' && <ReportsPage />}
      </div>
    </div>
  );
}
