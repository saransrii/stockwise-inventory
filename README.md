# 📦 StockWise – Intelligent Inventory Management System

## 📌 Project Overview

**StockWise** is a production-ready, full-stack Smart Inventory and Sales Prediction System developed using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js) and an **AI-based Demand Forecasting Module** (Python / Scikit-Learn time-series regression + native analytical engine).

The system helps businesses manage products, monitor stock levels, record sales & purchases, and analyze business performance through an interactive dashboard with Chart.js.

The AI-driven demand forecasting engine uses historical sales data to predict future product demand, automatically estimates stockout dates and runway, and computes optimal replenishment orders to eliminate both stockouts and costly overstocking.

---

## 🎯 Key Capabilities & Features

### 1. 📦 Product Management
- Full CRUD operations: Create, Read, Update, and Delete products.
- Fields: Product Name, SKU, Category, Cost Price, Selling Price, In-Stock Quantity, Reorder Level Threshold, Unit of Measure, Barcode / QR, Preferred Supplier.
- Instant search across names, SKUs, and barcodes, with dynamic category and status filtering.

### 2. 📊 Real-Time Stock & Threshold Monitoring
- Continuous tracking of stock levels across the catalog.
- Color-coded status indicators:
  - `In Stock` (Healthy levels above threshold)
  - `Low Stock` (Quantity has fallen to or below the reorder point)
  - `Out of Stock` (Zero inventory remaining)
- Visual stock health meters relative to ideal inventory buffers.
- Fast Manual Stock Adjustments (Add Units, Deduct Units, Set Exact Count) with audit reasoning.

### 3. 🛒 Sales Management & Point-of-Sale (POS)
- Record sales transactions with customer details.
- Multi-item checkout with atomic stock availability validation (prevents overselling beyond current stock).
- Automatic inventory deduction upon sale confirmation.
- Subtotal, configurable tax, and discount calculations.
- Detailed invoice receipts with print capability.
- Sales history filtering by date range and payment method (Cash, Card, UPI, Bank Transfer).

### 4. 🚚 Purchase Orders & Automated Replenishment
- Create supplier purchase orders with itemized unit costs.
- **Immediate stock replenishment**: Receiving a purchase order automatically increments inventory quantities and recalculates product status.
- PO tracking with supplier reference and order dates.

### 5. 🏢 Supplier & Vendor Directory
- Maintain supplier contact persons, emails, phone numbers, payment terms (Net 15/30/45, Due on Receipt), and physical addresses.
- Direct association of products with preferred suppliers.
- Order history tracking per supplier.

### 6. 📈 Executive Sales Analytics Dashboard
- Summary KPI Cards: Total Products, Total Stock Units, Net Revenue, Completed Sales, Gross Profit & Margins, Stock Alerts.
- **Chart.js Visualizations**:
  - **Monthly Sales & Revenue Trend**: Revenue line chart with order volume indicators.
  - **Stock by Category**: Doughnut chart showing inventory allocation across categories.
  - **Top Selling Products**: Bar chart identifying best-performing inventory.
- Real-time stockout alert alerts with one-click restock actions.
- Recent sales transaction logs.

### 7. 🧠 AI-Based Demand Forecasting & Replenishment Matrix
- Analyzes historical sales velocity and daily run rates over time.
- Time-series statistical regression: Linear trend modeling, moving averages, and exponential smoothing.
- **Interactive Demand Trajectory Chart**: Visualizes actual historical sales alongside future predicted demand curves with 95% confidence intervals.
- Actionable replenishment metrics:
  - **Daily Run Rate (Velocity)**: Average daily sales rate.
  - **Stock Runway**: Days of inventory remaining before stockout.
  - **Safety Stock**: Buffer calculated using lead time and service factor.
  - **Recommended Reorder Quantity**: Calculated as $\max(0, \text{30-Day Demand} + \text{Safety Stock} - \text{Current Stock})$.
  - **Urgency Risk Rating**: `CRITICAL` ($\le 3$ days), `HIGH` ($\le 7$ days), `MODERATE` ($\le 15$ days), or `OPTIMAL`.
- Catalog Replenishment Matrix table with one-click **"Restock / Create PO"** pre-fill.
- Complete Python module in `forecasting/` (`data_processing.py`, `train_model.py`, `predict_demand.py`).

### 8. 📑 Business Reports & Analytics
- **Sales Performance Report**: Filter by date range, calculate gross vs net sales, payment method breakdown, and export to CSV.
- **Inventory Valuation Report**: Procurement cost valuation vs retail market valuation, and potential margin by category.
- **Movement Velocity Report**: Fast-moving items vs slow-moving stock identification.

---

## 🏗️ System Architecture

```text
User Interface (React.js + Chart.js + Lucide Icons)
                     │
                     ▼ HTTP / REST
Node.js & Express.js Application Server (Port 5000)
       ├── Controllers (Auth, Products, Sales, Purchases, Dashboard, Forecasting, Reports)
       ├── Models (Mongoose Schemas for User, Product, Sale, Purchase, Supplier, Category)
       └── Forecasting Engine (Native Statistical ML + Python Subprocess)
                     │
                     ▼
           MongoDB Database (Port 27017)
```

---

