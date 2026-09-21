import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FlavorCard from './components/FlavorCard';
import CustomerForm from './components/CustomerForm';
import OrderSummaryDrawer from './components/OrderSummaryDrawer';
import OrderConfirmationModal from './components/OrderConfirmationModal';
import AdminPortal from './components/AdminPortal';
import AdminLoginModal from './components/AdminLoginModal';
import OrderCutoffBanner from './components/OrderCutoffBanner';
import { DEFAULT_PRODUCTS, formatPHP } from './config/products';
import { DEFAULT_GCASH_QR, DEFAULT_MARIBANK_QR, GCASH_NUMBER } from './config/qrConfig';
import { DEFAULT_APPS_SCRIPT_URL, DEFAULT_SPREADSHEET_ID } from './config/sheetsConfig';
import { ArrowRight, AlertCircle, ShoppingBag, ChevronRight, Lock, Clock } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('order'); // 'order' or 'admin'
  const [products, setProducts] = useState(() => {
    try {
      const savedProds = JSON.parse(localStorage.getItem('mani_products') || 'null');
      const savedAvailability = JSON.parse(localStorage.getItem('mani_flavor_availability') || 'null');
      let base = Array.isArray(savedProds) && savedProds.length > 0 ? savedProds : DEFAULT_PRODUCTS;
      if (savedAvailability && typeof savedAvailability === 'object') {
        base = base.map(p => savedAvailability[p.id] !== undefined ? { ...p, available: Boolean(savedAvailability[p.id]) } : p);
      }
      return base;
    } catch (e) {
      return DEFAULT_PRODUCTS;
    }
  });
  
  // Admin Authentication State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [adminToken, setAdminToken] = useState(() => sessionStorage.getItem('mani_admin_token') || '');
  const [adminUser, setAdminUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('mani_admin_user') || 'null');
    } catch (e) {
      return null;
    }
  });

  // Order Cutoff State - Initialized immediately from cache or PHT defaults so timer is ALWAYS visible to everyone without delay
  const [cutoffInfo, setCutoffInfo] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('mani_cutoff_settings') || 'null');
      const now = new Date();
      const manilaDateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila' }).format(now);
      const conf = saved || {
        enabled: true,
        date: manilaDateStr,
        time: '23:59',
        deliveryDay: 'Wednesday'
      };
      const normalizedTime = conf.time?.length === 5 ? `${conf.time}:00` : (conf.time || '23:59:00');
      const cutoffIso = conf.date ? `${conf.date}T${normalizedTime}+08:00` : null;
      const cutoffTimestamp = cutoffIso ? new Date(cutoffIso).getTime() : null;
      const diffSec = cutoffTimestamp ? Math.floor((cutoffTimestamp - now.getTime()) / 1000) : null;
      const isOpen = conf.enabled ? (diffSec > 0) : true;
      const status = !conf.enabled ? 'OPEN' : (isOpen ? 'CUTOFF SCHEDULED' : 'CLOSED');
      return {
        enabled: Boolean(conf.enabled),
        isOpen,
        status,
        cutoffDate: conf.date,
        cutoffTime: conf.time,
        deliveryDay: conf.deliveryDay || 'Wednesday',
        flavorAvailability: conf.flavorAvailability || null,
        timezone: 'Asia/Manila',
        serverTime: now.toISOString(),
        remainingSeconds: diffSec ? Math.max(0, diffSec) : null,
        cutoffIso
      };
    } catch (e) {
      return null;
    }
  });

  // Flavors cart: { [productId]: quantity }
  const [quantities, setQuantities] = useState({
    salted: 0,
    unsalted: 0,
    spicy: 0,
    bbq: 0,
    'sour-cream': 0,
    cheese: 0,
    'bawang-only': 0
  });

  // Customer Form Data
  const [customerData, setCustomerData] = useState({
    customerName: '',
    mobileNumber: '',
    deliveryAddress: '',
    paymentMethod: 'Cash on Delivery'
  });

  // Configurable QR codes (v2 with new images)
  const [customQrs, setCustomQrs] = useState(() => {
    const saved = localStorage.getItem('mani_qr_config_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      maribank: DEFAULT_MARIBANK_QR,
      gcash: DEFAULT_GCASH_QR,
      gcashNumber: GCASH_NUMBER
    };
  });

  // Validation & UI State
  const [validationErrors, setValidationErrors] = useState({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Reset cart quantities for any unavailable flavors
  useEffect(() => {
    products.forEach((p) => {
      if (p.available === false && quantities[p.id] > 0) {
        setQuantities((prev) => ({ ...prev, [p.id]: 0 }));
      }
    });
  }, [products]);

  // Apply cloud settings payload to React states & local cache
  const applyCloudSettings = (settings, serverTimeStr) => {
    if (!settings) return;

    // 1. Synchronize Cutoff Settings & Delivery Day
    if (settings.cutoff || settings.deliveryDay) {
      const saved = settings.cutoff || {};
      const now = serverTimeStr ? new Date(serverTimeStr) : new Date();
      const normalizedTime = saved.time?.length === 5 ? `${saved.time}:00` : (saved.time || '23:59:00');
      const cutoffIso = saved.date ? `${saved.date}T${normalizedTime}+08:00` : null;
      const cutoffTimestamp = cutoffIso ? new Date(cutoffIso).getTime() : null;
      const diffSec = cutoffTimestamp ? Math.floor((cutoffTimestamp - now.getTime()) / 1000) : null;
      const isOpen = saved.enabled ? (diffSec > 0) : true;
      const status = !saved.enabled ? 'OPEN' : (isOpen ? 'CUTOFF SCHEDULED' : 'CLOSED');
      const deliveryDay = settings.deliveryDay || saved.deliveryDay || 'Wednesday';

      setCutoffInfo({
        enabled: Boolean(saved.enabled),
        isOpen,
        status,
        cutoffDate: saved.date,
        cutoffTime: saved.time,
        deliveryDay,
        flavorAvailability: saved.flavorAvailability || settings.flavorAvailability || null,
        timezone: 'Asia/Manila',
        serverTime: now.toISOString(),
        remainingSeconds: diffSec ? Math.max(0, diffSec) : null,
        cutoffIso
      });

      localStorage.setItem('mani_cutoff_settings', JSON.stringify({
        ...saved,
        deliveryDay
      }));
    }

    // 2. Synchronize Flavor Availability
    if (settings.flavorAvailability && typeof settings.flavorAvailability === 'object') {
      setProducts((prev) =>
        prev.map((p) => {
          if (settings.flavorAvailability[p.id] !== undefined) {
            return { ...p, available: Boolean(settings.flavorAvailability[p.id]) };
          }
          return p;
        })
      );
      localStorage.setItem('mani_flavor_availability', JSON.stringify(settings.flavorAvailability));
    }

    // 3. Synchronize Products & Pricing
    if (Array.isArray(settings.products) && settings.products.length > 0) {
      setProducts(settings.products);
      localStorage.setItem('mani_products', JSON.stringify(settings.products));
    }

    // 4. Synchronize Payment QR Codes & GCash Number
    if (settings.qrs && typeof settings.qrs === 'object') {
      setCustomQrs((prev) => ({ ...prev, ...settings.qrs }));
      localStorage.setItem('mani_qr_config_v2', JSON.stringify(settings.qrs));
    }
  };

  // Fallback to local storage cache if completely offline
  const applyLocalStorageFallback = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('mani_cutoff_settings') || 'null');
      if (saved) {
        const now = new Date();
        const normalizedTime = saved.time?.length === 5 ? `${saved.time}:00` : (saved.time || '23:59:00');
        const cutoffIso = saved.date ? `${saved.date}T${normalizedTime}+08:00` : null;
        const cutoffTimestamp = cutoffIso ? new Date(cutoffIso).getTime() : null;
        const diffSec = cutoffTimestamp ? Math.floor((cutoffTimestamp - now.getTime()) / 1000) : null;
        const isOpen = saved.enabled ? (diffSec > 0) : true;
        const status = !saved.enabled ? 'OPEN' : (isOpen ? 'CUTOFF SCHEDULED' : 'CLOSED');

        setCutoffInfo({
          enabled: Boolean(saved.enabled),
          isOpen,
          status,
          cutoffDate: saved.date,
          cutoffTime: saved.time,
          deliveryDay: saved.deliveryDay || 'Wednesday',
          flavorAvailability: saved.flavorAvailability || null,
          timezone: 'Asia/Manila',
          serverTime: now.toISOString(),
          remainingSeconds: diffSec ? Math.max(0, diffSec) : null,
          cutoffIso
        });
      }
    } catch (e) {}
  };

  // Real-time Cloud Settings Synchronization (Desktop <-> Mobile)
  const fetchCutoff = async () => {
    // 1. Try local Express backend if running (development mode)
    try {
      const res = await fetch('/api/cutoff');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data && data.status) {
          setCutoffInfo(data);
          if (data.flavorAvailability && typeof data.flavorAvailability === 'object') {
            setProducts((prev) =>
              prev.map((p) => {
                if (data.flavorAvailability[p.id] !== undefined) {
                  return { ...p, available: Boolean(data.flavorAvailability[p.id]) };
                }
                return p;
              })
            );
          }
          return;
        }
      }
    } catch (err) {}

    // 2. Fetch from Google Apps Script Web App (production cloud shared across desktop & mobile)
    const appsUrl = (localStorage.getItem('mani_apps_script_url') || DEFAULT_APPS_SCRIPT_URL || '').trim();
    if (appsUrl) {
      try {
        const cloudRes = await fetch(`${appsUrl}?action=getSettings`, { mode: 'cors' });
        if (cloudRes.ok) {
          const cloudData = await cloudRes.json();
          if (cloudData && cloudData.success && cloudData.settings) {
            applyCloudSettings(cloudData.settings, cloudData.serverTime);
            return;
          }
        }
      } catch (cloudErr) {
        // Fallback: JSONP for strict mobile browsers
        try {
          const cbName = `mani_sync_${Date.now()}`;
          const script = document.createElement('script');
          window[cbName] = (data) => {
            if (data && data.success && data.settings) {
              applyCloudSettings(data.settings, data.serverTime);
            }
            delete window[cbName];
            script.remove();
          };
          script.src = `${appsUrl}?action=getSettings&callback=${cbName}`;
          script.onerror = () => {
            delete window[cbName];
            script.remove();
          };
          document.head.appendChild(script);
        } catch (jpErr) {}
      }
    }

    // 3. Offline fallback
    applyLocalStorageFallback();
  };

  // Initial Data Fetching & Real-Time Sync Polling
  useEffect(() => {
    fetchCutoff();
    const syncInterval = setInterval(fetchCutoff, 10000); // Check cloud every 10s

    // Real-time mobile wakeup: refresh settings immediately when user switches tabs or unlocks phone
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchCutoff();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', fetchCutoff);

    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      })
      .catch(() => {});

    return () => {
      clearInterval(syncInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', fetchCutoff);
    };
  }, []);

  // Check auth if user tries to enter admin view
  useEffect(() => {
    if (currentView === 'admin' && !adminToken) {
      setCurrentView('order');
      setIsLoginModalOpen(true);
    }
  }, [currentView, adminToken]);

  const handleLoginSuccess = (token, user) => {
    setAdminToken(token);
    setAdminUser(user);
    setCurrentView('admin');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (e) {}
    sessionStorage.removeItem('mani_admin_token');
    sessionStorage.removeItem('mani_admin_user');
    setAdminToken('');
    setAdminUser(null);
    setCurrentView('order');
  };

  const handleUpdateProducts = (newProducts) => {
    setProducts(newProducts);
    localStorage.setItem('mani_products', JSON.stringify(newProducts));

    // 1. Sync to local backend if available
    fetch('/api/products', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(newProducts)
    }).catch(() => {});

    // 2. Sync to Google Apps Script Cloud so mobile immediately receives updated products & pricing
    const appsUrl = (localStorage.getItem('mani_apps_script_url') || DEFAULT_APPS_SCRIPT_URL || '').trim();
    if (appsUrl) {
      fetch(appsUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'saveSettings',
          settings: { products: newProducts }
        })
      }).catch(() => {});
    }
  };

  const handleUpdateQrs = (newQrs) => {
    setCustomQrs(newQrs);
    localStorage.setItem('mani_qr_config_v2', JSON.stringify(newQrs));

    // Sync to Google Apps Script Cloud so mobile immediately receives updated QR codes
    const appsUrl = (localStorage.getItem('mani_apps_script_url') || DEFAULT_APPS_SCRIPT_URL || '').trim();
    if (appsUrl) {
      fetch(appsUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'saveSettings',
          settings: { qrs: newQrs }
        })
      }).catch(() => {});
    }
  };

  const handleQuantityChange = (productId, newQty) => {
    const prod = products.find((p) => p.id === productId);
    if (prod && prod.available === false && newQty > 0) {
      return;
    }
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, newQty)
    }));
    if (submissionError) setSubmissionError('');
  };

  const handleClearOrder = () => {
    const cleared = {};
    Object.keys(quantities).forEach((k) => (cleared[k] = 0));
    setQuantities(cleared);
  };

  // Calculate totals
  const totalPacks = Object.values(quantities).reduce((a, b) => a + (Number(b) || 0), 0);

  const subtotal = products.reduce((sum, p) => {
    const qty = quantities[p.id] || 0;
    return sum + qty * (p.price || 50);
  }, 0);

  // Authoritative Cutoff Status
  const isOrdersClosed = Boolean(cutoffInfo?.enabled && !cutoffInfo?.isOpen);

  // Validation Logic
  const validateForm = () => {
    const errors = {};
    if (!customerData.customerName.trim()) {
      errors.customerName = 'Customer Name is required.';
    }

    const cleanMobile = customerData.mobileNumber.replace(/[\s\-()]/g, '');
    const mobileRegex = /^(09|\+639|639)\d{9}$/;
    if (!customerData.mobileNumber.trim()) {
      errors.mobileNumber = 'Mobile number is required.';
    } else if (!mobileRegex.test(cleanMobile)) {
      errors.mobileNumber = 'Please enter a valid mobile number (e.g. 09171234567 or +639171234567).';
    }

    if (!customerData.deliveryAddress.trim()) {
      errors.deliveryAddress = 'Delivery address is required.';
    }

    if (!customerData.paymentMethod) {
      errors.paymentMethod = 'Please select a mode of payment.';
    }

    if (totalPacks <= 0) {
      errors.items = 'Please select at least one Mani flavor.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Order Submission (Client & Server Cutoff Enforced)
  const handleSubmitOrder = async () => {
    if (isOrdersClosed) {
      setSubmissionError('Orders are now closed. The cutoff time for accepting orders has ended.');
      return;
    }

    if (!validateForm()) {
      setSubmissionError('Please fill out all required fields before placing your order.');
      return;
    }

    setIsSubmitting(true);
    setSubmissionError('');

    const orderedItems = products
      .filter((p) => (quantities[p.id] || 0) > 0)
      .map((p) => ({
        id: p.id,
        productId: p.id,
        name: p.name,
        quantity: quantities[p.id],
        price: p.price || 50,
        subtotal: quantities[p.id] * (p.price || 50),
        icon: p.icon
      }));

    let defaultPaymentStatus = 'Pending – Cash on Delivery';
    if (customerData.paymentMethod === 'GCash') {
      defaultPaymentStatus = 'Pending – Awaiting GCash Payment';
    } else if (customerData.paymentMethod === 'Maribank') {
      defaultPaymentStatus = 'Pending – Awaiting Maribank Payment';
    }

    const payload = {
      customerName: customerData.customerName.trim(),
      mobileNumber: customerData.mobileNumber.trim(),
      deliveryAddress: customerData.deliveryAddress.trim(),
      paymentMethod: customerData.paymentMethod,
      paymentStatus: defaultPaymentStatus,
      items: orderedItems,
      subtotal,
      deliveryFee: 0,
      discount: 0,
      totalAmount: subtotal
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();

        if (response.status === 403 || data.code === 'ORDERS_CLOSED') {
          fetchCutoff();
          throw new Error(data.error || 'Orders are now closed. The cutoff time for accepting orders has ended.');
        }

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Unable to submit your order.');
        }

        setConfirmedOrder(data.order);
        setIsDrawerOpen(false);
        return;
      }
    } catch (apiErr) {
      if (apiErr.message && apiErr.message.includes('Orders are now closed')) {
        setSubmissionError(apiErr.message);
        setIsSubmitting(false);
        return;
      }
      // If server returned non-JSON error, proceed to static fallback
    }

    // Static GitHub Pages fallback
    try {
      const now = new Date();
      const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
      const timeStr = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).format(now);
      const savedOrders = JSON.parse(localStorage.getItem('mani_orders') || '[]');
      const countToday = savedOrders.filter(o => o.orderDate === dateStr).length + 1;
      const orderId = `MANI-${dateStr.replace(/-/g, '')}-${String(countToday).padStart(3, '0')}`;

      const clientOrder = {
        orderId,
        orderDate: dateStr,
        orderTime: timeStr,
        customerName: payload.customerName,
        mobileNumber: payload.mobileNumber,
        deliveryAddress: payload.deliveryAddress,
        paymentMethod: payload.paymentMethod,
        paymentStatus: defaultPaymentStatus,
        items: orderedItems,
        flavorQuantities: { ...quantities },
        totalPacks,
        subtotal,
        deliveryFee: 0,
        discount: 0,
        totalAmount: subtotal,
        status: 'New',
        createdAt: now.toISOString(),
        syncedToGoogleSheets: false
      };

      const appsUrl = (localStorage.getItem('mani_apps_script_url') || DEFAULT_APPS_SCRIPT_URL || '').trim();
      const sheetId = (localStorage.getItem('mani_spreadsheet_id') || DEFAULT_SPREADSHEET_ID || '').trim();
      if (appsUrl) {
        fetch(appsUrl, {
          method: 'POST',
          mode: 'no-cors',
          keepalive: true,
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'addOrder', spreadsheetId: sheetId, order: clientOrder })
        }).catch((syncErr) => {
          console.warn('Apps Script sync error:', syncErr);
        });
        clientOrder.syncedToGoogleSheets = true;
      }

      localStorage.setItem('mani_orders', JSON.stringify([clientOrder, ...savedOrders]));
      setConfirmedOrder(clientOrder);
      setIsDrawerOpen(false);
    } catch (fallbackErr) {
      setSubmissionError('Unable to process order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForNewOrder = () => {
    setConfirmedOrder(null);
    handleClearOrder();
    setCustomerData({
      customerName: '',
      mobileNumber: '',
      deliveryAddress: '',
      paymentMethod: 'Cash on Delivery'
    });
    setValidationErrors({});
    setSubmissionError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-mani-900 selection:bg-amber-200">
      {/* Header */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        totalItems={totalPacks}
        onOpenCart={() => setIsDrawerOpen(true)}
        isAdminAuthenticated={Boolean(adminToken)}
        adminUser={adminUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        cutoffInfo={cutoffInfo}
      />

      {/* Main Content */}
      <main className="flex-1 pb-24 sm:pb-12">
        {currentView === 'admin' && adminToken ? (
          <AdminPortal
            products={products}
            onUpdateProducts={handleUpdateProducts}
            customQrs={customQrs}
            onUpdateQrs={handleUpdateQrs}
            adminToken={adminToken}
            adminUser={adminUser}
            onLogout={handleLogout}
            cutoffInfo={cutoffInfo}
            onRefreshCutoff={fetchCutoff}
          />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Friendly Hero Banner */}
            <div className="text-center space-y-2 py-5 sm:py-7 bg-gradient-to-b from-amber-100/60 to-transparent rounded-3xl p-4 sm:p-8 border border-amber-200/50 shadow-xs">
              <div className="flex justify-center mb-1">
                <img 
                  src="./images/logo.png" 
                  alt="Mani Wandering" 
                  className="w-32 sm:w-40 md:w-48 h-auto drop-shadow-md hover:scale-105 transition-transform duration-200" 
                />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500 text-white shadow-xs">
                <span>🇵🇭</span> Crispy na, Crunchy pa.
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-mani-950 tracking-tight">
                Mani Wandering
              </h2>
              <p className="text-base sm:text-lg text-amber-800 font-extrabold italic tracking-tight">
                “Wondering where your money went? We know.” 👀🥜
              </p>
              <p className="text-xs sm:text-sm text-mani-600 max-w-md mx-auto font-medium leading-relaxed">
                Choose your favorite flavors, enter your delivery address, and pick your payment method!
              </p>
            </div>

            {/* ⏰ Order Cutoff Timer Banner Prominently Placed at the Top */}
            <OrderCutoffBanner 
              cutoffInfo={cutoffInfo} 
              onRefreshCutoff={fetchCutoff} 
            />

            {/* Error Banner */}
            {submissionError && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-300 text-sm font-semibold text-red-700 flex items-center gap-2.5 shadow-xs animate-fade-in">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
                <span>{submissionError}</span>
              </div>
            )}

            {/* Responsive 2-Column Desktop Grid / 1-Column Mobile Stack */}
            <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start space-y-6 lg:space-y-0">
              {/* Left Column (Desktop 7 cols): Flavors Catalog */}
              <div className="lg:col-span-7 space-y-6">
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-mani-900 flex items-center gap-2">
                        <span>🥜</span> Mani Flavors
                      </h3>
                      <p className="text-xs sm:text-sm text-mani-600">
                        Select one or more flavors. Adjust quantities with the buttons.
                      </p>
                    </div>
                    {totalPacks > 0 && (
                      <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200">
                        {totalPacks} pack{totalPacks > 1 ? 's' : ''} in cart
                      </span>
                    )}
                  </div>

                  {/* Flavors Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
                    {products.map((product) => (
                      <FlavorCard
                        key={product.id}
                        product={product}
                        quantity={quantities[product.id] || 0}
                        onQuantityChange={handleQuantityChange}
                      />
                    ))}
                  </div>
                </section>
              </div>

              {/* Right Column (Desktop 5 cols, Sticky): Customer Info & Live Checkout */}
              <div id="checkout-section" className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
                {/* Customer Information, Delivery Address & Payment Method */}
                <section>
                  <CustomerForm
                    formData={customerData}
                    onChange={setCustomerData}
                    errors={validationErrors}
                    customQrs={customQrs}
                  />
                </section>

                {/* Live Order Summary & Checkout Card */}
                <section className="bg-cream rounded-3xl p-5 sm:p-7 border border-mani-200 shadow-warm space-y-4">
                  <div className="flex items-center justify-between border-b border-mani-100 pb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🛒</span>
                      <h3 className="text-base sm:text-lg font-black text-mani-900">
                        Order Summary
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {cutoffInfo && (
                        <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                          !cutoffInfo.isOpen
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : cutoffInfo.enabled
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}>
                          {!cutoffInfo.isOpen ? (
                            <><Lock className="w-3 h-3 text-red-600" /> Closed</>
                          ) : cutoffInfo.enabled ? (
                            <><Clock className="w-3 h-3 text-amber-600 animate-pulse" /> Cutoff {cutoffInfo.cutoffTime || '23:59'}</>
                          ) : (
                            <><span>🟢</span> Open</>
                          )}
                        </span>
                      )}
                      {totalPacks > 0 && (
                        <button
                          type="button"
                          onClick={handleClearOrder}
                          className="text-xs font-semibold text-mani-500 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                  </div>

                  {totalPacks === 0 ? (
                    <div className="text-center py-6 text-mani-500 text-xs sm:text-sm">
                      No Mani flavor selected yet. Click <strong>+</strong> on any flavor to add to your order.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="divide-y divide-mani-100 max-h-52 overflow-y-auto pr-1">
                        {products
                          .filter((p) => (quantities[p.id] || 0) > 0)
                          .map((p) => (
                            <div key={p.id} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
                              <div className="flex items-center gap-2">
                                <span>{p.icon || '🥜'}</span>
                                <span className="font-extrabold text-mani-900">{p.name}</span>
                                <span className="text-mani-600 font-medium">× {quantities[p.id]} pack(s)</span>
                              </div>
                              <span className="font-bold text-mani-900">
                                {formatPHP(quantities[p.id] * (p.price || 50))}
                              </span>
                            </div>
                          ))}
                      </div>

                      <div className="pt-3 border-t border-mani-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-mani-600 font-semibold">
                            Total Packs: <span className="text-mani-900 font-black">{totalPacks}</span>
                          </div>
                          <div className="text-xl sm:text-2xl font-black text-amber-900">
                            {formatPHP(subtotal)}
                          </div>
                        </div>

                        {/* Order Placement Button or Cutoff Alert */}
                        {isOrdersClosed ? (
                          <div className="space-y-2">
                            <button
                              type="button"
                              disabled={true}
                              className="w-full py-4 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 bg-red-100 border-2 border-red-300 text-red-800 cursor-not-allowed shadow-none"
                            >
                              <Lock className="w-5 h-5 text-red-600" />
                              <span>Orders Closed (Cutoff Ended)</span>
                            </button>
                            <p className="text-center text-xs text-red-700 font-medium">
                              The cutoff time for accepting orders has ended.
                            </p>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={isSubmitting || totalPacks === 0}
                            onClick={handleSubmitOrder}
                            className={`w-full py-4 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all ${
                              totalPacks === 0 || isSubmitting
                                ? 'bg-mani-200 text-mani-400 cursor-not-allowed shadow-none'
                                : 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white shadow-amber-900/20 active:scale-98 cursor-pointer'
                            }`}
                          >
                            {isSubmitting ? 'Submitting Order...' : 'Place Order Now 🥜'}
                            <ArrowRight className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </section>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Sticky Quick-Action Bar */}
      {currentView === 'order' && totalPacks > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-cream/95 backdrop-blur-md border-t border-amber-200 px-4 py-3 shadow-2xl lg:hidden animate-fade-in flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-mani-600 flex items-center gap-1.5">
              <span>{totalPacks} pack{totalPacks > 1 ? 's' : ''} in cart</span>
              {cutoffInfo?.isOpen && cutoffInfo?.enabled && (
                <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300">
                  ⏰ Cutoff {cutoffInfo.cutoffTime || '23:59'}
                </span>
              )}
            </div>
            <div className="text-base font-black text-amber-900">
              {formatPHP(subtotal)}
            </div>
          </div>
          {isOrdersClosed ? (
            <span className="px-3.5 py-2 rounded-xl bg-red-100 text-red-800 font-black text-xs border border-red-300 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> Orders Closed
            </span>
          ) : (
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('checkout-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-amber-900/20 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Slide-over Drawer */}
      <OrderSummaryDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        items={products.map((p) => ({ ...p, quantity: quantities[p.id] || 0 }))}
        onQuantityChange={handleQuantityChange}
        onClearOrder={handleClearOrder}
        customerData={customerData}
        totalPacks={totalPacks}
        subtotal={subtotal}
        onSubmitOrder={handleSubmitOrder}
        isSubmitting={isSubmitting}
        validationErrors={validationErrors}
        isOrdersClosed={isOrdersClosed}
        cutoffInfo={cutoffInfo}
      />

      {/* Order Confirmation Modal */}
      {confirmedOrder && (
        <OrderConfirmationModal
          order={confirmedOrder}
          onReset={handleResetForNewOrder}
        />
      )}

      {/* Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Clean Footer (No Google Sheet IDs or connections displayed) */}
      <footer className="border-t border-mani-200/80 bg-white py-6 text-center text-xs text-mani-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-1">
          <p className="font-bold text-mani-700">
            🥜 Mani Wandering — “Wondering where your money went? We know.” 👀🥜
          </p>
          <p className="text-mani-400 text-[11px]">
            Freshly roasted artisanal peanuts • Crispy na, Crunchy pa.
          </p>
        </div>
      </footer>
    </div>
  );
}
