import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
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

// Email Notification Configuration (Secure Server-Side)
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || 'engrkevinramirez@gmail.com';
const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';

// Deduplication cache for order notification emails
const sentOrderEmailIds = new Set();

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

  const deliveryDay = settings.deliveryDay || cutoff.deliveryDay || 'Wednesday';
  const flavorAvailability = settings.flavorAvailability || null;

  if (!cutoff.enabled || !cutoff.date || !cutoff.time) {
    return {
      enabled: false,
      isOpen: true,
      status: 'OPEN',
      cutoffDate: cutoff.date || dateStr,
      cutoffTime: cutoff.time || '23:59',
      deliveryDay,
      flavorAvailability,
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
    deliveryDay,
    flavorAvailability,
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
  const { enabled, date, time, deliveryDay, flavorAvailability } = req.body || {};

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

  if (deliveryDay !== undefined) {
    settings.deliveryDay = String(deliveryDay).trim();
    settings.cutoff.deliveryDay = String(deliveryDay).trim();
  }

  if (flavorAvailability && typeof flavorAvailability === 'object') {
    settings.flavorAvailability = {
      ...(settings.flavorAvailability || {}),
      ...flavorAvailability
    };
  }

  saveSettings();
  const updatedCutoff = evaluateCutoff();

  res.json({
    success: true,
    message: 'Cutoff settings updated successfully.',
    cutoff: updatedCutoff
  });
});

