import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Security Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_mani_g_app_change_in_env';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'kvn000';
// Default bcrypt hash for 'Bunny_016' (salt rounds = 12)
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '$2b$12$/yWLHw1NSRnst8YZLzVU0O0Blof2feJIuETFu.U0xIUFCqm8XstkO';
const TIMEZONE = process.env.TIMEZONE || 'Asia/Manila';

// 1. Security Headers via Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// 2. Rate Limiting Protection
// Brute-force protection for login: max 5 failed attempts per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again after 15 minutes.' }
});

// Order submission rate limiter: max 30 orders per 15 minutes per IP
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many order submissions. Please try again in a few minutes.' }
});

// Data Directory
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

// Default Settings
let settings = {
  spreadsheetId: process.env.GOOGLE_SHEET_ID || '1CpPaE3QFmyAuptF4z52vGtpF_YFuuH-EmEHmQXpS8yI',
  appsScriptUrl: process.env.APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxFqu_Z8ZNEFoQ79ejaospmqByaTvGcrWAmkc4njilYdSJK8kvEDSslJejBwUl9z7DS/exec',
  timezone: TIMEZONE,
  cutoff: {
    enabled: false,
    date: '2026-09-17',
    time: '23:59'
  }
};

if (fs.existsSync(SETTINGS_FILE)) {
  try {
    const loaded = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    settings = {
      ...settings,
      ...loaded,
      cutoff: {
        ...settings.cutoff,
        ...(loaded.cutoff || {})
      }
    };
  } catch (err) {
    console.error('Error reading settings.json:', err.message);
  }
}

const saveSettings = () => {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving settings.json:', err.message);
  }
};

// Orders Storage
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
  const dateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);

  const timeStr = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(date);

  return { dateStr, timeStr };
};

// Generate sequential Order ID: MANI-YYYYMMDD-001
const generateOrderId = (dateStr) => {
  const compactDate = dateStr.replace(/-/g, '');
  const prefix = `MANI-${compactDate}-`;
  const countToday = orders.filter(o => o.orderDate === dateStr).length + 1;
  const seq = String(countToday).padStart(3, '0');
  return `${prefix}${seq}`;
};

// Mobile Number Validation
const validatePhilippineMobile = (mobile) => {
  if (!mobile) return false;
  const cleaned = String(mobile).replace(/[\s\-()]/g, '');
  return /^(09\d{9}|\+639\d{9}|639\d{9})$/.test(cleaned);
};

const formatPhilippineMobile = (mobile) => {
  const cleaned = String(mobile).replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+63')) return '0' + cleaned.slice(3);
  if (cleaned.startsWith('63')) return '0' + cleaned.slice(2);
  return cleaned;
};

// -------------------------------------------------------------
// Cutoff Evaluation Engine
// -------------------------------------------------------------
const evaluateCutoff = () => {
  const cutoff = settings.cutoff || { enabled: false, date: '', time: '' };
  const now = new Date();
  const { dateStr, timeStr } = getPhilippineDateTime(now);

  if (!cutoff.enabled || !cutoff.date || !cutoff.time) {
    return {
      enabled: false,
      isOpen: true,
      status: 'OPEN',
      cutoffDate: cutoff.date || dateStr,
      cutoffTime: cutoff.time || '23:59',
      timezone: TIMEZONE,
      serverTime: now.toISOString(),
      currentPhilippineDate: dateStr,
      currentPhilippineTime: timeStr,
      remainingSeconds: null,
      cutoffIso: null
    };
  }

  // Construct standard ISO string in Asia/Manila (+08:00)
  const normalizedTime = cutoff.time.length === 5 ? `${cutoff.time}:00` : cutoff.time;
  const cutoffIso = `${cutoff.date}T${normalizedTime}+08:00`;
  const cutoffTimestamp = new Date(cutoffIso).getTime();
  const currentTimestamp = now.getTime();
  const diffSec = Math.floor((cutoffTimestamp - currentTimestamp) / 1000);

  const isOpen = diffSec > 0;
  const status = isOpen ? 'CUTOFF SCHEDULED' : 'CLOSED';

  return {
    enabled: true,
    isOpen,
    status,
    cutoffDate: cutoff.date,
    cutoffTime: cutoff.time,
    timezone: TIMEZONE,
    serverTime: now.toISOString(),
    currentPhilippineDate: dateStr,
    currentPhilippineTime: timeStr,
    remainingSeconds: Math.max(0, diffSec),
    cutoffIso
  };
};

// -------------------------------------------------------------
// Authentication Middleware & Handlers
// -------------------------------------------------------------
const requireAdminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication required.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded && decoded.username === ADMIN_USERNAME) {
      req.admin = decoded;
      return next();
    }
    return res.status(401).json({ error: 'Unauthorized: Invalid admin credentials.' });
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Admin session expired or invalid. Please log in again.' });
  }
};

