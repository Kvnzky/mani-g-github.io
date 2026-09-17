import assert from 'assert';

const BASE_URL = 'http://localhost:3001/api';

async function runTests() {
  console.log('--- STARTING E2E API VERIFICATION WITH ADDRESS & PAYMENT MODES ---');

  // 1. Health check
  console.log('1. Testing /health...');
  const healthRes = await fetch(`${BASE_URL}/health`);
  const health = await healthRes.json();
  assert.strictEqual(health.status, 'ok');
  assert.strictEqual(health.spreadsheetId, '1CpPaE3QFmyAuptF4z52vGtpF_YFuuH-EmEHmQXpS8yI');
  console.log('   ✅ Health OK:', health.time);

  // 2. Missing Delivery Address Validation
  console.log('2. Testing missing delivery address validation...');
  const failRes = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Juan Dela Cruz',
      mobileNumber: '09171234567',
      deliveryAddress: '',
      paymentMethod: 'Cash on Delivery',
      items: [{ id: 'salted', quantity: 1 }]
    })
  });
  assert.strictEqual(failRes.status, 400);
  const failData = await failRes.json();
  assert.match(failData.error, /Address/);
  console.log('   ✅ Address validation rejected as expected:', failData.error);

  // 3. Successful Order 1: Cash on Delivery
  console.log('3. Submitting Order with Cash on Delivery...');
  const order1Res = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Juan Dela Cruz',
      mobileNumber: '0917 123 4567',
      deliveryAddress: 'Unit 4B Sunrise Condominium, Ortigas Center, Pasig City',
      paymentMethod: 'Cash on Delivery',
      items: [
        { id: 'salted', name: 'Salted', quantity: 2, price: 50 },
        { id: 'spicy', name: 'Spicy', quantity: 1, price: 50 }
      ]
    })
  });
  assert.strictEqual(order1Res.status, 201);
  const order1Data = await order1Res.json();
  assert.strictEqual(order1Data.success, true);
  assert.strictEqual(order1Data.order.deliveryAddress, 'Unit 4B Sunrise Condominium, Ortigas Center, Pasig City');
  assert.strictEqual(order1Data.order.paymentMethod, 'Cash on Delivery');
  assert.strictEqual(order1Data.order.totalPacks, 3);
  assert.strictEqual(order1Data.order.subtotal, 150);
  console.log('   ✅ COD Order placed successfully:', order1Data.order.orderId, 'Payment:', order1Data.order.paymentMethod);

  // 4. Successful Order 2: GCash
  console.log('4. Submitting Order with GCash...');
  const order2Res = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Maria Santos',
      mobileNumber: '+639189876543',
      deliveryAddress: 'Block 12 Lot 5 Golden Hills, Antipolo, Rizal',
      paymentMethod: 'GCash',
      items: [
        { id: 'bbq', name: 'BBQ', quantity: 2, price: 50 },
        { id: 'bawang-only', name: 'Bawang Only', quantity: 1, price: 60 }
      ]
    })
  });
  assert.strictEqual(order2Res.status, 201);
  const order2Data = await order2Res.json();
  assert.strictEqual(order2Data.success, true);
  assert.strictEqual(order2Data.order.paymentMethod, 'GCash');
  assert.strictEqual(order2Data.order.subtotal, 160);
  console.log('   ✅ GCash Order placed successfully:', order2Data.order.orderId, 'Payment:', order2Data.order.paymentMethod);

  // 5. Successful Order 3: Maribank
  console.log('5. Submitting Order with Maribank...');
  const order3Res = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Pedro Penduko',
      mobileNumber: '0922 999 8888',
      deliveryAddress: '789 Mabini St, Manila',
      paymentMethod: 'Maribank',
      items: [
        { id: 'sour-cream', name: 'Sour Cream', quantity: 2, price: 50 }
      ]
    })
  });
  assert.strictEqual(order3Res.status, 201);
  const order3Data = await order3Res.json();
  assert.strictEqual(order3Data.success, true);
  assert.strictEqual(order3Data.order.paymentMethod, 'Maribank');
  console.log('   ✅ Maribank Order placed successfully:', order3Data.order.orderId, 'Payment:', order3Data.order.paymentMethod);

  console.log('--- ALL PAYMENT & ADDRESS TESTS PASSED SUCCESSFULLY ---');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
