import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Google Sheet Configuration
const DEFAULT_SPREADSHEET_ID = '1CpPaE3QFmyAuptF4z52vGtpF_YFuuH-EmEHmQXpS8yI';
const DATA_DIR = path.join(__dirname, 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

// Initialize settings
let settings = {
  spreadsheetId: DEFAULT_SPREADSHEET_ID,
  appsScriptUrl: process.env.APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxFqu_Z8ZNEFoQ79ejaospmqByaTvGcrWAmkc4njilYdSJK8kvEDSslJejBwUl9z7DS/exec',
  timezone: 'Asia/Manila'
};

if (fs.existsSync(SETTINGS_FILE)) {
  try {
    settings = { ...settings, ...JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8')) };
  } catch (err) {
    console.error('Error reading settings.json:', err.message);
  }
}

// Helper to save settings
const saveSettings = () => {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving settings.json:', err.message);
  }
};

// Initial Orders Storage
let orders = [];
if (fs.existsSync(ORDERS_FILE)) {
  try {
    orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
  } catch (err) {
    console.error('Error reading orders.json:', err.message);
  }
}

const saveOrders = () => {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving orders.json:', err.message);
  }
};

// Philippine Time Helpers (Asia/Manila)
const getPhilippineDateTime = (date = new Date()) => {
  // Format YYYY-MM-DD in Asia/Manila
  const dateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date); // e.g. "2026-09-16"

  const timeStr = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(date); // e.g. "02:45:00 PM"

  return { dateStr, timeStr };
};

// Generate sequential Order ID: MANI-YYYYMMDD-001
const generateOrderId = (dateStr) => {
  const compactDate = dateStr.replace(/-/g, ''); // "20260916"
  const prefix = `MANI-${compactDate}-`;
  
  // Count how many orders exist for this date
  const countToday = orders.filter(o => o.orderDate === dateStr).length + 1;
  const seq = String(countToday).padStart(3, '0');
  return `${prefix}${seq}`;
};

// Philippine Mobile Validation
const validatePhilippineMobile = (mobile) => {
  if (!mobile) return false;
  const cleaned = mobile.replace(/[\s\-()]/g, '');
  // Format: 09XXXXXXXXX (11 digits) or +639XXXXXXXXX (13 digits) or 639XXXXXXXXX (12 digits)
  return /^(09\d{9}|\+639\d{9}|639\d{9})$/.test(cleaned);
};

// Format mobile for display/storage
const formatPhilippineMobile = (mobile) => {
  const cleaned = mobile.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+63')) {
    return '0' + cleaned.slice(3);
  }
  if (cleaned.startsWith('63')) {
    return '0' + cleaned.slice(2);
  }
  return cleaned;
};

// API: Health & Settings
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    time: getPhilippineDateTime(),
    spreadsheetId: settings.spreadsheetId,
    appsScriptConnected: Boolean(settings.appsScriptUrl)
  });
});

app.get('/api/settings', (req, res) => {
  res.json(settings);
});

app.post('/api/settings', (req, res) => {
  const { appsScriptUrl, spreadsheetId } = req.body;
  if (appsScriptUrl !== undefined) settings.appsScriptUrl = appsScriptUrl.trim();
  if (spreadsheetId !== undefined) settings.spreadsheetId = spreadsheetId.trim();
  saveSettings();
  res.json({ success: true, settings });
});

// API: Submit Order
app.post('/api/orders', async (req, res) => {
  try {
    const {
      customerName,
      mobileNumber,
      deliveryAddress,
      paymentMethod = 'Cash on Delivery',
      items = []
    } = req.body;

    // 1. Validation
    if (!customerName || !customerName.trim()) {
      return res.status(400).json({ error: 'Customer Name is required.' });
    }

    if (!mobileNumber || !validatePhilippineMobile(mobileNumber)) {
      return res.status(400).json({ 
        error: 'Please enter a valid Philippine mobile number (e.g., 09171234567 or +639171234567).' 
      });
    }

    if (!deliveryAddress || !deliveryAddress.trim()) {
      return res.status(400).json({ error: 'Address / To Be Delivered To is required.' });
    }

    const validPaymentMethods = ['Cash on Delivery', 'Maribank', 'GCash'];
    const chosenPayment = validPaymentMethods.includes(paymentMethod) ? paymentMethod : 'Cash on Delivery';

    // Check items
    const totalPacks = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

    if (totalPacks <= 0) {
      return res.status(400).json({ error: 'Please select at least one Mani flavor.' });
    }

    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => sum + ((Number(item.quantity) || 0) * (Number(item.price) || 50)), 0);

    // 2. Generate Philippine Date & Order ID
    const { dateStr, timeStr } = getPhilippineDateTime();
    const orderId = generateOrderId(dateStr);

    // Breakdown for columns
    const flavorQtyMap = {
      salted: 0,
      unsalted: 0,
      spicy: 0,
      bbq: 0,
      'sour-cream': 0,
      'bawang-only': 0
    };

    items.forEach(item => {
      const key = item.productId || item.id;
      if (flavorQtyMap[key] !== undefined) {
        flavorQtyMap[key] += Number(item.quantity) || 0;
      }
    });

    const newOrder = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      orderId,
      orderDate: dateStr,
      orderTime: timeStr,
      customerName: customerName.trim(),
      mobileNumber: formatPhilippineMobile(mobileNumber),
      deliveryAddress: deliveryAddress.trim(),
      paymentMethod: chosenPayment,
      items,
      flavorQuantities: flavorQtyMap,
      totalPacks,
      subtotal,
      status: 'New',
      createdAt: new Date().toISOString(),
      syncedToGoogleSheets: false
    };

    // 3. Forward to Google Apps Script Web App if configured
    let appsScriptResult = null;
    let syncError = null;

    if (settings.appsScriptUrl) {
      try {
        console.log(`Forwarding order ${orderId} to Google Apps Script: ${settings.appsScriptUrl}`);
        const gasResponse = await fetch(settings.appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'addOrder',
            spreadsheetId: settings.spreadsheetId,
            order: newOrder
          }),
          // Redirect follow is required for Google Apps Script Web App
          redirect: 'follow'
        });

        const gasData = await gasResponse.json();
        if (gasData && gasData.success) {
          newOrder.syncedToGoogleSheets = true;
          appsScriptResult = gasData;
        } else {
          syncError = gasData ? gasData.error : 'Failed to receive success from Google Apps Script';
        }
      } catch (err) {
        console.error('Google Apps Script forward error:', err.message);
        syncError = err.message;
      }
    }

    // Save locally
    orders.unshift(newOrder);
    saveOrders();

    res.status(201).json({
      success: true,
      order: newOrder,
      syncedToGoogleSheets: newOrder.syncedToGoogleSheets,
      syncError,
      message: newOrder.syncedToGoogleSheets 
        ? `Order #${orderId} successfully recorded and synced to Google Sheets (${dateStr} tab)!`
        : `Order #${orderId} successfully recorded!`
    });

  } catch (error) {
    console.error('Order submission error:', error);
    res.status(500).json({ error: 'Unable to submit your order. Please try again.' });
  }
});