// API: Admin Login
app.post('/api/admin/login', loginLimiter, (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  // Constant-time username match
  const isUsernameValid = username.trim() === ADMIN_USERNAME;

  // Compare password with bcrypt hash
  // Even if username doesn't match, run compare against a dummy hash to prevent timing attacks
  const hashToCompare = isUsernameValid ? ADMIN_PASSWORD_HASH : '$2b$12$DummyHashToPreventTimingAttacks1234567890123456789012';
  const isPasswordValid = bcrypt.compareSync(password, hashToCompare);

  if (!isUsernameValid || !isPasswordValid) {
    // Generic error message: do not reveal if username or password was wrong
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  // Sign JWT session token (valid for 4 hours)
  const token = jwt.sign(
    {
      username: ADMIN_USERNAME,
      role: 'admin'
    },
    JWT_SECRET,
    { expiresIn: '4h' }
  );

  res.json({
    success: true,
    token,
    user: { username: ADMIN_USERNAME },
    expiresIn: '4h',
    message: 'Admin login successful.'
  });
});

// API: Verify Admin Session
app.get('/api/admin/verify', requireAdminAuth, (req, res) => {
  res.json({
    authenticated: true,
    user: { username: req.admin.username },
    expiresAt: req.admin.exp
  });
});

// API: Admin Logout
app.post('/api/admin/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});

// -------------------------------------------------------------
// Cutoff APIs
// -------------------------------------------------------------

// Public Cutoff Status (used by customer form and timers)
app.get('/api/cutoff', (req, res) => {
  res.json(evaluateCutoff());
});

// Admin Cutoff Update (Protected)
app.post('/api/admin/cutoff', requireAdminAuth, (req, res) => {
  const { enabled, date, time } = req.body || {};

  if (enabled !== undefined) {
    settings.cutoff.enabled = Boolean(enabled);
  }

  if (date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date format. Expected YYYY-MM-DD.' });
    }
    settings.cutoff.date = date;
  }

  if (time) {
    if (!/^\d{2}:\d{2}(:\d{2})?$/.test(time)) {
      return res.status(400).json({ error: 'Invalid time format. Expected HH:MM.' });
    }
    settings.cutoff.time = time.slice(0, 5);
  }

  saveSettings();
  const updatedCutoff = evaluateCutoff();

  res.json({
    success: true,
    message: 'Cutoff settings updated successfully.',
    cutoff: updatedCutoff
  });
});

// -------------------------------------------------------------
// Public Health & Order APIs
// -------------------------------------------------------------

// Sanitized Health Check (Does NOT expose Google Sheet ID or backend credentials)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    time: getPhilippineDateTime(),
    cutoff: evaluateCutoff()
  });
});

// Public: Submit Order (Enforces Server-Side Cutoff + Validation)
app.post('/api/orders', orderLimiter, async (req, res) => {
  try {
    // 1. Authoritative Server-Side Cutoff Enforcement
    const cutoffStatus = evaluateCutoff();
    if (cutoffStatus.enabled && !cutoffStatus.isOpen) {
      return res.status(403).json({
        error: 'Orders are now closed. The cutoff time for accepting orders has ended.',
        code: 'ORDERS_CLOSED'
      });
    }

    const {
      customerName,
      mobileNumber,
      deliveryAddress,
      paymentMethod = 'Cash on Delivery',
      items = []
    } = req.body;

    // 2. Input Validation & Sanitization
    if (!customerName || typeof customerName !== 'string' || !customerName.trim()) {
      return res.status(400).json({ error: 'Customer Name is required.' });
    }

    if (!mobileNumber || !validatePhilippineMobile(mobileNumber)) {
      return res.status(400).json({
        error: 'Please enter a valid Philippine mobile number (e.g., 09171234567 or +639171234567).'
      });
    }

    if (!deliveryAddress || typeof deliveryAddress !== 'string' || !deliveryAddress.trim()) {
      return res.status(400).json({ error: 'Address / To Be Delivered To is required.' });
    }

    const validPaymentMethods = ['Cash on Delivery', 'Maribank', 'GCash'];
    const chosenPayment = validPaymentMethods.includes(paymentMethod) ? paymentMethod : 'Cash on Delivery';

    const totalPacks = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    if (totalPacks <= 0) {
      return res.status(400).json({ error: 'Please select at least one Mani flavor.' });
    }

    const subtotal = items.reduce((sum, item) => sum + ((Number(item.quantity) || 0) * (Number(item.price) || 50)), 0);

    // 3. Generate Philippine Date & Order ID
    const { dateStr, timeStr } = getPhilippineDateTime();
    const orderId = generateOrderId(dateStr);

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
      customerName: customerName.trim().slice(0, 100),
      mobileNumber: formatPhilippineMobile(mobileNumber),
      deliveryAddress: deliveryAddress.trim().slice(0, 300),
      paymentMethod: chosenPayment,
      paymentStatus: 'Unpaid',
      items,
      flavorQuantities: flavorQtyMap,
      totalPacks,
      subtotal,
      status: 'New',
      createdAt: new Date().toISOString(),
      syncedToGoogleSheets: false
    };

    // 4. Forward to Google Apps Script Web App internally (if configured)
    let syncError = null;
    if (settings.appsScriptUrl) {
      try {
        const gasResponse = await fetch(settings.appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'addOrder',
            spreadsheetId: settings.spreadsheetId,
            order: newOrder
          }),
          redirect: 'follow'
        });

        const gasData = await gasResponse.json();
        if (gasData && gasData.success) {
          newOrder.syncedToGoogleSheets = true;
        } else {
          syncError = gasData ? gasData.error : 'Failed to receive success from Google Apps Script';
        }
      } catch (err) {
        console.error('Google Apps Script forward error:', err.message);
        syncError = err.message;
      }
    }

    orders.unshift(newOrder);
    saveOrders();

    res.status(201).json({
      success: true,
      order: newOrder,
      message: `Order #${orderId} successfully placed!`
    });

  } catch (error) {
    console.error('Order submission error:', error.message);
    res.status(500).json({ error: 'Unable to submit your order. Please try again.' });
  }
});

