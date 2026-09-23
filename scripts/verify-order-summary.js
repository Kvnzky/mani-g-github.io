// scratch/verify_order_summary.js
import assert from 'assert';

console.log('--- 1. Testing Date Preset Math (Asia/Manila UTC+8) ---');

const getManilaTodayObj = () => {
  const now = new Date();
  const manilaStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila' }).format(now);
  const [y, m, d] = manilaStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

const formatUtcYMD = (utcDate) => {
  const y = utcDate.getUTCFullYear();
  const m = String(utcDate.getUTCMonth() + 1).padStart(2, '0');
  const d = String(utcDate.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getPresetDateRange = (preset) => {
  const todayObj = getManilaTodayObj();
  const todayStr = formatUtcYMD(todayObj);

  switch (preset) {
    case 'today':
      return { start: todayStr, end: todayStr };

    case 'yesterday': {
      const yestObj = new Date(todayObj.getTime() - 86400000);
      const yestStr = formatUtcYMD(yestObj);
      return { start: yestStr, end: yestStr };
    }

    case 'this-week': {
      const dayOfWeek = todayObj.getUTCDay();
      const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monObj = new Date(todayObj.getTime() + diffToMon * 86400000);
      const sunObj = new Date(monObj.getTime() + 6 * 86400000);
      return { start: formatUtcYMD(monObj), end: formatUtcYMD(sunObj) };
    }

    case 'last-week': {
      const dayOfWeek = todayObj.getUTCDay();
      const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const thisMonObj = new Date(todayObj.getTime() + diffToMon * 86400000);
      const lastMonObj = new Date(thisMonObj.getTime() - 7 * 86400000);
      const lastSunObj = new Date(thisMonObj.getTime() - 1 * 86400000);
      return { start: formatUtcYMD(lastMonObj), end: formatUtcYMD(lastSunObj) };
    }

    case 'this-month': {
      const year = todayObj.getUTCFullYear();
      const month = todayObj.getUTCMonth();
      const startStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const nextMonthObj = new Date(Date.UTC(year, month + 1, 1));
      const endObj = new Date(nextMonthObj.getTime() - 86400000);
      return { start: startStr, end: formatUtcYMD(endObj) };
    }

    case 'last-month': {
      const year = todayObj.getUTCFullYear();
      const month = todayObj.getUTCMonth();
      const lastMonthObj = new Date(Date.UTC(year, month - 1, 1));
      const lmYear = lastMonthObj.getUTCFullYear();
      const lmMonth = lastMonthObj.getUTCMonth();
      const startStr = `${lmYear}-${String(lmMonth + 1).padStart(2, '0')}-01`;
      const thisMonthObj = new Date(Date.UTC(year, month, 1));
      const endObj = new Date(thisMonthObj.getTime() - 86400000);
      return { start: startStr, end: formatUtcYMD(endObj) };
    }

    default:
      return { start: todayStr, end: todayStr };
  }
};

const presets = ['today', 'yesterday', 'this-week', 'last-week', 'this-month', 'last-month'];
presets.forEach(p => {
  const range = getPresetDateRange(p);
  console.log(`Preset [${p}]: ${range.start} -> ${range.end}`);
  assert(range.start <= range.end, `Range start must be <= end for ${p}`);
  assert(/^\d{4}-\d{2}-\d{2}$/.test(range.start), `Invalid start format: ${range.start}`);
  assert(/^\d{4}-\d{2}-\d{2}$/.test(range.end), `Invalid end format: ${range.end}`);
});
console.log('✓ Preset calculations passed successfully!');

console.log('\n--- 2. Testing Aggregation & Filtering Logic ---');

const mockProducts = [
  { id: 'salted', name: 'Salted Mani', price: 50, available: true, icon: '🧂' },
  { id: 'unsalted', name: 'Unsalted Mani', price: 50, available: true, icon: '🥜' },
  { id: 'spicy', name: 'Spicy Mani', price: 50, available: true, icon: '🌶️' },
  { id: 'bbq', name: 'BBQ Mani', price: 50, available: true, icon: '🔥' },
  { id: 'sour-cream', name: 'Sour Cream & Onion', price: 50, available: true, icon: '🥛' },
  { id: 'cheese', name: 'Cheese', price: 50, available: false, icon: '🧀' },
  { id: 'bawang-only', name: 'Bawang Only', price: 50, available: true, icon: '🧄' }
];

const mockOrders = [
  {
    orderId: 'ORD-001',
    orderDate: '2026-09-20',
    status: 'Completed',
    totalTubs: 5,
    subtotal: 250,
    items: [
      { id: 'salted', name: 'Salted Mani', quantity: 3, price: 50 },
      { id: 'bbq', name: 'BBQ Mani', quantity: 2, price: 50 }
    ]
  },
  {
    orderId: 'ORD-002',
    orderDate: '2026-09-21',
    status: 'New',
    totalTubs: 3,
    subtotal: 150,
    items: [
      { id: 'salted', name: 'Salted Mani', quantity: 1, price: 50 },
      { id: 'spicy', name: 'Spicy Mani', quantity: 2, price: 50 }
    ]
  },
  {
    orderId: 'ORD-003',
    orderDate: '2026-09-21',
    status: 'Cancelled', // Should be excluded
    totalTubs: 10,
    subtotal: 500,
    items: [
      { id: 'cheese', name: 'Cheese', quantity: 10, price: 50 }
    ]
  },
  {
    orderId: 'ORD-004',
    orderDate: '2026-09-22',
    status: 'Confirmed',
    totalTubs: 4,
    subtotal: 200,
    flavorQuantities: {
      salted: 0,
      unsalted: 4,
      spicy: 0,
      bbq: 0,
      'sour-cream': 0,
      cheese: 0,
      'bawang-only': 0
    }
  },
  {
    orderId: 'ORD-001', // Duplicate order ID test
    orderDate: '2026-09-20',
    status: 'Completed',
    totalTubs: 5,
    subtotal: 250
  }
];

const filterAndAggregate = (orders, startDate, endDate, products) => {
  const seenIds = new Set();
  const activeOrders = orders.filter((o) => {
    const id = o.orderId || o.id;
    if (seenIds.has(id)) return false;
    seenIds.add(id);

    if ((o.status || '').toLowerCase() === 'cancelled') return false;
    if (startDate && o.orderDate < startDate) return false;
    if (endDate && o.orderDate > endDate) return false;
    return true;
  });

  const totalOrders = activeOrders.length;
  const totalTubs = activeOrders.reduce((sum, o) => sum + (o.totalTubs || 0), 0);
  const totalRevenue = activeOrders.reduce((sum, o) => sum + (o.subtotal || 0), 0);

  // Map flavors
  const map = {};
  products.forEach(p => {
    map[p.id] = {
      id: p.id,
      name: p.name,
      available: p.available,
      price: p.price,
      quantity: 0,
      sales: 0
    };
  });

  activeOrders.forEach(o => {
    if (Array.isArray(o.items) && o.items.length > 0) {
      o.items.forEach(it => {
        const id = it.id || it.productId;
        const q = it.quantity || 0;
        const p = it.price || 50;
        if (!map[id]) map[id] = { id, name: it.name, available: true, price: p, quantity: 0, sales: 0 };
        map[id].quantity += q;
        map[id].sales += q * p;
      });
    } else if (o.flavorQuantities) {
      Object.entries(o.flavorQuantities).forEach(([fid, q]) => {
        if (q > 0) {
          if (!map[fid]) map[fid] = { id: fid, name: fid, available: true, price: 50, quantity: 0, sales: 0 };
          map[fid].quantity += q;
          map[fid].sales += q * map[fid].price;
        }
      });
    }
  });

  const stats = Object.values(map).map(f => ({
    ...f,
    sharePercent: totalTubs > 0 ? ((f.quantity / totalTubs) * 100).toFixed(1) : '0.0'
  }));

  const distinctFlavorsOrdered = stats.filter(f => f.quantity > 0).length;

  return { activeOrders, totalOrders, totalTubs, totalRevenue, stats, distinctFlavorsOrdered };
};

// Test Range 2026-09-20 to 2026-09-22
const res = filterAndAggregate(mockOrders, '2026-09-20', '2026-09-22', mockProducts);

console.log('Total Active Orders:', res.totalOrders);
assert.strictEqual(res.totalOrders, 3, 'Should have 3 orders (excluding cancelled and duplicate)');

console.log('Total Tubs Sold:', res.totalTubs);
assert.strictEqual(res.totalTubs, 12, '3+2 (ord1) + 1+2 (ord2) + 4 (ord4) = 12 tubs');

console.log('Total Revenue:', res.totalRevenue);
assert.strictEqual(res.totalRevenue, 600, '250 + 150 + 200 = ₱600');

console.log('Distinct Flavors Ordered:', res.distinctFlavorsOrdered);
assert.strictEqual(res.distinctFlavorsOrdered, 4, 'Salted (4), BBQ (2), Spicy (2), Unsalted (4)');

// Check zero-order flavors are retained
const cheeseStat = res.stats.find(f => f.id === 'cheese');
assert(cheeseStat, 'Cheese must be in flavor stats even with 0 orders');
assert.strictEqual(cheeseStat.quantity, 0, 'Cheese cancelled orders should result in 0 quantity');
assert.strictEqual(cheeseStat.available, false, 'Cheese availability status should be preserved');

// Check empty state range
const emptyRes = filterAndAggregate(mockOrders, '2026-01-01', '2026-01-02', mockProducts);
assert.strictEqual(emptyRes.totalOrders, 0, 'Should have 0 orders in empty period');
assert.strictEqual(emptyRes.totalTubs, 0, 'Should have 0 tubs in empty period');
assert.strictEqual(emptyRes.totalRevenue, 0, 'Should have 0 revenue in empty period');

console.log('✓ All aggregation, filtering, deduplication, and zero-order tests passed successfully!');