// API: Get Orders (with optional date & status filters)
app.get('/api/orders', (req, res) => {
  const { date, status } = req.query;
  let filtered = [...orders];

  if (date) {
    filtered = filtered.filter(o => o.orderDate === date);
  }

  if (status) {
    filtered = filtered.filter(o => o.status.toLowerCase() === status.toLowerCase());
  }

  // Calculate daily summaries for the selected date or overall
  const todayDateStr = getPhilippineDateTime().dateStr;
  const activeDate = date || todayDateStr;
  const dayOrders = orders.filter(o => o.orderDate === activeDate && o.status !== 'Cancelled');

  const dailySummary = {
    date: activeDate,
    totalOrders: dayOrders.length,
    totalPacks: dayOrders.reduce((sum, o) => sum + (o.totalPacks || 0), 0),
    totalSales: dayOrders.reduce((sum, o) => sum + (o.subtotal || 0), 0),
    salted: dayOrders.reduce((sum, o) => sum + (o.flavorQuantities?.salted || 0), 0),
    unsalted: dayOrders.reduce((sum, o) => sum + (o.flavorQuantities?.unsalted || 0), 0),
    spicy: dayOrders.reduce((sum, o) => sum + (o.flavorQuantities?.spicy || 0), 0),
    bbq: dayOrders.reduce((sum, o) => sum + (o.flavorQuantities?.bbq || 0), 0),
    sourCream: dayOrders.reduce((sum, o) => sum + (o.flavorQuantities?.['sour-cream'] || 0), 0),
    bawangOnly: dayOrders.reduce((sum, o) => sum + (o.flavorQuantities?.['bawang-only'] || 0), 0),
    specialOrder: dayOrders.reduce((sum, o) => sum + (o.specialOrderQty || 0), 0),
    pickup: dayOrders.filter(o => o.orderType === 'Pickup').length,
    delivery: dayOrders.filter(o => o.orderType === 'Delivery').length,
  };

  res.json({
    orders: filtered,
    totalCount: orders.length,
    dailySummary,
    todayDate: todayDateStr
  });
});

// API: Update Order Status
app.patch('/api/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['New', 'Confirmed', 'Preparing', 'Ready', 'Completed', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  const orderIndex = orders.findIndex(o => o.id === id || o.orderId === id);
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  orders[orderIndex].status = status;
  orders[orderIndex].updatedAt = new Date().toISOString();
  saveOrders();

  // If Google Apps Script is configured, update status on Google Sheet
  if (settings.appsScriptUrl) {
    try {
      fetch(settings.appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateStatus',
          spreadsheetId: settings.spreadsheetId,
          orderId: orders[orderIndex].orderId,
          orderDate: orders[orderIndex].orderDate,
          status
        }),
        redirect: 'follow'
      }).catch(err => console.error('Status sync to GAS failed:', err.message));
    } catch (e) {}
  }

  res.json({ success: true, order: orders[orderIndex] });
});

// API: Products Catalog
let products = null;
if (fs.existsSync(PRODUCTS_FILE)) {
  try {
    products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
  } catch (e) {}
}

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.put('/api/products', (req, res) => {
  const updatedProducts = req.body;
  if (!Array.isArray(updatedProducts)) {
    return res.status(400).json({ error: 'Products must be an array.' });
  }
  products = updatedProducts;
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf8');
  res.json({ success: true, products });
});

app.listen(PORT, () => {
  console.log(`🥜 MANI G? Orders Server running on port ${PORT}`);
  console.log(`Connected Google Sheet: ${settings.spreadsheetId}`);
  if (settings.appsScriptUrl) {
    console.log(`Google Apps Script Web App configured: ${settings.appsScriptUrl}`);
  } else {
    console.log(`Google Apps Script Web App URL not set yet (configured in Admin Portal or APPS_SCRIPT_URL)`);
  }
});
