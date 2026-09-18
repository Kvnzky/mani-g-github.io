/**
 * 🥜 MANI WANDERING ORDERING APP - GOOGLE APPS SCRIPT BACKEND
 * 
 * Target Google Sheet: https://docs.google.com/spreadsheets/d/1CpPaE3QFmyAuptF4z52vGtpF_YFuuH-EmEHmQXpS8yI/edit
 * Default Spreadsheet ID: 1CpPaE3QFmyAuptF4z52vGtpF_YFuuH-EmEHmQXpS8yI
 * 
 * 17-Column Standard Order Layout (Columns A to Q):
 * 1  (A): Order ID
 * 2  (B): Order Date
 * 3  (C): Order Time
 * 4  (D): Customer Name
 * 5  (E): Mobile Number
 * 6  (F): Payment Mode
 * 7  (G): Delivery Address
 * 8  (H): Paid Status (Paid / Unpaid)
 * 9  (I): Salted Qty (₱50)
 * 10 (J): Unsalted Qty (₱50)
 * 11 (K): Spicy Qty (₱50)
 * 12 (L): BBQ Qty (₱50)
 * 13 (M): Sour Cream Qty (₱50)
 * 14 (N): Bawang Only Qty (₱60)
 * 15 (O): Total Packs [Formula: =SUM(I{row}:N{row})]
 * 16 (P): Total Amount (₱) [Formula: =(SUM(I{row}:M{row})*50)+(N{row}*60)]
 * 17 (Q): Order Status (New, Confirmed, Preparing, Ready, Completed, Cancelled)
 * 
 * 17-Column Aligned Summary Dashboard (Rows 2 & 3, aligned 1:1 with Data Columns):
 * A: Total Orders               [=COUNTA(A8:A)]
 * B: Log Date                   [="YYYY-MM-DD"]
 * C: COD Orders                 [=COUNTIF(F8:F, "*Cash*")]
 * D: GCash Orders               [=COUNTIF(F8:F, "*GCash*")]
 * E: Maribank Orders            [=COUNTIF(F8:F, "*Maribank*")]
 * F: Paid Orders                [=COUNTIF(H8:H, "Paid")]
 * G: Unpaid Orders              [=COUNTIF(H8:H, "Unpaid")]
 * H: Payment Ratio              [="Paid: " & COUNTIF(H8:H, "Paid") & " / " & COUNTA(A8:A)]
 * I: Salted (₱50)               [=SUM(I8:I)]
 * J: Unsalted (₱50)             [=SUM(J8:J)]
 * K: Spicy (₱50)                [=SUM(K8:K)]
 * L: BBQ (₱50)                  [=SUM(L8:L)]
 * M: Sour Cream (₱50)           [=SUM(M8:M)]
 * N: Bawang Only (₱60)          [=SUM(N8:N)]
 * O: Total Packs                [=SUM(O8:O)]
 * P: Total Revenue (₱)          [=SUM(P8:P)]
 * Q: Active Orders              [=COUNTIFS(A8:A, "<>", Q8:Q, "<>Completed") & " active"]
 */

var DEFAULT_SPREADSHEET_ID = '1CpPaE3QFmyAuptF4z52vGtpF_YFuuH-EmEHmQXpS8yI';
var TIMEZONE = 'Asia/Manila';

/**
 * Custom UI Menu inside Google Sheets
 */
function onOpen() {
  try {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('🥜 Mani Wandering')
      .addItem('🧹 Clean Test Orders & Fix Calculations', 'menuCleanAndRepair')
      .addItem('📐 Refresh Summary Dashboard & Formulas', 'menuFixLayout')
      .addToUi();
  } catch (e) {}
}

function menuCleanAndRepair() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var res = handleCleanAllSheets(ss);
  SpreadsheetApp.getUi().alert('Cleanup & Formula Repair Complete', res.message, SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuFixLayout() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var res = handleFixAllSheets(ss);
  SpreadsheetApp.getUi().alert('Dashboard Refresh Complete', res.message, SpreadsheetApp.getUi().ButtonSet.OK);
}

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
 * Handle HTTP GET (Health check, Self-healing layout trigger, Cleanup, and Status queries)
 */
