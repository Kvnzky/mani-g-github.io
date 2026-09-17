/**
 * 🥜 MANI G? ORDERING APP - GOOGLE APPS SCRIPT BACKEND
 * 
 * Target Google Sheet: https://docs.google.com/spreadsheets/d/1CpPaE3QFmyAuptF4z52vGtpF_YFuuH-EmEHmQXpS8yI/edit
 * Default Spreadsheet ID: 1CpPaE3QFmyAuptF4z52vGtpF_YFuuH-EmEHmQXpS8yI
 * 
 * 17-Column Standard Order Layout:
 * 1 (A): Order ID
 * 2 (B): Order Date
 * 3 (C): Order Time
 * 4 (D): Customer Name
 * 5 (E): Mobile Number
 * 6 (F): Payment Mode
 * 7 (G): Delivery Address
 * 8 (H): Paid Status (Paid / Unpaid)
 * 9 (I): Salted Qty
 * 10 (J): Unsalted Qty
 * 11 (K): Spicy Qty
 * 12 (L): BBQ Qty
 * 13 (M): Sour Cream Qty
 * 14 (N): Bawang Only Qty
 * 15 (O): Total Packs
 * 16 (P): Total Amount (₱)
 * 17 (Q): Order Status
 */

var DEFAULT_SPREADSHEET_ID = '1CpPaE3QFmyAuptF4z52vGtpF_YFuuH-EmEHmQXpS8yI';
var TIMEZONE = 'Asia/Manila';

