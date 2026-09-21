/**
 * 🥜 MANI WANDERING ORDERING APP - GOOGLE APPS SCRIPT BACKEND & REAL-TIME SYNC ENGINE
 * 
 * Target Google Sheet: https://docs.google.com/spreadsheets/d/1CpPaE3QFmyAuptF4z52vGtpF_YFuuH-EmEHmQXpS8yI/edit
 * Default Spreadsheet ID: 1CpPaE3QFmyAuptF4z52vGtpF_YFuuH-EmEHmQXpS8yI
 * 
 * 18-Column Standard Order Layout (Columns A to R):
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
 * 14 (N): Cheese Qty (₱50)
 * 15 (O): Bawang Only Qty (₱60)
 * 16 (P): Total Packs [Formula: =SUM(I{row}:O{row})]
 * 17 (Q): Total Amount (₱) [Formula: =(SUM(I{row}:N{row})*50)+(O{row}*60)]
 * 18 (R): Order Status (New, Confirmed, Preparing, Ready, Completed, Cancelled)
 * 
 * 18-Column Aligned Summary Dashboard (Rows 2 & 3, aligned 1:1 with Data Columns):
 * A: Total Orders               [=COUNTA(A8:A)]
 * B: Log Scope                  [="Master List"]
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
 * N: Cheese (₱50)               [=SUM(N8:N)]
 * O: Bawang Only (₱60)          [=SUM(O8:O)]
 * P: Total Packs                [=SUM(P8:P)]
 * Q: Total Revenue (₱)          [=SUM(Q8:Q)]
 * R: Active Orders              [=COUNTIFS(A8:A, "<>", R8:R, "<>Completed") & " active"]
 */

var DEFAULT_SPREADSHEET_ID = '1CpPaE3QFmyAuptF4z52vGtpF_YFuuH-EmEHmQXpS8yI';
var DEFAULT_NOTIFICATION_EMAIL = 'engrkevinramirez@gmail.com';
var MASTER_SHEET_NAME = 'Master list';
var TIMEZONE = 'Asia/Manila';

/**
 * Custom UI Menu inside Google Sheets
 */
function onOpen() {
  try {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('🥜 Mani Wandering')
      .addItem('📋 1. Consolidate All Orders into Master list', 'menuConsolidateToMasterList')
      .addItem('🔑 2. Authorize Email Notifications', 'authorizeEmailNotifications')
      .addItem('📧 3. Send Test Order Notification Email', 'menuSendTestEmail')
      .addItem('🧹 Clean Test Orders & Fix Calculations', 'menuCleanAndRepair')
      .addItem('📐 Refresh Summary Dashboard & Formulas', 'menuFixLayout')
      .addToUi();
  } catch (e) {}
}