function doGet(e) {
  var tz = getTimezone();
  var ssId = (typeof DEFAULT_SPREADSHEET_ID !== 'undefined' ? DEFAULT_SPREADSHEET_ID : '1CpPaE3QFmyAuptF4z52vGtpF_YFuuH-EmEHmQXpS8yI');

  if (!e || !e.parameter || !e.parameter.action) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'ok',
      app: 'Mani Wandering Google Apps Script Backend',
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

    if (action === 'cleanSheet' || action === 'cleanup' || action === 'cleanTestOrders') {
      var result = handleCleanAllSheets(ss);
      return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    } else if (action === 'fixSheet' || action === 'repairLayout') {
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
 * Handle HTTP POST (Order Submissions, Layout Fixes, Cleanups & Status Updates)
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
    } else if (action === 'cleanSheet' || action === 'cleanup' || action === 'cleanTestOrders') {
      var result = handleCleanAllSheets(ss);
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
 * Repair and align all sheets in the spreadsheet with 17-column layout and formulas
 */
function handleFixAllSheets(ss) {
  var sheets = ss.getSheets();
  var fixed = [];
  for (var i = 0; i < sheets.length; i++) {
    var sh = sheets[i];
    var name = sh.getName();
    if (/^\d{4}-\d{2}-\d{2}$/.test(name) || i === 0) {
      fixAndAlignSheet(sh, name);
      fixed.push(name);
    }
  }
  return { success: true, fixedTabs: fixed, message: 'All sheets successfully realigned with correct 17-column headers and dynamic formulas.' };
}

/**
 * Clean all test orders and repair calculations across all date sheets
 */
function handleCleanAllSheets(ss) {
  var sheets = ss.getSheets();
  var cleaned = [];

  for (var i = 0; i < sheets.length; i++) {
    var sh = sheets[i];
    var name = sh.getName();

    if (/^\d{4}-\d{2}-\d{2}$/.test(name)) {
      cleanAndRepairDateSheet(sh, name);
      cleaned.push(name);
    } else if (name === 'Sheet1' || i === 0) {
      setupSheetHeadersAndSummary(sh, name);
    }
  }

  return {
    success: true,
    cleanedTabs: cleaned,
    message: 'Test orders successfully cleaned and all price calculations/totals restored to accurate dynamic formulas.'
  };
}

/**
 * Cleans a specific date sheet: removes Juan Dela Cruz / test orders, corrects Mermer's order, and resets formulas
 */
function cleanAndRepairDateSheet(sheet, dateStr) {
  setupSheetHeadersAndSummary(sheet, dateStr);

  var lastRow = sheet.getLastRow();
  if (lastRow < 8) return;

  var lastCol = Math.max(sheet.getLastColumn(), 17);
  var rawValues = sheet.getRange(8, 1, lastRow - 7, lastCol).getValues();

  var validRows = [];

  for (var i = 0; i < rawValues.length; i++) {
    var r = rawValues[i];
    var customer = String(r[3] || '').trim();
    var customerLower = customer.toLowerCase();
    var orderId = String(r[0] || '').trim();

    // Identify test orders to exclude
    var isTest = customerLower.includes('juan dela cruz') ||
                 customerLower.includes('test') ||
                 customerLower.includes('bypass') ||
                 orderId.toLowerCase().includes('test');

    if (isTest) {
      continue; // Drop test row
    }

    var isMermer = customerLower.includes('mermer');

    // Parse and normalize orderDate
    var rawDate = r[1];
    var orderDate = dateStr;
    if (rawDate instanceof Date) {
      orderDate = Utilities.formatDate(rawDate, getTimezone(), 'yyyy-MM-dd');
    } else if (rawDate) {
      var sDate = String(rawDate).trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(sDate)) {
        orderDate = sDate;
      }
    }

    // Parse and normalize orderTime
    var rawTime = r[2];
    var orderTime = '10:29:32 AM';
    if (rawTime instanceof Date) {
      orderTime = Utilities.formatDate(rawTime, getTimezone(), 'hh:mm:ss a');
    } else if (rawTime) {
      var sTime = String(rawTime).trim();
      if (!sTime.includes('GMT') && sTime.length < 20) {
        orderTime = sTime;
      }
    }

    var mobile = String(r[4] || '');
    var paymentMode = String(r[5] || 'GCash');
    var address = String(r[6] || '');
    var paidStatus = String(r[7] || 'Paid');

    var salted = Number(r[8] || 0);
    var unsalted = Number(r[9] || 0);
    var spicy = Number(r[10] || 0);
    var bbq = Number(r[11] || 0);
    var sourCream = Number(r[12] || 0);
    var bawangOnly = Number(r[13] || 0);
    var orderStatus = String(r[16] || 'New');

    if (isMermer) {
      // Customer Mermer ordered Spicy, BBQ, Salted, and Sour Cream (1 pack each = 4 packs, ₱200, GCash, Paid)
      salted = 1;
      unsalted = 0;
      spicy = 1;
      bbq = 1;
      sourCream = 1;
      bawangOnly = 0;
      paymentMode = 'GCash';
      paidStatus = 'Paid';
      orderStatus = 'New';
    }

    validRows.push({
      orderId: orderId,
      orderDate: orderDate,
      orderTime: orderTime,
      customer: customer,
      mobile: mobile,
      paymentMode: paymentMode,
      address: address,
      paidStatus: paidStatus,
      salted: salted,
      unsalted: unsalted,
      spicy: spicy,
      bbq: bbq,
      sourCream: sourCream,
      bawangOnly: bawangOnly,
      orderStatus: orderStatus
    });
  }

  // Clear all old data rows from row 8 downwards
  if (lastRow >= 8) {
    sheet.getRange(8, 1, lastRow - 7, sheet.getMaxColumns()).clearContent().clearFormat();
  }

  // If no genuine rows remain, leave rows 1-7 pristine
  if (validRows.length === 0) {
    return;
  }

  // Write back genuine rows with dynamic formulas
  for (var k = 0; k < validRows.length; k++) {
    var v = validRows[k];
    var targetRow = 8 + k;

    var totalPacksFormula = '=SUM(I' + targetRow + ':N' + targetRow + ')';
    var totalAmountFormula = '=(SUM(I' + targetRow + ':M' + targetRow + ')*50)+(N' + targetRow + '*60)';

    var cleanRow = [
      v.orderId,
      v.orderDate,
      v.orderTime,
      v.customer,
      v.mobile,
      v.paymentMode,
      v.address,
      v.paidStatus,
      v.salted,
      v.unsalted,
      v.spicy,
      v.bbq,
      v.sourCream,
      v.bawangOnly,
      totalPacksFormula,
      totalAmountFormula,
      v.orderStatus
    ];

    sheet.getRange(targetRow, 1, 1, 17).setValues([cleanRow]);
    formatDataRow(sheet, targetRow, cleanRow);
  }
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
    // Verify headers alignment
    var h14 = String(sheet.getRange(2, 14).getValue() || '');
    if (h14 !== 'Bawang Only (₱60)') {
      setupSheetHeadersAndSummary(sheet, sheetName);
    }
  }

  var lastRow = sheet.getLastRow();
  var targetRow = Math.max(lastRow + 1, 8);

  var fq = order.flavorQuantities || {};
  // If flavorQuantities was omitted but items array was provided, extract quantities
  if ((!order.flavorQuantities || Object.keys(order.flavorQuantities).length === 0) && Array.isArray(order.items)) {
    fq = { salted: 0, unsalted: 0, spicy: 0, bbq: 0, 'sour-cream': 0, 'bawang-only': 0 };
    order.items.forEach(function(it) {
      var k = it.productId || it.id;
      if (k && fq[k] !== undefined) {
        fq[k] = (fq[k] || 0) + Number(it.quantity || 0);
      }
    });
  }

  var saltedQty = Number(fq.salted || 0);
  var unsaltedQty = Number(fq.unsalted || 0);
  var spicyQty = Number(fq.spicy || 0);
  var bbqQty = Number(fq.bbq || 0);
  var sourCreamQty = Number(fq['sour-cream'] || 0);
  var bawangOnlyQty = Number(fq['bawang-only'] || 0);

  var paymentMethod = (order.paymentMethod || order.paymentMode || 'Cash on Delivery').trim();
  var defaultPaidStatus = paymentMethod.toLowerCase().includes('cash') ? 'Unpaid' : 'Paid';
  var paymentStatus = order.paymentStatus || order.paidStatus || defaultPaidStatus;

  var totalPacksFormula = '=SUM(I' + targetRow + ':N' + targetRow + ')';
  var totalAmountFormula = '=(SUM(I' + targetRow + ':M' + targetRow + ')*50)+(N' + targetRow + '*60)';

  // 17-Column Standard Order Array
  var rowData = [
    order.orderId || 'MANI-' + orderDate.replace(/-/g, '') + '-001', // Col 1  (A): Order ID
    orderDate,                                                        // Col 2  (B): Order Date
    orderTime,                                                        // Col 3  (C): Order Time
    order.customerName || order.name || '',                           // Col 4  (D): Customer Name
    order.mobileNumber || order.mobile || '',                         // Col 5  (E): Mobile Number
    paymentMethod,                                                    // Col 6  (F): Payment Mode
    order.deliveryAddress || order.address || 'N/A',                  // Col 7  (G): Delivery Address
    paymentStatus,                                                    // Col 8  (H): Paid Status
    saltedQty,                                                        // Col 9  (I): Salted Qty
    unsaltedQty,                                                      // Col 10 (J): Unsalted Qty
    spicyQty,                                                         // Col 11 (K): Spicy Qty
    bbqQty,                                                           // Col 12 (L): BBQ Qty
    sourCreamQty,                                                     // Col 13 (M): Sour Cream Qty
    bawangOnlyQty,                                                    // Col 14 (N): Bawang Only Qty
    totalPacksFormula,                                                // Col 15 (O): Total Packs (Formula)
    totalAmountFormula,                                               // Col 16 (P): Total Amount (Formula)
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
  var range = sheet.getRange(targetRow, 1, 1, 17);
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

  // Plain text format for dates/times to prevent long GMT strings
  sheet.getRange(targetRow, 2).setNumberFormat('@');
  sheet.getRange(targetRow, 3).setNumberFormat('@');
  sheet.getRange(targetRow, 5).setNumberFormat('@');

  // Number format for pack counts (Cols 9-15)
  sheet.getRange(targetRow, 9, 1, 7).setNumberFormat('#,##0');
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
 * Setup sheet formatting: Top Daily Summary Dashboard + Column Headers (17 Columns Exact Alignment)
 */
function setupSheetHeadersAndSummary(sheet, dateStr) {
  // Title Bar (Row 1)
  sheet.getRange('A1:Q1').breakApart();
  sheet.getRange('A1:Q1').merge()
    .setValue('🥜 MANI WANDERING ORDERS — DAILY LOG & SUMMARY (' + dateStr + ')')
    .setFontFamily('Arial')
    .setFontSize(13)
    .setFontWeight('bold')
    .setBackground('#613F20')
    .setFontColor('#FFFFFF')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.setRowHeight(1, 35);

  // Daily Order Summary Metrics Header (Row 2) - Exactly 17 columns aligned 1:1 with columns A-Q
  var summaryHeaders = [
    'Total Orders',      // Col A (1)
    'Log Date',          // Col B (2)
    'COD Orders',        // Col C (3)
    'GCash Orders',      // Col D (4)
    'Maribank Orders',   // Col E (5)
    'Paid Orders',       // Col F (6)
    'Unpaid Orders',     // Col G (7)
    'Payment Ratio',     // Col H (8)
    'Salted (₱50)',      // Col I (9)
    'Unsalted (₱50)',    // Col J (10)
    'Spicy (₱50)',       // Col K (11)
    'BBQ (₱50)',         // Col L (12)
    'Sour Cream (₱50)',  // Col M (13)
    'Bawang Only (₱60)', // Col N (14)
    'Total Packs',       // Col O (15)
    'Total Sales (₱)',   // Col P (16)
    'Pending / Active'   // Col Q (17)
  ];

  sheet.getRange('A2:Q2').breakApart();
  sheet.getRange('A2:Q2').setValues([summaryHeaders])
    .setFontFamily('Arial')
    .setFontSize(9)
    .setFontWeight('bold')
    .setBackground('#9E7241')
    .setFontColor('#FFFFFF')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.setRowHeight(2, 24);

  // Daily Order Summary Dynamic Formulas (Row 3) - Exactly 17 columns aligned 1:1 with columns A-Q
  var formulas = [
    '=COUNTA(A8:A)',                                                      // Col A: Total Orders
    '="' + dateStr + '"',                                                 // Col B: Log Date
    '=COUNTIF(F8:F, "*Cash*")',                                           // Col C: COD Orders
    '=COUNTIF(F8:F, "*GCash*")',                                          // Col D: GCash Orders
    '=COUNTIF(F8:F, "*Maribank*")',                                       // Col E: Maribank Orders
    '=COUNTIF(H8:H, "Paid")',                                             // Col F: Paid Orders
    '=COUNTIF(H8:H, "Unpaid")',                                           // Col G: Unpaid Orders
    '="Paid: " & COUNTIF(H8:H, "Paid") & " / " & COUNTA(A8:A)',           // Col H: Payment Ratio
    '=SUM(I8:I)',                                                         // Col I: Salted Qty Sum
    '=SUM(J8:J)',                                                         // Col J: Unsalted Qty Sum
    '=SUM(K8:K)',                                                         // Col K: Spicy Qty Sum
    '=SUM(L8:L)',                                                         // Col L: BBQ Qty Sum
    '=SUM(M8:M)',                                                         // Col M: Sour Cream Qty Sum
    '=SUM(N8:N)',                                                         // Col N: Bawang Only Qty Sum
    '=SUM(O8:O)',                                                         // Col O: Total Packs Sum
    '=SUM(P8:P)',                                                         // Col P: Total Revenue Sum
    '=COUNTIFS(A8:A, "<>", Q8:Q, "<>Completed") & " active"'              // Col Q: Active Orders
  ];

  sheet.getRange('A3:Q3').breakApart();
  sheet.getRange('A3:Q3').setFormulas([formulas])
    .setFontFamily('Arial')
    .setFontSize(11)
    .setFontWeight('bold')
    .setBackground('#FFF8EB')
    .setFontColor('#4B3019')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.setRowHeight(3, 30);
  sheet.getRange('P3').setNumberFormat('"₱"#,##0.00');

  // Blank Separator (Rows 4, 5, 6)
  sheet.setRowHeight(4, 8);
  sheet.setRowHeight(5, 8);
  sheet.setRowHeight(6, 8);

  // Column Headers (Row 7) - Exactly 17 columns
  var colHeaders = [
    'Order ID',          // Col 1  (A)
    'Order Date',        // Col 2  (B)
    'Order Time',        // Col 3  (C)
    'Customer Name',     // Col 4  (D)
    'Mobile Number',     // Col 5  (E)
    'Payment Mode',      // Col 6  (F)
    'Delivery Address',  // Col 7  (G)
    'Paid Status',       // Col 8  (H)
    'Salted Qty',        // Col 9  (I)
    'Unsalted Qty',      // Col 10 (J)
    'Spicy Qty',         // Col 11 (K)
    'BBQ Qty',           // Col 12 (L)
    'Sour Cream Qty',    // Col 13 (M)
    'Bawang Only Qty',   // Col 14 (N)
    'Total Packs',       // Col 15 (O)
    'Total Amount (₱)',  // Col 16 (P)
    'Order Status'       // Col 17 (Q)
  ];

  var hRange = sheet.getRange(7, 1, 1, colHeaders.length);
  hRange.breakApart();
  hRange.setValues([colHeaders])
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
  sheet.setColumnWidth(9, 90);  // Salted
  sheet.setColumnWidth(10, 90); // Unsalted
  sheet.setColumnWidth(11, 90); // Spicy
  sheet.setColumnWidth(12, 90); // BBQ
  sheet.setColumnWidth(13, 105);// Sour Cream
  sheet.setColumnWidth(14, 115);// Bawang Only
  sheet.setColumnWidth(15, 95); // Total Packs
  sheet.setColumnWidth(16, 125);// Total Amount
  sheet.setColumnWidth(17, 115);// Order Status
}

/**
 * Self-healing repair: Re-aligns existing data rows and sets proper headers and formulas
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
    var rawDate = r[1];
    var orderDate = dateStr;
    if (rawDate instanceof Date) {
      orderDate = Utilities.formatDate(rawDate, getTimezone(), 'yyyy-MM-dd');
    } else if (rawDate) {
      var sDate = String(rawDate).trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(sDate)) orderDate = sDate;
    }

    var rawTime = r[2];
    var orderTime = '';
    if (rawTime instanceof Date) {
      orderTime = Utilities.formatDate(rawTime, getTimezone(), 'hh:mm:ss a');
    } else if (rawTime) {
      var sTime = String(rawTime).trim();
      if (!sTime.includes('GMT')) orderTime = sTime;
      else orderTime = '10:00:00 AM';
    }

    var customer = r[3] || '';
    var mobile = r[4] || '';

    var valF = String(r[5] || '');
    var valG = String(r[6] || '');
    var valH = String(r[7] || '');

    var paymentMode = 'Cash on Delivery';
    var deliveryAddress = '';
    var paidStatus = 'Unpaid';
    var salted = 0, unsalted = 0, spicy = 0, bbq = 0, sourCream = 0, bawangOnly = 0;
    var orderStatus = 'New';

    if (valH.toLowerCase() === 'paid' || valH.toLowerCase() === 'unpaid') {
      paidStatus = (valH.toLowerCase() === 'paid') ? 'Paid' : 'Unpaid';
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
      orderStatus = r[16] || 'New';
    } else {
      paymentMode = valF || 'Cash on Delivery';
      deliveryAddress = valG || '';
      paidStatus = paymentMode.toLowerCase().includes('cash') ? 'Unpaid' : 'Paid';
      salted = Number(r[8] || 0);
      unsalted = Number(r[9] || 0);
      spicy = Number(r[10] || 0);
      bbq = Number(r[11] || 0);
      sourCream = Number(r[12] || 0);
      bawangOnly = Number(r[13] || 0);
      orderStatus = r[16] || 'New';
    }

    var totalPacksFormula = '=SUM(I' + rowNum + ':N' + rowNum + ')';
    var totalAmountFormula = '=(SUM(I' + rowNum + ':M' + rowNum + ')*50)+(N' + rowNum + '*60)';

    var cleanRow = [
      orderId, orderDate, orderTime, customer, mobile,
      paymentMode, deliveryAddress, paidStatus,
      salted, unsalted, spicy, bbq, sourCream, bawangOnly,
      totalPacksFormula, totalAmountFormula, orderStatus
    ];

    sheet.getRange(rowNum, 1, 1, 17).setValues([cleanRow]);
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
