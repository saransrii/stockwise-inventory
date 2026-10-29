const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config({ path: __dirname + '/../.env' });

const User = require('../models/User');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const Category = require('../models/Category');
const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stockwise';
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to MongoDB. Starting database seeding...');

    // Clean existing collections
    await User.deleteMany();
    await Product.deleteMany();
    await Supplier.deleteMany();
    await Category.deleteMany();
    await Sale.deleteMany();
    await Purchase.deleteMany();

    // 1. Seed Users
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const managerPassword = await bcrypt.hash('manager123', salt);
    const staffPassword = await bcrypt.hash('staff123', salt);

    const users = await User.insertMany([
      {
        name: 'Alex Rivera (Admin)',
        email: 'admin@stockwise.com',
        password: adminPassword,
        role: 'admin',
        phone: '+1 555-0101',
      },
      {
        name: 'Sarah Chen (Manager)',
        email: 'manager@stockwise.com',
        password: managerPassword,
        role: 'manager',
        phone: '+1 555-0102',
      },
      {
        name: 'David Miller (Staff)',
        email: 'staff@stockwise.com',
        password: staffPassword,
        role: 'staff',
        phone: '+1 555-0103',
      },
    ]);
    console.log(`✓ Seeded ${users.length} users.`);

    // 2. Seed Categories
    const categories = await Category.insertMany([
      { name: 'Electronics', description: 'Gadgets, peripherals and computing accessories', color: '#3b82f6' },
      { name: 'Office Supplies', description: 'Desk essentials, notebooks and organizational gear', color: '#10b981' },
      { name: 'Hardware', description: 'Tools, adapters, mounts and durable hardware', color: '#f59e0b' },
      { name: 'Stationery', description: 'Writing instruments, paper, folders and cards', color: '#8b5cf6' },
      { name: 'Accessories', description: 'Bags, sleeves, stands and cables', color: '#ec4899' },
    ]);
    console.log(`✓ Seeded ${categories.length} categories.`);

    // 3. Seed Suppliers
    const suppliers = await Supplier.insertMany([
      {
        name: 'Apex Global Electronics',
        contactPerson: 'Marcus Vance',
        email: 'contact@apexelectronics.com',
        phone: '+1 (555) 234-5678',
        address: { street: '100 Silicon Way', city: 'San Jose', state: 'CA', postalCode: '95134', country: 'USA' },
        paymentTerms: 'Net 30',
        status: 'active',
      },
      {
        name: 'Summit Paper & Stationery Co.',
        contactPerson: 'Elena Rostova',
        email: 'sales@summitstationery.com',
        phone: '+1 (555) 876-5432',
        address: { street: '45 Industrial Pkwy', city: 'Portland', state: 'OR', postalCode: '97201', country: 'USA' },
        paymentTerms: 'Net 15',
        status: 'active',
      },
      {
        name: 'Prime Tech Hardware Corp',
        contactPerson: 'Nathan Drake',
        email: 'orders@primetechware.com',
        phone: '+1 (555) 345-6789',
        address: { street: '78 Austin Tech Ridge', city: 'Austin', state: 'TX', postalCode: '78758', country: 'USA' },
        paymentTerms: 'Net 45',
        status: 'active',
      },
      {
        name: 'Horizon Craft & Packaging',
        contactPerson: 'Claire Bennett',
        email: 'info@horizonpack.com',
        phone: '+1 (555) 456-7890',
        address: { street: '22 Harbor Drive', city: 'Seattle', state: 'WA', postalCode: '98101', country: 'USA' },
        paymentTerms: 'Due on Receipt',
        status: 'active',
      },
    ]);
    console.log(`✓ Seeded ${suppliers.length} suppliers.`);

    // 4. Seed Products
    const productsData = [
      {
        name: 'Wireless Ergonomic Mouse',
        sku: 'ELEC-WEM-001',
        category: 'Electronics',
        description: '2.4GHz wireless rechargeable ergonomic mouse with silent clicks.',
        costPrice: 18.5,
        sellingPrice: 34.99,
        quantity: 45,
        reorderLevel: 15,
        unit: 'pcs',
        barcode: '890123450001',
        supplier: suppliers[0]._id,
        supplierName: suppliers[0].name,
        status: 'in_stock',
      },
      {
        name: 'Mechanical Gaming Keyboard RGB',
        sku: 'ELEC-KB-002',
        category: 'Electronics',
        description: 'Tenkeyless tactile mechanical keyboard with programmable RGB.',
        costPrice: 42.0,
        sellingPrice: 79.99,
        quantity: 28,
        reorderLevel: 10,
        unit: 'pcs',
        barcode: '890123450002',
        supplier: suppliers[0]._id,
        supplierName: suppliers[0].name,
        status: 'in_stock',
      },
      {
        name: 'USB-C Multi-Port Hub 7-in-1',
        sku: 'ELEC-HUB-003',
        category: 'Electronics',
        description: 'Aluminum USB-C hub with 4K HDMI, 100W PD charging and SD slot.',
        costPrice: 22.0,
        sellingPrice: 44.99,
        quantity: 5, // LOW STOCK for alert demo!
        reorderLevel: 12,
        unit: 'pcs',
        barcode: '890123450003',
        supplier: suppliers[0]._id,
        supplierName: suppliers[0].name,
        status: 'low_stock',
      },
      {
        name: 'Active Noise Canceling Headphones',
        sku: 'ELEC-ANC-004',
        category: 'Electronics',
        description: 'Over-ear Bluetooth 5.3 ANC headphones with 40hr battery life.',
        costPrice: 65.0,
        sellingPrice: 129.99,
        quantity: 18,
        reorderLevel: 8,
        unit: 'pcs',
        barcode: '890123450004',
        supplier: suppliers[0]._id,
        supplierName: suppliers[0].name,
        status: 'in_stock',
      },
      {
        name: 'Executive Hardcover Journal A5',
        sku: 'STAT-JRN-101',
        category: 'Stationery',
        description: '192 numbered archival pages, 120gsm bleeding-resistant ivory paper.',
        costPrice: 4.8,
        sellingPrice: 14.5,
        quantity: 85,
        reorderLevel: 25,
        unit: 'pcs',
        barcode: '890123450101',
        supplier: suppliers[1]._id,
        supplierName: suppliers[1].name,
        status: 'in_stock',
      },
      {
        name: 'Gel Ink Pen Set (Pack of 12)',
        sku: 'STAT-PEN-102',
        category: 'Stationery',
        description: '0.5mm ultra fine smooth quick-drying black and blue gel pens.',
        costPrice: 3.5,
        sellingPrice: 9.99,
        quantity: 110,
        reorderLevel: 30,
        unit: 'packs',
        barcode: '890123450102',
        supplier: suppliers[1]._id,
        supplierName: suppliers[1].name,
        status: 'in_stock',
      },
      {
        name: 'Self-Adhesive Sticky Notes (500 Sheets)',
        sku: 'OFF-NOT-201',
        category: 'Office Supplies',
        description: 'Pastel colored 3x3 inch sticky notes for reminders and indexing.',
        costPrice: 2.1,
        sellingPrice: 6.5,
        quantity: 4, // LOW STOCK
        reorderLevel: 20,
        unit: 'packs',
        barcode: '890123450201',
        supplier: suppliers[1]._id,
        supplierName: suppliers[1].name,
        status: 'low_stock',
      },
      {
        name: 'Adjustable Aluminum Laptop Stand',
        sku: 'ACC-LST-301',
        category: 'Accessories',
        description: 'Foldable ergonomic laptop riser with heat dissipation vents.',
        costPrice: 14.0,
        sellingPrice: 29.99,
        quantity: 32,
        reorderLevel: 10,
        unit: 'pcs',
        barcode: '890123450301',
        supplier: suppliers[2]._id,
        supplierName: suppliers[2].name,
        status: 'in_stock',
      },
      {
        name: 'High-Speed HDMI 2.1 Cable 2M',
        sku: 'HDW-CBL-401',
        category: 'Hardware',
        description: 'Braided 48Gbps 8K@60Hz and 4K@120Hz certified cable.',
        costPrice: 5.2,
        sellingPrice: 12.99,
        quantity: 0, // OUT OF STOCK for critical alert demo!
        reorderLevel: 15,
        unit: 'pcs',
        barcode: '890123450401',
        supplier: suppliers[2]._id,
        supplierName: suppliers[2].name,
        status: 'out_of_stock',
      },
      {
        name: 'Heavy Duty Metal Desktop Stapler',
        sku: 'OFF-STP-202',
        category: 'Office Supplies',
        description: 'Jam-free 50-sheet capacity desktop stapler with staples box.',
        costPrice: 6.8,
        sellingPrice: 16.99,
        quantity: 22,
        reorderLevel: 8,
        unit: 'pcs',
        barcode: '890123450202',
        supplier: suppliers[1]._id,
        supplierName: suppliers[1].name,
        status: 'in_stock',
      },
      {
        name: '1080P Full HD Streaming Webcam',
        sku: 'ELEC-CAM-005',
        category: 'Electronics',
        description: 'Wide angle webcam with dual noise-canceling stereo mics.',
        costPrice: 28.0,
        sellingPrice: 59.99,
        quantity: 14,
        reorderLevel: 8,
        unit: 'pcs',
        barcode: '890123450005',
        supplier: suppliers[0]._id,
        supplierName: suppliers[0].name,
        status: 'in_stock',
      },
      {
        name: 'Waterproof Laptop Sleeve 15.6 Inch',
        sku: 'ACC-SLV-302',
        category: 'Accessories',
        description: 'Shockproof protective neoprene sleeve with accessory pocket.',
        costPrice: 8.5,
        sellingPrice: 19.99,
        quantity: 40,
        reorderLevel: 12,
        unit: 'pcs',
        barcode: '890123450302',
        supplier: suppliers[3]._id,
        supplierName: suppliers[3].name,
        status: 'in_stock',
      },
    ];

    const products = await Product.insertMany(productsData);
    console.log(`✓ Seeded ${products.length} products.`);

    // 5. Seed Purchases (Recent Stock Inflow)
    const purchasesData = [
      {
        purchaseOrderNumber: 'PO-202610-0001',
        supplier: suppliers[0]._id,
        supplierName: suppliers[0].name,
        items: [
          {
            product: products[0]._id,
            name: products[0].name,
            sku: products[0].sku,
            quantity: 50,
            unitCost: 18.5,
            subtotal: 925.0,
          },
          {
            product: products[1]._id,
            name: products[1].name,
            sku: products[1].sku,
            quantity: 30,
            unitCost: 42.0,
            subtotal: 1260.0,
          },
        ],
        totalCost: 2185.0,
        status: 'received',
        paymentStatus: 'paid',
        purchaseDate: new Date(Date.now() - 40 * 86400000),
      },
      {
        purchaseOrderNumber: 'PO-202610-0002',
        supplier: suppliers[1]._id,
        supplierName: suppliers[1].name,
        items: [
          {
            product: products[4]._id,
            name: products[4].name,
            sku: products[4].sku,
            quantity: 100,
            unitCost: 4.8,
            subtotal: 480.0,
          },
          {
            product: products[5]._id,
            name: products[5].name,
            sku: products[5].sku,
            quantity: 150,
            unitCost: 3.5,
            subtotal: 525.0,
          },
        ],
        totalCost: 1005.0,
        status: 'received',
        paymentStatus: 'paid',
        purchaseDate: new Date(Date.now() - 25 * 86400000),
      },
      {
        purchaseOrderNumber: 'PO-202610-0003',
        supplier: suppliers[2]._id,
        supplierName: suppliers[2].name,
        items: [
          {
            product: products[7]._id,
            name: products[7].name,
            sku: products[7].sku,
            quantity: 40,
            unitCost: 14.0,
            subtotal: 560.0,
          },
        ],
        totalCost: 560.0,
        status: 'received',
        paymentStatus: 'paid',
        purchaseDate: new Date(Date.now() - 10 * 86400000),
      },
    ];

    const purchases = await Purchase.insertMany(purchasesData);
    console.log(`✓ Seeded ${purchases.length} purchases.`);

    // 6. Seed Realistic Historical Sales Transactions
    // Spanning the last 60 days to give the AI forecasting module real time-series patterns!
    const salesData = [];
    const customerNames = [
      'David K.', 'Acme Studios', 'Emily Watson', 'Apex Labs', 'TechNova Corp',
      'Jessica Alba', 'Oliver Smith', 'Blueberry Co.', 'Michael Scott', 'Rachel Green',
      'Quantum Innovations', 'Sophia Taylor', 'Horizon Dynamics', 'Lucas Vance'
    ];
    const paymentOptions = ['card', 'cash', 'upi', 'bank_transfer'];

    let invoiceCounter = 1001;

    // Distribute sales over the last 45 days
    for (let dayOffset = 45; dayOffset >= 0; dayOffset--) {
      // 1 to 3 sales per day
      const salesCountToday = Math.floor(Math.random() * 3) + 1;

      for (let s = 0; s < salesCountToday; s++) {
        const saleDate = new Date();
        saleDate.setDate(saleDate.getDate() - dayOffset);
        saleDate.setHours(9 + Math.floor(Math.random() * 9), Math.floor(Math.random() * 60));

        // Randomly select 1 to 3 products
        const numItems = Math.floor(Math.random() * 2) + 1;
        const saleItems = [];
        let subtotal = 0;

        for (let i = 0; i < numItems; i++) {
          // Weighted product selection
          const pIndex = Math.floor(Math.random() * products.length);
          const p = products[pIndex];
          const qty = Math.floor(Math.random() * 3) + 1;
          const itemTotal = Number((p.sellingPrice * qty).toFixed(2));
          subtotal += itemTotal;

          saleItems.push({
            product: p._id,
            name: p.name,
            sku: p.sku,
            quantity: qty,
            unitPrice: p.sellingPrice,
            subtotal: itemTotal,
          });
        }

        const tax = Number((subtotal * 0.05).toFixed(2));
        const discount = Math.random() > 0.7 ? 5 : 0;
        const totalAmount = Number((subtotal + tax - discount).toFixed(2));

        salesData.push({
          invoiceNumber: `INV-2026-${invoiceCounter++}`,
          customerName: customerNames[Math.floor(Math.random() * customerNames.length)],
          customerPhone: '+1 555-' + Math.floor(1000 + Math.random() * 9000),
          items: saleItems,
          subtotal,
          tax,
          discount,
          totalAmount,
          paymentMethod: paymentOptions[Math.floor(Math.random() * paymentOptions.length)],
          status: 'completed',
          saleDate,
          recordedBy: users[0]._id,
        });
      }
    }

    const sales = await Sale.insertMany(salesData);
    console.log(`✓ Seeded ${sales.length} historical sales records for AI demand forecasting and analytics.`);

    console.log('✅ StockWise database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();
