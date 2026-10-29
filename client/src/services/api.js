const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('stockwise_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
};

export const api = {
  // Auth
  auth: {
    login: async (credentials) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      return handleResponse(res);
    },
    register: async (userData) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return handleResponse(res);
    },
    demoLogin: async (role = 'admin') => {
      const res = await fetch(`${API_BASE}/auth/demo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      return handleResponse(res);
    },
    getMe: async () => {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
  },

  // Dashboard
  dashboard: {
    getStats: async () => {
      const res = await fetch(`${API_BASE}/dashboard/stats`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
  },

  // Products
  products: {
    getAll: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/products?${query}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    getById: async (id) => {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    create: async (productData) => {
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(productData),
      });
      return handleResponse(res);
    },
    update: async (id, productData) => {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(productData),
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    getLowStock: async () => {
      const res = await fetch(`${API_BASE}/products/alerts/low-stock`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    adjustStock: async (id, adjustment) => {
      const res = await fetch(`${API_BASE}/products/${id}/adjust`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(adjustment),
      });
      return handleResponse(res);
    },
  },

  // Sales
  sales: {
    getAll: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/sales?${query}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    getById: async (id) => {
      const res = await fetch(`${API_BASE}/sales/${id}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    create: async (saleData) => {
      const res = await fetch(`${API_BASE}/sales`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(saleData),
      });
      return handleResponse(res);
    },
    getTopSelling: async (limit = 5) => {
      const res = await fetch(`${API_BASE}/sales/top-products?limit=${limit}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
  },

  // Purchases
  purchases: {
    getAll: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/purchases?${query}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    getById: async (id) => {
      const res = await fetch(`${API_BASE}/purchases/${id}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    create: async (purchaseData) => {
      const res = await fetch(`${API_BASE}/purchases`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(purchaseData),
      });
      return handleResponse(res);
    },
  },

  // Suppliers
  suppliers: {
    getAll: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/suppliers?${query}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    getById: async (id) => {
      const res = await fetch(`${API_BASE}/suppliers/${id}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    create: async (supplierData) => {
      const res = await fetch(`${API_BASE}/suppliers`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(supplierData),
      });
      return handleResponse(res);
    },
    update: async (id, supplierData) => {
      const res = await fetch(`${API_BASE}/suppliers/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(supplierData),
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE}/suppliers/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
  },

  // AI Forecasting
  forecasting: {
    getCatalogSummary: async () => {
      const res = await fetch(`${API_BASE}/forecasting/catalog-summary`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    getProductForecast: async (productId, leadTime = 7) => {
      const res = await fetch(`${API_BASE}/forecasting/product/${productId}?leadTime=${leadTime}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
  },

  // Reports
  reports: {
    getSales: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/reports/sales?${query}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    getInventory: async () => {
      const res = await fetch(`${API_BASE}/reports/inventory`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    getMovement: async () => {
      const res = await fetch(`${API_BASE}/reports/movement`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
  },
};