function getTargetSpreadsheet(id) {
  try {
    var active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (err) {}
  var targetId = id || (typeof DEFAULT_SPREADSHEET_ID !== 'undefined' ? DEFAULT_SPREADSHEET_ID : '1CpPaE3QFmyAuptF4z52vGtpF_YFuuH-EmEHmQXpS8yI');
  return SpreadsheetApp.openById(targetId);
}

function getTimezone() {
  return (typeof TIMEZONE !== 'undefined' ? TIMEZONE : 'Asia/Manila');
}

/**
 * Handle HTTP GET (Health check, Self-healing layout trigger, and Status queries)
 */
function doGet(e) {
  var tz = getTimezone();
  var ssId = (typeof DEFAULT_SPREADSHEET_ID !== 'undefined' ? DEFAULT_SPREADSHEET_ID : '1CpPaE3QFmyAuptF4z52vGtpF_YFuuH-EmEHmQXpS8yI');

  if (!e || !e.parameter || !e.parameter.action) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'ok',
      app: 'MANI G? Google Apps Script Backend',
      spreadsheetId: ssId,
      serverTime: Utilities.formatDate(new Date(), tz, "yyyy-MM-dd HH:mm:ss 'GMT'XXX")
    })).setMimeType(ContentService.MimeType.JSON);
  }

  var lock = LockService.getScriptLock();
  var hasLock = lock.tryLock(30000);
  if (!hasLock) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'System busy. Please retry.' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var action = e.parameter.action;
    var ss = getTargetSpreadsheet(e.parameter.spreadsheetId);

    if (action === 'fixSheet' || action === 'repairLayout') {
      var result = handleFixAllSheets(ss);
      return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    } else if (action === 'updateStatus') {
      var result = handleUpdateStatus(ss, e.parameter.orderId, e.parameter.orderDate, e.parameter.status);
      return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    } else if (action === 'updatePaymentStatus') {
      var result = handleUpdatePaymentStatus(ss, e.parameter.orderId, e.parameter.orderDate, e.parameter.paymentStatus);
      return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'ok' })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Handle HTTP POST (Order Submissions, Layout Fixes & Status Updates)
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  var hasLock = lock.tryLock(30000);
  if (!hasLock) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'System busy. Please retry.' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var rawData = e.postData ? e.postData.contents : null;
    if (!rawData) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'No post data received' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var payload = JSON.parse(rawData);
    var action = payload.action || 'addOrder';
    var ss = getTargetSpreadsheet(payload.spreadsheetId);

    if (action === 'addOrder') {
      var result = handleAddOrder(ss, payload.order);
      return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    } else if (action === 'updateStatus') {
      var result = handleUpdateStatus(ss, payload.orderId, payload.orderDate, payload.status);
      return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    } else if (action === 'updatePaymentStatus') {
      var result = handleUpdatePaymentStatus(ss, payload.orderId, payload.orderDate, payload.paymentStatus);
      return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    } else if (action === 'fixSheet' || action === 'repairLayout') {
      var result = handleFixAllSheets(ss);
      return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Unknown action: ' + action }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Self-healing: Repair and align all sheets in the spreadsheet
 */
function handleFixAllSheets(ss) {
  var sheets = ss.getSheets();
  var fixed = [];
  for (var i = 0; i < sheets.length; i++) {
    var sh = sheets[i];
    var name = sh.getName();
    // Only process date-formatted tabs (e.g. 2026-09-17) or active sheets
    if (/^\d{4}-\d{2}-\d{2}$/.test(name) || i === 0) {
      fixAndAlignSheet(sh, name);
      fixed.push(name);
    }
  }
  return { success: true, fixedTabs: fixed, message: 'All sheets successfully realigned with correct headers and column mappings.' };
}

/**
 * Handle adding a new order to the daily date tab (YYYY-MM-DD)
 */
function handleAddOrder(ss, order) {
  if (!order) {
    return { success: false, error: 'Missing order data' };
  }

  var tz = getTimezone();
  var orderDate = order.orderDate || Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
  var orderTime = order.orderTime || Utilities.formatDate(new Date(), tz, 'hh:mm:ss a');

  var sheetName = orderDate;
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    setupSheetHeadersAndSummary(sheet, sheetName);
  } else {
    // Auto-check if existing sheet headers are outdated
    var h8 = String(sheet.getRange(7, 8).getValue() || '');
    if (h8 !== 'Paid Status') {
      fixAndAlignSheet(sheet, sheetName);
    }
  }

  var lastRow = sheet.getLastRow();
  var targetRow = Math.max(lastRow + 1, 8);

  var fq = order.flavorQuantities || {};
  var saltedQty = Number(fq.salted || 0);
  var unsaltedQty = Number(fq.unsalted || 0);
  var spicyQty = Number(fq.spicy || 0);
  var bbqQty = Number(fq.bbq || 0);
  var sourCreamQty = Number(fq['sour-cream'] || 0);
  var bawangOnlyQty = Number(fq['bawang-only'] || 0);
  var totalPacks = Number(order.totalPacks || 0);
  var subtotal = Number(order.subtotal || 0);
  var paymentStatus = order.paymentStatus || order.paidStatus || 'Unpaid';

  // 17-Column Standard Order Array
  var rowData = [
    order.orderId || 'MANI-' + orderDate.replace(/-/g, '') + '-001', // Col 1 (A): Order ID
    orderDate,                                                        // Col 2 (B): Order Date
    orderTime,                                                        // Col 3 (C): Order Time
    order.customerName || '',                                         // Col 4 (D): Customer Name
    order.mobileNumber || '',                                         // Col 5 (E): Mobile Number
    order.paymentMethod || 'Cash on Delivery',                        // Col 6 (F): Payment Mode
    order.deliveryAddress || order.address || 'N/A',                  // Col 7 (G): Delivery Address
    paymentStatus,                                                    // Col 8 (H): Paid Status
    saltedQty,                                                        // Col 9 (I): Salted Qty
    unsaltedQty,                                                      // Col 10 (J): Unsalted Qty
    spicyQty,                                                         // Col 11 (K): Spicy Qty
    bbqQty,                                                           // Col 12 (L): BBQ Qty
    sourCreamQty,                                                     // Col 13 (M): Sour Cream Qty
    bawangOnlyQty,                                                    // Col 14 (N): Bawang Only Qty
    totalPacks,                                                       // Col 15 (O): Total Packs
    subtotal,                                                         // Col 16 (P): Total Amount (PHP)
    order.status || 'New'                                             // Col 17 (Q): Order Status
  ];

  var range = sheet.getRange(targetRow, 1, 1, rowData.length);
  range.setValues([rowData]);
  formatDataRow(sheet, targetRow, rowData);

  return {
    success: true,
    tabName: sheetName,
    row: targetRow,
    orderId: rowData[0],
    message: 'Order added successfully to ' + sheetName + ' tab at row ' + targetRow
  };
}

