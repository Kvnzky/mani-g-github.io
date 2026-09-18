import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3001';

async function runTests() {
  console.log('🥜 Starting Comprehensive MANI G? Security & Cutoff Test Suite...\n');
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

  // Reset cutoff for normal use
  await fetch(`${BASE_URL}/api/admin/cutoff`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ enabled: true, date: '2026-09-17', time: '23:59' })
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

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