function menuConsolidateToMasterList() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var res = handleConsolidateToMasterList(ss);
  SpreadsheetApp.getUi().alert('Master list Consolidation', res.message, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * 🔑 FORCE AUTHORIZATION FOR EMAIL NOTIFICATIONS
 * Runs an unhandled MailApp call to force Google's OAuth consent prompt.
 * Once authorized, immediately sends a test email to engrkevinramirez@gmail.com.
 */
function authorizeEmailNotifications() {
  var recipient = typeof DEFAULT_NOTIFICATION_EMAIL !== 'undefined' ? DEFAULT_NOTIFICATION_EMAIL : 'engrkevinramirez@gmail.com';
  MailApp.sendEmail({
    to: recipient,
    subject: '✅ Mani Wandering - Email Authorization Successful',
    body: 'Great news! Email notifications for Mani Wandering orders are now authorized and active.\n\nRecipient: ' + recipient + '\nTimestamp: ' + Utilities.formatDate(new Date(), getTimezone(), 'yyyy-MM-dd HH:mm:ss') + ' (PHT)'
  });
  Logger.log('Authorization successful! Confirmation email sent to ' + recipient);
}

function menuSendTestEmail() {
  var res = handleSendTestEmail();
  var msg = res.sent ? ('Notification email successfully sent to ' + res.recipient) : ('Failed to send email: ' + (res.error || res.reason));
  SpreadsheetApp.getUi().alert('Order Email Notification Test', msg, SpreadsheetApp.getUi().ButtonSet.OK);
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
 * Handle HTTP GET (Health check, Real-time Cloud Settings Sync, Cleanups, and Order queries)
 */
function doGet(e) {
  var tz = getTimezone();
  var ssId = (typeof DEFAULT_SPREADSHEET_ID !== 'undefined' ? DEFAULT_SPREADSHEET_ID : '1CpPaE3QFmyAuptF4z52vGtpF_YFuuH-EmEHmQXpS8yI');

  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : '';

  // Fast path for Cloud Settings retrieval (bypasses sheet lock for instant speed)
  if (action === 'getSettings') {
    var settingsRes = handleGetSettings();
    return formatResponse(settingsRes, e);
  }

  // Fast path for Cutoff update via GET (instant sync from mobile/desktop)
  if (action === 'saveCutoff') {
    var enabled = e.parameter.enabled === 'true';
    var date = e.parameter.date || Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
    var time = e.parameter.time || '23:59';
    var saveCutoffRes = handleSaveSettings({
      cutoff: { enabled: enabled, date: date, time: time }
    });
    return formatResponse(saveCutoffRes, e);
  }

  // Fast test email verification endpoint
  if (action === 'testEmail' || action === 'sendTestEmail') {
    var targetRecipient = e.parameter ? e.parameter.to : null;
    var testEmailRes = handleSendTestEmail(targetRecipient);
    return formatResponse(testEmailRes, e);
  }

  if (!action) {
    return formatResponse({
      status: 'ok',
      app: 'Mani Wandering Google Apps Script Backend',
      spreadsheetId: ssId,
      serverTime: Utilities.formatDate(new Date(), tz, "yyyy-MM-dd HH:mm:ss 'GMT'XXX")
    }, e);
  }

  var lock = LockService.getScriptLock();
  var hasLock = lock.tryLock(30000);
  if (!hasLock) {
    return formatResponse({ success: false, error: 'System busy. Please retry.' }, e);
  }

  try {
    var ss = getTargetSpreadsheet(e.parameter.spreadsheetId);
    var result = { status: 'ok' };

    if (action === 'getOrders') {
      result = handleGetOrders(ss, e.parameter.date);
    } else if (action === 'consolidate' || action === 'initMasterList') {
      result = handleConsolidateToMasterList(ss);
    } else if (action === 'cleanSheet' || action === 'cleanup' || action === 'cleanTestOrders') {
      result = handleCleanAllSheets(ss);
    } else if (action === 'fixSheet' || action === 'repairLayout') {
      result = handleFixAllSheets(ss);
    } else if (action === 'updateStatus') {
      result = handleUpdateStatus(ss, e.parameter.orderId, e.parameter.orderDate, e.parameter.status);
    } else if (action === 'updatePaymentStatus') {
      result = handleUpdatePaymentStatus(ss, e.parameter.orderId, e.parameter.orderDate, e.parameter.paymentStatus);
    }

    return formatResponse(result, e);
  } catch (err) {
    return formatResponse({ success: false, error: err.toString() }, e);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Helper to format response supporting both JSON and JSONP for mobile browsers
 */
function formatResponse(data, e) {
  var json = JSON.stringify(data);
  if (e && e.parameter && e.parameter.callback) {
    return ContentService.createTextOutput(e.parameter.callback + '(' + json + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle HTTP POST (Order Submissions, Layout Fixes, Settings Updates & Status Updates)
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

    // Settings sync actions
    if (action === 'saveSettings') {
      var saveRes = handleSaveSettings(payload.settings);
      return ContentService.createTextOutput(JSON.stringify(saveRes)).setMimeType(ContentService.MimeType.JSON);
    } else if (action === 'getSettings') {
      var getRes = handleGetSettings();
      return ContentService.createTextOutput(JSON.stringify(getRes)).setMimeType(ContentService.MimeType.JSON);
    }

    var ss = getTargetSpreadsheet(payload.spreadsheetId);

    if (action === 'addOrder') {
      var result = handleAddOrder(ss, payload.order);
      return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    } else if (action === 'getOrders') {
      var ordRes = handleGetOrders(ss, payload.date);
      return ContentService.createTextOutput(JSON.stringify(ordRes)).setMimeType(ContentService.MimeType.JSON);
    } else if (action === 'consolidate' || action === 'initMasterList') {
      var result = handleConsolidateToMasterList(ss);
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
    } else if (action === 'testEmail' || action === 'sendTestEmail') {
      var emailRes = handleSendTestEmail(payload.to);
      return ContentService.createTextOutput(JSON.stringify(emailRes)).setMimeType(ContentService.MimeType.JSON);
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
 * Get Cloud Settings (Shared persistently across desktop & mobile)
 */
function handleGetSettings() {
  var props = PropertiesService.getScriptProperties();
  var raw = props.getProperty('MANI_SETTINGS');
  var settings = {};
  if (raw) {
    try {
      settings = JSON.parse(raw);
    } catch (e) {}
  }

  // Fallback defaults
  if (!settings.cutoff) {
    settings.cutoff = {
      enabled: true,
      date: Utilities.formatDate(new Date(), getTimezone(), 'yyyy-MM-dd'),
      time: '23:59'
    };
  }

  return {
    success: true,
    settings: settings,
    serverTime: Utilities.formatDate(new Date(), getTimezone(), "yyyy-MM-dd'T'HH:mm:ssXXX")
  };
}

/**
 * Save Cloud Settings (Instantly syncs to mobile and desktop)
 */
function handleSaveSettings(newSettings) {
  if (!newSettings) return { success: false, error: 'Missing settings payload' };
  var payload = (newSettings.settings && typeof newSettings.settings === 'object') ? newSettings.settings : newSettings;
  var props = PropertiesService.getScriptProperties();
  var raw = props.getProperty('MANI_SETTINGS');
  var existing = {};
  if (raw) {
    try {
      existing = JSON.parse(raw);
    } catch (e) {}
  }

  if (payload.cutoff) existing.cutoff = payload.cutoff;
  if (payload.products) existing.products = payload.products;
  if (payload.qrs) existing.qrs = payload.qrs;

  props.setProperty('MANI_SETTINGS', JSON.stringify(existing));

  return {
    success: true,
    settings: existing,
    message: 'Settings successfully synchronized across all devices.'
  };
}

/**
 * Fetch all orders from Google Sheet for the Admin Portal across devices
 */
function handleGetOrders(ss, dateFilter) {
  var tz = getTimezone();
  var todayDateStr = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
  
  // 1. Prioritize Master list tab
  var sheet = ss.getSheetByName(MASTER_SHEET_NAME);
  
  // Fallback to legacy date tab if Master list doesn't exist yet
  if (!sheet) {
    var targetDate = dateFilter || todayDateStr;
    sheet = ss.getSheetByName(targetDate);
    if (!sheet) {
      var sheets = ss.getSheets();
      for (var i = 0; i < sheets.length; i++) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(sheets[i].getName())) {
          sheet = sheets[i];
          break;
        }
      }
    }
  }

  if (!sheet) return { success: true, orders: [], todayDate: todayDateStr, tabName: MASTER_SHEET_NAME };

  var lastRow = sheet.getLastRow();
  if (lastRow < 8) return { success: true, orders: [], todayDate: todayDateStr, tabName: sheet.getName() };

  var lastCol = Math.max(sheet.getLastColumn(), 18);
  var values = sheet.getRange(8, 1, lastRow - 7, lastCol).getValues();
  var col14Name = String(sheet.getRange(7, 14).getValue() || '');
  var hasCheese = (col14Name.indexOf('Cheese') !== -1 || sheet.getLastColumn() >= 18);
  var orders = [];

  for (var i = values.length - 1; i >= 0; i--) {
    var r = values[i];
    var ordId = String(r[0] || '').trim();
    if (!ordId) continue;

    // Normalizing dates and times
    var rawDate = r[1];
    var oDate = todayDateStr;
    if (rawDate instanceof Date) {
      oDate = Utilities.formatDate(rawDate, tz, 'yyyy-MM-dd');
    } else if (rawDate) {
      var sDate = String(rawDate).trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(sDate)) oDate = sDate;
    }

    // Optional date filter: if user requested a specific date filter, only include matching dates
    if (dateFilter && dateFilter !== 'all' && dateFilter !== '') {
      if (oDate !== dateFilter) {
        continue;
      }
    }

    var rawTime = r[2];
    var oTime = '10:00:00 AM';
    if (rawTime instanceof Date) {
      oTime = Utilities.formatDate(rawTime, tz, 'hh:mm:ss a');
    } else if (rawTime) {
      var sTime = String(rawTime).trim();
      if (!sTime.includes('GMT')) oTime = sTime;
    }

    var salted = Number(r[8] || 0);
    var unsalted = Number(r[9] || 0);
    var spicy = Number(r[10] || 0);
    var bbq = Number(r[11] || 0);
    var sourCream = Number(r[12] || 0);
    var cheese = hasCheese ? Number(r[13] || 0) : 0;
    var bawangOnly = hasCheese ? Number(r[14] || 0) : Number(r[13] || 0);
    var totalPacks = hasCheese ? Number(r[15] || 0) : Number(r[14] || 0);
    var subtotal = hasCheese ? Number(r[16] || 0) : Number(r[15] || 0);
    var status = hasCheese ? String(r[17] || 'New') : String(r[16] || 'New');

    orders.push({
      orderId: ordId,
      orderDate: oDate,
      orderTime: oTime,
      customerName: String(r[3] || ''),
      mobileNumber: String(r[4] || ''),
      paymentMethod: String(r[5] || 'Cash on Delivery'),
      deliveryAddress: String(r[6] || ''),
      paymentStatus: String(r[7] || 'Unpaid'),
      flavorQuantities: {
        salted: salted,
        unsalted: unsalted,
        spicy: spicy,
        bbq: bbq,
        'sour-cream': sourCream,
        cheese: cheese,
        'bawang-only': bawangOnly
      },
      totalPacks: totalPacks,
      totalTubs: totalPacks,
      subtotal: subtotal,
      status: status
    });
  }

  return {
    success: true,
    orders: orders,
    todayDate: todayDateStr,
    tabName: sheet.getName()
  };
}

/**
 * 📋 Consolidate all existing orders from any daily tabs into the single "Master list" tab
 */
function handleConsolidateToMasterList(ss) {
  var masterSheet = getOrCreateMasterSheet(ss);
  var sheets = ss.getSheets();
  var tz = getTimezone();
  var todayDateStr = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');

  // Collect all existing order IDs in Master list to avoid duplicates
  var existingIds = {};
  var masterLastRow = masterSheet.getLastRow();
  if (masterLastRow >= 8) {
    var existingValues = masterSheet.getRange(8, 1, masterLastRow - 7, 1).getValues();
    for (var m = 0; m < existingValues.length; m++) {
      var id = String(existingValues[m][0] || '').trim();
      if (id) existingIds[id] = true;
    }
  }

  var importedCount = 0;
  var scannedTabs = [];

  for (var s = 0; s < sheets.length; s++) {
    var sh = sheets[s];
    var name = sh.getName();
    if (name === MASTER_SHEET_NAME) continue;

    scannedTabs.push(name);
    var shLastRow = sh.getLastRow();
    if (shLastRow < 8) continue;

    var rawRows = sh.getRange(8, 1, shLastRow - 7, Math.max(sh.getLastColumn(), 18)).getValues();
    var srcHasCheese = (String(sh.getRange(7, 14).getValue() || '').indexOf('Cheese') !== -1 || sh.getLastColumn() >= 18);
    for (var r = 0; r < rawRows.length; r++) {
      var row = rawRows[r];
      var orderId = String(row[0] || '').trim();
      var customer = String(row[3] || '').trim();
      var customerLower = customer.toLowerCase();

      // Skip empty or test orders
      if (!orderId || !customer) continue;
      if (customerLower.includes('juan dela cruz') || customerLower.includes('test') || customerLower.includes('bypass') || orderId.toLowerCase().includes('test')) {
        continue;
      }

      // Check if already in Master list
      if (existingIds[orderId]) continue;

      // Extract and clean values
      var rawDate = row[1];
      var oDate = name;
      if (rawDate instanceof Date) {
        oDate = Utilities.formatDate(rawDate, tz, 'yyyy-MM-dd');
      } else if (rawDate && /^\d{4}-\d{2}-\d{2}$/.test(String(rawDate).trim())) {
        oDate = String(rawDate).trim();
      } else if (!/^\d{4}-\d{2}-\d{2}$/.test(name)) {
        oDate = todayDateStr;
      }

      var rawTime = row[2];
      var oTime = '10:00:00 AM';
      if (rawTime instanceof Date) {
        oTime = Utilities.formatDate(rawTime, tz, 'hh:mm:ss a');
      } else if (rawTime) {
        var sTime = String(rawTime).trim();
        if (!sTime.includes('GMT') && sTime.length < 25) oTime = sTime;
      }

      var mobile = String(row[4] || '');
      var paymentMode = String(row[5] || 'Cash on Delivery');
      var address = String(row[6] || 'N/A');
      var paidStatus = String(row[7] || (paymentMode.toLowerCase().includes('cash') ? 'Unpaid' : 'Paid'));

      var salted = Number(row[8] || 0);
      var unsalted = Number(row[9] || 0);
      var spicy = Number(row[10] || 0);
      var bbq = Number(row[11] || 0);
      var sourCream = Number(row[12] || 0);
      var cheese = srcHasCheese ? Number(row[13] || 0) : 0;
      var bawangOnly = srcHasCheese ? Number(row[14] || 0) : Number(row[13] || 0);
      var orderStatus = srcHasCheese ? String(row[17] || 'New') : String(row[16] || 'New');

      var targetRow = Math.max(masterSheet.getLastRow() + 1, 8);
      var totalPacksFormula = '=SUM(I' + targetRow + ':O' + targetRow + ')';
      var totalAmountFormula = '=(SUM(I' + targetRow + ':N' + targetRow + ')*50)+(O' + targetRow + '*60)';

      var cleanRow = [
        orderId, oDate, oTime, customer, mobile, paymentMode, address, paidStatus,
        salted, unsalted, spicy, bbq, sourCream, cheese, bawangOnly,
        totalPacksFormula, totalAmountFormula, orderStatus
      ];

      masterSheet.getRange(targetRow, 1, 1, 18).setValues([cleanRow]);
      formatDataRow(masterSheet, targetRow, cleanRow);
      existingIds[orderId] = true;
      importedCount++;
    }
  }

  // Ensure dashboard formulas are up-to-date
  setupSheetHeadersAndSummary(masterSheet, MASTER_SHEET_NAME);

  return {
    success: true,
    importedCount: importedCount,
    masterLastRow: masterSheet.getLastRow(),
    scannedTabs: scannedTabs,
    message: 'Master list is ready! Successfully consolidated ' + importedCount + ' orders into the "Master list" tab.'
  };
}

/**
 * Repair and align all sheets in the spreadsheet with 17-column layout and formulas
 */
function handleFixAllSheets(ss) {
  var masterSheet = getOrCreateMasterSheet(ss);
  fixAndAlignSheet(masterSheet, MASTER_SHEET_NAME);

  var sheets = ss.getSheets();
  var fixed = [MASTER_SHEET_NAME];
  for (var i = 0; i < sheets.length; i++) {
    var sh = sheets[i];
    var name = sh.getName();
    if (name !== MASTER_SHEET_NAME && (/^\d{4}-\d{2}-\d{2}$/.test(name) || name === 'Sheet1')) {
      fixAndAlignSheet(sh, name);
      fixed.push(name);
    }
  }
  return { success: true, fixedTabs: fixed, message: 'Master list and sheets successfully realigned with correct 17-column headers and dynamic formulas.' };
}

/**
 * Clean all test orders and repair calculations across all date sheets
 */
function handleCleanAllSheets(ss) {
  var masterSheet = getOrCreateMasterSheet(ss);
  cleanAndRepairDateSheet(masterSheet, MASTER_SHEET_NAME);

  var sheets = ss.getSheets();
  var cleaned = [MASTER_SHEET_NAME];

  for (var i = 0; i < sheets.length; i++) {
    var sh = sheets[i];
    var name = sh.getName();

    if (name !== MASTER_SHEET_NAME && /^\d{4}-\d{2}-\d{2}$/.test(name)) {
      cleanAndRepairDateSheet(sh, name);
      cleaned.push(name);
    }
  }

  return {
    success: true,
    cleanedTabs: cleaned,
    message: 'Test orders successfully cleaned and all price calculations/totals in Master list restored to accurate dynamic formulas.'
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
    var orderDate = Utilities.formatDate(new Date(), getTimezone(), 'yyyy-MM-dd');
    if (rawDate instanceof Date) {
      orderDate = Utilities.formatDate(rawDate, getTimezone(), 'yyyy-MM-dd');
    } else if (rawDate && /^\d{4}-\d{2}-\d{2}$/.test(String(rawDate).trim())) {
      orderDate = String(rawDate).trim();
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      orderDate = dateStr;
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
 * Get or create the single "Master list" tab
 */
function getOrCreateMasterSheet(ss) {
  var sheet = ss.getSheetByName(MASTER_SHEET_NAME);
  if (!sheet) {
    var sheet1 = ss.getSheetByName('Sheet1');
    if (sheet1 && sheet1.getLastRow() <= 1) {
      sheet = sheet1;
      sheet.setName(MASTER_SHEET_NAME);
    } else {
      sheet = ss.insertSheet(MASTER_SHEET_NAME, 0);
    }
    setupSheetHeadersAndSummary(sheet, MASTER_SHEET_NAME);
  } else {
    var h14 = String(sheet.getRange(2, 14).getValue() || '');
    if (h14 !== 'Cheese (₱50)') {
      setupSheetHeadersAndSummary(sheet, MASTER_SHEET_NAME);
    }
  }
  return sheet;
}

/**
 * Handle adding a new order to the single "Master list" tab
 */
function handleAddOrder(ss, order) {
  if (!order) {
    return { success: false, error: 'Missing order data' };
  }

  var tz = getTimezone();
  var orderDate = order.orderDate || Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
  var orderTime = order.orderTime || Utilities.formatDate(new Date(), tz, 'hh:mm:ss a');

  var sheet = getOrCreateMasterSheet(ss);
  var sheetName = MASTER_SHEET_NAME;

  var lastRow = sheet.getLastRow();
  var targetRow = Math.max(lastRow + 1, 8);

  var fq = order.flavorQuantities || {};
  if ((!order.flavorQuantities || Object.keys(order.flavorQuantities).length === 0) && Array.isArray(order.items)) {
    fq = { salted: 0, unsalted: 0, spicy: 0, bbq: 0, 'sour-cream': 0, cheese: 0, 'bawang-only': 0 };
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
  var cheeseQty = Number(fq.cheese || 0);
  var bawangOnlyQty = Number(fq['bawang-only'] || 0);

  var paymentMethod = (order.paymentMethod || order.paymentMode || 'Cash on Delivery').trim();
  var defaultPaidStatus = paymentMethod.toLowerCase().includes('cash') ? 'Unpaid' : 'Paid';
  var paymentStatus = order.paymentStatus || order.paidStatus || defaultPaidStatus;

  var totalPacksFormula = '=SUM(I' + targetRow + ':O' + targetRow + ')';
  var totalAmountFormula = '=(SUM(I' + targetRow + ':N' + targetRow + ')*50)+(O' + targetRow + '*60)';

  // 18-Column Standard Order Array
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
    cheeseQty,                                                        // Col 14 (N): Cheese Qty
    bawangOnlyQty,                                                    // Col 15 (O): Bawang Only Qty
    totalPacksFormula,                                                // Col 16 (P): Total Packs (Formula)
    totalAmountFormula,                                               // Col 17 (Q): Total Amount (Formula)
    order.status || 'New'                                             // Col 18 (R): Order Status
  ];

  var range = sheet.getRange(targetRow, 1, 1, rowData.length);
  range.setValues([rowData]);
  formatDataRow(sheet, targetRow, rowData);

  // Send immediate Order Notification Email to store owner
  var emailStatus = { sent: false };
  try {
    emailStatus = sendOrderNotificationEmail(order, rowData);
  } catch (mailErr) {
    console.error('Email notification error:', mailErr.toString());
    emailStatus = { sent: false, error: mailErr.toString() };
  }

  return {
    success: true,
    tabName: sheetName,
    row: targetRow,
    orderId: rowData[0],
    emailStatus: emailStatus,
    message: 'Order added successfully to ' + sheetName + ' tab at row ' + targetRow
  };
}

/**
 * Format a single data row with alternating backgrounds, currencies, and status colors
 */
function formatDataRow(sheet, targetRow, rowData) {
  var range = sheet.getRange(targetRow, 1, 1, 18);
  range.setFontFamily('Arial');
  range.setFontSize(10);
  range.setVerticalAlignment('middle');
  range.setHorizontalAlignment('center');

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

  // Number format for pack counts (Cols 9-16)
  sheet.getRange(targetRow, 9, 1, 8).setNumberFormat('#,##0');
  // Currency format for Total Amount (Col 17 / Q)
  sheet.getRange(targetRow, 17).setNumberFormat('"₱"#,##0.00');

  // Paid Status formatting (Col 8 / H)
  var paidCell = sheet.getRange(targetRow, 8);
  paidCell.setFontWeight('bold');
  var pStatus = String(rowData[7] || '').toLowerCase();
  if (pStatus === 'paid') {
    paidCell.setFontColor('#065F46').setBackground('#D1FAE5');
  } else {
    paidCell.setFontColor('#92400E').setBackground('#FEF3C7');
  }

  // Order Status formatting (Col 18 / R)
  var statusCell = sheet.getRange(targetRow, 18);
  statusCell.setFontWeight('bold');
  var st = String(rowData[17] || 'New').toLowerCase();
  if (st === 'new') statusCell.setFontColor('#D97706').setBackground('#FEF3C7');
  else if (st === 'confirmed') statusCell.setFontColor('#2563EB').setBackground('#DBEAFE');
  else if (st === 'preparing') statusCell.setFontColor('#EA580C').setBackground('#FFEDD5');
  else if (st === 'ready') statusCell.setFontColor('#7C3AED').setBackground('#EDE9FE');
  else if (st === 'completed') statusCell.setFontColor('#059669').setBackground('#D1FAE5');
  else if (st === 'cancelled') statusCell.setFontColor('#DC2626').setBackground('#FEE2E2');
}

/**
 * Setup sheet formatting: Top Daily Summary Dashboard + Column Headers (18 Columns Exact Alignment)
 */
function setupSheetHeadersAndSummary(sheet, titleStr) {
  var isMaster = (titleStr === MASTER_SHEET_NAME || sheet.getName() === MASTER_SHEET_NAME);
  var displayTitle = isMaster 
    ? '🥜 MANI WANDERING ORDERS — MASTER LIST' 
    : ('🥜 MANI WANDERING ORDERS — DAILY LOG & SUMMARY (' + (titleStr || sheet.getName()) + ')');

  // Title Bar (Row 1)
  sheet.getRange('A1:R1').breakApart();
  sheet.getRange('A1:R1').merge()
    .setValue(displayTitle)
    .setFontFamily('Arial')
    .setFontSize(13)
    .setFontWeight('bold')
    .setBackground('#613F20')
    .setFontColor('#FFFFFF')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.setRowHeight(1, 35);

  // Daily / Master Order Summary Metrics Header (Row 2) - Exactly 18 columns aligned 1:1 with columns A-R
  var summaryHeaders = [
    'Total Orders',      // Col A (1)
    'Log Scope',         // Col B (2)
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
    'Cheese (₱50)',      // Col N (14)
    'Bawang Only (₱60)', // Col O (15)
    'Total Packs',       // Col P (16)
    'Total Sales (₱)',   // Col Q (17)
    'Pending / Active'   // Col R (18)
  ];

  sheet.getRange('A2:R2').breakApart();
  sheet.getRange('A2:R2').setValues([summaryHeaders])
    .setFontFamily('Arial')
    .setFontSize(9)
    .setFontWeight('bold')
    .setBackground('#9E7241')
    .setFontColor('#FFFFFF')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.setRowHeight(2, 24);

  // Dynamic Summary Formulas (Row 3) - Exactly 18 columns aligned 1:1 with columns A-R
  var logScopeFormula = isMaster ? '="Master List"' : '="' + (titleStr || sheet.getName()) + '"';
  var formulas = [
    '=COUNTA(A8:A)',                                                      // Col A: Total Orders
    logScopeFormula,                                                      // Col B: Log Scope
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
    '=SUM(N8:N)',                                                         // Col N: Cheese Qty Sum
    '=SUM(O8:O)',                                                         // Col O: Bawang Only Qty Sum
    '=SUM(P8:P)',                                                         // Col P: Total Packs Sum
    '=SUM(Q8:Q)',                                                         // Col Q: Total Revenue Sum
    '=COUNTIFS(A8:A, "<>", R8:R, "<>Completed") & " active"'              // Col R: Active Orders
  ];

  sheet.getRange('A3:R3').breakApart();
  sheet.getRange('A3:R3').setFormulas([formulas])
    .setFontFamily('Arial')
    .setFontSize(11)
    .setFontWeight('bold')
    .setBackground('#FFF8EB')
    .setFontColor('#4B3019')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.setRowHeight(3, 30);
  sheet.getRange('Q3').setNumberFormat('"₱"#,##0.00');

  // Blank Separator (Rows 4, 5, 6)
  sheet.setRowHeight(4, 8);
  sheet.setRowHeight(5, 8);
  sheet.setRowHeight(6, 8);

  // Column Headers (Row 7) - Exactly 18 columns
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
    'Cheese Qty',        // Col 14 (N)
    'Bawang Only Qty',   // Col 15 (O)
    'Total Packs',       // Col 16 (P)
    'Total Amount (₱)',  // Col 17 (Q)
    'Order Status'       // Col 18 (R)
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
  sheet.setColumnWidth(14, 95); // Cheese
  sheet.setColumnWidth(15, 115);// Bawang Only
  sheet.setColumnWidth(16, 95); // Total Packs
  sheet.setColumnWidth(17, 125);// Total Amount
  sheet.setColumnWidth(18, 115);// Order Status
}

/**
 * Self-healing repair: Re-aligns existing data rows and sets proper headers and formulas
 */
function fixAndAlignSheet(sheet, dateStr) {
  setupSheetHeadersAndSummary(sheet, dateStr);

  var lastRow = sheet.getLastRow();
  if (lastRow < 8) return;

  var lastCol = Math.max(sheet.getLastColumn(), 18);
  var range = sheet.getRange(8, 1, lastRow - 7, lastCol);
  var values = range.getValues();

  for (var i = 0; i < values.length; i++) {
    var r = values[i];
    var rowNum = 8 + i;

    var orderId = r[0];
    var rawDate = r[1];
    var orderDate = Utilities.formatDate(new Date(), getTimezone(), 'yyyy-MM-dd');
    if (rawDate instanceof Date) {
      orderDate = Utilities.formatDate(rawDate, getTimezone(), 'yyyy-MM-dd');
    } else if (rawDate && /^\d{4}-\d{2}-\d{2}$/.test(String(rawDate).trim())) {
      orderDate = String(rawDate).trim();
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      orderDate = dateStr;
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

    if (valH.toLowerCase() === 'paid' || valH.toLowerCase() === 'unpaid') {
      paidStatus = (valH.toLowerCase() === 'paid') ? 'Paid' : 'Unpaid';
      if (valG.toLowerCase().includes('cash') || valG.toLowerCase().includes('gcash') || valG.toLowerCase().includes('maribank')) {
        paymentMode = valG;
        deliveryAddress = valF;
      } else {
        paymentMode = valF;
        deliveryAddress = valG;
      }
    } else {
      paymentMode = valF || 'Cash on Delivery';
      deliveryAddress = valG || '';
      paidStatus = paymentMode.toLowerCase().includes('cash') ? 'Unpaid' : 'Paid';
    }

    var salted = Number(r[8] || 0);
    var unsalted = Number(r[9] || 0);
    var spicy = Number(r[10] || 0);
    var bbq = Number(r[11] || 0);
    var sourCream = Number(r[12] || 0);
    var cheese = 0;
    var bawangOnly = 0;
    var orderStatus = 'New';

    if (r.length >= 18 && r[17] !== undefined && r[17] !== '') {
      cheese = Number(r[13] || 0);
      bawangOnly = Number(r[14] || 0);
      orderStatus = String(r[17] || 'New');
    } else {
      cheese = 0;
      bawangOnly = Number(r[13] || 0);
      orderStatus = String(r[16] || 'New');
    }

    var totalPacksFormula = '=SUM(I' + rowNum + ':O' + rowNum + ')';
    var totalAmountFormula = '=(SUM(I' + rowNum + ':N' + rowNum + ')*50)+(O' + rowNum + '*60)';

    var cleanRow = [
      orderId, orderDate, orderTime, customer, mobile,
      paymentMode, deliveryAddress, paidStatus,
      salted, unsalted, spicy, bbq, sourCream, cheese, bawangOnly,
      totalPacksFormula, totalAmountFormula, orderStatus
    ];

    sheet.getRange(rowNum, 1, 1, 18).setValues([cleanRow]);
    formatDataRow(sheet, rowNum, cleanRow);
  }
}

/**
 * Handle Updating Order Status in Google Sheet (Col 17 / Q)
 */
function handleUpdateStatus(ss, orderId, orderDate, newStatus) {
  if (!orderId) return { success: false, error: 'Missing orderId' };
  
  // 1. Search Master list first
  var sheet = ss.getSheetByName(MASTER_SHEET_NAME);
  var row = sheet ? findOrderInSheet(sheet, orderId) : -1;

  // 2. Fallback search across other sheets if needed
  if (row === -1) {
    var targetDate = orderDate || Utilities.formatDate(new Date(), getTimezone(), 'yyyy-MM-dd');
    var dateSheet = ss.getSheetByName(targetDate);
    if (dateSheet) {
      var dRow = findOrderInSheet(dateSheet, orderId);
      if (dRow > 0) {
        sheet = dateSheet;
        row = dRow;
      }
    }
  }

  if (row === -1) {
    var sheets = ss.getSheets();
    for (var i = 0; i < sheets.length; i++) {
      if (sheets[i].getName() === MASTER_SHEET_NAME) continue;
      var foundRow = findOrderInSheet(sheets[i], orderId);
      if (foundRow > 0) {
        sheet = sheets[i];
        row = foundRow;
        break;
      }
    }
  }

  var statusCol = (sheet.getLastColumn() >= 18 || String(sheet.getRange(7, 14).getValue() || '').indexOf('Cheese') !== -1) ? 18 : 17;
  var cell = sheet.getRange(row, statusCol);
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
  
  // 1. Search Master list first
  var sheet = ss.getSheetByName(MASTER_SHEET_NAME);
  var row = sheet ? findOrderInSheet(sheet, orderId) : -1;

  // 2. Fallback search across other sheets if needed
  if (row === -1) {
    var targetDate = orderDate || Utilities.formatDate(new Date(), getTimezone(), 'yyyy-MM-dd');
    var dateSheet = ss.getSheetByName(targetDate);
    if (dateSheet) {
      var dRow = findOrderInSheet(dateSheet, orderId);
      if (dRow > 0) {
        sheet = dateSheet;
        row = dRow;
      }
    }
  }

  if (row === -1) {
    var sheets = ss.getSheets();
    for (var i = 0; i < sheets.length; i++) {
      if (sheets[i].getName() === MASTER_SHEET_NAME) continue;
      var foundRow = findOrderInSheet(sheets[i], orderId);
      if (foundRow > 0) {
        sheet = sheets[i];
        row = foundRow;
        break;
      }
    }
  }

  if (!sheet || row === -1) return { success: false, error: 'Order ' + orderId + ' not found in sheet' };

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

/**
 * -------------------------------------------------------------
 * Order Notification Email Service
 * Automatically sends immediate, professional, mobile-friendly
 * HTML email notifications whenever an order is successfully created.
 * Default recipient: engrkevinramirez@gmail.com
 * -------------------------------------------------------------
 */
function sendOrderNotificationEmail(order, rowData, forceSend) {
  if (!order) return { sent: false, error: 'No order data provided' };

  var tz = getTimezone();
  var recipientEmail = 'engrkevinramirez@gmail.com';

  var customerName = (order.customerName || order.name || (rowData && rowData[3]) || '').trim() || 'N/A';
  var orderId = (order.orderId || (rowData && rowData[0]) || ('MANI-' + Utilities.formatDate(new Date(), tz, 'yyyyMMdd-HHmmss'))).trim();

  // 1. Guard against automated test suite orders (unless explicitly forced)
  var isTest = order.isTest === true || (orderId && orderId.toLowerCase().includes('bypass'));
  if (isTest && !forceSend) {
    return { sent: false, skipped: true, reason: 'Test order notification skipped to prevent inbox spam.' };
  }

  // 2. Prevent accidental duplicate notifications (Idempotency check via Cache)
  var cache = CacheService.getScriptCache();
  var cacheKey = 'notif_sent_' + orderId.replace(/[^a-zA-Z0-9_-]/g, '');
  if (!forceSend && cache.get(cacheKey)) {
    return { sent: false, skipped: true, reason: 'Duplicate notification prevented for order ' + orderId };
  }

  // 3. Format Date & Time in Philippine Standard Time
  var now = new Date();
  var formattedDateTime = Utilities.formatDate(now, tz, 'MMMM d, yyyy – h:mm a');

  var mobileNumber = (order.mobileNumber || order.mobile || (rowData && rowData[4]) || '').trim() || 'N/A';
  var deliveryAddress = (order.deliveryAddress || order.address || (rowData && rowData[6]) || '').trim() || 'N/A';
  var paymentMethod = (order.paymentMethod || order.paymentMode || (rowData && rowData[5]) || '').trim() || 'N/A';

  // 4. Determine Payment Status Text and Styling
  var paymentStatusText = '';
  var statusBadgeBg = '#FEF3C7';
  var statusBadgeColor = '#92400E';
  var statusBadgeBorder = '#FCD34D';

  var methodLower = paymentMethod.toLowerCase();
  var explicitStatus = (order.paymentStatus || (rowData && rowData[7]) || '').trim();

  if (explicitStatus) {
    paymentStatusText = explicitStatus;
    if (explicitStatus.toLowerCase().includes('paid') && !explicitStatus.toLowerCase().includes('unpaid')) {
      statusBadgeBg = '#D1FAE5';
      statusBadgeColor = '#065F46';
      statusBadgeBorder = '#6EE7B7';
    } else if (methodLower.includes('cash')) {
      statusBadgeBg = '#FEF3C7';
      statusBadgeColor = '#92400E';
      statusBadgeBorder = '#FCD34D';
    } else {
      statusBadgeBg = '#DBEAFE';
      statusBadgeColor = '#1E40AF';
      statusBadgeBorder = '#93C5FD';
    }
  } else if (methodLower.includes('cash')) {
    paymentStatusText = 'Pending – Cash on Delivery';
    statusBadgeBg = '#FEF3C7';
    statusBadgeColor = '#92400E';
    statusBadgeBorder = '#FCD34D';
  } else if (methodLower.includes('gcash')) {
    paymentStatusText = 'Pending – Awaiting GCash Payment';
    statusBadgeBg = '#DBEAFE';
    statusBadgeColor = '#1E40AF';
    statusBadgeBorder = '#93C5FD';
  } else if (methodLower.includes('maribank')) {
    paymentStatusText = 'Pending – Awaiting Maribank Payment';
    statusBadgeBg = '#FFEDD5';
    statusBadgeColor = '#9A3412';
    statusBadgeBorder = '#FDBA74';
  } else {
    paymentStatusText = paymentMethod !== 'N/A' ? ('Pending – ' + paymentMethod) : 'N/A';
  }

  // 5. Build Ordered Items List & Computations
  var itemsList = [];
  if (Array.isArray(order.items) && order.items.length > 0) {
    order.items.forEach(function(it) {
      var q = Number(it.quantity || 0);
      if (q > 0) {
        var p = Number(it.price || 50);
        itemsList.push({
          name: it.name || it.productId || it.id || 'Mani Tub',
          quantity: q,
          price: p,
          subtotal: q * p
        });
      }
    });
  }

  // Fallback to flavorQuantities if items array wasn't provided
  if (itemsList.length === 0) {
    var fq = order.flavorQuantities || {};
    var flavorCatalog = [
      { key: 'salted', name: 'Salted Mani', price: 50 },
      { key: 'unsalted', name: 'Unsalted Mani', price: 50 },
      { key: 'spicy', name: 'Spicy Mani', price: 50 },
      { key: 'bbq', name: 'BBQ Mani', price: 50 },
      { key: 'sour-cream', name: 'Sour Cream Mani', price: 50 },
      { key: 'cheese', name: 'Cheese Mani', price: 50 },
      { key: 'bawang-only', name: 'Bawang Only', price: 60 }
    ];
    flavorCatalog.forEach(function(flv) {
      var q = Number(fq[flv.key] || 0);
      if (q > 0) {
        itemsList.push({
          name: flv.name,
          quantity: q,
          price: flv.price,
          subtotal: q * flv.price
        });
      }
    });
  }

  // Fallback to rowData if available
  if (itemsList.length === 0 && rowData) {
    var rowCatalog = (rowData.length >= 18) ? [
      { name: 'Salted Mani', qty: Number(rowData[8] || 0), price: 50 },
      { name: 'Unsalted Mani', qty: Number(rowData[9] || 0), price: 50 },
      { name: 'Spicy Mani', qty: Number(rowData[10] || 0), price: 50 },
      { name: 'BBQ Mani', qty: Number(rowData[11] || 0), price: 50 },
      { name: 'Sour Cream Mani', qty: Number(rowData[12] || 0), price: 50 },
      { name: 'Cheese Mani', qty: Number(rowData[13] || 0), price: 50 },
      { name: 'Bawang Only', qty: Number(rowData[14] || 0), price: 60 }
    ] : [
      { name: 'Salted Mani', qty: Number(rowData[8] || 0), price: 50 },
      { name: 'Unsalted Mani', qty: Number(rowData[9] || 0), price: 50 },
      { name: 'Spicy Mani', qty: Number(rowData[10] || 0), price: 50 },
      { name: 'BBQ Mani', qty: Number(rowData[11] || 0), price: 50 },
      { name: 'Sour Cream Mani', qty: Number(rowData[12] || 0), price: 50 },
      { name: 'Bawang Only', qty: Number(rowData[13] || 0), price: 60 }
    ];
    rowCatalog.forEach(function(flv) {
      if (flv.qty > 0) {
        itemsList.push({
          name: flv.name,
          quantity: flv.qty,
          price: flv.price,
          subtotal: flv.qty * flv.price
        });
      }
    });
  }

  var totalPacks = itemsList.reduce(function(acc, it) { return acc + it.quantity; }, 0);
  var subtotalNum = itemsList.reduce(function(acc, it) { return acc + it.subtotal; }, 0);
  if (order.subtotal !== undefined && order.subtotal !== null && Number(order.subtotal) > 0) {
    subtotalNum = Number(order.subtotal);
  }

  var deliveryFeeVal = '₱0.00 (Standard)';
  if (order.deliveryFee !== undefined && order.deliveryFee !== null) {
    var df = Number(order.deliveryFee);
    deliveryFeeVal = df > 0 ? ('₱' + df.toFixed(2)) : '₱0.00 (Standard)';
  } else {
    deliveryFeeVal = 'N/A';
  }

  var discountNum = Number(order.discount || 0);
  var totalAmountNum = subtotalNum + (order.deliveryFee ? Number(order.deliveryFee) : 0) - discountNum;
  if (order.totalAmount !== undefined && order.totalAmount !== null && Number(order.totalAmount) > 0) {
    totalAmountNum = Number(order.totalAmount);
  }

  var subtotalDisplay = (subtotalNum > 0) ? ('₱' + subtotalNum.toFixed(2)) : 'N/A';
  var totalAmountDisplay = (totalAmountNum > 0) ? ('₱' + totalAmountNum.toFixed(2)) : 'N/A';

  // 6. Build Summary Strings & HTML Table
  var productRowsHtml = '';
  var plainTextOrderSummary = '';

  itemsList.forEach(function(it, idx) {
    var rowBg = (idx % 2 === 0) ? '#FFFFFF' : '#FDFBF7';
    productRowsHtml += '<tr style="background-color: ' + rowBg + '; border-bottom: 1px solid #EDE4D8;">' +
      '<td style="padding: 10px 14px; font-weight: 700; color: #2B1810;">' + it.name + '</td>' +
      '<td align="center" style="padding: 10px 14px; font-weight: 800; color: #7C552E;">' + it.quantity + '</td>' +
      '<td align="right" style="padding: 10px 14px; color: #5D4037;">₱' + it.price.toFixed(2) + '</td>' +
      '<td align="right" style="padding: 10px 14px; font-weight: 800; color: #2B1810;">₱' + it.subtotal.toFixed(2) + '</td>' +
      '</tr>';

    plainTextOrderSummary += it.name + ' x ' + it.quantity + ' - ₱' + it.subtotal.toFixed(2) + '\n';
  });

  if (itemsList.length === 0) {
    productRowsHtml = '<tr><td colspan="4" style="padding: 14px; text-align: center; color: #8C6A48;">N/A</td></tr>';
    plainTextOrderSummary = 'N/A\n';
  }

  // 7. Compose Mobile-Friendly HTML Email
  var subject = 'New Order Received - ' + customerName;
  var statusBadgeStyle = 'background-color: ' + statusBadgeBg + '; color: ' + statusBadgeColor + '; border: 1px solid ' + statusBadgeBorder + ';';

  var htmlBody = '<!DOCTYPE html>' +
    '<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '<title>New Order Received - ' + customerName + '</title></head>' +
    '<body style="margin: 0; padding: 20px 10px; background-color: #FDFBF7; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #2B1810;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #EADBCE; box-shadow: 0 4px 20px rgba(124, 85, 46, 0.08);">' +
    
    // Header Banner
    '<tr><td style="background: linear-gradient(135deg, #7C552E 0%, #A36832 50%, #D97706 100%); padding: 32px 24px; text-align: center;">' +
    '<div style="font-size: 32px; line-height: 1; margin-bottom: 8px;">🥜</div>' +
    '<div style="font-size: 13px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #FEF3C7; margin-bottom: 6px;">Mani Wandering</div>' +
    '<h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">NEW ORDER RECEIVED</h1>' +
    '<div style="margin-top: 14px;">' +
    '<span style="display: inline-block; background-color: rgba(255, 255, 255, 0.22); color: #ffffff; padding: 6px 16px; border-radius: 9999px; font-weight: 800; font-size: 15px; border: 1px solid rgba(255, 255, 255, 0.35); letter-spacing: 0.5px;">Order ID: ' + orderId + '</span>' +
    '</div>' +
    '<div style="margin-top: 10px; font-size: 13px; color: #FEF3C7; font-weight: 600;">📅 ' + formattedDateTime + '</div>' +
    '</td></tr>' +

    // Body Content
    '<tr><td style="padding: 28px 24px;">' +

    // Customer Information Card
    '<div style="background-color: #FFFDF8; border-radius: 14px; border: 1px solid #F3E8DB; padding: 18px 20px; margin-bottom: 24px;">' +
    '<h2 style="margin: 0 0 14px 0; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #7C552E; border-bottom: 1px solid #F3E8DB; padding-bottom: 8px;">👤 Customer Information</h2>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px; line-height: 1.8;">' +
    '<tr><td style="padding: 4px 0; color: #8C6A48; width: 190px; font-weight: 600;">Customer Name:</td><td style="padding: 4px 0; color: #1E120D; font-weight: 800;">' + customerName + '</td></tr>' +
    '<tr><td style="padding: 4px 0; color: #8C6A48; font-weight: 600;">Mobile Number:</td><td style="padding: 4px 0; color: #1E120D; font-weight: 700;"><a href="tel:' + mobileNumber + '" style="color: #D97706; text-decoration: none;">' + mobileNumber + '</a></td></tr>' +
    '<tr><td style="padding: 4px 0; color: #8C6A48; font-weight: 600; vertical-align: top;">Address / To Be Delivered To:</td><td style="padding: 4px 0; color: #1E120D; font-weight: 600;">' + deliveryAddress + '</td></tr>' +
    '<tr><td style="padding: 4px 0; color: #8C6A48; font-weight: 600;">Mode of Payment:</td><td style="padding: 4px 0; color: #1E120D; font-weight: 700;">' + paymentMethod + '</td></tr>' +
    '<tr><td style="padding: 4px 0; color: #8C6A48; font-weight: 600;">Payment Status:</td><td style="padding: 4px 0;"><span style="display: inline-block; padding: 4px 12px; border-radius: 8px; font-size: 12px; font-weight: 800; ' + statusBadgeStyle + '">' + paymentStatusText + '</span></td></tr>' +
    '</table></div>' +

    // Order Summary Section
    '<div style="margin-bottom: 24px;">' +
    '<h2 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #7C552E;">📦 Order Summary</h2>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; font-size: 14px; border: 1px solid #EDE4D8; border-radius: 12px; overflow: hidden; margin-bottom: 16px;">' +
    '<thead><tr style="background-color: #F8F4EE;">' +
    '<th align="left" style="padding: 12px 14px; font-weight: 800; color: #664322; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #EDE4D8;">Item</th>' +
    '<th align="center" style="padding: 12px 14px; font-weight: 800; color: #664322; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #EDE4D8; width: 70px;">Quantity</th>' +
    '<th align="right" style="padding: 12px 14px; font-weight: 800; color: #664322; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #EDE4D8; width: 80px;">Price</th>' +
    '<th align="right" style="padding: 12px 14px; font-weight: 800; color: #664322; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #EDE4D8; width: 90px;">Total</th>' +
    '</tr></thead>' +
    '<tbody>' + productRowsHtml + '</tbody></table>' +

    '<div style="background-color: #FDFBF7; border-radius: 14px; border: 1px solid #EFE6DA; padding: 16px 20px;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px; line-height: 1.8;">' +
    '<tr><td style="color: #6B5645; font-weight: 600;">Subtotal:</td><td align="right" style="color: #1E120D; font-weight: 700;">' + subtotalDisplay + '</td></tr>' +
    '<tr><td style="color: #6B5645; font-weight: 600;">Delivery Fee:</td><td align="right" style="color: #059669; font-weight: 700;">' + deliveryFeeVal + '</td></tr>' +
    (discountNum > 0 ? ('<tr><td style="color: #6B5645; font-weight: 600;">Discount:</td><td align="right" style="color: #DC2626; font-weight: 700;">-₱' + discountNum.toFixed(2) + '</td></tr>') : '') +
    '<tr style="border-top: 2px dashed #DEC8B0;">' +
    '<td style="padding-top: 10px; font-size: 16px; font-weight: 900; color: #7C552E;">Total Amount:</td>' +
    '<td align="right" style="padding-top: 10px; font-size: 18px; font-weight: 900; color: #B45309;">' + totalAmountDisplay + '</td></tr>' +
    '</table></div></div>' +

    // Direct Google Sheets Link
    '<div style="text-align: center; margin-top: 14px;">' +
    '<a href="https://docs.google.com/spreadsheets/d/1CpPaE3QFmyAuptF4z52vGtpF_YFuuH-EmEHmQXpS8yI/edit" target="_blank" style="display: inline-block; background-color: #7C552E; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-size: 14px; font-weight: 800; letter-spacing: 0.3px; box-shadow: 0 2px 8px rgba(124, 85, 46, 0.2);">📊 View Orders in Google Sheets</a>' +
    '</div>' +

    '</td></tr>' +

    // Footer
    '<tr><td style="background-color: #F8F5EE; padding: 20px 24px; text-align: center; font-size: 12px; color: #8C6A48; border-top: 1px solid #EADBCE;">' +
    '<p style="margin: 0 0 4px 0; font-weight: 700; color: #5D3B1C;">🥜 Mani Wandering Ordering System</p>' +
    '<p style="margin: 0; color: #A88B6E;">Automated order notification sent immediately to ' + recipientEmail + '</p>' +
    '</td></tr>' +

    '</table></td></tr></table></body></html>';

  // 8. Plain Text Fallback
  var plainTextBody = 'New Order Received - ' + customerName + '\n\n' +
    'Customer Name: ' + customerName + '\n' +
    'Mobile Number: ' + mobileNumber + '\n' +
    'Address / To Be Delivered To: ' + deliveryAddress + '\n' +
    'Mode of Payment: ' + paymentMethod + '\n' +
    'Payment Status: ' + paymentStatusText + '\n\n' +
    'Order Summary:\n' +
    plainTextOrderSummary +
    'Subtotal: ' + subtotalDisplay + '\n' +
    'Delivery Fee: ' + deliveryFeeVal + '\n' +
    'Total Amount: ' + totalAmountDisplay + '\n\n' +
    'Order ID: ' + orderId + '\n' +
    'Timestamp: ' + formattedDateTime + ' (PHT)\n' +
    'Google Sheets: https://docs.google.com/spreadsheets/d/1CpPaE3QFmyAuptF4z52vGtpF_YFuuH-EmEHmQXpS8yI/edit\n';

  // 9. Dispatch via MailApp with GmailApp fallback
  try {
    MailApp.sendEmail({
      to: recipientEmail,
      subject: subject,
      body: plainTextBody,
      htmlBody: htmlBody,
      name: 'Mani Wandering Orders'
    });

    // Mark cache to prevent double sending (15-minute TTL)
    cache.put(cacheKey, '1', 900);

    return {
      sent: true,
      recipient: recipientEmail,
      subject: subject,
      orderId: orderId
    };
  } catch (err) {
    console.warn('MailApp send attempt failed, trying GmailApp fallback:', err.toString());
    try {
      GmailApp.sendEmail(recipientEmail, subject, plainTextBody, {
        htmlBody: htmlBody,
        name: 'Mani Wandering Orders'
      });
      cache.put(cacheKey, '1', 900);
      return {
        sent: true,
        recipient: recipientEmail,
        subject: subject,
        orderId: orderId,
        via: 'GmailApp'
      };
    } catch (gErr) {
      console.error('MailApp & GmailApp send error:', err.toString(), gErr.toString());
      return {
        sent: false,
        error: err.toString(),
        gmailError: gErr.toString(),
        recipient: recipientEmail,
        orderId: orderId
      };
    }
  }
}

/**
 * Test helper for email delivery
 */
function handleSendTestEmail(toEmail) {
  var tz = getTimezone();
  var testOrder = {
    orderId: 'MANI-TEST-' + Utilities.formatDate(new Date(), tz, 'HHmmss'),
    customerName: 'Kevin Ramirez (Test Order)',
    mobileNumber: '0917 123 4567',
    deliveryAddress: 'Unit 102, Manila, Philippines',
    paymentMethod: 'GCash',
    paymentStatus: 'Pending – Awaiting GCash Payment',
    items: [
      { name: 'Original Crispy Salted', quantity: 2, price: 50 },
      { name: 'Spicy Kick Mani', quantity: 1, price: 50 },
      { name: 'Cheese Mani', quantity: 2, price: 50 },
      { name: 'Garlic Bawang Only', quantity: 3, price: 60 }
    ],
    subtotal: 430,
    totalAmount: 430
  };

  if (toEmail) {
    var props = PropertiesService.getScriptProperties();
    props.setProperty('NOTIFICATION_EMAIL', toEmail);
  }

  var res = sendOrderNotificationEmail(testOrder, null, true);
  Logger.log('handleSendTestEmail result: ' + JSON.stringify(res));
  if (!res.sent) {
    throw new Error('Email sending failed! Reason: ' + (res.error || res.gmailError || res.reason));
  }
  return res;
}

