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

### Step 3: Run One-Click Cleanup & Formula Repair
In the Apps Script editor:
1. Select **`handleCleanAllSheets`** in the function dropdown at the top toolbar.
2. Click **▶ Run**.
3. If prompted, grant authorization once.
4. Open the Google Sheet! All test orders ("Juan Dela Cruz") will be removed, Mermer's order will be corrected (4 packs, ₱200, GCash, Paid), and the 17-column summary dashboard and dynamic price formulas will be aligned and live.

### Step 4: Deploy the New Version (Takes 30 seconds)
1. At the top right of Apps Script, click the blue **Deploy** button > **Manage deployments**.
2. Click the **✏️ (Edit / Pencil)** icon next to the active deployment.
3. In the **Version** dropdown, select **New version**.
4. (Optional) Description: `Aligned 17 columns, dynamic price formulas, and test filter`.
5. Click **Deploy**.
6. The Web App URL remains the same:
   `https://script.google.com/macros/s/AKfycbxFqu_Z8ZNEFoQ79ejaospmqByaTvGcrWAmkc4njilYdSJK8kvEDSslJejBwUl9z7DS/exec`

---

## 🥜 Google Sheet In-App Menu

When you refresh the Google Sheet, you will see a new menu in the top menu bar:
- **`🥜 Mani Wandering`**
  - **`🧹 Clean Test Orders & Fix Calculations`**: Automatically purges test orders and recalibrates all pricing and summary formulas.
  - **`📐 Refresh Summary Dashboard & Formulas`**: Realigns the 17-column header cards and recomputes all metrics.

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