## 📂 Project Directory Structure

```text
stockwise project/
│
├── client/                     # Frontend React Application
│   ├── public/                 # Static public assets
│   ├── src/
│   │   ├── charts/             # Chart.js visual components (SalesTrend, Forecast, Category)
│   │   ├── components/         # Reusable UI (Navbar, Sidebar, StatCard, Modal, Badge)
│   │   ├── pages/              # Views (Dashboard, Products, Inventory, Sales, Purchases, Suppliers, Forecasting, Reports, Login)
│   │   ├── services/           # API communication client
│   │   ├── App.jsx             # Main routing and global state
│   │   ├── index.css           # Modern design system & styling
│   │   └── main.jsx            # React root entry point
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── server/                     # Backend Node.js / Express API
│   ├── config/
│   │   └── db.js               # MongoDB connection & auto-recovery
│   ├── controllers/            # Request handlers (Products, Sales, AI Forecasting, etc.)
│   ├── middleware/             # JWT authentication and error handling
│   ├── models/                 # Mongoose database models
│   ├── routes/                 # Express API routing endpoints
│   ├── scripts/
│   │   └── seed.js             # Rich demo database seeder
│   ├── .env                    # Environment configuration
│   ├── package.json
│   └── server.js               # Express application entry point
│
├── forecasting/                # Python AI & Machine Learning Module
│   ├── data_processing.py      # Cleaning, aggregation, and time feature extraction
│   ├── train_model.py          # Scikit-Learn regression pipelines (Linear, Ridge, RF)
│   ├── predict_demand.py       # Demand prediction CLI
│   ├── requirements.txt        # Python dependencies
│   └── README.md
│
├── .gitignore
└── README.md
```

---

## ⚙️ Quick Start & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local Community Server or MongoDB Atlas URI)
- Python 3 (Optional, for standalone Python forecasting scripts)

---

### Step 1: Start MongoDB
Ensure MongoDB is running locally on port 27017:
```bash
# On Windows (if installed as a service or executable):
mongod --dbpath "server/data/db"
```

---

### Step 2: Set Up Backend Server

```bash
cd server
npm install
```

Verify `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/stockwise
JWT_SECRET=stockwise_super_secret_jwt_key_2026_inventory_management
NODE_ENV=development
```

#### Seed the Database with Realistic Demo Data:
```bash
npm run seed
```
*This populates realistic suppliers, categories, products with varying inventory thresholds, and 85+ historical sales records spanning recent weeks to power the AI forecasting engine.*

#### Start the Server:
```bash
npm start
```
The API server will run at `http://localhost:5000`.

---

### Step 3: Set Up Frontend Client

In a separate terminal:
```bash
cd client
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

Alternatively, build the frontend for production:
```bash
cd client
npm run build
```
Once built, the Express backend serves both the API and the complete frontend UI directly at `http://localhost:5000`!

---

### Step 4: (Optional) Python Forecasting Setup

```bash
cd forecasting
pip install -r requirements.txt
python predict_demand.py
```

---

## 🔑 Demo Login Accounts

For quick evaluation and testing, you can use the **One-Click Evaluator Demo Access** buttons on the login screen, or sign in with:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@stockwise.com` | `admin123` |
| **Manager** | `manager@stockwise.com` | `manager123` |
| **Staff** | `staff@stockwise.com` | `staff123` |

---

## 📡 REST API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | System and database health status |
| `/api/auth/login` | POST | Authenticate user & get JWT |
| `/api/auth/demo` | POST | 1-Click quick demo session |
| `/api/dashboard/stats` | GET | Aggregated KPI metrics, sales trends & category distributions |
| `/api/products` | GET / POST | Catalog search, filtering, and product creation |
| `/api/products/:id` | GET / PUT / DELETE | Manage specific product details |
| `/api/products/alerts/low-stock` | GET | List low-stock and out-of-stock items |
| `/api/products/:id/adjust` | POST | Manual stock adjustments (Add / Deduct / Set) |
| `/api/sales` | GET / POST | View sales history & process POS sales transaction |
| `/api/sales/top-products` | GET | Top selling products by volume and revenue |
| `/api/purchases` | GET / POST | View POs and record inventory replenishment |
| `/api/suppliers` | GET / POST / PUT / DELETE | Manage vendors and contact information |
| `/api/forecasting/catalog-summary`| GET | Replenishment prioritization matrix for all products |
| `/api/forecasting/product/:id` | GET | Detailed time-series demand forecast for a single product |
| `/api/reports/sales` | GET | Filterable sales revenue report |
| `/api/reports/inventory` | GET | Inventory valuation and profit margin breakdown |
| `/api/reports/movement` | GET | High-velocity (fast) vs low-velocity (slow) moving items |

---

## 🔒 Security & Data Integrity

- **Password Hashing**: Bcrypt with cryptographic salt rounds.
- **JWT Authorization**: Bearer tokens protecting modifying routes (`POST`, `PUT`, `DELETE`).
- **Atomic Stock Checks**: Validates inventory quantities before completing sales to strictly prevent negative stock levels.
- **Threshold Integrity**: Automatic recalculation of `in_stock`, `low_stock`, and `out_of_stock` statuses upon every transaction or audit.

---

