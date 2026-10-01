// scripts/verify-fixes.js
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import {
  PHT_TIMEZONE,
  getManilaDateStr,
  getManilaCutoffTimestampMs,
  buildManilaCutoffIso,
  getRawRemainingCutoffSeconds,
  evaluateClientCutoff,
  formatManilaDateNice,
  formatManilaTime12,
  normalizeCutoffTime
} from '../src/utils/phtTime.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const SETTINGS_FILE = path.join(ROOT_DIR, 'server', 'data', 'settings.json');
const ORDERS_FILE = path.join(ROOT_DIR, 'server', 'data', 'orders.json');
const BASE_URL = 'http://127.0.0.1:3001';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForServer(maxAttempts = 80) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(`${BASE_URL}/api/cutoff`);
      if (res.ok) return true;
    } catch (e) {}
    await wait(300);
  }
  throw new Error('Server failed to start on port 3001');
}

async function runVerification() {
  console.log('================================================================');
  console.log('🧪 RUNNING 17-STEP END-TO-END VERIFICATION SUITE');
  console.log('================================================================\n');

  // Backup data files so verification leaves clean production data intact
  const originalSettingsRaw = fs.readFileSync(SETTINGS_FILE, 'utf8');
  const originalOrdersRaw = fs.readFileSync(ORDERS_FILE, 'utf8');

  let serverProc = null;

  try {
    // ------------------------------------------------------------------
    // PART A: PHT (Asia/Manila, UTC+8) Timezone Unit Verification
    // ------------------------------------------------------------------
    console.log('--- [A] Verifying Fixed Philippine Time (Asia/Manila, UTC+8) Calculations ---');
    assert.strictEqual(PHT_TIMEZONE, 'Asia/Manila', 'Timezone constant must be Asia/Manila');

    // 2026-10-15 18:30:00 PHT (UTC+8) === 2026-10-15 10:30:00 UTC
    const expectedUtcMs = Date.UTC(2026, 9, 15, 10, 30, 0, 0);
    const actualManilaMs = getManilaCutoffTimestampMs('2026-10-15', '18:30');
    assert.strictEqual(
      actualManilaMs,
      expectedUtcMs,
      'getManilaCutoffTimestampMs must compute exact UTC+8 timestamp regardless of local OS/browser timezone'
    );
    assert.strictEqual(
      buildManilaCutoffIso('2026-10-15', '18:30'),
      '2026-10-15T18:30:00+08:00',
      'buildManilaCutoffIso must include +08:00 offset'
    );

    // 1 hour before cutoff in UTC
    const oneHourBeforeMs = expectedUtcMs - 3600 * 1000;
    const remSec = getRawRemainingCutoffSeconds('2026-10-15', '18:30', oneHourBeforeMs);
    assert.strictEqual(remSec, 3600, 'Countdown remaining seconds must be exactly 3600s in Asia/Manila');

    const evalOpen = evaluateClientCutoff(
      { enabled: true, date: '2026-10-15', time: '18:30', deliveryDay: 'Friday', manualFormOpen: true },
      oneHourBeforeMs
    );
    assert.strictEqual(evalOpen.isOpen, true);
    assert.strictEqual(evalOpen.status, 'CUTOFF SCHEDULED');
    assert.strictEqual(evalOpen.timezone, 'Asia/Manila');
    assert.strictEqual(evalOpen.remainingSeconds, 3600);

    // Verify manualFormOpen = false closes form independently even when cutoff timer has remaining time
    const evalManualClosed = evaluateClientCutoff(
      { enabled: true, date: '2026-10-15', time: '18:30', deliveryDay: 'Friday', manualFormOpen: false },
      oneHourBeforeMs
    );
    assert.strictEqual(evalManualClosed.isOpen, false, 'Manual Closed must close form even if timer is active');
    assert.strictEqual(evalManualClosed.manualFormOpen, false);
    assert.strictEqual(evalManualClosed.status, 'CLOSED');
    assert.strictEqual(evalManualClosed.cutoffDate, '2026-10-15', 'Manual Closed must not alter cutoffDate');
    assert.strictEqual(evalManualClosed.cutoffTime, '18:30', 'Manual Closed must not alter cutoffTime');

    assert.strictEqual(formatManilaTime12('18:30'), '6:30 PM');
    assert.strictEqual(formatManilaDateNice('2026-10-15'), 'Thu, Oct 15');
    console.log('✓ PHT (Asia/Manila, UTC+8) timezone calculations verified!\n');

    // ------------------------------------------------------------------
    // Start Express Server if not already running
    // ------------------------------------------------------------------
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

    // ------------------------------------------------------------------
    // STEP 1-7: Admin Settings Cutoff Date & Time Permanent Save + PHT Countdown
    // ------------------------------------------------------------------
    console.log('--- [Steps 1-7] Testing Cutoff Date & Time Permanent Persistence & PHT Timer ---');

    // Step 1: Log in to Admin Settings
    const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'kvn000', password: 'Bunny_016' })
    });
    assert.strictEqual(loginRes.status, 200, 'Step 1: Admin login should succeed');
    const { token } = await loginRes.json();
    assert(token, 'Step 1: Admin JWT token must be returned');

    // Step 2 & 3: Change cutoff date and cutoff time and save
    const newCutoffDate = '2026-12-20';
    const newCutoffTime = '19:45';
    const newDeliveryDay = 'Friday';

    const saveCutoffRes = await fetch(`${BASE_URL}/api/admin/cutoff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        enabled: true,
        date: newCutoffDate,
        time: newCutoffTime,
        deliveryDay: newDeliveryDay,
        manualFormOpen: true
      })
    });
    assert.strictEqual(saveCutoffRes.status, 200, 'Step 2 & 3: Saving cutoff date & time should return 200');
    const saveCutoffData = await saveCutoffRes.json();
    assert.strictEqual(saveCutoffData.success, true);
    assert.strictEqual(saveCutoffData.cutoff.cutoffDate, newCutoffDate, 'Saved cutoffDate must match 2026-12-20');
    assert.strictEqual(saveCutoffData.cutoff.cutoffTime, newCutoffTime, 'Saved cutoffTime must match 19:45');
    assert.strictEqual(saveCutoffData.cutoff.deliveryDay, newDeliveryDay, 'Saved deliveryDay must match Friday');
    assert.strictEqual(saveCutoffData.cutoff.timezone, 'Asia/Manila', 'Saved timezone must be Asia/Manila');

    // Step 4 & 5: Refresh / re-fetch / navigate away & return / logout & login back in — confirm date and time do NOT reset
    const getCutoffRes1 = await fetch(`${BASE_URL}/api/cutoff`);
    const cutoffAfterRefresh = await getCutoffRes1.json();
    assert.strictEqual(cutoffAfterRefresh.cutoffDate, newCutoffDate, 'Step 5: Cutoff date must persist after refresh');
    assert.strictEqual(cutoffAfterRefresh.cutoffTime, newCutoffTime, 'Step 5: Cutoff time must persist after refresh');
    assert.strictEqual(cutoffAfterRefresh.deliveryDay, newDeliveryDay, 'Step 5: Delivery day must persist after refresh');

    // Verify disk persistence in server/data/settings.json
    const diskSettings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    assert.strictEqual(diskSettings.cutoff.date, newCutoffDate, 'Disk settings.json must store new cutoff date');
    assert.strictEqual(diskSettings.cutoff.time, newCutoffTime, 'Disk settings.json must store new cutoff time');

    // Simulate logging out and logging back in
    await fetch(`${BASE_URL}/api/admin/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const reloginRes = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'kvn000', password: 'Bunny_016' })
    });
    const { token: token2 } = await reloginRes.json();
    const getSettingsRes = await fetch(`${BASE_URL}/api/settings`, {
      headers: { Authorization: `Bearer ${token2}` }
    });
    const adminSettingsAfterRelogin = await getSettingsRes.json();
    assert.strictEqual(
      adminSettingsAfterRelogin.cutoff.date,
      newCutoffDate,
      'Cutoff date must remain after logging out and logging back in'
    );
    assert.strictEqual(
      adminSettingsAfterRelogin.cutoff.time,
      newCutoffTime,
      'Cutoff time must remain after logging out and logging back in'
    );

    // Step 6 & 7: Confirm countdown timer reflects the new cutoff date/time using Philippine Time (Asia/Manila, UTC+8)
    assert.strictEqual(
      cutoffAfterRefresh.cutoffIso,
      '2026-12-20T19:45:00+08:00',
      'Step 6 & 7: Cutoff ISO must be anchored to +08:00 (Asia/Manila PHT)'
    );
    assert(
      cutoffAfterRefresh.remainingSeconds > 0,
      'Step 6 & 7: Countdown remainingSeconds must be positive for future PHT cutoff'
    );
    console.log('✓ Steps 1-7 passed: Cutoff Date & Time save permanently and calculate strictly in Asia/Manila (UTC+8)!\n');

    // ------------------------------------------------------------------
    // STEPS 8-12: Order Manager Independent Per-Order Status Updates
    // ------------------------------------------------------------------
    console.log('--- [Steps 8-12] Testing Order Manager Independent Per-Order Status Updates ---');

    // Ensure all existing orders in orders.json have unique `id` and `orderId`
    const existingOrders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
    const existingIds = new Set(existingOrders.map((o) => o.id));
    const existingOrderIds = new Set(existingOrders.map((o) => o.orderId));
    assert.strictEqual(existingIds.size, existingOrders.length, 'Every existing order in orders.json must have a unique id');
    assert.strictEqual(existingOrderIds.size, existingOrders.length, 'Every existing order in orders.json must have a unique orderId');

    // Create 3 test orders (Order 1, Order 2, Order 3)
    const createTestOrder = async (customerName, mobileNumber, deliveryAddress, qty) => {
      const res = await fetch(`${BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-test-suite': 'true'
        },
        body: JSON.stringify({
          customerName,
          mobileNumber,
          deliveryAddress,
          paymentMethod: 'Cash on Delivery',
          items: [{ id: 'salted', productId: 'salted', name: 'Salted', quantity: qty, price: 50 }]
        })
      });
      assert.strictEqual(res.status, 201, `Creating order for ${customerName} should return 201`);
      const data = await res.json();
      assert(data.order && data.order.id && data.order.orderId, 'Created order must have unique id and orderId');
      return data.order;
    };

    const order1 = await createTestOrder('Customer One', '09171111111', 'Unit 101 Makati', 1);
    const order2 = await createTestOrder('Customer Two', '09172222222', 'Unit 202 BGC', 2);
    const order3 = await createTestOrder('Customer Three', '09173333333', 'Unit 303 Ortigas', 3);

    assert.notStrictEqual(order1.id, order2.id, 'Order 1 and Order 2 must have distinct unique IDs');
    assert.notStrictEqual(order2.id, order3.id, 'Order 2 and Order 3 must have distinct unique IDs');
    assert.notStrictEqual(order1.orderId, order2.orderId, 'Order 1 and Order 2 must have distinct orderIds');
    assert.notStrictEqual(order2.orderId, order3.orderId, 'Order 2 and Order 3 must have distinct orderIds');

    // Step 9: Update status of Order 1 -> Confirmed
    const patch1Res = await fetch(`${BASE_URL}/api/orders/${encodeURIComponent(order1.id)}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token2}`
      },
      body: JSON.stringify({
        status: 'Confirmed',
        id: order1.id,
        orderId: order1.orderId,
        orderDate: order1.orderDate,
        orderTime: order1.orderTime,
        customerName: order1.customerName
      })
    });
    assert.strictEqual(patch1Res.status, 200, 'Step 9: Updating Order 1 status should succeed');

    // Step 10: Confirm Order 2 and Order 3 did NOT change
    let listRes = await fetch(`${BASE_URL}/api/orders`, {
      headers: { Authorization: `Bearer ${token2}` }
    });
    let listData = await listRes.json();
    let fetched1 = listData.allOrders.find((o) => o.id === order1.id);
    let fetched2 = listData.allOrders.find((o) => o.id === order2.id);
    let fetched3 = listData.allOrders.find((o) => o.id === order3.id);

    assert.strictEqual(fetched1.status, 'Confirmed', 'Order 1 status should be Confirmed');
    assert.strictEqual(fetched2.status, 'New', 'Step 10: Order 2 status must remain New');
    assert.strictEqual(fetched3.status, 'New', 'Step 10: Order 3 status must remain New');

    // Step 11: Update status of Order 2 -> Completed
    const patch2Res = await fetch(`${BASE_URL}/api/orders/${encodeURIComponent(order2.id)}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token2}`
      },
      body: JSON.stringify({
        status: 'Completed',
        id: order2.id,
        orderId: order2.orderId,
        orderDate: order2.orderDate,
        orderTime: order2.orderTime,
        customerName: order2.customerName
      })
    });
    assert.strictEqual(patch2Res.status, 200, 'Step 11: Updating Order 2 status should succeed');

    // Step 12: Confirm Order 1 and Order 3 did NOT change, and refresh preserves all statuses
    listRes = await fetch(`${BASE_URL}/api/orders`, {
      headers: { Authorization: `Bearer ${token2}` }
    });
    listData = await listRes.json();
    fetched1 = listData.allOrders.find((o) => o.id === order1.id);
    fetched2 = listData.allOrders.find((o) => o.id === order2.id);
    fetched3 = listData.allOrders.find((o) => o.id === order3.id);

    assert.strictEqual(fetched1.status, 'Confirmed', 'Step 12: Order 1 must still be Confirmed');
    assert.strictEqual(fetched2.status, 'Completed', 'Step 12: Order 2 must be Completed');
    assert.strictEqual(fetched3.status, 'New', 'Step 12: Order 3 must still be New');
    console.log('✓ Steps 8-12 passed: Order Manager updates ONLY the selected order and preserves statuses on refresh!\n');

    // ------------------------------------------------------------------
    // STEPS 13-17: Manual Form Open/Close Toggle (Order Form Status)
    // ------------------------------------------------------------------
    console.log('--- [Steps 13-17] Testing Manual Order Form Open/Close Toggle & Independence ---');

    // Step 13: Toggle Order Form Status to Closed
    const closeFormRes = await fetch(`${BASE_URL}/api/admin/form-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token2}`
      },
      body: JSON.stringify({ manualFormOpen: false })
    });
    assert.strictEqual(closeFormRes.status, 200, 'Step 13: Setting manualFormOpen=false should return 200');
    const closeFormData = await closeFormRes.json();
    assert.strictEqual(closeFormData.manualFormOpen, false);
    assert.strictEqual(closeFormData.cutoff.manualFormOpen, false);
    assert.strictEqual(closeFormData.cutoff.isOpen, false, 'Step 13: Form must be closed when manualFormOpen is false');
    assert.strictEqual(closeFormData.cutoff.status, 'CLOSED');
    // Verify independence: cutoffDate, cutoffTime, and enabled must NOT have changed!
    assert.strictEqual(
      closeFormData.cutoff.cutoffDate,
      newCutoffDate,
      'Step 13: Manual toggle must NOT alter cutoffDate'
    );
    assert.strictEqual(
      closeFormData.cutoff.cutoffTime,
      newCutoffTime,
      'Step 13: Manual toggle must NOT alter cutoffTime'
    );
    assert.strictEqual(
      closeFormData.cutoff.enabled,
      true,
      'Step 13: Manual toggle must NOT alter cutoff timer enabled state'
    );

    // Step 14: Open customer order form / attempt submission and confirm orders cannot be submitted
    const blockedOrderRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-test-suite': 'true'
      },
      body: JSON.stringify({
        customerName: 'Blocked Customer',
        mobileNumber: '09174444444',
        deliveryAddress: '444 Closed St',
        paymentMethod: 'Cash on Delivery',
        items: [{ id: 'salted', productId: 'salted', name: 'Salted', quantity: 1, price: 50 }]
      })
    });
    assert.strictEqual(blockedOrderRes.status, 403, 'Step 14: Submitting order while manually Closed must return 403');
    const blockedOrderData = await blockedOrderRes.json();
    assert.strictEqual(blockedOrderData.code, 'ORDERS_CLOSED');
    assert(
      blockedOrderData.error.includes('Orders are currently closed. Please check back soon.'),
      'Step 14: Closed error message must be "Orders are currently closed. Please check back soon."'
    );

    // Confirm Admin Order Manager is still accessible while customer form is Closed
    const adminOrdersWhileClosed = await fetch(`${BASE_URL}/api/orders`, {
      headers: { Authorization: `Bearer ${token2}` }
    });
    assert.strictEqual(
      adminOrdersWhileClosed.status,
      200,
      'Step 14: Admin Order Manager must remain accessible while Order Form is Closed'
    );

    // Step 15: Toggle Order Form Status back to Open
    const openFormRes = await fetch(`${BASE_URL}/api/admin/form-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token2}`
      },
      body: JSON.stringify({ manualFormOpen: true })
    });
    assert.strictEqual(openFormRes.status, 200, 'Step 15: Setting manualFormOpen=true should return 200');
    const openFormData = await openFormRes.json();
    assert.strictEqual(openFormData.manualFormOpen, true);
    assert.strictEqual(openFormData.cutoff.isOpen, true, 'Step 15: Form must be open again');

    // Step 16: Confirm customers can submit orders again
    const allowedOrderRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-test-suite': 'true'
      },
      body: JSON.stringify({
        customerName: 'Reopened Customer',
        mobileNumber: '09175555555',
        deliveryAddress: '555 Open St',
        paymentMethod: 'Cash on Delivery',
        items: [{ id: 'salted', productId: 'salted', name: 'Salted', quantity: 1, price: 50 }]
      })
    });
    assert.strictEqual(allowedOrderRes.status, 201, 'Step 16: Customer order submission should succeed when Open');

    console.log('✓ Steps 13-17 passed: Manual Order Form Open/Close toggle works independently and blocks/allows orders!\n');

    // ------------------------------------------------------------------
    // STEP 18: Orders Manager Date Range Filtering (startDate & endDate)
    // ------------------------------------------------------------------
    console.log('--- [Step 18] Testing Orders Manager Date Range Filtering ---');
    const todayPht = getManilaDateStr();
    const rangeRes = await fetch(
      `${BASE_URL}/api/orders?startDate=${encodeURIComponent(todayPht)}&endDate=${encodeURIComponent(todayPht)}&summaryDate=${encodeURIComponent(todayPht)}`,
      { headers: { Authorization: `Bearer ${token2}` } }
    );
    assert.strictEqual(rangeRes.status, 200, 'Step 18: Querying orders by startDate & endDate should return 200');
    const rangeData = await rangeRes.json();
    assert(Array.isArray(rangeData.orders), 'Step 18: Response must include filtered orders array');
    assert(rangeData.orders.length >= 4, 'Step 18: Today date range must include the newly created orders');
    assert(
      rangeData.orders.every((o) => o.orderDate >= todayPht && o.orderDate <= todayPht),
      'Step 18: Every returned order must fall within [startDate, endDate]'
    );

    const futureRangeRes = await fetch(
      `${BASE_URL}/api/orders?startDate=2099-01-01&endDate=2099-01-31&summaryDate=${encodeURIComponent(todayPht)}`,
      { headers: { Authorization: `Bearer ${token2}` } }
    );
    const futureRangeData = await futureRangeRes.json();
    assert.strictEqual(futureRangeData.orders.length, 0, 'Step 18: Out-of-range future dates should return 0 orders');
    console.log('✓ Step 18 passed: Orders Manager Date Range filtering verified!\n');

    // ------------------------------------------------------------------
    // STEP 19: Easy Fill-Out Checkout (Optional Mobile & Clean Manual Address Input)
    // ------------------------------------------------------------------
    console.log('--- [Step 19] Testing Optional Mobile & Clean Manual Address Flow ---');
    const customerFormSrc = fs.readFileSync(path.join(ROOT_DIR, 'src', 'components', 'CustomerForm.jsx'), 'utf8');
    assert(customerFormSrc.includes('Mobile Number (Optional)'), 'Step 19: CustomerForm must label mobile as optional');
    assert(!customerFormSrc.includes('Mobile Number *'), 'Step 19: CustomerForm must NOT require mobile number with asterisk');
    assert(
      customerFormSrc.includes('House/Unit No., Street, Barangay, City/Municipality, Province'),
      'Step 19: CustomerForm must include the helpful address placeholder'
    );
    assert(
      !customerFormSrc.includes('Use My Location'),
      'Step 19: CustomerForm must have pin location removed for clean direct entry'
    );

    // Test 19a: Order with NO mobile number (mobile number completely optional)
    const noMobileOrder = await createTestOrder(
      'Optional Mobile Suki',
      '',
      'Unit 4B, 123 Ayala Ave, Brgy. Bel-Air, Makati City',
      2
    );
    assert.strictEqual(
      noMobileOrder.customerName,
      'Optional Mobile Suki',
      'Step 19a: Order without mobile number must succeed'
    );
    assert.strictEqual(
      noMobileOrder.mobileNumber,
      '',
      'Step 19a: Order without mobile number must store empty string for mobileNumber'
    );

    // Test 19b: Order with short/unusual/informal delivery instructions (no address validation blocking checkout)
    const informalAddressOrder = await createTestOrder(
      'Manual Suki',
      '09177777777',
      'Blue gate beside sari-sari store',
      1
    );
    assert.strictEqual(
      informalAddressOrder.deliveryAddress,
      'Blue gate beside sari-sari store',
      'Step 19b: Informal or unusual address must be accepted without validation errors'
    );
    console.log('✓ Step 19 passed: Optional Mobile Number & Clean Manual Delivery Address verified!\n');

    // ------------------------------------------------------------------
    // STEP 20: Spooky Halloween Theme ("Trick or Treat Crunch!") Verification
    // ------------------------------------------------------------------
    console.log('--- [Step 20] Testing Halloween Theme, Roaming Ghost, Sharp Bats, Leaves & Seasonal Sub-Labels ---');
    const appSrc = fs.readFileSync(path.join(ROOT_DIR, 'src', 'App.jsx'), 'utf8');
    const cssSrc = fs.readFileSync(path.join(ROOT_DIR, 'src', 'index.css'), 'utf8');
    const productsSrc = fs.readFileSync(path.join(ROOT_DIR, 'src', 'config', 'products.js'), 'utf8');
    const flavorCardSrc = fs.readFileSync(path.join(ROOT_DIR, 'src', 'components', 'FlavorCard.jsx'), 'utf8');
    const atmosphereSrc = fs.readFileSync(path.join(ROOT_DIR, 'src', 'components', 'HalloweenAtmosphere.jsx'), 'utf8');

    assert(cssSrc.includes('#1F1025') && cssSrc.includes('#2B1B30') && cssSrc.includes('#FF6B00'), 'Step 20: CSS must include #1F1025, #2B1B30, and #FF6B00');
    assert(appSrc.includes('ANONG FEAR MO TODAY?'), 'Step 20: Hero headline must be ANONG FEAR MO TODAY?');
    assert(
      appSrc.includes("Mani so good, it&apos;s scary. No tricks, just pure crunch!") ||
      appSrc.includes("Mani so good, it's scary. No tricks, just pure crunch!"),
      'Step 20: Hero sub-headline must be Mani so good, it\'s scary. No tricks, just pure crunch!'
    );
    assert(appSrc.includes('Trick or Treat Crunch!'), 'Step 20: Must include Trick or Treat Crunch! theme badge');
    assert(atmosphereSrc.includes('roaming-ghost') && atmosphereSrc.includes('pointer-events-none'), 'Step 20: Roaming ghost must be present and pointer-events-none');
    assert(
      productsSrc.includes("Vampire's Bane") &&
      productsSrc.includes('Midnight BBQ') &&
      productsSrc.includes('Monster Bawang') &&
      productsSrc.includes('Ghostly Pure') &&
      productsSrc.includes('Hellfire Crunch') &&
      productsSrc.includes('Phantom Cream') &&
      productsSrc.includes('Full Moon Cheddar'),
      'Step 20: All 7 seasonal Halloween sub-labels must be defined'
    );
    assert(flavorCardSrc.includes('shadow-pumpkin-tub'), 'Step 20: Product tubs must have warm pumpkin-illuminated box-shadow');
    console.log('✓ Step 20 passed: Spooky Halloween Special ("Trick or Treat Crunch!") verified!\n');

    console.log('================================================================');
    console.log('✅ ALL VERIFICATION STEPS PASSED WITH ZERO ERRORS!');
    console.log('================================================================');
  } finally {
    // Restore original data files
    fs.writeFileSync(SETTINGS_FILE, originalSettingsRaw, 'utf8');
    fs.writeFileSync(ORDERS_FILE, originalOrdersRaw, 'utf8');
    if (serverProc) {
      serverProc.kill();
    }
  }
}

runVerification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
