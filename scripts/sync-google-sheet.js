// scripts/sync-google-sheet.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEFAULT_APPS_SCRIPT_URL } from '../src/config/sheetsConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function sync() {
  console.log('Fetching master list orders from Google Apps Script...');
  const res = await fetch(`${DEFAULT_APPS_SCRIPT_URL}?action=getOrders`);
  const data = await res.json();
  
  if (data && data.success && Array.isArray(data.orders)) {
    const ordersWithIds = data.orders.map((o, idx) => ({
      ...o,
      id: o.id || `ord_sheet_${idx + 1}_${o.orderId}`,
      totalTubs: o.totalTubs !== undefined ? o.totalTubs : (o.totalPacks || 0)
    }));

    const ordersFilePath = path.join(__dirname, '..', 'server', 'data', 'orders.json');
    fs.writeFileSync(ordersFilePath, JSON.stringify(ordersWithIds, null, 2), 'utf8');
    console.log(`✅ Successfully synced ${ordersWithIds.length} orders from Google Sheet Master list into server/data/orders.json`);
    console.log('Orders summary:');
    let totalTubs = 0;
    let totalRevenue = 0;
    ordersWithIds.forEach(o => {
      totalTubs += Number(o.totalTubs || o.totalPacks || 0);
      totalRevenue += Number(o.subtotal || 0);
      console.log(` - ${o.orderDate} [${o.orderId}] ${o.customerName}: ${o.totalTubs || o.totalPacks} tubs (₱${o.subtotal}) - Status: ${o.status}`);
    });
    console.log(`Total Master List Tubs: ${totalTubs}, Total Revenue: ₱${totalRevenue}`);
  } else {
    console.error('Failed to fetch orders:', data);
  }
}

sync().catch(console.error);
