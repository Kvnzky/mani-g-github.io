import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const ORDERS_FILE = path.join(ROOT_DIR, 'server', 'data', 'orders.json');
const SETTINGS_FILE = path.join(ROOT_DIR, 'server', 'data', 'settings.json');

const BASE_URL = 'http://127.0.0.1:3001';

async function waitForServer(retries = 60) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`${BASE_URL}/api/cutoff`);
      if (res.ok) return true;
    } catch (e) {}
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('Server failed to start within timeout');
}

async function runTests() {
  const initialOrders = fs.existsSync(ORDERS_FILE) ? fs.readFileSync(ORDERS_FILE, 'utf8') : null;
  const initialSettings = fs.existsSync(SETTINGS_FILE) ? fs.readFileSync(SETTINGS_FILE, 'utf8') : null;
  let serverProc = null;

  try {
    let alreadyRunning = false;
    try {
      const check = await fetch(`${BASE_URL}/api/cutoff`);
      if (check.ok) alreadyRunning = true;
    } catch (e) {}

    if (!alreadyRunning) {
      serverProc = spawn(process.execPath, [path.join(ROOT_DIR, 'server', 'index.js')], {
        cwd: ROOT_DIR,
        stdio: 'ignore'
      });
      await waitForServer();
    }

    console.log('🥜 Starting Comprehensive MANI Security & Cutoff Test Suite...\n');
    let passed = 0;
    let failed = 0;

    function assert(condition, message) {
      if (condition) {
        console.log(`✅ PASS: ${message}`);
        passed++;
      } else {
        console.error(`❌ FAIL: ${message}`);
        failed++;
      }
    }

    // -------------------------------------------------------------
    // 1. AUTHENTICATION TESTS
    // -------------------------------------------------------------
    console.log('\n--- 1. AUTHENTICATION TESTS ---');

  // Test 1.1: Login with incorrect password
  try {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'kvn000', password: 'WrongPassword123!' })
    });
    const data = await res.json();
    assert(res.status === 401 && data.error === 'Invalid username or password.', 'Incorrect password returns generic 401');
  } catch (e) {
    assert(false, `Login failed error: ${e.message}`);
  }

  // Test 1.2: Login with incorrect username
  try {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'unknown_admin', password: 'Briar7.Heftiness.Geek' })
    });
    const data = await res.json();
    assert(res.status === 401 && data.error === 'Invalid username or password.', 'Incorrect username returns identical generic 401 (no username exposure)');
  } catch (e) {
    assert(false, `Login failed error: ${e.message}`);
  }

  // Test 1.3: Login with correct credentials
  let adminToken = '';
  try {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'kvn000', password: 'Bunny_016' })
    });
    const data = await res.json();
    assert(res.status === 200 && data.success === true && Boolean(data.token), 'Correct credentials log in successfully and return JWT token');
    adminToken = data.token;
  } catch (e) {
    assert(false, `Valid login error: ${e.message}`);
  }

  // Test 1.4: Verify token endpoint with valid token
  try {
    const res = await fetch(`${BASE_URL}/api/admin/verify`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    assert(res.status === 200 && data.authenticated === true && data.user.username === 'kvn000', 'Token verification succeeds for active admin session');
  } catch (e) {
    assert(false, `Token verification error: ${e.message}`);
  }

  // Test 1.5: Unauthenticated request to protected endpoints
  try {
    const resOrders = await fetch(`${BASE_URL}/api/orders`);
    const resCutoff = await fetch(`${BASE_URL}/api/admin/cutoff`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
    const resSettings = await fetch(`${BASE_URL}/api/settings`);
    assert(resOrders.status === 401 && resCutoff.status === 401 && resSettings.status === 401, 'Unauthenticated requests to admin APIs are strictly rejected with 401');
  } catch (e) {
    assert(false, `Protected endpoint rejection error: ${e.message}`);
  }

  // Test 1.6: Authenticated request to protected endpoints
  try {
    const resOrders = await fetch(`${BASE_URL}/api/orders`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await resOrders.json();
    assert(resOrders.status === 200 && Array.isArray(data.orders), 'Authenticated admin can access order list');
  } catch (e) {
    assert(false, `Authenticated orders error: ${e.message}`);
  }

  // -------------------------------------------------------------
  // 2. ORDER CUTOFF & SERVER ENFORCEMENT TESTS
  // -------------------------------------------------------------
  console.log('\n--- 2. ORDER CUTOFF & SERVER-SIDE ENFORCEMENT TESTS ---');

  // Test 2.1: Cutoff disabled -> form is OPEN
  try {
    await fetch(`${BASE_URL}/api/admin/cutoff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ enabled: false, date: '2026-09-17', time: '23:59' })
    });
    const cutoffRes = await fetch(`${BASE_URL}/api/cutoff`);
    const cutoff = await cutoffRes.json();
    assert(cutoff.enabled === false && cutoff.isOpen === true && cutoff.status === 'OPEN', 'Cutoff disabled -> status is OPEN and orders allowed');
  } catch (e) {
    assert(false, `Cutoff disabled error: ${e.message}`);
  }

  // Test 2.2: Order submission succeeds when cutoff disabled
  try {
    const orderRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-test-suite': 'true' },
      body: JSON.stringify({
        customerName: 'Test Juan Dela Cruz',
        mobileNumber: '09171234567',
        deliveryAddress: 'Unit 102, Manila Building',
        paymentMethod: 'Cash on Delivery',
        isTest: true,
        items: [{ id: 'salted', quantity: 2, price: 50 }]
      })
    });
    const orderData = await orderRes.json();
    assert(orderRes.status === 201 && orderData.success === true, 'Order placed successfully while orders are OPEN');
  } catch (e) {
    assert(false, `Order placement error: ${e.message}`);
  }

  // Test 2.3: Set cutoff in future -> CUTOFF SCHEDULED with remainingSeconds > 0
  try {
    const futureDate = new Date(Date.now() + 86400000 * 2);
    const futureDateStr = futureDate.toISOString().split('T')[0];
    await fetch(`${BASE_URL}/api/admin/cutoff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ enabled: true, date: futureDateStr, time: '23:59' })
    });
    const cutoffRes = await fetch(`${BASE_URL}/api/cutoff`);
    const cutoff = await cutoffRes.json();
    assert(cutoff.enabled === true && cutoff.isOpen === true && cutoff.status === 'CUTOFF SCHEDULED' && cutoff.remainingSeconds > 0, 'Future cutoff -> status is CUTOFF SCHEDULED with active remainingSeconds countdown');
  } catch (e) {
    assert(false, `Future cutoff error: ${e.message}`);
  }

  // Test 2.4: Set cutoff in past -> CLOSED
  try {
    const pastDate = new Date(Date.now() - 86400000 * 2);
    const pastDateStr = pastDate.toISOString().split('T')[0];
    await fetch(`${BASE_URL}/api/admin/cutoff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ enabled: true, date: pastDateStr, time: '12:00' })
    });
    const cutoffRes = await fetch(`${BASE_URL}/api/cutoff`);
    const cutoff = await cutoffRes.json();
    assert(cutoff.enabled === true && cutoff.isOpen === false && cutoff.status === 'CLOSED', 'Past cutoff -> status is CLOSED');
  } catch (e) {
    assert(false, `Past cutoff error: ${e.message}`);
  }

  // Test 2.5: Server strictly rejects order submission after cutoff (403 Forbidden)
  try {
    const orderRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Bypass Attempter',
        mobileNumber: '09181112233',
        deliveryAddress: 'Sneaky Street',
        paymentMethod: 'GCash',
        items: [{ id: 'bbq', quantity: 1, price: 50 }]
      })
    });
    const orderData = await orderRes.json();
    assert(orderRes.status === 403 && orderData.code === 'ORDERS_CLOSED', 'Direct API order submission after cutoff is REJECTED with 403 Forbidden and ORDERS_CLOSED code');
  } catch (e) {
    assert(false, `Cutoff rejection error: ${e.message}`);
  }

  // Reset cutoff to open so subsequent order tests succeed
  await fetch(`${BASE_URL}/api/admin/cutoff`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ enabled: false, date: '2026-09-17', time: '23:59' })
  });

  // -------------------------------------------------------------
  // 3. SECURITY & CODE INSPECTION TESTS
  // -------------------------------------------------------------
  console.log('\n--- 3. SECURITY & CODE INTEGRITY TESTS ---');

  // Test 3.1: Verify .env is in .gitignore
  const gitignore = fs.readFileSync('.gitignore', 'utf8');
  assert(gitignore.includes('.env'), '.gitignore properly contains .env');

  // Test 3.2: Verify no plaintext password in dist/ or src/
  const srcFiles = fs.readdirSync('src', { recursive: true }).filter(f => typeof f === 'string' && (f.endsWith('.js') || f.endsWith('.jsx')));
  let passwordFoundInSrc = false;
  for (const f of srcFiles) {
    const content = fs.readFileSync(path.join('src', f), 'utf8');
    if (content.includes('Briar7.Heftiness.Geek')) {
      passwordFoundInSrc = true;
      break;
    }
  }
  assert(!passwordFoundInSrc, 'Plaintext admin password does NOT exist anywhere in client src/ files');

  // Test 3.3: Verify no Google Sheet connection display in src/App.jsx
  const appJsx = fs.readFileSync('src/App.jsx', 'utf8');
  assert(!appJsx.includes('Connected to Google Sheet:'), 'src/App.jsx does NOT contain "Connected to Google Sheet:"');

  // Test 3.4: Verify security headers via Helmet
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  const nosniff = healthRes.headers.get('x-content-type-options');
  const frameOptions = healthRes.headers.get('x-frame-options');
  assert(nosniff === 'nosniff' && frameOptions === 'SAMEORIGIN', 'Server responses include secure HTTP headers (X-Content-Type-Options: nosniff, X-Frame-Options: SAMEORIGIN)');

  // -------------------------------------------------------------
  // 4. ORDER NOTIFICATION EMAIL INTEGRITY TESTS
  // -------------------------------------------------------------
  console.log('\n--- 4. ORDER NOTIFICATION EMAIL INTEGRITY TESTS ---');

  // Test 4.1: Order created with GCash reflects Pending - Awaiting GCash Payment and totalAmount
  try {
    const orderRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-test-suite': 'true' },
      body: JSON.stringify({
        customerName: 'Test Juan Dela Cruz',
        mobileNumber: '09171234567',
        deliveryAddress: 'Test Unit 102, Manila',
        paymentMethod: 'GCash',
        isTest: true,
        items: [
          { id: 'salted', name: 'Salted Mani', quantity: 2, price: 50 },
          { id: 'spicy', name: 'Spicy Mani', quantity: 1, price: 50 }
        ]
      })
    });
    const orderData = await orderRes.json();
    assert(
      orderRes.status === 201 &&
      orderData.order.paymentStatus === 'Pending – Awaiting GCash Payment' &&
      orderData.order.totalAmount === 150 &&
      orderData.order.items.length === 2,
      'Order with GCash assigns "Pending – Awaiting GCash Payment" and computes totalAmount ₱150'
    );
  } catch (e) {
    assert(false, `Order email integration error: ${e.message}`);
  }

  // Test 4.2: Verify no SMTP passwords or email credentials in frontend src/
  let smtpFoundInSrc = false;
  for (const f of srcFiles) {
    const content = fs.readFileSync(path.join('src', f), 'utf8');
    if (content.includes('SMTP_PASS') || content.includes('smtp.gmail.com') || content.includes('app_password')) {
      smtpFoundInSrc = true;
      break;
    }
  }
  assert(!smtpFoundInSrc, 'Email SMTP credentials and passwords strictly absent from client src/ files');

  // Test 4.3: Verify Google Apps Script contains sendOrderNotificationEmail and recipient
  const codeGs = fs.readFileSync('google-apps-script/Code.gs', 'utf8');
  assert(
    codeGs.includes('sendOrderNotificationEmail') &&
    codeGs.includes('engrkevinramirez@gmail.com') &&
    codeGs.includes('MailApp.sendEmail'),
    'Google Apps Script backend includes production MailApp.sendEmail targeted to engrkevinramirez@gmail.com'
  );

  // -------------------------------------------------------------
  // 5. CHEESE FLAVOR VERIFICATION TESTS
  // -------------------------------------------------------------
  console.log('\n--- 5. CHEESE FLAVOR VERIFICATION TESTS ---');

  // Test 5.1: Verify Cheese in products.js is placed immediately after Sour Cream with price 50
  const productsJs = fs.readFileSync('src/config/products.js', 'utf8');
  const sourCreamIdx = productsJs.indexOf("'sour-cream'");
  const cheeseIdx = productsJs.indexOf("'cheese'");
  const bawangIdx = productsJs.indexOf("'bawang-only'");
  assert(
    cheeseIdx > sourCreamIdx && cheeseIdx < bawangIdx,
    'Cheese is configured immediately after Sour Cream and before Bawang Only'
  );

  // Test 5.2: Order with Cheese succeeds and records cheese flavor quantity
  try {
    const orderRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-test-suite': 'true' },
      body: JSON.stringify({
        customerName: 'Cheese Test Customer',
        mobileNumber: '09181234567',
        deliveryAddress: 'Cheese Test Address',
        paymentMethod: 'Cash on Delivery',
        isTest: true,
        items: [
          { id: 'cheese', name: 'Cheese', quantity: 3, price: 50 }
        ]
      })
    });
    const orderData = await orderRes.json();
    assert(
      orderRes.status === 201 &&
      orderData.order.flavorQuantities?.cheese === 3 &&
      orderData.order.totalAmount === 150,
      'Order with Cheese flavor calculates 3 packs x ₱50 = ₱150 and maps cheese quantity 3'
    );
  } catch (e) {
    assert(false, `Cheese order test error: ${e.message}`);
  }

  // Test 5.3: Verify Google Apps Script supports Cheese in Column 14 (N)
  assert(
    codeGs.includes('Cheese Qty') &&
    codeGs.includes("cheeseQty") &&
    codeGs.includes("'Cheese (₱50)'"),
    'Google Apps Script backend includes Cheese in column layout at ₱50'
  );

  // -------------------------------------------------------------
  // 6. SALTED EGG & SPICY SALTED EGG FLAVOR VERIFICATION TESTS
  // -------------------------------------------------------------
  console.log('\n--- 6. SALTED EGG & SPICY SALTED EGG FLAVOR VERIFICATION TESTS ---');

  // Test 6.1: Verify Salted Egg & Spicy Salted Egg configured after Cheese and before Bawang Only
  const saltedEggIdx = productsJs.indexOf("'salted-egg'");
  const spicyEggIdx = productsJs.indexOf("'spicy-salted-egg'");
  assert(
    saltedEggIdx > cheeseIdx && spicyEggIdx > saltedEggIdx && spicyEggIdx < bawangIdx,
    'Salted Egg and Spicy Salted Egg configured immediately after Cheese and before Bawang Only'
  );

  // Test 6.2: Order with Salted Egg & Spicy Salted Egg succeeds and records flavor quantities and correct amounts
  try {
    const eggOrderRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-test-suite': 'true' },
      body: JSON.stringify({
        customerName: 'Egg Flavor Connoisseur',
        mobileNumber: '09198765432',
        deliveryAddress: 'Gold Street, Pasig City',
        paymentMethod: 'GCash',
        isTest: true,
        items: [
          { id: 'salted-egg', name: 'Salted Egg', quantity: 2, price: 65 },
          { id: 'spicy-salted-egg', name: 'Spicy Salted Egg', quantity: 1, price: 65 }
        ]
      })
    });
    const eggOrderData = await eggOrderRes.json();
    assert(
      eggOrderRes.status === 201 &&
      eggOrderData.order.flavorQuantities?.['salted-egg'] === 2 &&
      eggOrderData.order.flavorQuantities?.['spicy-salted-egg'] === 1 &&
      eggOrderData.order.totalAmount === 195,
      'Order with Salted Egg & Spicy Salted Egg calculates 3 packs x ₱65 = ₱195 and maps quantities correctly'
    );
  } catch (e) {
    assert(false, `Salted Egg order test error: ${e.message}`);
  }

  // Test 6.3: Verify Google Apps Script supports 20-column layout with Salted Egg & Spicy Salted Egg
  assert(
    codeGs.includes('Salted Egg Qty') &&
    codeGs.includes('Spicy Salted Egg Qty') &&
    codeGs.includes('saltedEggQty') &&
    codeGs.includes('spicySaltedEggQty') &&
    codeGs.includes("'Salted Egg (₱65)'") &&
    codeGs.includes("'Spicy Salted Egg (₱65)'"),
    'Google Apps Script backend includes Salted Egg & Spicy Salted Egg in 20-column layout at ₱65'
  );

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
  } finally {
    if (serverProc) {
      try {
        serverProc.kill();
      } catch (e) {}
      await new Promise((r) => setTimeout(r, 250));
    }
    if (initialOrders !== null) {
      try {
        fs.writeFileSync(ORDERS_FILE, initialOrders, 'utf8');
      } catch (e) {}
    }
    if (initialSettings !== null) {
      try {
        fs.writeFileSync(SETTINGS_FILE, initialSettings, 'utf8');
      } catch (e) {}
    }
  }
}

runTests().catch(err => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