/**
 * Format a single data row with alternating backgrounds, currencies, and status colors
 */
function formatDataRow(sheet, targetRow, rowData) {
  var range = sheet.getRange(targetRow, 1, 1, rowData.length);
  range.setFontFamily('Arial');
  range.setFontSize(10);
  range.setVerticalAlignment('middle');
  range.setHorizontalAlignment('center');

  // Alternating row background
  if (targetRow % 2 === 0) {
    range.setBackground('#FDFBF7');
  } else {
    range.setBackground('#FFFFFF');
  }

  // Left-align text columns: Customer Name (4) and Delivery Address (7)
  sheet.getRange(targetRow, 4).setHorizontalAlignment('left');
  sheet.getRange(targetRow, 7).setHorizontalAlignment('left');

  // Currency format for Total Amount (Col 16 / P)
  sheet.getRange(targetRow, 16).setNumberFormat('"₱"#,##0.00');

  // Paid Status formatting (Col 8 / H)
  var paidCell = sheet.getRange(targetRow, 8);
  paidCell.setFontWeight('bold');
  var pStatus = String(rowData[7] || '').toLowerCase();
  if (pStatus === 'paid') {
    paidCell.setFontColor('#065F46').setBackground('#D1FAE5');
  } else {
    paidCell.setFontColor('#92400E').setBackground('#FEF3C7');
  }

  // Order Status formatting (Col 17 / Q)
  var statusCell = sheet.getRange(targetRow, 17);
  statusCell.setFontWeight('bold');
  var st = String(rowData[16] || 'New').toLowerCase();
  if (st === 'new') statusCell.setFontColor('#D97706').setBackground('#FEF3C7');
  else if (st === 'confirmed') statusCell.setFontColor('#2563EB').setBackground('#DBEAFE');
  else if (st === 'preparing') statusCell.setFontColor('#EA580C').setBackground('#FFEDD5');
  else if (st === 'ready') statusCell.setFontColor('#7C3AED').setBackground('#EDE9FE');
  else if (st === 'completed') statusCell.setFontColor('#059669').setBackground('#D1FAE5');
  else if (st === 'cancelled') statusCell.setFontColor('#DC2626').setBackground('#FEE2E2');
}

/**
 * Setup sheet formatting: Top Daily Summary Dashboard + Column Headers
 */
