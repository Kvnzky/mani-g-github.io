# 🥜 Google Sheets Integration Setup & Repair Guide for Mani Wandering Orders

This guide walks you through updating and connecting your Mani Wandering Ordering Web App to your Google Sheet:
**Target Sheet**: [https://docs.google.com/spreadsheets/d/1CpPaE3QFmyAuptF4z52vGtpF_YFuuH-EmEHmQXpS8yI/edit](https://docs.google.com/spreadsheets/d/1CpPaE3QFmyAuptF4z52vGtpF_YFuuH-EmEHmQXpS8yI/edit)

---

## 🚀 How to Update & Apply the Latest Fixes

### Step 1: Open Apps Script Editor
1. Open the [Google Sheet](https://docs.google.com/spreadsheets/d/1CpPaE3QFmyAuptF4z52vGtpF_YFuuH-EmEHmQXpS8yI/edit) in your browser.
2. In the top menu, click **Extensions** > **Apps Script**.

### Step 2: Paste the Updated Code
1. Erase any existing code inside `Code.gs`.
2. Copy the entire contents of [`google-apps-script/Code.gs`](./Code.gs) and paste it into the editor.
3. Click the **💾 Save** icon (or press `Ctrl+S`).

### Step 3: Grant Email Permission & Test (One-Time Only)
In the Apps Script editor:
1. Select **`handleSendTestEmail`** in the function dropdown at the top toolbar.
2. Click **▶ Run**.
3. Google will prompt: **"Authorization Required"** (this is Google's standard security prompt when an Apps Script gains email-sending capabilities).
4. Click **Review permissions** > Choose your Google account (`rkevinramirez@gmail.com`) > Click **Advanced** > Click **Go to Mani Wandering (unsafe)** > Click **Allow**.
5. Check your Gmail inbox! A live test email will arrive immediately, confirming your script now has permanent permission to send order emails.

### Step 4: Deploy the New Version (Takes 30 seconds)
1. At the top right of Apps Script, click the blue **Deploy** button > **Manage deployments**.
2. Click the **✏️ (Edit / Pencil)** icon next to the active deployment.
3. In the **Version** dropdown, select **New version**.
4. Description: `Added immediate Order Notification Email to rkevinramirez@gmail.com`.
5. Click **Deploy**.
6. The Web App URL remains the same:
   `https://script.google.com/macros/s/AKfycbxFqu_Z8ZNEFoQ79ejaospmqByaTvGcrWAmkc4njilYdSJK8kvEDSslJejBwUl9z7DS/exec`

---

## 📧 Order Notification Email Feature
Whenever a customer places an order on the website:
- **Recipient**: `rkevinramirez@gmail.com`
- **Subject**: `🛒 New Order Received – [Customer Name]`
- **Content**:
  - Prominent **Order ID** & Philippine Standard Time (PST) timestamp.
  - **Customer Information**: Full Name, Click-to-call Mobile Number, Delivery Address, and Payment Mode.
  - **Order Details Table**: Every ordered flavor and corresponding quantity with unit prices and subtotals.
  - **Order Summary**: Subtotal, Delivery Fee (Standard Free), Discount, and Total Amount.
  - **Payment Status**:
    - Cash on Delivery: `Pending – Cash on Delivery`
    - GCash: `Pending – Awaiting GCash Payment` (or `Paid`)
    - Maribank: `Pending – Awaiting Maribank Payment` (or `Paid`)
  - **Direct Sheet Link**: One-click button to view the orders spreadsheet.
- **Anti-Duplicate Protection**: Built-in cache deduplication prevents duplicate emails if the customer submits repeatedly.

---

## 🥜 Google Sheet In-App Menu

When you refresh the Google Sheet, you will see the custom menu in the top menu bar:
- **`🥜 Mani Wandering`**
  - **`🧹 Clean Test Orders & Fix Calculations`**: Automatically purges test orders and recalibrates all pricing and summary formulas.
  - **`📐 Refresh Summary Dashboard & Formulas`**: Realigns the 17-column header cards and recomputes all metrics.
  - **`📧 Send Test Order Notification Email`**: Sends a live test email directly to `rkevinramirez@gmail.com` to verify email delivery.

---

## 📊 17-Column Standard Layout (Columns A to Q)

| Col | Field | Summary Metric (Row 2 & 3) |
|---|---|---|
| **A** | Order ID | **Total Orders** (`=COUNTA(A8:A)`) |
| **B** | Order Date | **Log Date** (`YYYY-MM-DD`) |
| **C** | Order Time | **COD Orders** (`=COUNTIF(F8:F, "*Cash*")`) |
| **D** | Customer Name | **GCash Orders** (`=COUNTIF(F8:F, "*GCash*")`) |
| **E** | Mobile Number | **Maribank Orders** (`=COUNTIF(F8:F, "*Maribank*")`) |
| **F** | Payment Mode | **Paid Orders** (`=COUNTIF(H8:H, "Paid")`) |
| **G** | Delivery Address | **Unpaid Orders** (`=COUNTIF(H8:H, "Unpaid")`) |
| **H** | Paid Status | **Payment Ratio** (`Paid / Total`) |
| **I** | Salted Qty (₱50) | **Total Salted** (`=SUM(I8:I)`) |
| **J** | Unsalted Qty (₱50) | **Total Unsalted** (`=SUM(J8:J)`) |
| **K** | Spicy Qty (₱50) | **Total Spicy** (`=SUM(K8:K)`) |
| **L** | BBQ Qty (₱50) | **Total BBQ** (`=SUM(L8:L)`) |
| **M** | Sour Cream Qty (₱50) | **Total Sour Cream** (`=SUM(M8:M)`) |
| **N** | Bawang Only Qty (₱60) | **Total Bawang** (`=SUM(N8:N)`) |
| **O** | Total Packs | **Total Packs** (`=SUM(O8:O)`) |
| **P** | Total Amount (₱) | **Total Revenue (₱)** (`=SUM(P8:P)`) |
| **Q** | Order Status | **Active Orders** (`=COUNTIF(Q8:Q, "<>Completed")`) |
