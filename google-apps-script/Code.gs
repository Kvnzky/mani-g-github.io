/**
 * 🥜 MANI (PEANUTS) ORDERING APP - GOOGLE APPS SCRIPT
 * 
 * Target Google Sheet: https://docs.google.com/spreadsheets/d/1CpPaE3QFmyAuptF4z52vGtpF_YFuuH-EmEHmQXpS8yI/edit
 * Default Spreadsheet ID: 1CpPaE3QFmyAuptF4z52vGtpF_YFuuH-EmEHmQXpS8yI
 * 
 * Instructions:
 * 1. Open your Google Sheet
 * 2. Click Extensions > Apps Script
 * 3. Delete any code in Code.gs and paste this entire code
 * 4. Click Deploy > New deployment
 * 5. Select type: "Web app"
 * 6. Description: "Mani Ordering Web App Backend"
 * 7. Execute as: "Me" (your Google account)
 * 8. Who has access: "Anyone"
 * 9. Click Deploy, Authorize permissions, and copy the Web App URL!
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
 * Handle HTTP GET (Health check, Connectivity Test, and Zero-CORS Browser Direct Orders)
 */
function doGet(e) {
  var tz = getTimezone();
  var ssId = (typeof DEFAULT_SPREADSHEET_ID !== 'undefined' ? DEFAULT_SPREADSHEET_ID : '1CpPaE3QFmyAuptF4z52vGtpF_YFuuH-EmEHmQXpS8yI');

  // If no action or parameters, return health check
  if (!e || !e.parameter || !e.parameter.action) {
    var output = ContentService.createTextOutput(JSON.stringify({
      status: 'ok',
      app: 'Mani Orders Google Apps Script API',
      spreadsheetId: ssId,
      serverTime: Utilities.formatDate(new Date(), tz, "yyyy-MM-dd HH:mm:ss 'GMT'XXX")
    })).setMimeType(ContentService.MimeType.JSON);
    return output;
  }

  // If action is requested via GET (e.g. for zero-install browser mode)
  var lock = LockService.getScriptLock();
  var hasLock = lock.tryLock(30000);
  
  if (!hasLock) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'System busy. Please retry.'
    })).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var action = e.parameter.action;
    var ss = getTargetSpreadsheet(e.parameter.spreadsheetId);

    if (action === 'addOrder' && e.parameter.order) {
      var orderData = JSON.parse(decodeURIComponent(e.parameter.order));
      var result = handleAddOrder(ss, orderData);
      
      if (e.parameter.callback) {
        return ContentService.createTextOutput(e.parameter.callback + '(' + JSON.stringify(result) + ')')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    } else if (action === 'updateStatus') {
      var result = handleUpdateStatus(ss, e.parameter.orderId, e.parameter.orderDate, e.parameter.status);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    } else if (action === 'updatePaymentStatus') {
      var result = handleUpdatePaymentStatus(ss, e.parameter.orderId, e.parameter.orderDate, e.parameter.paymentStatus);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Handle HTTP POST (Order Submissions & Status Updates)
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  // Wait up to 30 seconds for other concurrent writes to avoid conflicts
  var hasLock = lock.tryLock(30000);
  
  if (!hasLock) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'System is busy with another order. Please retry.'
    })).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var rawData = e.postData ? e.postData.contents : null;
    if (!rawData) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'No post data received'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var payload = JSON.parse(rawData);
    var action = payload.action || 'addOrder';
    var ss = getTargetSpreadsheet(payload.spreadsheetId);

    if (action === 'addOrder') {
      var result = handleAddOrder(ss, payload.order);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    } else if (action === 'updateStatus') {
      var result = handleUpdateStatus(ss, payload.orderId, payload.orderDate, payload.status);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    } else if (action === 'updatePaymentStatus') {
      var result = handleUpdatePaymentStatus(ss, payload.orderId, payload.orderDate, payload.paymentStatus);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Unknown action: ' + action
      })).setMimeType(ContentService.MimeType.JSON);
    }

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
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
  // Determine Philippine Date (YYYY-MM-DD)
  var orderDate = order.orderDate || Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
  var orderTime = order.orderTime || Utilities.formatDate(new Date(), tz, 'hh:mm:ss a');

  var sheetName = orderDate;
  var sheet = ss.getSheetByName(sheetName);

  var isNewSheet = false;
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    isNewSheet = true;
    setupSheetHeadersAndSummary(sheet, sheetName);
  }

  // Find next available row in order table (Data starts from row 8)
  var lastRow = sheet.getLastRow();
  var targetRow = Math.max(lastRow + 1, 8);

  // Extract Quantities (supports flavorQuantities map and/or items array)
  var fq = Object.assign({}, order.flavorQuantities || {});
  if (order.items && Array.isArray(order.items)) {
    order.items.forEach(function(item) {
      var key = item.productId || item.id;
      if (key && !fq[key]) {
        fq[key] = Number(item.quantity || 0);
      }
    });
  }
  var saltedQty = Number(fq.salted || 0);
  var unsaltedQty = Number(fq.unsalted || 0);
  var spicyQty = Number(fq.spicy || 0);
  var bbqQty = Number(fq.bbq || 0);
  var sourCreamQty = Number(fq['sour-cream'] || 0);
  var bawangOnlyQty = Number(fq['bawang-only'] || 0);
  var totalPacks = Number(order.totalPacks || 0);
  var subtotal = Number(order.subtotal || 0);
  var paymentStatus = order.paymentStatus || order.paidStatus || 'Unpaid';

  var rowData = [
    order.orderId || 'MANI-' + orderDate.replace(/-/g, '') + '-001', // A: Order ID
    orderDate,                                                        // B: Order Date
    orderTime,                                                        // C: Order Time
    order.customerName || '',                                         // D: Customer Name
    order.mobileNumber || '',                                         // E: Mobile Number
    order.deliveryAddress || order.address || 'N/A',                  // F: Delivery Address
    order.paymentMethod || 'Cash on Delivery',                        // G: Payment Mode
    paymentStatus,                                                    // H: Paid Status (Paid / Unpaid)
    saltedQty,                                                        // I: Salted Qty
    unsaltedQty,                                                      // J: Unsalted Qty
    spicyQty,                                                         // K: Spicy Qty
    bbqQty,                                                           // L: BBQ Qty
    sourCreamQty,                                                     // M: Sour Cream Qty
    bawangOnlyQty,                                                    // N: Bawang Only Qty
    totalPacks,                                                       // O: Total Packs
    subtotal,                                                         // P: Total Amount (PHP)
    order.status || 'New'                                             // Q: Order Status
  ];

  // Write row
  var range = sheet.getRange(targetRow, 1, 1, rowData.length);
  range.setValues([rowData]);

  // Format data row
  range.setFontFamily('Arial');
  range.setFontSize(10);
  range.setVerticalAlignment('middle');
  range.setHorizontalAlignment('center');

  // Alternating row color
  if (targetRow % 2 === 0) {
    range.setBackground('#FDFBF7');
  } else {
    range.setBackground('#FFFFFF');
  }

  // Text align left for text columns (Customer, Address)
  sheet.getRange(targetRow, 4).setHorizontalAlignment('left'); // Customer
  sheet.getRange(targetRow, 6).setHorizontalAlignment('left'); // Address

  // Currency format for Total Amount (Col 16 / P)
  sheet.getRange(targetRow, 16).setNumberFormat('"₱"#,##0.00');

  // Paid Status formatting (Column 8 / H)
  var paidCell = sheet.getRange(targetRow, 8);
  paidCell.setFontWeight('bold');
  if (String(paymentStatus).toLowerCase() === 'paid') {
    paidCell.setFontColor('#065F46').setBackground('#D1FAE5');
  } else {
    paidCell.setFontColor('#92400E').setBackground('#FEF3C7');
  }

  // Status color formatting (Column 17 / Q)
  var statusCell = sheet.getRange(targetRow, 17);
  statusCell.setFontWeight('bold');
  var st = (order.status || 'New').toLowerCase();
  if (st === 'new') statusCell.setFontColor('#D97706').setBackground('#FEF3C7');
  else if (st === 'confirmed') statusCell.setFontColor('#2563EB').setBackground('#DBEAFE');
  else if (st === 'preparing') statusCell.setFontColor('#EA580C').setBackground('#FFEDD5');
  else if (st === 'ready') statusCell.setFontColor('#7C3AED').setBackground('#EDE9FE');
  else if (st === 'completed') statusCell.setFontColor('#059669').setBackground('#D1FAE5');
  else if (st === 'cancelled') statusCell.setFontColor('#DC2626').setBackground('#FEE2E2');

  return {
    success: true,
    tabName: sheetName,
    row: targetRow,
    orderId: rowData[0],
    message: 'Order added successfully to ' + sheetName + ' tab at row ' + targetRow
  };
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

  // Daily Order Summary Metrics Header (Row 2)
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
  // Data starts at row 8, formulas dynamically calculate from row 8 downwards
  var formulas = [
    '=COUNTA(A8:A)',                    // Total Orders
    '=SUM(O8:O)',                       // Total Packs (Col O)
    '=SUM(I8:I)',                       // Salted (Col I)
    '=SUM(J8:J)',                       // Unsalted (Col J)
    '=SUM(K8:K)',                       // Spicy (Col K)
    '=SUM(L8:L)',                       // BBQ (Col L)
    '=SUM(M8:M)',                       // Sour Cream (Col M)
    '=SUM(N8:N)',                       // Bawang Only (Col N)
    '=COUNTIF(G8:G, "*Cash*")',         // COD Orders (Col G)
    '=COUNTIF(G8:G, "*GCash*")',        // GCash Orders (Col G)
    '=COUNTIF(G8:G, "*Maribank*")',     // Maribank Orders (Col G)
    '=COUNTIF(H8:H, "Paid")',           // Paid Orders (Col H)
    '=COUNTIF(H8:H, "Unpaid")',         // Unpaid Orders (Col H)
    '=SUM(P8:P)'                        // Total Sales (PHP) (Col P)
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

  // Column Headers (Row 7)
  var colHeaders = [
    'Order ID', 'Order Date', 'Order Time', 'Customer Name', 'Mobile Number',
    'Delivery Address', 'Payment Mode', 'Paid Status', 'Salted Qty', 'Unsalted Qty',
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

  // Freeze top 7 rows so summary and headers stay visible while scrolling!
  sheet.setFrozenRows(7);

  // Adjust Column Widths for readability
  sheet.setColumnWidth(1, 150); // Order ID
  sheet.setColumnWidth(2, 95);  // Order Date
  sheet.setColumnWidth(3, 95);  // Order Time
  sheet.setColumnWidth(4, 150); // Customer Name
  sheet.setColumnWidth(5, 120); // Mobile Number
  sheet.setColumnWidth(6, 220); // Delivery Address
  sheet.setColumnWidth(7, 125); // Payment Mode
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
 * Handle Updating Order Status in Google Sheet
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

  if (!sheet) {
    return { success: false, error: 'Sheet tab not found for date: ' + targetDate };
  }

  var row = findOrderInSheet(sheet, orderId);
  if (row === -1) {
    return { success: false, error: 'Order ' + orderId + ' not found in sheet ' + sheet.getName() };
  }

  // Update Status in column 17 (Q)
  var cell = sheet.getRange(row, 17);
  cell.setValue(newStatus);
  
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
 * Handle Updating Paid Status in Google Sheet (Column 8 / H)
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

  if (!sheet) {
    return { success: false, error: 'Sheet tab not found for date: ' + targetDate };
  }

  var row = findOrderInSheet(sheet, orderId);
  if (row === -1) {
    return { success: false, error: 'Order ' + orderId + ' not found in sheet ' + sheet.getName() };
  }

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
