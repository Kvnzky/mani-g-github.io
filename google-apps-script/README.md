# 🥜 Google Sheets Integration Setup Guide for Mani Orders

This guide walks you through connecting your Mani Ordering Web App directly to your Google Sheet:
**Target Sheet**: [https://docs.google.com/spreadsheets/d/1CpPaE3QFmyAuptF4z52vGtpF_YFuuH-EmEHmQXpS8yI/edit](https://docs.google.com/spreadsheets/d/1CpPaE3QFmyAuptF4z52vGtpF_YFuuH-EmEHmQXpS8yI/edit)

---

## Quick 2-Minute Setup

### Step 1: Open Apps Script Editor
1. Open the Google Sheet above in your browser.
2. In the top menu, click **Extensions** > **Apps Script**.

### Step 2: Paste the Script
1. Erase any code inside `Code.gs`.
2. Copy the entire contents of [`google-apps-script/Code.gs`](./Code.gs) and paste it into the editor.
3. Click the **💾 Save** icon (or press `Ctrl+S`).

### Step 3: Deploy as Web App
1. At the top right, click the blue **Deploy** button > **New deployment**.
2. Click the gear icon ⚙️ next to "Select type" and choose **Web app**.
3. Fill in the deployment details:
   - **Description**: `Mani Ordering API`
   - **Execute as**: `Me (your email)`
   - **Who has access**: `Anyone` *(Crucial so the ordering app can send submissions)*
4. Click **Deploy**.
5. If prompted, click **Authorize access**, choose your Google Account, click **Advanced**, then **Go to Untitled project (unsafe)**, and **Allow**.
6. Google will provide a **Web app URL** (starts with `https://script.google.com/macros/s/.../exec`). Copy this URL!

### Step 4: Connect to the App
1. Open your Mani Ordering App.
2. Go to the **Admin Portal** (or click the Settings/Admin toggle at the top).
3. Under **Google Sheets Integration**, paste your **Web App URL** and click **Save & Test Connection**.
4. That's it! Every submitted order will now automatically create or append to the current date's tab (e.g. `2026-09-16`) and update the live daily summary!

---

## Features & Automations Included

- 📅 **Daily Tabs (`YYYY-MM-DD`)**: Automatically creates tabs like `2026-09-16` using Philippine time (`Asia/Manila`).
- 📊 **Dynamic Daily Summary**:
  - Live formulas `=COUNTA(A8:A)` (Total Orders), `=SUM(P8:P)` (Total Packs), `=SUM(Q8:Q)` (Total Sales ₱), and individual flavor counters.
  - Frozen top rows so summary cards remain visible while scrolling.
- 🆔 **Unique Order ID**: Formatted as `MANI-YYYYMMDD-001`.
- 🎨 **Visual Styling**:
  - Warm peanut-themed headers and alternating row colors.
  - Status badges with colored backgrounds (`New`, `Confirmed`, `Preparing`, `Ready`, `Completed`, `Cancelled`).
- 🔒 **Concurrency Protection**: Google Apps Script lock prevents order collision during peak times.
