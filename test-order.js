// Test script for Mani Order Backend Logic
import assert from 'assert';

// 1. Philippine Time & Date
const getPhilippineDateTime = (date = new Date()) => {
  const dateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);

  const timeStr = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(date);

  return { dateStr, timeStr };
};

const dt = getPhilippineDateTime();
console.log('✅ Philippine Date & Time:', dt.dateStr, dt.timeStr);
assert.match(dt.dateStr, /^\d{4}-\d{2}-\d{2}$/, 'Date must match YYYY-MM-DD');

// 2. Mobile validation
const validatePhilippineMobile = (mobile) => {
  if (!mobile) return false;
  const cleaned = mobile.replace(/[\s\-()]/g, '');
  return /^(09\d{9}|\+639\d{9}|639\d{9})$/.test(cleaned);
};

const formatPhilippineMobile = (mobile) => {
  const cleaned = mobile.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+63')) return '0' + cleaned.slice(3);
  if (cleaned.startsWith('63')) return '0' + cleaned.slice(2);
  return cleaned;
};

assert.strictEqual(validatePhilippineMobile('09171234567'), true);
assert.strictEqual(validatePhilippineMobile('+639171234567'), true);
assert.strictEqual(validatePhilippineMobile('0917 123 4567'), true);
assert.strictEqual(validatePhilippineMobile('0917-123-4567'), true);
assert.strictEqual(validatePhilippineMobile('12345'), false);
assert.strictEqual(validatePhilippineMobile('08171234567'), false);
assert.strictEqual(formatPhilippineMobile('+639171234567'), '09171234567');
console.log('✅ Philippine Mobile Number validation & formatting passed.');

// 3. Order ID generation
const generateOrderId = (dateStr, seqNumber) => {
  const compactDate = dateStr.replace(/-/g, '');
  const seq = String(seqNumber).padStart(3, '0');
  return `MANI-${compactDate}-${seq}`;
};

const orderId = generateOrderId('2026-09-16', 1);
assert.strictEqual(orderId, 'MANI-20260916-001');
console.log('✅ Order ID generation passed:', orderId);

console.log('All core logic verification tests passed successfully!');