// -------------------------------------------------------------
// Protected Admin APIs
// -------------------------------------------------------------

// API: Get Orders (Protected)
app.get('/api/orders', requireAdminAuth, (req, res) => {
  const { date, status } = req.query;
  let filtered = [...orders];

  if (date) {
    filtered = filtered.filter(o => o.orderDate === date);
  }

  if (status && status !== 'all') {
    filtered = filtered.filter(o => o.status.toLowerCase() === status.toLowerCase());
  }

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
    cod: dayOrders.filter(o => (o.paymentMethod || '').toLowerCase().includes('cash')).length,
    gcash: dayOrders.filter(o => (o.paymentMethod || '').toLowerCase().includes('gcash')).length,
    maribank: dayOrders.filter(o => (o.paymentMethod || '').toLowerCase().includes('maribank')).length,
    paid: dayOrders.filter(o => (o.paymentStatus || '').toLowerCase() === 'paid').length,
    unpaid: dayOrders.filter(o => (o.paymentStatus || '').toLowerCase() !== 'paid').length
  };

  res.json({
    orders: filtered,
    totalCount: orders.length,
    dailySummary,
    todayDate: todayDateStr
  });
});

// API: Update Order Status (Protected)
app.patch('/api/orders/:id/status', requireAdminAuth, async (req, res) => {
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

  if (settings.appsScriptUrl) {
    try {
      fetch(settings.appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
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

// API: Update Payment Status (Protected)
app.patch('/api/orders/:id/payment-status', requireAdminAuth, async (req, res) => {
  const { id } = req.params;
  const { paymentStatus } = req.body;

  const validPaymentStatuses = ['Paid', 'Unpaid'];
  if (!validPaymentStatuses.includes(paymentStatus)) {
    return res.status(400).json({ error: `Invalid paymentStatus. Must be one of: ${validPaymentStatuses.join(', ')}` });
  }

  const orderIndex = orders.findIndex(o => o.id === id || o.orderId === id);
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  orders[orderIndex].paymentStatus = paymentStatus;
  orders[orderIndex].updatedAt = new Date().toISOString();
  saveOrders();

  if (settings.appsScriptUrl) {
    try {
      fetch(settings.appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'updatePaymentStatus',
          spreadsheetId: settings.spreadsheetId,
          orderId: orders[orderIndex].orderId,
          orderDate: orders[orderIndex].orderDate,
          paymentStatus
        }),
        redirect: 'follow'
      }).catch(err => console.error('Payment status sync to GAS failed:', err.message));
    } catch (e) {}
  }

  res.json({ success: true, order: orders[orderIndex] });
});

// API: Get Settings (Protected)
app.get('/api/settings', requireAdminAuth, (req, res) => {
  res.json({
    spreadsheetId: settings.spreadsheetId,
    appsScriptUrl: settings.appsScriptUrl,
    timezone: settings.timezone,
    cutoff: evaluateCutoff()
  });
});

// API: Update Settings (Protected)
app.post('/api/settings', requireAdminAuth, (req, res) => {
  const { appsScriptUrl, spreadsheetId } = req.body;
  if (appsScriptUrl !== undefined) settings.appsScriptUrl = appsScriptUrl.trim();
  if (spreadsheetId !== undefined) settings.spreadsheetId = spreadsheetId.trim();
  saveSettings();
  res.json({ success: true, settings });
});

// Products API
let products = null;
if (fs.existsSync(PRODUCTS_FILE)) {
  try {
    products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
  } catch (e) {}
}

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.put('/api/products', requireAdminAuth, (req, res) => {
  const updatedProducts = req.body;
  if (!Array.isArray(updatedProducts)) {
    return res.status(400).json({ error: 'Products must be an array.' });
  }
  products = updatedProducts;
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf8');
  res.json({ success: true, products });
});

// Global Error Handler (Hides internal stack traces)
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.message);
  res.status(500).json({ error: 'Internal Server Error.' });
});

app.listen(PORT, () => {
  console.log(`🥜 MANI G? Secure Orders Server running on port ${PORT}`);
  console.log(`Timezone: ${TIMEZONE}`);
  console.log(`Admin user: ${ADMIN_USERNAME}`);
});