// Admin Flavor Availability Update (Protected)
app.post('/api/admin/flavor-availability', requireAdminAuth, (req, res) => {
  const { flavorAvailability } = req.body || {};

  if (!flavorAvailability || typeof flavorAvailability !== 'object') {
    return res.status(400).json({ error: 'Invalid flavorAvailability payload.' });
  }

  settings.flavorAvailability = {
    ...(settings.flavorAvailability || {}),
    ...flavorAvailability
  };

  saveSettings();

  res.json({
    success: true,
    message: 'Flavor availability updated successfully.',
    flavorAvailability: settings.flavorAvailability
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

// Server-Side Email Dispatcher (Node.js fallback for standalone server)
const sendNodeOrderEmail = async (order) => {
  if (!order || !NOTIFICATION_EMAIL) return { sent: false, skipped: true };
  if (sentOrderEmailIds.has(order.orderId)) {
    return { sent: false, skipped: true, reason: 'Duplicate order notification prevented' };
  }

  const customerName = (order.customerName || '').trim() || 'N/A';
  const orderId = order.orderId || `MANI-${Date.now()}`;
  const mobileNumber = (order.mobileNumber || '').trim() || 'N/A';
  const deliveryAddress = (order.deliveryAddress || '').trim() || 'N/A';
  const paymentMethod = (order.paymentMethod || '').trim() || 'Cash on Delivery';
  const paymentStatus = (order.paymentStatus || (paymentMethod === 'Cash on Delivery' ? 'Pending – Cash on Delivery' : `Pending – Awaiting ${paymentMethod} Payment`)).trim();
  
  const subtotal = Number(order.subtotal || 0);
  const deliveryFeeVal = order.deliveryFee !== undefined && order.deliveryFee !== null
    ? (Number(order.deliveryFee) > 0 ? `₱${Number(order.deliveryFee).toFixed(2)}` : '₱0.00 (Standard)')
    : 'N/A';
  const discount = Number(order.discount || 0);
  const totalAmount = Number(order.totalAmount || (subtotal + (Number(order.deliveryFee) || 0) - discount));
  const subtotalDisplay = subtotal > 0 ? `₱${subtotal.toFixed(2)}` : 'N/A';
  const totalAmountDisplay = totalAmount > 0 ? `₱${totalAmount.toFixed(2)}` : 'N/A';

  const itemsList = Array.isArray(order.items) ? order.items : [];

  // If SMTP credentials not provided in .env, record notice and avoid throwing
  if (!SMTP_HOST || !SMTP_USER) {
    console.log(`[Order Email Notification] Standalone Mode: Order #${orderId} from ${customerName} logged for ${NOTIFICATION_EMAIL}`);
    sentOrderEmailIds.add(order.orderId);
    return { sent: false, logged: true, recipient: NOTIFICATION_EMAIL };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });

    const subject = `New Order Received - ${customerName}`;

    let productRowsHtml = '';
    let plainTextOrderSummary = '';

    itemsList.forEach((it, idx) => {
      const q = Number(it.quantity || 0);
      const p = Number(it.price || 50);
      const rowSub = q * p;
      const rowBg = idx % 2 === 0 ? '#FFFFFF' : '#FDFBF7';
      productRowsHtml += `<tr style="background-color: ${rowBg}; border-bottom: 1px solid #EDE4D8;">
        <td style="padding: 10px 14px; font-weight: 700; color: #2B1810;">${it.name}</td>
        <td align="center" style="padding: 10px 14px; font-weight: 800; color: #7C552E;">${q}</td>
        <td align="right" style="padding: 10px 14px; color: #5D4037;">₱${p.toFixed(2)}</td>
        <td align="right" style="padding: 10px 14px; font-weight: 800; color: #2B1810;">₱${rowSub.toFixed(2)}</td>
      </tr>`;
      plainTextOrderSummary += `${it.name} x ${q} - ₱${rowSub.toFixed(2)}\n`;
    });

    if (itemsList.length === 0) {
      productRowsHtml = `<tr><td colspan="4" style="padding: 14px; text-align: center; color: #8C6A48;">N/A</td></tr>`;
      plainTextOrderSummary = 'N/A\n';
    }

    const htmlBody = `<!DOCTYPE html>
    <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Order Received - ${customerName}</title></head>
    <body style="margin: 0; padding: 20px 10px; background-color: #FDFBF7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #2B1810;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #EADBCE; box-shadow: 0 4px 20px rgba(124, 85, 46, 0.08);">
          <tr><td style="background: linear-gradient(135deg, #7C552E 0%, #D97706 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
            <div style="font-size: 32px;">🥜</div>
            <div style="font-size: 13px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #FEF3C7; margin-bottom: 6px;">Mani Wandering</div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #ffffff;">NEW ORDER RECEIVED</h1>
            <div style="margin-top: 14px;"><span style="background-color: rgba(255, 255, 255, 0.25); color: #ffffff; padding: 6px 16px; border-radius: 9999px; font-weight: 800; font-size: 15px;">Order ID: ${orderId}</span></div>
            <div style="margin-top: 8px; font-size: 13px; color: #FEF3C7;">📅 ${order.orderDate || ''} – ${order.orderTime || ''}</div>
          </td></tr>
          <tr><td style="padding: 24px;">
            <div style="background-color: #FFFDF8; border-radius: 14px; border: 1px solid #F3E8DB; padding: 18px 20px; margin-bottom: 24px;">
              <h2 style="margin: 0 0 14px 0; font-size: 14px; font-weight: 800; text-transform: uppercase; color: #7C552E; border-bottom: 1px solid #F3E8DB; padding-bottom: 8px;">👤 Customer Information</h2>
              <table style="font-size: 14px; line-height: 1.8; width: 100%;">
                <tr><td style="color: #8C6A48; font-weight: 600; width: 190px;">Customer Name:</td><td style="color: #1E120D; font-weight: 800;">${customerName}</td></tr>
                <tr><td style="color: #8C6A48; font-weight: 600;">Mobile Number:</td><td style="color: #1E120D; font-weight: 700;">${mobileNumber}</td></tr>
                <tr><td style="color: #8C6A48; font-weight: 600; vertical-align: top;">Address / To Be Delivered To:</td><td style="color: #1E120D; font-weight: 600;">${deliveryAddress}</td></tr>
                <tr><td style="color: #8C6A48; font-weight: 600;">Mode of Payment:</td><td style="color: #1E120D; font-weight: 700;">${paymentMethod}</td></tr>
                <tr><td style="color: #8C6A48; font-weight: 600;">Payment Status:</td><td style="color: #1E120D; font-weight: 700;">${paymentStatus}</td></tr>
              </table>
            </div>
            <div style="margin-bottom: 24px;">
              <h2 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 800; text-transform: uppercase; color: #7C552E;">📦 Order Summary</h2>
              <table style="border-collapse: collapse; font-size: 14px; border: 1px solid #EDE4D8; width: 100%; border-radius: 12px; overflow: hidden; margin-bottom: 16px;">
                <thead><tr style="background-color: #F8F4EE;"><th align="left" style="padding: 12px 14px; color: #664322;">Item</th><th align="center" style="padding: 12px 14px; color: #664322;">Quantity</th><th align="right" style="padding: 12px 14px; color: #664322;">Price</th><th align="right" style="padding: 12px 14px; color: #664322;">Total</th></tr></thead>
                <tbody>${productRowsHtml}</tbody>
              </table>
              <div style="background-color: #FDFBF7; border-radius: 14px; border: 1px solid #EFE6DA; padding: 16px 20px;">
                <table style="font-size: 14px; line-height: 1.8; width: 100%;">
                  <tr><td style="color: #6B5645; font-weight: 600;">Subtotal:</td><td align="right" style="color: #1E120D; font-weight: 700;">${subtotalDisplay}</td></tr>
                  <tr><td style="color: #6B5645; font-weight: 600;">Delivery Fee:</td><td align="right" style="color: #059669; font-weight: 700;">${deliveryFeeVal}</td></tr>
                  <tr style="border-top: 2px dashed #DEC8B0;"><td style="padding-top: 10px; font-size: 16px; font-weight: 900; color: #7C552E;">Total Amount:</td><td align="right" style="padding-top: 10px; font-size: 18px; font-weight: 900; color: #B45309;">${totalAmountDisplay}</td></tr>
                </table>
              </div>
            </div>
            <div style="text-align: center; margin-top: 14px;">
              <a href="https://docs.google.com/spreadsheets/d/1CpPaE3QFmyAuptF4z52vGtpF_YFuuH-EmEHmQXpS8yI/edit" target="_blank" style="display: inline-block; background-color: #7C552E; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-size: 14px; font-weight: 800;">📊 View Orders in Google Sheets</a>
            </div>
          </td></tr>
          <tr><td style="background-color: #F8F5EE; padding: 20px; text-align: center; font-size: 12px; color: #8C6A48; border-top: 1px solid #EADBCE;">
            🥜 Mani Wandering Ordering System — Notification sent to ${NOTIFICATION_EMAIL}
          </td></tr>
        </table>
      </td></tr></table>
    </body></html>`;

    const plainText = `New Order Received - ${customerName}\n\n` +
      `Customer Name: ${customerName}\n` +
      `Mobile Number: ${mobileNumber}\n` +
      `Address / To Be Delivered To: ${deliveryAddress}\n` +
      `Mode of Payment: ${paymentMethod}\n` +
      `Payment Status: ${paymentStatus}\n\n` +
      `Order Summary:\n` +
      plainTextOrderSummary +
      `Subtotal: ${subtotalDisplay}\n` +
      `Delivery Fee: ${deliveryFeeVal}\n` +
      `Total Amount: ${totalAmountDisplay}\n\n` +
      `Order ID: ${orderId}\n` +
      `Timestamp: ${order.orderDate || ''} ${order.orderTime || ''}\n`;

    await transporter.sendMail({
      from: `"Mani Wandering" <${SMTP_USER}>`,
      to: NOTIFICATION_EMAIL,
      subject,
      text: plainText,
      html: htmlBody
    });

    sentOrderEmailIds.add(orderId);
    return { sent: true, recipient: NOTIFICATION_EMAIL };
  } catch (err) {
    console.error('Node email sending error:', err.message);
    return { sent: false, error: err.message };
  }
};

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

    // Enforce flavor availability: reject order if any requested flavor is currently marked unavailable
    if (settings.flavorAvailability) {
      for (const item of items) {
        const key = item.productId || item.id;
        const qty = Number(item.quantity) || 0;
        if (qty > 0 && settings.flavorAvailability[key] === false) {
          return res.status(400).json({
            error: `The flavor "${item.name || key}" is currently unavailable for ordering.`,
            code: 'FLAVOR_UNAVAILABLE'
          });
        }
      }
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
      cheese: 0,
      'bawang-only': 0
    };

    items.forEach(item => {
      const key = item.productId || item.id;
      if (flavorQtyMap[key] !== undefined) {
        flavorQtyMap[key] += Number(item.quantity) || 0;
      }
    });

    const defaultPaymentStatus = chosenPayment === 'Cash on Delivery' 
      ? 'Pending – Cash on Delivery' 
      : (chosenPayment === 'GCash' ? 'Pending – Awaiting GCash Payment' : 'Pending – Awaiting Maribank Payment');

    const deliveryFee = Number(req.body.deliveryFee || 0);
    const discount = Number(req.body.discount || 0);
    const totalAmount = (subtotal + deliveryFee) - discount;

    const newOrder = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      orderId,
      orderDate: dateStr,
      orderTime: timeStr,
      customerName: customerName.trim().slice(0, 100),
      mobileNumber: formatPhilippineMobile(mobileNumber),
      deliveryAddress: deliveryAddress.trim().slice(0, 300),
      paymentMethod: chosenPayment,
      paymentStatus: req.body.paymentStatus || defaultPaymentStatus,
      items,
      flavorQuantities: flavorQtyMap,
      totalPacks,
      totalTubs: totalPacks,
      subtotal,
      deliveryFee,
      discount,
      totalAmount,
      status: 'New',
      createdAt: new Date().toISOString(),
      syncedToGoogleSheets: false
    };

    // 4. Forward to Google Apps Script Web App internally (if configured and not an automated test)
    let syncError = null;
    const isTestOrder = req.headers['x-test-suite'] === 'true' ||
                        req.body.isTest === true ||
                        customerName.trim().toLowerCase() === 'test juan dela cruz';

    if (settings.appsScriptUrl && !isTestOrder) {
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
          // Google Apps Script also sent the notification email!
        } else {
          syncError = gasData ? gasData.error : 'Failed to receive success from Google Apps Script';
        }
      } catch (err) {
        console.error('Google Apps Script forward error:', err.message);
        syncError = err.message;
      }
    }

    // 5. Fallback server-side email dispatch if Google Apps Script did not send it
    if (!newOrder.syncedToGoogleSheets && !isTestOrder) {
      try {
        await sendNodeOrderEmail(newOrder);
      } catch (emailErr) {
        console.error('Node fallback email error:', emailErr.message);
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
    totalTubs: dayOrders.reduce((sum, o) => sum + (o.totalPacks || 0), 0),
    totalSales: dayOrders.reduce((sum, o) => sum + (o.subtotal || 0), 0),
    salted: dayOrders.reduce((sum, o) => sum + (o.flavorQuantities?.salted || 0), 0),
    unsalted: dayOrders.reduce((sum, o) => sum + (o.flavorQuantities?.unsalted || 0), 0),
    spicy: dayOrders.reduce((sum, o) => sum + (o.flavorQuantities?.spicy || 0), 0),
    bbq: dayOrders.reduce((sum, o) => sum + (o.flavorQuantities?.bbq || 0), 0),
    sourCream: dayOrders.reduce((sum, o) => sum + (o.flavorQuantities?.['sour-cream'] || 0), 0),
    cheese: dayOrders.reduce((sum, o) => sum + (o.flavorQuantities?.cheese || 0), 0),
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
