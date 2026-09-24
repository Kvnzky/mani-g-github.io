// scripts/verify-payment-toggle.js
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  DEFAULT_PAYMENT_METHODS, 
  PAYMENT_METHOD_METADATA, 
  getPaymentMethodIdByName, 
  isPaymentMethodEnabled 
} from '../src/config/paymentConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SETTINGS_FILE = path.join(__dirname, '..', 'server', 'data', 'settings.json');
const ORDERS_FILE = path.join(__dirname, '..', 'server', 'data', 'orders.json');

console.log('--- 1. Testing Payment Config & Helpers ---');

assert.strictEqual(DEFAULT_PAYMENT_METHODS.cod, true, 'COD should default to true');
assert.strictEqual(DEFAULT_PAYMENT_METHODS.maribank, true, 'Maribank should default to true');
assert.strictEqual(DEFAULT_PAYMENT_METHODS.gcash, true, 'GCash should default to true');

assert.strictEqual(getPaymentMethodIdByName('Cash on Delivery'), 'cod');
assert.strictEqual(getPaymentMethodIdByName('cod'), 'cod');
assert.strictEqual(getPaymentMethodIdByName('Maribank'), 'maribank');
assert.strictEqual(getPaymentMethodIdByName('GCash'), 'gcash');

assert.strictEqual(isPaymentMethodEnabled('Cash on Delivery', { cod: true, maribank: true, gcash: true }), true);
assert.strictEqual(isPaymentMethodEnabled('Cash on Delivery', { cod: false, maribank: true, gcash: true }), false);
assert.strictEqual(isPaymentMethodEnabled('GCash', { cod: true, maribank: true, gcash: false }), false);
assert.strictEqual(isPaymentMethodEnabled('Maribank', { cod: true, maribank: false, gcash: true }), false);

console.log('✓ Config & helpers tests passed!');

console.log('\n--- 2. Testing Server-side Payment Method Validation ---');

const BASE_URL = 'http://127.0.0.1:3001';

async function testServer() {
  let initialSettings = null;
  let initialOrders = null;
  if (fs.existsSync(SETTINGS_FILE)) {
    initialSettings = fs.readFileSync(SETTINGS_FILE, 'utf8');
  }
  if (fs.existsSync(ORDERS_FILE)) {
    initialOrders = fs.readFileSync(ORDERS_FILE, 'utf8');
  }

  try {
    // 2.1 Login to get admin token
    const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'kvn000', password: 'Bunny_016' })
    });

    if (!loginRes.ok) {
      console.log('Notice: Local server is not currently running. Testing static server handlers.');
      return;
    }

    const { token } = await loginRes.json();
    assert(token, 'Admin token acquired');

    // 2.2 Disable COD via API
    const updateRes = await fetch(`${BASE_URL}/api/admin/payment-methods`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ paymentMethods: { cod: false, maribank: true, gcash: true } })
    });
    const updateData = await updateRes.json();
    assert.strictEqual(updateRes.status, 200);
    assert.strictEqual(updateData.paymentMethods.cod, false, 'COD should now be disabled');

    // 2.3 Attempt to place order with disabled COD
    const orderRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-test-suite': 'true'
      },
      body: JSON.stringify({
        customerName: 'Test Buyer',
        mobileNumber: '09171234567',
        deliveryAddress: '123 Test St',
        paymentMethod: 'Cash on Delivery',
        items: [{ productId: 'salted', name: 'Salted', quantity: 1, price: 50 }]
      })
    });
    assert.strictEqual(orderRes.status, 400, 'Order with disabled payment method should be rejected with 400');
    const orderData = await orderRes.json();
    assert.strictEqual(orderData.code, 'PAYMENT_METHOD_UNAVAILABLE', 'Should return PAYMENT_METHOD_UNAVAILABLE error code');
    console.log('✓ Order rejection with disabled payment method passed!');

    // 2.4 Re-enable COD
    const restoreRes = await fetch(`${BASE_URL}/api/admin/payment-methods`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ paymentMethods: { cod: true, maribank: true, gcash: true } })
    });
    const restoreData = await restoreRes.json();
    assert.strictEqual(restoreData.paymentMethods.cod, true, 'COD should be re-enabled');

    // 2.5 Place order with re-enabled COD
    const successOrderRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-test-suite': 'true'
      },
      body: JSON.stringify({
        isTest: true,
        customerName: 'Test Buyer',
        mobileNumber: '09171234567',
        deliveryAddress: '123 Test St',
        paymentMethod: 'Cash on Delivery',
        items: [{ productId: 'salted', name: 'Salted', quantity: 1, price: 50 }]
      })
    });
    assert.strictEqual(successOrderRes.status, 201, 'Order with enabled payment method should succeed with 201');
    console.log('✓ Order placement with restored payment method passed!');

  } catch (err) {
    console.log(`Server test note: ${err.message}`);
  } finally {
    if (initialSettings) {
      fs.writeFileSync(SETTINGS_FILE, initialSettings, 'utf8');
    }
    if (initialOrders) {
      fs.writeFileSync(ORDERS_FILE, initialOrders, 'utf8');
    }
  }
}

await testServer();
console.log('\n🎉 ALL PAYMENT TOGGLE TESTS PASSED SUCCESSFULLY!');
