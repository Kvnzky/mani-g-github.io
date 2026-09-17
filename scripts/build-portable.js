import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEFAULT_GCASH_QR, DEFAULT_MARIBANK_QR, GCASH_NUMBER } from '../src/config/qrConfig.js';

const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <meta name="theme-color" content="#7C552E" />
  <title>🥜 MANI G? — “G ka ba sa crunch?”</title>
  
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            mani: {
              50: '#FDFBF7', 100: '#F6EFE3', 200: '#EADEC7', 300: '#D7BF9B',
              400: '#BC966A', 500: '#9E7241', 600: '#7C552E', 700: '#613F20',
              800: '#4B3019', 900: '#372212'
            },
            cream: { DEFAULT: '#FFFDF9', warm: '#FDF8ED' }
          }
        }
      }
    }
  </script>

  <!-- React 18 & Babel for Instant Portable Standalone Execution -->
  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

  <!-- Google Fonts: Plus Jakarta Sans -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">

  <style>
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: #FDFBF7;
      color: #372212;
      -webkit-tap-highlight-color: transparent;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
  </style>
</head>
<body class="min-h-screen">
  <div id="root"></div>

  <script type="text/babel">
    const { useState, useEffect } = React;

    const INITIAL_PRODUCTS = [
      { id: 'salted', name: 'Salted', description: 'Crispy deep-fried peanuts seasoned with fine rock salt.', price: 50, icon: '🧂', badge: 'Popular', available: true },
      { id: 'unsalted', name: 'Unsalted', description: 'Roasted to perfection with zero added salt — hearty & pure.', price: 50, icon: '🥜', badge: 'Healthy', available: true },
      { id: 'spicy', name: 'Spicy', description: 'Classic crunchy mani tossed with hot chili flakes & seasonings.', price: 50, icon: '🌶️', badge: 'Best Seller', available: true },
      { id: 'bbq', name: 'BBQ', description: 'Rich barbecue glaze packed with sweet, smoky & savory notes.', price: 50, icon: '🔥', badge: 'Favorites', available: true },
      { id: 'sour-cream', name: 'Sour Cream', description: 'Tangy blend of zesty sour cream & spring onions.', price: 50, icon: '🥛', badge: 'Trending', available: true },
      { id: 'bawang-only', name: 'Bawang Only', description: 'Pure crispy golden garlic chips & whole fried cloves only!', price: 60, icon: '🧄', badge: 'Must Try', available: true }
    ];

    const DEFAULT_SPREADSHEET_ID = '';
    const DEFAULT_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxFqu_Z8ZNEFoQ79ejaospmqByaTvGcrWAmkc4njilYdSJK8kvEDSslJejBwUl9z7DS/exec';
    const DEFAULT_GCASH_QR = "___DEFAULT_GCASH_QR___";
    const DEFAULT_MARIBANK_QR = "___DEFAULT_MARIBANK_QR___";
    const GCASH_NUMBER = "09055182263";

    const formatPHP = (amount) => {
      return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 }).format(amount);
    };

    const getPhilippineDateTime = () => {
      const now = new Date();
      const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
      const timeStr = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).format(now);
      return { dateStr, timeStr };
    };

    function App() {
      const [view, setView] = useState('order'); // 'order' or 'admin'
      const [products, setProducts] = useState(() => {
        const saved = localStorage.getItem('mani_products');
        return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
      });

      const [quantities, setQuantities] = useState({
        salted: 0, unsalted: 0, spicy: 0, bbq: 0, 'sour-cream': 0, 'bawang-only': 0
      });

      // Customer Info: Name, Mobile, Delivery Address, Payment Method
      const [customer, setCustomer] = useState({
        name: '',
        mobile: '',
        deliveryAddress: '',
        paymentMethod: 'Cash on Delivery' // 'Cash on Delivery', 'Maribank', 'GCash'
      });

      const [customQrs, setCustomQrs] = useState(() => {
        const saved = localStorage.getItem('mani_qr_config');
        if (saved) {
          try { return JSON.parse(saved); } catch (e) {}
        }
        return {
          maribank: DEFAULT_MARIBANK_QR,
          gcash: DEFAULT_GCASH_QR,
          gcashNumber: GCASH_NUMBER
        };
      });

      const [errors, setErrors] = useState({});
      const [isCartOpen, setIsCartOpen] = useState(false);
      const [submitting, setSubmitting] = useState(false);
      const [confirmedOrder, setConfirmedOrder] = useState(null);
      const [copiedGcash, setCopiedGcash] = useState(false);
      const [qrSaveMsg, setQrSaveMsg] = useState('');

      const [orders, setOrders] = useState(() => {
        const saved = localStorage.getItem('mani_orders');
        return saved ? JSON.parse(saved) : [];
      });

      const [appsScriptUrl, setAppsScriptUrl] = useState(() => {
        return localStorage.getItem('mani_apps_script_url') || DEFAULT_APPS_SCRIPT_URL;
      });

      useEffect(() => {
        localStorage.setItem('mani_products', JSON.stringify(products));
      }, [products]);

      useEffect(() => {
        localStorage.setItem('mani_orders', JSON.stringify(orders));
      }, [orders]);

      useEffect(() => {
        localStorage.setItem('mani_apps_script_url', appsScriptUrl);
      }, [appsScriptUrl]);

      useEffect(() => {
        localStorage.setItem('mani_qr_config', JSON.stringify(customQrs));
      }, [customQrs]);

      const handleQty = (id, change) => {
        setQuantities(prev => ({
          ...prev,
          [id]: Math.max(0, (prev[id] || 0) + change)
        }));
      };

      const totalPacks = Object.values(quantities).reduce((a, b) => a + (Number(b) || 0), 0);
      const grandTotal = products.reduce((sum, p) => sum + ((quantities[p.id] || 0) * p.price), 0);

      const handleCopyGcash = () => {
        navigator.clipboard.writeText(customQrs.gcashNumber || GCASH_NUMBER);
        setCopiedGcash(true);
        setTimeout(() => setCopiedGcash(false), 2000);
      };

      const handleFileUpload = (e, qrKey) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          setCustomQrs(prev => ({
            ...prev,
            [qrKey]: reader.result
          }));
          setQrSaveMsg(qrKey === 'maribank' ? 'Maribank QR updated!' : 'GCash QR updated!');
          setTimeout(() => setQrSaveMsg(''), 3000);
        };
        reader.readAsDataURL(file);
      };

      const validate = () => {
        const errs = {};
        if (!customer.name.trim()) errs.name = 'Customer Name is required';
        const cleanMobile = customer.mobile.replace(/[\\s\\-()]/g, '');
        if (!customer.mobile.trim()) {
          errs.mobile = 'Mobile number is required';
        } else if (!/^(09|\\+639|639)\\d{9}$/.test(cleanMobile)) {
          errs.mobile = 'Valid Philippine mobile required (e.g. 09171234567)';
        }
        if (!customer.deliveryAddress.trim()) {
          errs.deliveryAddress = 'Delivery address is required';
        }
        if (!customer.paymentMethod) {
          errs.paymentMethod = 'Please select a mode of payment';
        }
        if (totalPacks === 0) {
          errs.items = 'Please select at least 1 pack of Mani';
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
      };

      const handleSubmitOrder = async () => {
        if (!validate()) return;
        setSubmitting(true);

        const { dateStr, timeStr } = getPhilippineDateTime();
        const countToday = orders.filter(o => o.orderDate === dateStr).length + 1;
        const orderId = \`MANI-\${dateStr.replace(/-/g, '')}-\${String(countToday).padStart(3, '0')}\`;

        const itemsOrdered = products
          .filter(p => (quantities[p.id] || 0) > 0)
          .map(p => ({
            id: p.id,
            name: p.name,
            quantity: quantities[p.id],
            price: p.price,
            subtotal: quantities[p.id] * p.price
          }));

        const newOrder = {
          orderId,
          orderDate: dateStr,
          orderTime: timeStr,
          customerName: customer.name.trim(),
          mobileNumber: customer.mobile.trim(),
          deliveryAddress: customer.deliveryAddress.trim(),
          paymentMethod: customer.paymentMethod,
          paymentStatus: 'Unpaid',
          items: itemsOrdered,
          flavorQuantities: quantities,
          totalPacks,
          subtotal: grandTotal,
          status: 'New',
          createdAt: new Date().toISOString()
        };

        if (appsScriptUrl) {
          try {
            await fetch(appsScriptUrl, {
              method: 'POST',
              mode: 'no-cors',
              headers: { 'Content-Type': 'text/plain;charset=utf-8' },
              body: JSON.stringify({
                action: 'addOrder',
                spreadsheetId: DEFAULT_SPREADSHEET_ID,
                order: newOrder
              })
            });
          } catch (e) {
            console.warn('Google Sheet write:', e);
          }
        }

        newOrder.syncedToGoogleSheets = Boolean(appsScriptUrl);

        setOrders(prev => [newOrder, ...prev]);
        setConfirmedOrder(newOrder);
        setIsCartOpen(false);
        setSubmitting(false);
      };

      const handleReset = () => {
        setConfirmedOrder(null);
        setQuantities({ salted: 0, unsalted: 0, spicy: 0, bbq: 0, 'sour-cream': 0, 'bawang-only': 0 });
        setCustomer({ name: '', mobile: '', deliveryAddress: '', paymentMethod: 'Cash on Delivery' });
        setErrors({});
      };

      return (
        <div className="min-h-screen flex flex-col">
          {/* Top Bar */}
          <header className="sticky top-0 z-30 bg-cream/95 backdrop-blur-md border-b border-mani-200 px-4 py-3 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
              <div onClick={() => setView('order')} className="cursor-pointer flex items-center gap-2.5">
                <span className="text-3xl filter drop-shadow">🥜</span>
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-mani-900 leading-none tracking-tight">MANI G?</h1>
                  <p className="text-xs text-mani-600 font-medium italic">“G ka ba sa crunch?”</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setView(view === 'admin' ? 'order' : 'admin')}
                  className={\`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors \${
                    view === 'admin' ? 'bg-mani-900 text-amber-100 border-mani-900' : 'bg-mani-100 text-mani-800 border-mani-200'
                  }\`}
                >
                  {view === 'admin' ? 'Shop Menu' : '⚙️ Admin'}
                </button>

                {view === 'order' && (
                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow flex items-center gap-1.5"
                  >
                    <span>🛒</span>
                    <span>Order ({totalPacks})</span>
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* Main Area */}
          <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 pb-28">
            {view === 'admin' ? (
              /* ADMIN DASHBOARD */
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white rounded-3xl p-5 border border-mani-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h2 className="text-xl font-black text-mani-900">MANI G? Seller Dashboard</h2>
                    <p className="text-xs text-mani-600">Review orders, update status, and manage payment QR codes.</p>
                  </div>
                </div>

                {/* QR Code Upload / Configuration Card */}
                <div className="bg-white rounded-3xl p-5 border border-mani-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-mani-900">Payment QR Codes & GCash Settings</h3>
                  {qrSaveMsg && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                      {qrSaveMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {/* Maribank */}
                    <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-200 space-y-2 text-center">
                      <div className="flex justify-between items-center text-left">
                        <span className="font-extrabold text-orange-950">🏦 Maribank QR</span>
                        <label className="cursor-pointer px-2.5 py-1 bg-orange-600 text-white rounded-lg text-[11px] font-bold">
                          Upload QR
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'maribank')} />
                        </label>
                      </div>
                      <img src={customQrs.maribank} alt="Maribank QR" className="max-h-44 mx-auto rounded-lg object-contain bg-white p-2 border border-orange-200" />
                      <div className="text-[11px] font-semibold text-mani-700">JOHN KEVIN RAMIREZ: MariBank(****0559)</div>
                    </div>

                    {/* GCash */}
                    <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2 text-center">
                      <div className="flex justify-between items-center text-left">
                        <span className="font-extrabold text-blue-950">📱 GCash QR & Number</span>
                        <label className="cursor-pointer px-2.5 py-1 bg-blue-600 text-white rounded-lg text-[11px] font-bold">
                          Upload QR
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'gcash')} />
                        </label>
                      </div>
                      <img src={customQrs.gcash} alt="GCash QR" className="max-h-44 mx-auto rounded-lg object-contain bg-white p-2 border border-blue-200" />
                      <div className="flex gap-1.5 pt-1">
                        <input
                          type="text"
                          value={customQrs.gcashNumber || GCASH_NUMBER}
                          onChange={(e) => setCustomQrs(prev => ({ ...prev, gcashNumber: e.target.value }))}
                          className="flex-1 px-2 py-1 rounded-lg border border-blue-200 text-xs font-mono font-bold"
                        />
                        <button
                          onClick={() => {
                            setQrSaveMsg('GCash number saved!');
                            setTimeout(() => setQrSaveMsg(''), 2500);
                          }}
                          className="px-2.5 py-1 bg-blue-600 text-white rounded-lg font-bold text-[11px]"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Google Sheet Web App Connection */}
                <div className="bg-white rounded-3xl p-5 border border-mani-200 shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-mani-900">Google Apps Script Web App Connection</h3>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://script.google.com/macros/s/.../exec"
                      value={appsScriptUrl}
                      onChange={(e) => setAppsScriptUrl(e.target.value)}
                      className="flex-1 text-xs px-3 py-2 rounded-xl border border-mani-200 outline-none font-mono"
                    />
                    <button
                      onClick={() => alert('Connected! Orders will automatically write to Google Sheets.')}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold"
                    >
                      Save
                    </button>
                  </div>
                </div>

                {/* Orders List */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-mani-900 uppercase tracking-wider text-xs">
                    Incoming Orders ({orders.length})
                  </h3>

                  {orders.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-2xl border border-mani-200 text-mani-500 text-xs">
                      No orders placed yet.
                    </div>
                  ) : (
                    orders.map((ord) => (
                      <div key={ord.orderId} className="bg-white p-4 rounded-2xl border border-mani-200 shadow-sm space-y-2.5">
                        <div className="flex justify-between items-center border-b border-mani-100 pb-2">
                          <div>
                            <span className="font-mono font-bold text-sm text-amber-900">{ord.orderId}</span>
                            <span className="text-xs text-mani-500 ml-2">{ord.orderDate} {ord.orderTime}</span>
                            <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                              {ord.paymentMethod || 'Cash on Delivery'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <select
                              value={ord.paymentStatus || 'Unpaid'}
                              onChange={(e) => {
                                const newPSt = e.target.value;
                                setOrders(prev => prev.map(o => o.orderId === ord.orderId ? { ...o, paymentStatus: newPSt } : o));
                                if (appsScriptUrl) {
                                  fetch(appsScriptUrl, {
                                    method: 'POST',
                                    mode: 'no-cors',
                                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                                    body: JSON.stringify({
                                      action: 'updatePaymentStatus',
                                      spreadsheetId: DEFAULT_SPREADSHEET_ID,
                                      orderId: ord.orderId,
                                      orderDate: ord.orderDate,
                                      paymentStatus: newPSt
                                    })
                                  }).catch(console.error);
                                }
                              }}
                              className={"text-xs font-bold px-2 py-1 rounded-lg border " + ((ord.paymentStatus || 'Unpaid').toLowerCase() === 'paid' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-amber-100 text-amber-900 border-amber-300')}
                            >
                              <option value="Unpaid">🟡 Unpaid</option>
                              <option value="Paid">🟢 Paid</option>
                            </select>

                            <select
                              value={ord.status}
                              onChange={(e) => {
                                const newSt = e.target.value;
                                setOrders(prev => prev.map(o => o.orderId === ord.orderId ? { ...o, status: newSt } : o));
                                if (appsScriptUrl) {
                                  fetch(appsScriptUrl, {
                                    method: 'POST',
                                    mode: 'no-cors',
                                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                                    body: JSON.stringify({
                                      action: 'updateStatus',
                                      spreadsheetId: DEFAULT_SPREADSHEET_ID,
                                      orderId: ord.orderId,
                                      orderDate: ord.orderDate,
                                      status: newSt
                                    })
                                  }).catch(console.error);
                                }
                              }}
                              className="text-xs font-bold px-2 py-1 rounded-lg border bg-amber-50 text-amber-900 border-amber-300"
                            >
                              <option value="New">🟡 New</option>
                              <option value="Confirmed">🔵 Confirmed</option>
                              <option value="Preparing">🟠 Preparing</option>
                              <option value="Ready">🟣 Ready</option>
                              <option value="Completed">🟢 Completed</option>
                              <option value="Cancelled">🔴 Cancelled</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-mani-500 block">Customer:</span>
                            <span className="font-bold text-mani-900">{ord.customerName}</span>
                            <div className="text-mani-600">{ord.mobileNumber}</div>
                          </div>
                          <div>
                            <span className="text-mani-500 block">Delivery Address:</span>
                            <div className="font-medium text-mani-800">{ord.deliveryAddress || 'No address'}</div>
                          </div>
                          <div>
                            <span className="text-mani-500 block">Total & Payment:</span>
                            <span className="font-bold text-amber-800 text-sm">{formatPHP(ord.subtotal)}</span>
                            <div className="text-mani-600">{ord.totalPacks} packs • {ord.paymentMethod}</div>
                          </div>
                        </div>

                        <div className="bg-cream p-2 rounded-xl text-xs space-y-1">
                          {ord.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between text-mani-700">
                              <span>{it.name} × {it.quantity}</span>
                              <span>{formatPHP(it.subtotal)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              /* CUSTOMER SHOP SCREEN */
              <div className="space-y-6 animate-fade-in">
                {/* Hero Header */}
                <div className="text-center py-4 bg-gradient-to-b from-amber-100/60 to-transparent rounded-3xl p-5 border border-amber-200/60 shadow-xs">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 bg-amber-200/80 px-3 py-1 rounded-full">
                    Freshly Roasted Daily 🇵🇭
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black text-mani-900 mt-2 tracking-tight">
                    🥜 MANI G?
                  </h2>
                  <p className="text-sm sm:text-base text-amber-900 mt-1 font-bold italic">
                    “G ka ba sa crunch?”
                  </p>
                </div>

                {errors.items && (
                  <div className="p-3 bg-red-50 border border-red-300 text-red-700 rounded-2xl text-xs font-bold">
                    {errors.items}
                  </div>
                )}

                {/* 2-Column Responsive Desktop Grid / 1-Column Mobile Stack */}
                <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start space-y-6 lg:space-y-0">
                  {/* Left Column (Desktop 7 cols): Flavors Grid */}
                  <div className="lg:col-span-7 space-y-4">
                    <h3 className="text-sm font-extrabold text-mani-900 flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><span>🥜</span> Available Flavors</span>
                      <span className="text-xs text-amber-800 font-bold bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200">{totalPacks} packs chosen</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                    {products.map((p) => {
                      const qty = quantities[p.id] || 0;
                      return (
                        <div
                          key={p.id}
                          className={\`p-4 rounded-2xl border transition-all flex flex-col justify-between \${
                            qty > 0 ? 'bg-amber-50/50 border-amber-400 shadow-md ring-1 ring-amber-300' : 'bg-white border-mani-200 shadow-sm'
                          }\`}
                        >
                          <div>
                            <div className="flex justify-between items-start mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-3xl">{p.icon}</span>
                                <div>
                                  <h4 className="font-extrabold text-base text-mani-900">{p.name}</h4>
                                  <span className="text-xs font-bold text-amber-800">{formatPHP(p.price)} / pack</span>
                                </div>
                              </div>
                              {p.badge && (
                                <span className="text-[10px] uppercase font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
                                  {p.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-mani-600 mb-3">{p.description}</p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-mani-100">
                            <span className="text-xs font-bold text-mani-600">Qty:</span>
                            <div className="flex items-center gap-2 bg-mani-50 p-1 rounded-xl border border-mani-200">
                              <button
                                onClick={() => handleQty(p.id, -1)}
                                className="w-8 h-8 rounded-lg bg-white text-mani-800 font-bold shadow-xs border border-mani-200 flex items-center justify-center active:scale-95"
                              >
                                -
                              </button>
                              <span className="w-8 text-center text-sm font-black text-mani-900">{qty}</span>
                              <button
                                onClick={() => handleQty(p.id, 1)}
                                className="w-8 h-8 rounded-lg bg-amber-500 text-white font-bold shadow-xs flex items-center justify-center active:scale-95"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* End Left Column */}

                  {/* Right Column (Desktop 5 cols, Sticky): Customer Info & Live Checkout */}
                  <div id="portable-checkout-section" className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
                    {/* 1. Customer Information & Delivery Address */}
                <div className="bg-white p-5 sm:p-6 rounded-3xl border border-mani-200 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-base text-mani-900 border-b border-mani-100 pb-2 flex items-center gap-2">
                    <span>📋</span> Customer Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-mani-800 mb-1">Customer Name *</label>
                      <input
                        type="text"
                        placeholder="Juan Dela Cruz"
                        value={customer.name}
                        onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                        className={\`w-full text-xs px-3.5 py-2.5 rounded-xl border \${errors.name ? 'border-red-400 bg-red-50' : 'border-mani-200'} outline-none focus:border-amber-500\`}
                      />
                      {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-mani-800 mb-1">Mobile Number (PH) *</label>
                      <input
                        type="tel"
                        placeholder="0917 123 4567"
                        value={customer.mobile}
                        onChange={(e) => setCustomer({ ...customer, mobile: e.target.value })}
                        className={\`w-full text-xs px-3.5 py-2.5 rounded-xl border \${errors.mobile ? 'border-red-400 bg-red-50' : 'border-mani-200'} outline-none focus:border-amber-500\`}
                      />
                      {errors.mobile && <p className="text-[11px] text-red-500 mt-1">{errors.mobile}</p>}
                    </div>

                    {/* Address / To Be Delivered To */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-mani-800 mb-1">
                        Address / To Be Delivered To *
                      </label>
                      <textarea
                        rows="2"
                        placeholder="Enter complete delivery address"
                        value={customer.deliveryAddress}
                        onChange={(e) => setCustomer({ ...customer, deliveryAddress: e.target.value })}
                        className={\`w-full text-xs px-3.5 py-2.5 rounded-xl border \${errors.deliveryAddress ? 'border-red-400 bg-red-50' : 'border-mani-200'} outline-none focus:border-amber-500 resize-none\`}
                      />
                      {errors.deliveryAddress && <p className="text-[11px] text-red-500 mt-1">{errors.deliveryAddress}</p>}
                    </div>
                  </div>
                </div>

                {/* 2. Mode of Payment */}
                <div className="bg-white p-5 sm:p-6 rounded-3xl border border-mani-200 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-base text-mani-900 border-b border-mani-100 pb-2 flex items-center gap-2">
                    <span>💳</span> Mode of Payment
                  </h3>

                  {errors.paymentMethod && (
                    <p className="text-xs text-red-600 bg-red-50 p-2 rounded-xl border border-red-200 font-medium">
                      {errors.paymentMethod}
                    </p>
                  )}

                  {/* Payment Selection Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Cash on Delivery */}
                    <button
                      type="button"
                      onClick={() => setCustomer({ ...customer, paymentMethod: 'Cash on Delivery' })}
                      className={\`p-3.5 rounded-2xl border text-left transition-all \${
                        customer.paymentMethod === 'Cash on Delivery'
                          ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-300'
                          : 'bg-mani-50 text-mani-900 border-mani-200'
                      }\`}
                    >
                      <div className="text-xl mb-1">💵</div>
                      <div className="font-extrabold text-xs sm:text-sm">Cash on Delivery</div>
                      <div className={\`text-[11px] \${customer.paymentMethod === 'Cash on Delivery' ? 'text-amber-100' : 'text-mani-500'}\`}>
                        Pay upon arrival
                      </div>
                    </button>

                    {/* Maribank */}
                    <button
                      type="button"
                      onClick={() => setCustomer({ ...customer, paymentMethod: 'Maribank' })}
                      className={\`p-3.5 rounded-2xl border text-left transition-all \${
                        customer.paymentMethod === 'Maribank'
                          ? 'bg-orange-600 text-white border-orange-700 shadow-md ring-2 ring-orange-300'
                          : 'bg-mani-50 text-mani-900 border-mani-200'
                      }\`}
                    >
                      <div className="text-xl mb-1">🏦</div>
                      <div className="font-extrabold text-xs sm:text-sm">Maribank</div>
                      <div className={\`text-[11px] \${customer.paymentMethod === 'Maribank' ? 'text-orange-100' : 'text-mani-500'}\`}>
                        Scan to pay via QR
                      </div>
                    </button>

                    {/* GCash */}
                    <button
                      type="button"
                      onClick={() => setCustomer({ ...customer, paymentMethod: 'GCash' })}
                      className={\`p-3.5 rounded-2xl border text-left transition-all \${
                        customer.paymentMethod === 'GCash'
                          ? 'bg-blue-600 text-white border-blue-700 shadow-md ring-2 ring-blue-300'
                          : 'bg-mani-50 text-mani-900 border-mani-200'
                      }\`}
                    >
                      <div className="text-xl mb-1">📱</div>
                      <div className="font-extrabold text-xs sm:text-sm">GCash</div>
                      <div className={\`text-[11px] \${customer.paymentMethod === 'GCash' ? 'text-blue-100' : 'text-mani-500'}\`}>
                        QR code & number
                      </div>
                    </button>
                  </div>

                  {/* Dynamic Details */}
                  <div className="pt-2">
                    {customer.paymentMethod === 'Cash on Delivery' && (
                      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 animate-fade-in flex items-center gap-3">
                        <span className="text-2xl">💵</span>
                        <div>
                          <span className="font-bold block">Cash on Delivery</span>
                          Payment will be collected upon delivery.
                        </div>
                      </div>
                    )}

                    {customer.paymentMethod === 'Maribank' && (
                      <div className="p-5 sm:p-7 rounded-3xl bg-orange-50/80 border-2 border-orange-200 text-center space-y-4 animate-fade-in">
                        <div className="flex items-center justify-center gap-2 text-orange-950">
                          <span className="text-2xl">🏦</span>
                          <h4 className="text-base sm:text-lg font-black">Maribank Payment</h4>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-900 text-xs font-bold border border-orange-300/80">
                          <span>Scan the QR code to send your payment.</span>
                        </div>
                        {/* ENLARGED MARIBANK QR CODE */}
                        <div className="bg-white p-5 sm:p-7 rounded-3xl border-2 border-orange-300 max-w-sm sm:max-w-md mx-auto shadow-lg shadow-orange-900/10">
                          <div className="relative group overflow-hidden rounded-2xl bg-white p-2">
                            <img
                              src={customQrs.maribank}
                              alt="Maribank QR Code"
                              className="w-full max-w-[340px] sm:max-w-[380px] mx-auto rounded-xl object-contain filter contrast-105"
                            />
                          </div>
                          <div className="mt-4 pt-3 border-t border-orange-100">
                            <div className="text-sm font-black text-mani-900">
                              JOHN KEVIN RAMIREZ: MariBank(****0559)
                            </div>
                            <div className="text-xs text-mani-600 mt-1 font-medium">
                              Supports MariBank, GCash, Maya, ShopeePay & all InstaPay apps
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-mani-600 font-medium">
                          💡 Tip: Brighten your screen for faster scanning!
                        </p>
                      </div>
                    )}

                    {customer.paymentMethod === 'GCash' && (
                      <div className="p-5 sm:p-7 rounded-3xl bg-blue-50/80 border-2 border-blue-200 space-y-4 animate-fade-in text-center">
                        <div className="flex items-center justify-center gap-2 text-blue-950">
                          <span className="text-2xl">📱</span>
                          <h4 className="text-base sm:text-lg font-black">GCash Payment</h4>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold border border-blue-300/80">
                          <span>Scan the QR code or send payment to the GCash number.</span>
                        </div>
                        {/* GCash Number Box with Big Copy Button */}
                        <div className="bg-white p-4 rounded-2xl border-2 border-blue-300 max-w-sm sm:max-w-md mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                          <div className="text-center sm:text-left">
                            <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">GCash Number:</span>
                            <span className="text-xl sm:text-2xl font-black font-mono text-mani-900">{customQrs.gcashNumber || GCASH_NUMBER}</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleCopyGcash}
                            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-extrabold shadow transition-all"
                          >
                            {copiedGcash ? '✓ Copied Number!' : 'Copy Number'}
                          </button>
                        </div>
                        {/* ENLARGED GCASH QR CODE */}
                        <div className="bg-white p-5 sm:p-7 rounded-3xl border-2 border-blue-300 max-w-sm sm:max-w-md mx-auto shadow-lg shadow-blue-900/10">
                          <div className="relative group overflow-hidden rounded-2xl bg-white p-2">
                            <img
                              src={customQrs.gcash}
                              alt="GCash QR Code"
                              className="w-full max-w-[340px] sm:max-w-[380px] mx-auto rounded-xl object-contain filter contrast-105"
                            />
                          </div>
                          <div className="mt-4 pt-3 border-t border-blue-100">
                            <div className="text-sm font-black text-mani-900">
                              JO******N R.
                            </div>
                            <div className="text-xs text-mani-600 mt-1 font-medium">
                              Scan via GCash app or any InstaPay banking app
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-mani-600 font-medium">
                          💡 Tip: Please save a screenshot of your payment confirmation!
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Live Order Summary & Place Order */}
                <div className="bg-cream p-5 rounded-3xl border border-mani-200 shadow-warm space-y-4">
                  <div className="flex justify-between items-center border-b border-mani-200 pb-2">
                    <h3 className="font-black text-sm text-mani-900 uppercase tracking-wider">Order Summary</h3>
                    <span className="text-xs text-mani-600 font-bold">{totalPacks} packs total</span>
                  </div>

                  {totalPacks === 0 ? (
                    <p className="text-xs text-mani-500 text-center py-4">Choose flavors above to start your order.</p>
                  ) : (
                    <div className="space-y-2 text-xs">
                      {products.filter(p => (quantities[p.id] || 0) > 0).map(p => (
                        <div key={p.id} className="flex justify-between text-mani-800">
                          <span>{p.name} × {quantities[p.id]}</span>
                          <span className="font-bold">{formatPHP(quantities[p.id] * p.price)}</span>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-mani-200 flex justify-between items-center text-sm font-black text-mani-900">
                        <span>Total:</span>
                        <span className="text-xl text-amber-800">{formatPHP(grandTotal)}</span>
                      </div>
                    </div>
                  )}

                  <button
                    disabled={submitting || totalPacks === 0}
                    onClick={handleSubmitOrder}
                    className={\`w-full py-3.5 rounded-2xl font-black text-sm transition-all shadow-md \${
                      submitting || totalPacks === 0
                        ? 'bg-mani-200 text-mani-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white active:scale-98'
                    }\`}
                  >
                    {submitting ? 'Submitting Order...' : 'Place Order Now 🥜'}
                  </button>
                </div>
                  </div>
                </div>
              </div>
            )}
          </main>

          {/* Mobile Sticky Quick-Action Bar */}
          {view === 'order' && totalPacks > 0 && (
            <div className="fixed bottom-0 left-0 right-0 z-30 bg-cream/95 backdrop-blur-md border-t border-amber-200 px-4 py-3 shadow-2xl lg:hidden flex items-center justify-between animate-fade-in">
              <div>
                <div className="text-[11px] font-bold text-mani-600">{totalPacks} pack{totalPacks > 1 ? 's' : ''} in cart</div>
                <div className="text-base font-black text-amber-900">{formatPHP(grandTotal)}</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('portable-checkout-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-extrabold text-xs flex items-center gap-1 shadow-md shadow-amber-900/20"
              >
                <span>Proceed to Checkout →</span>
              </button>
            </div>
          )}

          {/* Confirmation Modal */}
          {confirmedOrder && (
            <div className="fixed inset-0 z-50 bg-mani-950/70 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fade-in border border-amber-300">
                <div className="text-center space-y-1">
                  <span className="text-4xl block">🎉</span>
                  <span className="inline-block text-[10px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full">
                    MANI G? Order Confirmed
                  </span>
                  <h3 className="text-xl font-black text-mani-900">Order Received!</h3>
                  <p className="text-xs text-mani-600">
                    Thank you, <span className="font-bold text-mani-900">{confirmedOrder.customerName}</span>! Your MANI G? order has been placed.
                  </p>
                </div>

                <div className="bg-cream p-4 rounded-2xl border border-dashed border-amber-300 space-y-2 text-xs">
                  <div className="flex justify-between font-bold">
                    <span className="text-mani-500">Order #:</span>
                    <span className="font-mono text-amber-900">{confirmedOrder.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mani-500">Mobile:</span>
                    <span className="font-bold text-mani-900">{confirmedOrder.mobileNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mani-500">Delivery Address:</span>
                    <span className="font-bold text-mani-900">{confirmedOrder.deliveryAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mani-500">Payment:</span>
                    <span className="font-bold text-amber-900">{confirmedOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mani-500">Total Packs:</span>
                    <span className="font-bold">{confirmedOrder.totalPacks} packs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mani-500">Total Amount:</span>
                    <span className="font-extrabold text-amber-800 text-sm">{formatPHP(confirmedOrder.subtotal)}</span>
                  </div>
                </div>

                <button
                  onClick={handleReset}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-2xl text-xs shadow"
                >
                  Place Another Order 🛒
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    ReactDOM.createRoot(document.getElementById('root')).render(<App />);
  </script>
</body>
</html>`;

const finalHtml = htmlTemplate
  .replace('"___DEFAULT_GCASH_QR___"', JSON.stringify(DEFAULT_GCASH_QR))
  .replace('"___DEFAULT_MARIBANK_QR___"', JSON.stringify(DEFAULT_MARIBANK_QR));

const outputPath = path.join(process.cwd(), 'Mani-Order-App.html');
fs.writeFileSync(outputPath, finalHtml, 'utf8');
console.log('✅ Mani-Order-App.html generated with embedded QR codes. Size:', fs.statSync(outputPath).size, 'bytes');