function setupSheetHeadersAndSummary(sheet, dateStr) {
  // Title Bar (Row 1)
  sheet.getRange('A1:Q1').merge()
    .setValue('🥜 MANI G? ORDERS — DAILY LOG & SUMMARY (' + dateStr + ')')
    .setFontFamily('Arial')
    .setFontSize(14)
    .setFontWeight('bold')
    .setBackground('#613F20')
    .setFontColor('#FFFFFF')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.setRowHeight(1, 35);

  // Daily Order Summary Metrics Header (Row 2) - 14 metrics across A2:N2
  var summaryHeaders = [
    'Total Orders', 'Total Packs', 'Salted', 'Unsalted', 'Spicy',
    'BBQ', 'Sour Cream', 'Bawang Only', 'COD', 'GCash', 'Maribank', 'Paid Orders', 'Unpaid Orders', 'Total Sales (PHP)'
  ];
  sheet.getRange('A2:N2').setValues([summaryHeaders])
    .setFontFamily('Arial')
    .setFontSize(9)
    .setFontWeight('bold')
    .setBackground('#9E7241')
    .setFontColor('#FFFFFF')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.setRowHeight(2, 24);

  // Daily Order Summary Dynamic Formulas (Row 3)
  // Data starts at row 8, dynamically calculating downwards
  var formulas = [
    '=COUNTA(A8:A)',                    // Col A: Total Orders
    '=SUM(O8:O)',                       // Col B: Total Packs (Col O / 15)
    '=SUM(I8:I)',                       // Col C: Salted (Col I / 9)
    '=SUM(J8:J)',                       // Col D: Unsalted (Col J / 10)
    '=SUM(K8:K)',                       // Col E: Spicy (Col K / 11)
    '=SUM(L8:L)',                       // Col F: BBQ (Col L / 12)
    '=SUM(M8:M)',                       // Col G: Sour Cream (Col M / 13)
    '=SUM(N8:N)',                       // Col H: Bawang Only (Col N / 14)
    '=COUNTIF(F8:F, "*Cash*")',         // Col I: COD Orders (Col F is Payment Mode)
    '=COUNTIF(F8:F, "*GCash*")',        // Col J: GCash Orders (Col F is Payment Mode)
    '=COUNTIF(F8:F, "*Maribank*")',     // Col K: Maribank Orders (Col F is Payment Mode)
    '=COUNTIF(H8:H, "Paid")',           // Col L: Paid Orders (Col H is Paid Status)
    '=COUNTIF(H8:H, "Unpaid")',         // Col M: Unpaid Orders (Col H is Paid Status)
    '=SUM(P8:P)'                        // Col N: Total Sales (PHP) (Col P / 16)
  ];
  sheet.getRange('A3:N3').setFormulas([formulas])
    .setFontFamily('Arial')
    .setFontSize(12)
    .setFontWeight('bold')
    .setBackground('#FFF8EB')
    .setFontColor('#4B3019')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.setRowHeight(3, 30);
  sheet.getRange('N3').setNumberFormat('"₱"#,##0.00');

  // Blank Separator (Rows 4, 5, 6)
  sheet.setRowHeight(4, 8);
  sheet.setRowHeight(5, 8);
  sheet.setRowHeight(6, 8);

  // Column Headers (Row 7) - 17 columns
  var colHeaders = [
    'Order ID', 'Order Date', 'Order Time', 'Customer Name', 'Mobile Number',
    'Payment Mode', 'Delivery Address', 'Paid Status', 'Salted Qty', 'Unsalted Qty',
    'Spicy Qty', 'BBQ Qty', 'Sour Cream Qty', 'Bawang Only Qty', 'Total Packs',
    'Total Amount (₱)', 'Order Status'
  ];

  sheet.getRange(7, 1, 1, colHeaders.length).setValues([colHeaders])
    .setFontFamily('Arial')
    .setFontSize(10)
    .setFontWeight('bold')
    .setBackground('#4B3019')
    .setFontColor('#FFFFFF')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.setRowHeight(7, 28);

  // Freeze top 7 rows
  sheet.setFrozenRows(7);

  // Column Widths
  sheet.setColumnWidth(1, 150); // Order ID
  sheet.setColumnWidth(2, 95);  // Order Date
  sheet.setColumnWidth(3, 95);  // Order Time
  sheet.setColumnWidth(4, 150); // Customer Name
  sheet.setColumnWidth(5, 120); // Mobile Number
  sheet.setColumnWidth(6, 125); // Payment Mode
  sheet.setColumnWidth(7, 220); // Delivery Address
  sheet.setColumnWidth(8, 100); // Paid Status
  sheet.setColumnWidth(9, 85);  // Salted
  sheet.setColumnWidth(10, 85); // Unsalted
  sheet.setColumnWidth(11, 85); // Spicy
  sheet.setColumnWidth(12, 85); // BBQ
  sheet.setColumnWidth(13, 100);// Sour Cream
  sheet.setColumnWidth(14, 110);// Bawang Only
  sheet.setColumnWidth(15, 90); // Total Packs
  sheet.setColumnWidth(16, 120);// Total Amount
  sheet.setColumnWidth(17, 110);// Order Status
}

