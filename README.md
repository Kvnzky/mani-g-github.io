# 🥜 MANI G? — “G ka ba sa crunch?”

A modern, fast, mobile- and PC-optimized web ordering application for fresh, crunchy Mani (peanuts).

🌐 **Live URL:** [https://kvnzky.github.io/mani-g-github.io/](https://kvnzky.github.io/mani-g-github.io/)

---

## ✨ Features

- **📱 Fully Responsive (PC & Mobile)**:
  - **PC / Desktop**: Wide 2-column layout with flavors catalog on the left and sticky live checkout on the right.
  - **Mobile Phone**: 1-column layout with a floating sticky bottom checkout bar for convenient 1-thumb ordering.
- **🥜 Flavor Selection**: Salted, Unsalted, Spicy, BBQ, Sour Cream, and Bawang Only with interactive steppers.
- **📍 Required Delivery Address**: Direct customer delivery info capture.
- **💳 Mode of Payment Options**:
  - **💵 Cash on Delivery**
  - **🏦 Maribank**: High-res enlarged QR code with scan instructions and brightness tip.
  - **📱 GCash**: High-res enlarged QR code, account name, and 1-tap **Copy Number** button for `09055182263`.
- **📊 Connected to Google Sheets**: Automatically logs orders into daily tabs (`YYYY-MM-DD`) with Philippine time (`Asia/Manila`).
- **⚙️ Seller Admin Dashboard**: View incoming orders, update order status, reconfigure payment QR codes, and test Google Sheet sync.
- **🚀 Zero-Installation Portable File**: Includes `Mani-Order-App.html` which can be opened directly on any computer or smartphone with no dependencies.

---

## 🚀 GitHub Pages Deployment

This repository is configured for **GitHub Pages**:
1. Go to repository **Settings** → **Pages**.
2. Under **Build and deployment**:
   - **Option A (Automated CI/CD)**: Select **GitHub Actions** (uses `.github/workflows/deploy.yml`).
   - **Option B (Instant Pre-Built)**: Select **Deploy from a branch** → Branch: `main` → Folder: `/docs` → **Save**.
3. Your live store will be online at:
   👉 **https://kvnzky.github.io/mani-g-github.io/**

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Run frontend & backend concurrently
npm run dev

# Build for production
npm run build
```
