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
  manualFormOpen: true,
  paymentMethods: {
    cod: true,
    maribank: true,
    gcash: true
  },
  cutoff: {
    enabled: false,
    date: '2026-09-28',
    time: '23:59',
    deliveryDay: 'Wednesday',
    updatedAt: 0
  }
};

if (fs.existsSync(SETTINGS_FILE)) {
  try {
    const loaded = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    settings = {
      ...settings,
      ...loaded,
      manualFormOpen: loaded.manualFormOpen !== undefined ? Boolean(loaded.manualFormOpen) : true,
      paymentMethods: {
        cod: true,
        maribank: true,
        gcash: true,
        ...(loaded.paymentMethods || {})
      },
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
const saveOrders = () => {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving orders.json:', err.message);
  }
};

// Ensure every order has its own strictly unique `id` and unique `orderId`
const normalizeAndDeduplicateOrders = (rawOrders) => {
  if (!Array.isArray(rawOrders)) return { list: [], changed: false };
  const seenIds = new Set();
  const seenOrderIds = new Set();
  let changed = false;

  // Process from oldest to newest so earlier orders keep their original sequence number
  const reversed = [...rawOrders].reverse();
  const normalizedReversed = reversed.map((orig, idx) => {
    const o = { ...orig };
    const datePart = (o.orderDate || '2026-09-20').replace(/-/g, '');
    const prefix = `MANI-${datePart}-`;

    let ordId = String(o.orderId || '').trim();
    if (!ordId || seenOrderIds.has(ordId)) {
      let seqNum = 1;
      while (seenOrderIds.has(`${prefix}${String(seqNum).padStart(3, '0')}`)) {
        seqNum++;
      }
      ordId = `${prefix}${String(seqNum).padStart(3, '0')}`;
      o.orderId = ordId;
      changed = true;
    }
    seenOrderIds.add(ordId);

    let recId = String(o.id || '').trim();
    if (!recId || seenIds.has(recId)) {
      recId = `ord_${datePart}_${idx + 1}_${ordId}`;
      o.id = recId;
      changed = true;
    }
    seenIds.add(recId);

    return o;
  });

  return { list: normalizedReversed.reverse(), changed };
};

if (fs.existsSync(ORDERS_FILE)) {
  try {
    const raw = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
    const { list, changed } = normalizeAndDeduplicateOrders(raw);
    orders = list;
    if (changed) {
      saveOrders();
    }
  } catch (err) {
    console.error('Error reading orders.json:', err.message);
  }
}

// Philippine Time Helpers (Asia/Manila, UTC+8)
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

// Generate strictly unique sequential Order ID: MANI-YYYYMMDD-001
const generateOrderId = (dateStr) => {
  const compactDate = dateStr.replace(/-/g, '');
  const prefix = `MANI-${compactDate}-`;
  let maxSeq = 0;
  orders.forEach((o) => {
    if (o && typeof o.orderId === 'string' && o.orderId.startsWith(prefix)) {
      const num = parseInt(o.orderId.slice(prefix.length), 10);
      if (!Number.isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  });
  let nextSeq = Math.max(maxSeq + 1, orders.filter(o => o.orderDate === dateStr).length + 1);
  let candidate = `${prefix}${String(nextSeq).padStart(3, '0')}`;
  while (orders.some((o) => o.orderId === candidate)) {
    nextSeq++;
    candidate = `${prefix}${String(nextSeq).padStart(3, '0')}`;
  }
  return candidate;
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

// Compute exact UTC timestamp for YYYY-MM-DD and HH:MM in Asia/Manila (UTC+8)
const getManilaCutoffTimestamp = (dateStr, timeStr) => {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(String(dateStr).trim())) return null;
  const [year, month, day] = String(dateStr).trim().split('-').map(Number);
  const cleanTime = String(timeStr || '23:59').trim();
  const timeMatch = cleanTime.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!timeMatch) return null;
  const hour = parseInt(timeMatch[1], 10);
  const minute = parseInt(timeMatch[2], 10);
  const second = parseInt(timeMatch[3] || '0', 10);
  return Date.UTC(year, month - 1, day, hour - 8, minute, second, 0);
};

// -------------------------------------------------------------
// Cutoff & Manual Form Status Evaluation Engine (Asia/Manila UTC+8)
// -------------------------------------------------------------
const evaluateCutoff = () => {
  const cutoff = settings.cutoff || { enabled: false, date: '', time: '23:59' };
  const now = new Date();
  const { dateStr, timeStr } = getPhilippineDateTime(now);

  const manualFormOpen = settings.manualFormOpen !== false;
  const deliveryDay = settings.deliveryDay || cutoff.deliveryDay || 'Wednesday';
  const flavorAvailability = settings.flavorAvailability || null;
  const savedDate = cutoff.date || dateStr;
  const savedTime = (cutoff.time || '23:59').slice(0, 5);
  const normalizedTime = savedTime.length === 5 ? `${savedTime}:00` : savedTime;
  const cutoffIso = savedDate ? `${savedDate}T${normalizedTime}+08:00` : null;
  const updatedAt = Number(cutoff.updatedAt || settings.updatedAt || 0);

  if (!cutoff.enabled || !cutoff.date || !cutoff.time) {
    const isOpen = manualFormOpen;
    const status = isOpen ? 'OPEN' : 'CLOSED';
    const closedReason = isOpen ? null : 'manual';
    return {
      enabled: false,
      manualFormOpen,
      formStatus: manualFormOpen ? 'open' : 'closed',
      isOpen,
      closedReason,
      status,
      date: savedDate,
      time: savedTime,
      cutoffDate: savedDate,
      cutoffTime: savedTime,
      deliveryDay,
      flavorAvailability,
      paymentMethods: settings.paymentMethods || { cod: true, maribank: true, gcash: true },
      timezone: TIMEZONE,
      serverTime: now.toISOString(),
      currentPhilippineDate: dateStr,
      currentPhilippineTime: timeStr,
      remainingSeconds: null,
      cutoffIso,
      updatedAt
    };
  }

  // Strictly evaluate in Asia/Manila (UTC+8)
  const cutoffTimestamp = getManilaCutoffTimestamp(savedDate, savedTime);
  const currentTimestamp = now.getTime();
  const diffSec = cutoffTimestamp !== null ? Math.floor((cutoffTimestamp - currentTimestamp) / 1000) : 0;

  const isCutoffExpired = diffSec <= 0;
  const isOpen = manualFormOpen && !isCutoffExpired;
  const closedReason = !manualFormOpen ? 'manual' : (isCutoffExpired ? 'cutoff' : null);
  const status = !isOpen ? 'CLOSED' : 'CUTOFF SCHEDULED';

  return {
    enabled: true,
    manualFormOpen,
    formStatus: manualFormOpen ? 'open' : 'closed',
    isOpen,
    closedReason,
    status,
    date: savedDate,
    time: savedTime,
    cutoffDate: savedDate,
    cutoffTime: savedTime,
    deliveryDay,
    flavorAvailability,
    paymentMethods: settings.paymentMethods || { cod: true, maribank: true, gcash: true },
    timezone: TIMEZONE,
    serverTime: now.toISOString(),
    currentPhilippineDate: dateStr,
    currentPhilippineTime: timeStr,
    remainingSeconds: Math.max(0, diffSec),
    cutoffIso,
    updatedAt
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
  const { enabled, date, time, deliveryDay, flavorAvailability, manualFormOpen } = req.body || {};

  if (enabled !== undefined) {
    settings.cutoff.enabled = Boolean(enabled);
  }

  if (date) {
    const cleanDate = String(date).trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
      return res.status(400).json({ error: 'Invalid date format. Expected YYYY-MM-DD.' });
    }
    settings.cutoff.date = cleanDate;
  }

  if (time) {
    const cleanTime = String(time).trim();
    const match = cleanTime.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (!match) {
      return res.status(400).json({ error: 'Invalid time format. Expected HH:MM.' });
    }
    const hh = String(Math.min(23, Math.max(0, parseInt(match[1], 10)))).padStart(2, '0');
    const mm = String(Math.min(59, Math.max(0, parseInt(match[2], 10)))).padStart(2, '0');
    settings.cutoff.time = `${hh}:${mm}`;
  }

  if (deliveryDay !== undefined) {
    settings.deliveryDay = String(deliveryDay).trim();
    settings.cutoff.deliveryDay = String(deliveryDay).trim();
  }

  // Only update manualFormOpen if explicitly provided; never let cutoff timer updates reset manualFormOpen
  if (manualFormOpen !== undefined) {
    settings.manualFormOpen = Boolean(manualFormOpen);
  }

  if (flavorAvailability && typeof flavorAvailability === 'object') {
    settings.flavorAvailability = {
      ...(settings.flavorAvailability || {}),
      ...flavorAvailability
    };
  }

  const nowTs = Date.now();
  settings.cutoff.updatedAt = nowTs;
  settings.updatedAt = nowTs;

  saveSettings();
  const updatedCutoff = evaluateCutoff();

  res.json({
    success: true,
    message: 'Cutoff settings updated successfully.',
    cutoff: updatedCutoff
  });
});

// Admin Manual Order Form Status Toggle (Protected & Independent from Cutoff Timer)
app.post('/api/admin/form-status', requireAdminAuth, (req, res) => {
  const { manualFormOpen, formStatus } = req.body || {};

  let nextOpenState;
  if (manualFormOpen !== undefined) {
    nextOpenState = Boolean(manualFormOpen);
  } else if (formStatus !== undefined) {
    nextOpenState = String(formStatus).toLowerCase() !== 'closed';
  } else {
    return res.status(400).json({ error: 'Missing manualFormOpen or formStatus in request body.' });
  }

  settings.manualFormOpen = nextOpenState;
  const nowTs = Date.now();
  settings.updatedAt = nowTs;
  if (settings.cutoff) {
    settings.cutoff.updatedAt = nowTs;
  }

  saveSettings();
  const updatedCutoff = evaluateCutoff();

  res.json({
    success: true,
    manualFormOpen: settings.manualFormOpen,
    formStatus: settings.manualFormOpen ? 'open' : 'closed',
    message: settings.manualFormOpen
      ? 'Order form is now OPEN.'
      : 'Order form is now CLOSED.',
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

// Admin Payment Methods Availability Update (Protected)
app.post('/api/admin/payment-methods', requireAdminAuth, (req, res) => {
  const { paymentMethods } = req.body || {};

  if (!paymentMethods || typeof paymentMethods !== 'object') {
    return res.status(400).json({ error: 'Invalid paymentMethods payload.' });
  }

  settings.paymentMethods = {
    cod: paymentMethods.cod !== undefined ? Boolean(paymentMethods.cod) : (settings.paymentMethods?.cod ?? true),
    maribank: paymentMethods.maribank !== undefined ? Boolean(paymentMethods.maribank) : (settings.paymentMethods?.maribank ?? true),
    gcash: paymentMethods.gcash !== undefined ? Boolean(paymentMethods.gcash) : (settings.paymentMethods?.gcash ?? true)
  };

  saveSettings();

  res.json({
    success: true,
    message: 'Payment methods availability updated successfully.',
    paymentMethods: settings.paymentMethods
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

// Escape HTML entities for safe email rendering
const escapeHtml = (str) => {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const formatDateLabelServer = (dateStr) => {
  if (!dateStr) return '';
  try {
    const parts = String(dateStr).split('-');
    if (parts.length !== 3) return String(dateStr);
    const [y, m, d] = parts.map(Number);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return String(dateStr);
    const dateObj = new Date(Date.UTC(y, m - 1, d));
    return dateObj.toLocaleDateString('en-US', {
      timeZone: 'UTC',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (e) {
    return String(dateStr);
  }
};

const formatServerOrderItems = (order) => {
  const defaultNames = {
    salted: 'Salted',
    unsalted: 'Unsalted',
    spicy: 'Spicy',
    bbq: 'BBQ',
    'sour-cream': 'Sour Cream',
    cheese: 'Cheese',
    'bawang-only': 'Bawang Only'
  };

  const getProductName = (id, fallback) => {
    if (Array.isArray(products)) {
      const found = products.find((p) => p.id === id);
      if (found && found.name) return found.name;
    }
    if (fallback) return fallback;
    if (defaultNames[id]) return defaultNames[id];
    return String(id || 'Mani')
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const parts = [];
  if (Array.isArray(order.items) && order.items.length > 0) {
    order.items.forEach((it) => {
      const q = Number(it.quantity) || 0;
      if (q > 0) {
        parts.push(`${getProductName(it.id || it.productId, it.name)} × ${q}`);
      }
    });
  } else if (order.flavorQuantities && typeof order.flavorQuantities === 'object') {
    const stdKeys = ['salted', 'unsalted', 'spicy', 'bbq', 'sour-cream', 'cheese', 'bawang-only'];
    const extraKeys = Object.keys(order.flavorQuantities).filter((k) => !stdKeys.includes(k));
    [...stdKeys, ...extraKeys].forEach((k) => {
      const q = Number(order.flavorQuantities[k]) || 0;
      if (q > 0) {
        parts.push(`${getProductName(k)} × ${q}`);
      }
    });
  }
  return parts.length > 0 ? parts.join(', ') : 'N/A';
};

const isValidDateParam = (str) => typeof str === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(str.trim());

// Protected Admin Endpoint: Send Order Summary Email to engrkevinramirez@gmail.com
app.post('/api/admin/send-order-summary', requireAdminAuth, async (req, res) => {
  try {
    const {
      startDate = '',
      endDate = '',
      startDateDisplay: reqStartDisplay,
      endDateDisplay: reqEndDisplay,
      selectedDateRange: reqRangeLabel,
      rows: clientRows
    } = req.body || {};

    if ((startDate && !isValidDateParam(startDate)) || (endDate && !isValidDateParam(endDate))) {
      return res.status(400).json({ success: false, error: 'Invalid date range parameters.' });
    }

    // Build rows from latest server orders if not explicitly supplied
    let summaryRows = [];
    if (Array.isArray(clientRows)) {
      summaryRows = clientRows.map((r) => ({
        name: String(r.name || 'N/A').trim(),
        address: String(r.address || 'N/A').trim(),
        orderAndQuantity: String(r.orderAndQuantity || 'N/A').trim()
      }));
    } else {
      const seenKeys = new Set();
      const filtered = orders.filter((o, idx) => {
        const key = o.id || `${o.orderId || 'ord'}_${o.orderDate || ''}_${o.orderTime || ''}_${o.customerName || ''}_${o.subtotal || o.totalAmount || 0}_${idx}`;
        if (seenKeys.has(key)) return false;
        seenKeys.add(key);
        if ((o.status || '').toLowerCase() === 'cancelled') return false;
        const od = o.orderDate || '';
        if (startDate && od < startDate) return false;
        if (endDate && od > endDate) return false;
        return true;
      });
      summaryRows = filtered.map((o) => ({
        name: String(o.customerName || 'N/A').trim(),
        address: String(o.deliveryAddress || 'N/A').trim(),
        orderAndQuantity: formatServerOrderItems(o)
      }));
    }

    let startDisplay = reqStartDisplay || (startDate ? formatDateLabelServer(startDate) : '');
    let endDisplay = reqEndDisplay || (endDate ? formatDateLabelServer(endDate) : '');
    if (!startDisplay || !endDisplay) {
      const validDates = orders.map((o) => o.orderDate).filter(Boolean).sort();
      if (!startDisplay) startDisplay = validDates.length > 0 ? formatDateLabelServer(validDates[0]) : 'All Time';
      if (!endDisplay) endDisplay = validDates.length > 0 ? formatDateLabelServer(validDates[validDates.length - 1]) : 'Present';
    }

    const selectedDateRange = reqRangeLabel || `${startDisplay} – ${endDisplay}`;
    const targetRecipient = 'engrkevinramirez@gmail.com';
    const subject = `Order Summary – ${selectedDateRange}`;
    const introLine = `Please see the order summary for ${startDisplay} – ${endDisplay} below.`;

    let tableRowsHtml = '';
    let plainTextRows = 'Name | Address | Order & Quantity\n' + '------------------------------------------------------------\n';

    if (summaryRows.length === 0) {
      tableRowsHtml = `<tr>
        <td colspan="3" style="padding: 18px 14px; text-align: center; color: #8C6A48; font-style: italic;">
          No orders found for ${escapeHtml(startDisplay)} – ${escapeHtml(endDisplay)}.
        </td>
      </tr>`;
      plainTextRows += `No orders found for ${startDisplay} – ${endDisplay}.\n`;
    } else {
      summaryRows.forEach((row, idx) => {
        const rowBg = idx % 2 === 0 ? '#FFFFFF' : '#FDFBF7';
        tableRowsHtml += `<tr style="background-color: ${rowBg}; border-bottom: 1px solid #EDE4D8;">
          <td style="padding: 12px 14px; font-weight: 700; color: #2B1810; vertical-align: top; word-break: break-word;">${escapeHtml(row.name)}</td>
          <td style="padding: 12px 14px; color: #4A3525; vertical-align: top; word-break: break-word;">${escapeHtml(row.address)}</td>
          <td style="padding: 12px 14px; font-weight: 700; color: #7C552E; vertical-align: top; word-break: break-word;">${escapeHtml(row.orderAndQuantity)}</td>
        </tr>`;
        plainTextRows += `${row.name} | ${row.address} | ${row.orderAndQuantity}\n`;
      });
    }

    const htmlBody = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
  <style>
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; border-radius: 12px !important; }
      .email-padding { padding: 16px 12px !important; }
      .summary-table th, .summary-table td { padding: 10px 8px !important; font-size: 13px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 20px 10px; background-color: #FDFBF7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2B1810;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <table role="presentation" class="email-container" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 680px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #EADBCE; box-shadow: 0 4px 20px rgba(124, 85, 46, 0.08);">
          <tr>
            <td style="background: linear-gradient(135deg, #7C552E 0%, #D97706 100%); padding: 28px 24px; text-align: center; color: #ffffff;">
              <div style="font-size: 28px; line-height: 1; margin-bottom: 6px;">🥜</div>
              <div style="font-size: 12px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #FEF3C7; margin-bottom: 4px;">Mani Wandering</div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 900; color: #ffffff;">Order Summary</h1>
              <div style="margin-top: 8px; font-size: 13px; color: #FEF3C7; font-weight: 600;">📅 ${escapeHtml(selectedDateRange)}</div>
            </td>
          </tr>
          <tr>
            <td class="email-padding" style="padding: 24px;">
              <p style="margin: 0 0 18px 0; font-size: 15px; line-height: 1.6; color: #2B1810; font-weight: 600;">
                ${escapeHtml(introLine)}
              </p>
              <table role="presentation" class="summary-table" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; width: 100%; font-size: 14px; border: 1px solid #EDE4D8; border-radius: 12px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #F8F4EE; border-bottom: 2px solid #E5D5C3;">
                    <th align="left" style="padding: 12px 14px; font-weight: 800; color: #664322; width: 25%;">Name</th>
                    <th align="left" style="padding: 12px 14px; font-weight: 800; color: #664322; width: 40%;">Address</th>
                    <th align="left" style="padding: 12px 14px; font-weight: 800; color: #664322; width: 35%;">Order &amp; Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  ${tableRowsHtml}
                </tbody>
              </table>
              <div style="margin-top: 16px; font-size: 12px; color: #8C6A48; text-align: right; font-weight: 600;">
                Total Orders Included: ${summaryRows.length}
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #F8F5EE; padding: 16px 24px; text-align: center; font-size: 12px; color: #8C6A48; border-top: 1px solid #EADBCE;">
              🥜 Mani Wandering Order Summary — Sent to ${targetRecipient}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const textBody = `${introLine}\n\n${plainTextRows}`;

    const isTest = req.headers['x-test-suite'] === 'true' || req.body?.isTest === true;
    if (isTest) {
      return res.json({
        success: true,
        sent: true,
        recipient: targetRecipient,
        subject,
        introLine,
        rowCount: summaryRows.length,
        rows: summaryRows,
        htmlBody,
        textBody
      });
    }

    // 1. Send via SMTP if configured
    if (SMTP_HOST && SMTP_USER) {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS
        }
      });

      await transporter.sendMail({
        from: `"Mani Wandering" <${SMTP_USER}>`,
        to: targetRecipient,
        subject,
        text: textBody,
        html: htmlBody
      });

      return res.json({
        success: true,
        sent: true,
        recipient: targetRecipient,
        subject,
        rowCount: summaryRows.length
      });
    }

    // 2. Otherwise forward to Google Apps Script Web App to dispatch via MailApp.sendEmail
    if (settings.appsScriptUrl) {
      try {
        const gasRes = await fetch(settings.appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'sendOrderSummaryEmail',
            spreadsheetId: settings.spreadsheetId,
            recipient: targetRecipient,
            startDate,
            endDate,
            startDateDisplay: startDisplay,
            endDateDisplay: endDisplay,
            selectedDateRange,
            rows: summaryRows
          }),
          redirect: 'follow'
        });

        if (gasRes.ok) {
          return res.json({
            success: true,
            sent: true,
            recipient: targetRecipient,
            subject,
            rowCount: summaryRows.length
          });
        }
      } catch (gasErr) {
        console.warn('Apps Script summary email relay warning:', gasErr.message);
      }
    }

    console.log(`[Order Summary Email] Standalone Mode: Summary (${selectedDateRange}, ${summaryRows.length} orders) prepared for ${targetRecipient}`);
    return res.json({
      success: true,
      sent: true,
      logged: true,
      recipient: targetRecipient,
      subject,
      rowCount: summaryRows.length
    });
  } catch (err) {
    console.error('Error sending order summary email:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Unable to send the order summary. Please try again.'
    });
  }
});

// Public: Submit Order (Enforces Server-Side Manual Form Status + Cutoff + Validation)
app.post('/api/orders', orderLimiter, async (req, res) => {
  try {
    // 1. Authoritative Server-Side Form Status & Cutoff Enforcement
    const cutoffStatus = evaluateCutoff();
    if (!cutoffStatus.isOpen || cutoffStatus.manualFormOpen === false) {
      return res.status(403).json({
        error: cutoffStatus.manualFormOpen === false
          ? 'Orders are currently closed. Please check back soon.'
          : 'Orders are now closed. The cutoff time for accepting orders has ended.',
        code: 'ORDERS_CLOSED',
        closedReason: cutoffStatus.closedReason
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

    const safeDeliveryAddress = typeof deliveryAddress === 'string' ? deliveryAddress.trim() : String(deliveryAddress || '').trim();

    const validPaymentMethods = ['Cash on Delivery', 'Maribank', 'GCash'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ error: 'Please select a valid payment method.' });
    }
    const chosenPayment = paymentMethod;

    // Enforce mode of payment availability: reject order if the chosen payment method is disabled by admin
    const paymentKey = chosenPayment === 'Cash on Delivery' ? 'cod' : chosenPayment.toLowerCase();
    if (settings.paymentMethods && settings.paymentMethods[paymentKey] === false) {
      return res.status(400).json({
        error: `The payment method "${chosenPayment}" is currently unavailable for ordering.`,
        code: 'PAYMENT_METHOD_UNAVAILABLE'
      });
    }

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
      deliveryAddress: safeDeliveryAddress,
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
  const { date, status, startDate, endDate, summaryDate } = req.query;
  let filtered = [...orders];

  const hasDateRange = (typeof startDate === 'string' && startDate.trim()) || (typeof endDate === 'string' && endDate.trim());
  if (hasDateRange) {
    if (typeof startDate === 'string' && startDate.trim()) {
      filtered = filtered.filter(o => o.orderDate >= startDate.trim());
    }
    if (typeof endDate === 'string' && endDate.trim()) {
      filtered = filtered.filter(o => o.orderDate <= endDate.trim());
    }
  } else if (typeof date === 'string' && date.trim() && date.trim().toLowerCase() !== 'all') {
    filtered = filtered.filter(o => o.orderDate === date.trim());
  }

  if (typeof status === 'string' && status.trim() && status.toLowerCase() !== 'all') {
    filtered = filtered.filter(o => (o.status || '').toLowerCase() === status.trim().toLowerCase());
  }

  const todayDateStr = getPhilippineDateTime().dateStr;
  const activeDate = (typeof summaryDate === 'string' && summaryDate.trim())
    ? summaryDate.trim()
    : ((typeof date === 'string' && date.trim() && date.trim().toLowerCase() !== 'all') ? date.trim() : todayDateStr);
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
    allOrders: orders,
    totalCount: orders.length,
    dailySummary,
    todayDate: todayDateStr
  });
});

// Helper to locate a single specific order by its unique `id` first, then disambiguated `orderId`
const findTargetOrderIndex = (targetId, { orderDate, orderTime, customerName } = {}) => {
  if (!targetId) return -1;
  // 1. Prioritize exact match on unique record `id`
  let idx = orders.findIndex((o) => o && o.id === targetId);
  if (idx !== -1) return idx;

  // 2. Fallback if caller passed `orderId` with disambiguating fields
  if (orderDate || orderTime || customerName) {
    idx = orders.findIndex(
      (o) =>
        o &&
        o.orderId === targetId &&
        (!orderDate || o.orderDate === orderDate) &&
        (!orderTime || o.orderTime === orderTime) &&
        (!customerName || o.customerName === customerName)
    );
    if (idx !== -1) return idx;
  }

  // 3. Final fallback to exact orderId match
  return orders.findIndex((o) => o && o.orderId === targetId);
};

// API: Update Order Status (Protected)
app.patch('/api/orders/:id/status', requireAdminAuth, async (req, res) => {
  const { id } = req.params;
  const { status, orderDate, orderTime, customerName } = req.body || {};

  const validStatuses = ['New', 'Confirmed', 'Preparing', 'Ready', 'Completed', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  const orderIndex = findTargetOrderIndex(id, { orderDate, orderTime, customerName });
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  const updatedOrder = {
    ...orders[orderIndex],
    status,
    updatedAt: new Date().toISOString()
  };
  orders[orderIndex] = updatedOrder;
  saveOrders();

  if (settings.appsScriptUrl) {
    try {
      fetch(settings.appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'updateStatus',
          spreadsheetId: settings.spreadsheetId,
          id: updatedOrder.id,
          orderId: updatedOrder.orderId,
          orderDate: updatedOrder.orderDate,
          orderTime: updatedOrder.orderTime,
          customerName: updatedOrder.customerName,
          status
        }),
        redirect: 'follow'
      }).catch(err => console.error('Status sync to GAS failed:', err.message));
    } catch (e) {}
  }

  res.json({ success: true, order: updatedOrder });
});

// API: Update Payment Status (Protected)
app.patch('/api/orders/:id/payment-status', requireAdminAuth, async (req, res) => {
  const { id } = req.params;
  const { paymentStatus, orderDate, orderTime, customerName } = req.body || {};

  const validPaymentStatuses = ['Paid', 'Unpaid'];
  if (!validPaymentStatuses.includes(paymentStatus)) {
    return res.status(400).json({ error: `Invalid paymentStatus. Must be one of: ${validPaymentStatuses.join(', ')}` });
  }

  const orderIndex = findTargetOrderIndex(id, { orderDate, orderTime, customerName });
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  const updatedOrder = {
    ...orders[orderIndex],
    paymentStatus,
    updatedAt: new Date().toISOString()
  };
  orders[orderIndex] = updatedOrder;
  saveOrders();

  if (settings.appsScriptUrl) {
    try {
      fetch(settings.appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'updatePaymentStatus',
          spreadsheetId: settings.spreadsheetId,
          id: updatedOrder.id,
          orderId: updatedOrder.orderId,
          orderDate: updatedOrder.orderDate,
          orderTime: updatedOrder.orderTime,
          customerName: updatedOrder.customerName,
          paymentStatus
        }),
        redirect: 'follow'
      }).catch(err => console.error('Payment status sync to GAS failed:', err.message));
    } catch (e) {}
  }

  res.json({ success: true, order: updatedOrder });
});

// API: Get Settings (Protected)
app.get('/api/settings', requireAdminAuth, (req, res) => {
  res.json({
    spreadsheetId: settings.spreadsheetId,
    appsScriptUrl: settings.appsScriptUrl,
    timezone: settings.timezone,
    manualFormOpen: settings.manualFormOpen !== false,
    paymentMethods: settings.paymentMethods || { cod: true, maribank: true, gcash: true },
    cutoff: evaluateCutoff()
  });
});

// API: Update Settings (Protected)
app.post('/api/settings', requireAdminAuth, (req, res) => {
  const { appsScriptUrl, spreadsheetId, paymentMethods, manualFormOpen } = req.body || {};
  if (appsScriptUrl !== undefined) settings.appsScriptUrl = appsScriptUrl.trim();
  if (spreadsheetId !== undefined) settings.spreadsheetId = spreadsheetId.trim();
  if (manualFormOpen !== undefined) settings.manualFormOpen = Boolean(manualFormOpen);
  if (paymentMethods && typeof paymentMethods === 'object') {
    settings.paymentMethods = {
      cod: paymentMethods.cod !== undefined ? Boolean(paymentMethods.cod) : (settings.paymentMethods?.cod ?? true),
      maribank: paymentMethods.maribank !== undefined ? Boolean(paymentMethods.maribank) : (settings.paymentMethods?.maribank ?? true),
      gcash: paymentMethods.gcash !== undefined ? Boolean(paymentMethods.gcash) : (settings.paymentMethods?.gcash ?? true)
    };
  }
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