/**
 * Self-healing repair: Re-aligns existing data rows and sets proper headers
 */
function fixAndAlignSheet(sheet, dateStr) {
  setupSheetHeadersAndSummary(sheet, dateStr);

  var lastRow = sheet.getLastRow();
  if (lastRow < 8) return;

  var lastCol = Math.max(sheet.getLastColumn(), 17);
  var range = sheet.getRange(8, 1, lastRow - 7, lastCol);
  var values = range.getValues();

  for (var i = 0; i < values.length; i++) {
    var r = values[i];
    var rowNum = 8 + i;

    var orderId = r[0];
    var orderDate = r[1];
    var orderTime = r[2];
    var customer = r[3];
    var mobile = r[4];

    var valF = String(r[5] || '');
    var valG = String(r[6] || '');
    var valH = String(r[7] || '');

    var paymentMode = 'Cash on Delivery';
    var deliveryAddress = '';
    var paidStatus = 'Unpaid';
    var salted = 0, unsalted = 0, spicy = 0, bbq = 0, sourCream = 0, bawangOnly = 0;
    var totalPacks = 0, totalAmount = 0, orderStatus = 'New';

    // Check if Col H was numeric (Old format from earlier today where Col H was Salted Qty)
    if (!isNaN(parseFloat(valH)) && isFinite(valH) && valH.trim() !== '') {
      paymentMode = valF || 'Cash on Delivery';
      deliveryAddress = valG || '';
      paidStatus = 'Unpaid';
      salted = Number(r[7] || 0);
      unsalted = Number(r[8] || 0);
      spicy = Number(r[9] || 0);
      bbq = Number(r[10] || 0);
      sourCream = Number(r[11] || 0);
      bawangOnly = Number(r[12] || 0);
      totalPacks = Number(r[13] || 0);
      totalAmount = Number(r[14] || 0);
      orderStatus = r[15] || 'New';
    } 
    // Check if Col H was "Paid" or "Unpaid" (New format where Col F got Address and Col G got Payment Mode)
    else if (valH.toLowerCase() === 'paid' || valH.toLowerCase() === 'unpaid') {
      paidStatus = (valH.toLowerCase() === 'paid') ? 'Paid' : 'Unpaid';
      
      // Separate Payment Mode from Address
      if (valG.toLowerCase().includes('cash') || valG.toLowerCase().includes('gcash') || valG.toLowerCase().includes('maribank')) {
        paymentMode = valG;
        deliveryAddress = valF;
      } else {
        paymentMode = valF;
        deliveryAddress = valG;
      }

      salted = Number(r[8] || 0);
      unsalted = Number(r[9] || 0);
      spicy = Number(r[10] || 0);
      bbq = Number(r[11] || 0);
      sourCream = Number(r[12] || 0);
      bawangOnly = Number(r[13] || 0);
      totalPacks = Number(r[14] || 0);
      totalAmount = Number(r[15] || 0);
      orderStatus = r[16] || 'New';
    } else {
      // Fallback
      paymentMode = valF || 'Cash on Delivery';
      deliveryAddress = valG || '';
      paidStatus = 'Unpaid';
      salted = Number(r[8] || 0);
      unsalted = Number(r[9] || 0);
      spicy = Number(r[10] || 0);
      bbq = Number(r[11] || 0);
      sourCream = Number(r[12] || 0);
      bawangOnly = Number(r[13] || 0);
      totalPacks = Number(r[14] || 0);
      totalAmount = Number(r[15] || 0);
      orderStatus = r[16] || 'New';
    }

    var cleanRow = [
      orderId, orderDate, orderTime, customer, mobile,
      paymentMode, deliveryAddress, paidStatus,
      salted, unsalted, spicy, bbq, sourCream, bawangOnly,
      totalPacks, totalAmount, orderStatus
    ];

    var rowRange = sheet.getRange(rowNum, 1, 1, 17);
    rowRange.setValues([cleanRow]);
    formatDataRow(sheet, rowNum, cleanRow);
  }
}

/**
 * Handle Updating Order Status in Google Sheet (Col 17 / Q)
 */
function handleUpdateStatus(ss, orderId, orderDate, newStatus) {
  if (!orderId) return { success: false, error: 'Missing orderId' };
  
  var targetDate = orderDate || Utilities.formatDate(new Date(), getTimezone(), 'yyyy-MM-dd');
  var sheet = ss.getSheetByName(targetDate);
  if (!sheet) {
    var sheets = ss.getSheets();
    for (var i = 0; i < sheets.length; i++) {
      var foundRow = findOrderInSheet(sheets[i], orderId);
      if (foundRow > 0) {
        sheet = sheets[i];
        break;
      }
    }
  }

  if (!sheet) return { success: false, error: 'Sheet tab not found for date: ' + targetDate };

  var row = findOrderInSheet(sheet, orderId);
  if (row === -1) return { success: false, error: 'Order ' + orderId + ' not found in sheet ' + sheet.getName() };

  // Update Status in column 17 (Q)
  var cell = sheet.getRange(row, 17);
  cell.setValue(newStatus);
  cell.setFontWeight('bold');
  
  var st = (newStatus || '').toLowerCase();
  if (st === 'new') cell.setFontColor('#D97706').setBackground('#FEF3C7');
  else if (st === 'confirmed') cell.setFontColor('#2563EB').setBackground('#DBEAFE');
  else if (st === 'preparing') cell.setFontColor('#EA580C').setBackground('#FFEDD5');
  else if (st === 'ready') cell.setFontColor('#7C3AED').setBackground('#EDE9FE');
  else if (st === 'completed') cell.setFontColor('#059669').setBackground('#D1FAE5');
  else if (st === 'cancelled') cell.setFontColor('#DC2626').setBackground('#FEE2E2');

  return { success: true, orderId: orderId, status: newStatus, tabName: sheet.getName(), row: row };
}

/**
 * Handle Updating Paid Status in Google Sheet (Col 8 / H)
 */
function handleUpdatePaymentStatus(ss, orderId, orderDate, newPaymentStatus) {
  if (!orderId) return { success: false, error: 'Missing orderId' };
  
  var targetDate = orderDate || Utilities.formatDate(new Date(), getTimezone(), 'yyyy-MM-dd');
  var sheet = ss.getSheetByName(targetDate);
  if (!sheet) {
    var sheets = ss.getSheets();
    for (var i = 0; i < sheets.length; i++) {
      var foundRow = findOrderInSheet(sheets[i], orderId);
      if (foundRow > 0) {
        sheet = sheets[i];
        break;
      }
    }
  }

  if (!sheet) return { success: false, error: 'Sheet tab not found for date: ' + targetDate };

  var row = findOrderInSheet(sheet, orderId);
  if (row === -1) return { success: false, error: 'Order ' + orderId + ' not found in sheet ' + sheet.getName() };

  // Update Paid Status in column 8 (H)
  var cell = sheet.getRange(row, 8);
  cell.setValue(newPaymentStatus);
  cell.setFontWeight('bold');
  
  var pst = (newPaymentStatus || '').toLowerCase();
  if (pst === 'paid') {
    cell.setFontColor('#065F46').setBackground('#D1FAE5');
  } else {
    cell.setFontColor('#92400E').setBackground('#FEF3C7');
  }

  return { success: true, orderId: orderId, paymentStatus: newPaymentStatus, tabName: sheet.getName(), row: row };
}

function findOrderInSheet(sheet, orderId) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 8) return -1;
  var orderIds = sheet.getRange(8, 1, lastRow - 7, 1).getValues();
  for (var i = 0; i < orderIds.length; i++) {
    if (orderIds[i][0] === orderId) {
      return i + 8;
    }
  }
  return -1;
}
