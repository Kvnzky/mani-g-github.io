import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FlavorCard from './components/FlavorCard';
import CustomerForm from './components/CustomerForm';
import OrderSummaryCard from './components/OrderSummaryCard';
import OrderSummaryDrawer from './components/OrderSummaryDrawer';
import OrderConfirmationModal from './components/OrderConfirmationModal';
import AdminPortal from './components/AdminPortal';
import AdminLoginModal from './components/AdminLoginModal';
import OrderCutoffBanner from './components/OrderCutoffBanner';
import { DEFAULT_PRODUCTS, formatPHP } from './config/products';
import { DEFAULT_GCASH_QR, DEFAULT_MARIBANK_QR, GCASH_NUMBER } from './config/qrConfig';
import { DEFAULT_APPS_SCRIPT_URL, DEFAULT_SPREADSHEET_ID } from './config/sheetsConfig';
import { DEFAULT_PAYMENT_METHODS, getPaymentMethodIdByName, isPaymentMethodEnabled } from './config/paymentConfig';
import { ArrowRight, AlertCircle, ShoppingBag, ChevronRight, Lock, Clock, X } from 'lucide-react';

// Helper to detect if current URL or hash targets the admin route
const parseAdminRoute = () => {
  if (typeof window === 'undefined') return { isAdmin: false, subroute: '' };
  const pathname = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '');

  let isAdmin = false;
  let subroute = '';

  const adminPathIndex = pathname.indexOf('/admin');
  if (adminPathIndex !== -1) {
    isAdmin = true;
    const afterAdmin = pathname.substring(adminPathIndex + 6).replace(/^\/+|\/+$/g, '');
    subroute = afterAdmin.split('/')[0] || '';
  } else if (hash.startsWith('admin')) {
    isAdmin = true;
    const afterAdmin = hash.replace(/^admin\/?/, '').replace(/^\/+|\/+$/g, '');
    subroute = afterAdmin.split('/')[0] || '';
  }

  return { isAdmin, subroute };
};

export default function App() {
  const initialRoute = parseAdminRoute();
  const initialToken = typeof window !== 'undefined' ? (sessionStorage.getItem('mani_admin_token') || '') : '';

  const [currentView, setCurrentView] = useState(() => initialRoute.isAdmin ? 'admin' : 'order');
  const [adminTab, setAdminTab] = useState(() => {
    if (initialRoute.isAdmin && initialRoute.subroute) {
      if (initialRoute.subroute === 'settings' || initialRoute.subroute === 'availability') return 'cutoff';
      if (initialRoute.subroute === 'order-summary' || initialRoute.subroute === 'ordersummary') return 'order-summary';
      return initialRoute.subroute;
    }
    return 'cutoff';
  });

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
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(() => initialRoute.isAdmin && !initialToken);
  const [adminToken, setAdminToken] = useState(initialToken);
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

  // Mode of Payment Availability: { cod: true, maribank: true, gcash: true }
  const [paymentMethods, setPaymentMethods] = useState(() => {
    try {
      const saved = localStorage.getItem('mani_payment_methods');
      if (saved) {
        return { ...DEFAULT_PAYMENT_METHODS, ...JSON.parse(saved) };
      }
    } catch (e) {}
    return { ...DEFAULT_PAYMENT_METHODS };
  });

  // Automatically update customer paymentMethod if the selected method is disabled
  useEffect(() => {
    if (customerData.paymentMethod) {
      const currentId = getPaymentMethodIdByName(customerData.paymentMethod);
      if (paymentMethods[currentId] === false) {
        const fallback = paymentMethods.cod ? 'Cash on Delivery'
          : paymentMethods.gcash ? 'GCash'
          : paymentMethods.maribank ? 'Maribank'
          : '';
        setCustomerData((prev) => ({ ...prev, paymentMethod: fallback }));
      }
    }
  }, [paymentMethods, customerData.paymentMethod]);

  // Validation & UI State
  const [validationErrors, setValidationErrors] = useState({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Micro-interaction & Toast Feedback State
  const [toast, setToast] = useState({ show: false, message: '', icon: '' });
  const [recentlyAddedId, setRecentlyAddedId] = useState(null);
  const [cartBounce, setCartBounce] = useState(false);

  // Auto-dismiss toast notification
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 2600);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

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

    // 5. Synchronize Mode of Payment Availability
    if (settings.paymentMethods && typeof settings.paymentMethods === 'object') {
      const normalizedPm = {
        cod: settings.paymentMethods.cod !== false,
        maribank: settings.paymentMethods.maribank !== false,
        gcash: settings.paymentMethods.gcash !== false
      };
      setPaymentMethods(normalizedPm);
      localStorage.setItem('mani_payment_methods', JSON.stringify(normalizedPm));
    }
  };

  // Fallback to local storage cache if completely offline
  const applyLocalStorageFallback = () => {
    try {
      const savedPM = JSON.parse(localStorage.getItem('mani_payment_methods') || 'null');
      if (savedPM && typeof savedPM === 'object') {
        setPaymentMethods((prev) => ({ ...prev, ...savedPM }));
      }
    } catch (e) {}

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
          if (data.paymentMethods && typeof data.paymentMethods === 'object') {
            setPaymentMethods((prev) => ({ ...prev, ...data.paymentMethods }));
            localStorage.setItem('mani_payment_methods', JSON.stringify(data.paymentMethods));
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

  // Synchronize route & auth guard when URL or hash changes (browser Back/Forward/Manual navigation)
  useEffect(() => {
    const handleLocationChange = () => {
      const route = parseAdminRoute();
      const token = sessionStorage.getItem('mani_admin_token') || '';

      if (route.isAdmin) {
        if (token) {
          // Authenticated Admin access
          setCurrentView('admin');
          setIsLoginModalOpen(false);
          if (route.subroute) {
            let mappedTab = route.subroute;
            if (route.subroute === 'settings' || route.subroute === 'availability') mappedTab = 'cutoff';
            if (route.subroute === 'order-summary' || route.subroute === 'ordersummary') mappedTab = 'order-summary';
            setAdminTab(mappedTab);
          }
        } else {
          // Unauthenticated Admin access: redirect/normalize subroutes to /admin and prompt login
          const pathname = window.location.pathname.toLowerCase();
          const adminPathIndex = pathname.indexOf('/admin');
          if (route.subroute) {
            if (window.location.hash.includes('admin')) {
              window.history.replaceState(null, '', '#/admin');
            } else if (adminPathIndex !== -1) {
              const basePath = pathname.substring(0, adminPathIndex) || '';
              window.history.replaceState(null, '', `${basePath}/admin`);
            }
          }
          setCurrentView('admin');
          setIsLoginModalOpen(true);
        }
      } else {
        // Customer store view (100% guest-ordering)
        setCurrentView('order');
        setIsLoginModalOpen(false);
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = (view, tab = '') => {
    const isHashMode = window.location.hash.includes('admin') || (!window.location.pathname.includes('/admin') && Boolean(window.location.hash));

    if (view === 'admin') {
      const activeAdminTab = tab || adminTab || 'cutoff';
      const sub = (activeAdminTab === 'cutoff' || activeAdminTab === 'settings') ? 'settings' : activeAdminTab;

      if (adminToken) {
        setCurrentView('admin');
        setIsLoginModalOpen(false);
        setAdminTab(activeAdminTab);
        if (isHashMode) {
          window.location.hash = `/admin/${sub}`;
        } else {
          window.history.pushState(null, '', `/admin/${sub}`);
        }
      } else {
        // Unauthenticated access: prompt login modal at /admin
        setCurrentView('admin');
        setIsLoginModalOpen(true);
        if (isHashMode) {
          window.location.hash = '/admin';
        } else {
          window.history.pushState(null, '', '/admin');
        }
      }
    } else {
      // view === 'order' (customer guest store)
      setCurrentView('order');
      setIsLoginModalOpen(false);
      if (window.location.hash) {
        window.history.pushState(null, '', window.location.pathname || '/');
      } else {
        window.history.pushState(null, '', '/');
      }
    }
  };

  const handleAdminTabChange = (tabId) => {
    setAdminTab(tabId);
    const routeSegment = tabId === 'cutoff' ? 'settings' : tabId;
    const isHashMode = window.location.hash.includes('admin') || (!window.location.pathname.includes('/admin') && Boolean(window.location.hash));
    if (isHashMode) {
      window.location.hash = `/admin/${routeSegment}`;
    } else {
      window.history.pushState(null, '', `/admin/${routeSegment}`);
    }
  };

  const handleLoginSuccess = (token, user) => {
    setAdminToken(token);
    setAdminUser(user);
    setIsLoginModalOpen(false);
    setCurrentView('admin');
    const sub = (adminTab === 'cutoff' || adminTab === 'settings') ? 'settings' : adminTab;
    const isHashMode = window.location.hash.includes('admin');
    if (isHashMode) {
      window.location.hash = `/admin/${sub}`;
    } else {
      window.history.replaceState(null, '', `/admin/${sub}`);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { 
        method: 'POST',
        headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {}
      });
    } catch (e) {}
    sessionStorage.removeItem('mani_admin_token');
    sessionStorage.removeItem('mani_admin_user');
    setAdminToken('');
    setAdminUser(null);
    setCurrentView('admin');
    setIsLoginModalOpen(true);
    const isHashMode = window.location.hash.includes('admin');
    if (isHashMode) {
      window.location.hash = '/admin';
    } else {
      window.history.replaceState(null, '', '/admin');
    }
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
    if (!adminToken) {
      // If user closes admin login modal while unauthenticated, redirect to customer store
      navigateTo('order');
    }
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

  const handleUpdatePaymentMethods = (newMethods) => {
    const normalized = {
      cod: newMethods.cod !== false,
      maribank: newMethods.maribank !== false,
      gcash: newMethods.gcash !== false
    };
    setPaymentMethods(normalized);
    localStorage.setItem('mani_payment_methods', JSON.stringify(normalized));

    // 1. Sync to local backend server if running
    try {
      if (adminToken) {
        fetch('/api/admin/payment-methods', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`
          },
          body: JSON.stringify({ paymentMethods: normalized })
        }).catch(() => {});
      }
    } catch (err) {}

    // 2. Sync to Google Apps Script Cloud so mobile immediately receives updated payment methods
    const appsUrl = (localStorage.getItem('mani_apps_script_url') || DEFAULT_APPS_SCRIPT_URL || '').trim();
    if (appsUrl) {
      // POST sync
      fetch(appsUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'saveSettings',
          settings: { paymentMethods: normalized }
        })
      }).catch(() => {});

      // GET fast-path sync
      fetch(`${appsUrl}?action=savePaymentMethods&cod=${normalized.cod}&maribank=${normalized.maribank}&gcash=${normalized.gcash}`, {
        mode: 'no-cors'
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

  // Micro-interaction trigger on flavor addition
  const handleAddToCartFeedback = (product, addedQty) => {
    setRecentlyAddedId(product.id);
    setTimeout(() => {
      setRecentlyAddedId((curr) => (curr === product.id ? null : curr));
    }, 1800);

    setCartBounce(true);
    setTimeout(() => setCartBounce(false), 400);

    const flavorName = product.name.replace(/^Mani\s+/i, '');
    const tubLabel = addedQty === 1 ? 'tub' : 'tubs';
    setToast({
      show: true,
      message: `Added ${addedQty} ${tubLabel} of ${flavorName} to order`,
      icon: product.icon || '🥜'
    });
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

    const hasAnyPaymentMethod = Object.values(paymentMethods).some(Boolean);
    if (!hasAnyPaymentMethod) {
      errors.paymentMethod = 'All payment methods are temporarily disabled. Please contact us to order.';
    } else if (!customerData.paymentMethod) {
      errors.paymentMethod = 'Please select a mode of payment.';
    } else {
      const pmId = getPaymentMethodIdByName(customerData.paymentMethod);
      if (paymentMethods[pmId] === false) {
        errors.paymentMethod = `${customerData.paymentMethod} is currently unavailable. Please choose another payment option.`;
      }
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

    const hasAnyPaymentMethod = Object.values(paymentMethods).some(Boolean);
    if (!hasAnyPaymentMethod) {
      setSubmissionError('Payment options are temporarily disabled by the administrator. Orders cannot be placed at this time.');
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
        totalTubs: totalPacks,
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
      {/* Sleek Floating Toast Notification */}
      {toast.show && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 right-4 sm:right-6 z-50 flex items-center gap-3 bg-mani-950/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl border border-amber-500/40 animate-fade-in transition-all max-w-sm"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg shrink-0">
            {toast.icon}
          </div>
          <div className="text-xs sm:text-sm font-bold pr-1">
            {toast.message}
          </div>
          <button
            type="button"
            onClick={() => setToast((prev) => ({ ...prev, show: false }))}
            className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors ml-auto cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        onNavigate={navigateTo}
        totalItems={totalPacks}
        onOpenCart={() => setIsDrawerOpen(true)}
        isAdminAuthenticated={Boolean(adminToken)}
        adminUser={adminUser}
        onLogout={handleLogout}
        cutoffInfo={cutoffInfo}
      />

      {/* Main Content */}
      <main className={`flex-1 ${totalPacks > 0 ? 'pb-32 sm:pb-16' : 'pb-24 sm:pb-12'}`}>
        {currentView === 'admin' && adminToken ? (
          <AdminPortal
            products={products}
            onUpdateProducts={handleUpdateProducts}
            customQrs={customQrs}
            onUpdateQrs={handleUpdateQrs}
            paymentMethods={paymentMethods}
            onUpdatePaymentMethods={handleUpdatePaymentMethods}
            adminToken={adminToken}
            adminUser={adminUser}
            onLogout={handleLogout}
            cutoffInfo={cutoffInfo}
            onRefreshCutoff={fetchCutoff}
            activeTab={adminTab}
            onTabChange={handleAdminTabChange}
          />
        ) : currentView === 'admin' && !adminToken ? (
          /* Dedicated unauthenticated /admin screen holding the AdminLoginModal */
          <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-900 mx-auto flex items-center justify-center border border-amber-300 shadow-sm">
              <Lock className="w-8 h-8 text-amber-700" />
            </div>
            <h2 className="text-2xl font-black text-mani-950">Admin Access Required</h2>
            <p className="text-xs sm:text-sm text-mani-600 font-medium">
              Please sign in with authorized administrator credentials to manage orders, products, and store settings.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                Open Admin Login
              </button>
              <button
                type="button"
                onClick={() => navigateTo('order')}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-mani-100 text-mani-700 font-bold text-xs sm:text-sm border border-mani-200 transition-all cursor-pointer"
              >
                Return to Store
              </button>
            </div>
          </div>
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
                        {totalPacks} tub{totalPacks > 1 ? 's' : ''} in cart
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
                        onAddToCart={handleAddToCartFeedback}
                      />
                    ))}
                  </div>
                </section>
              </div>

              {/* Right Column (Desktop 5 cols, Sticky): 2. Order Summary, 3. Customer Info, 4. Shipping Info, 5. Payment & Checkout */}
              <div id="checkout-section" className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
                {/* 2. Active Order Summary / Cart */}
                <section>
                  <OrderSummaryCard
                    items={products}
                    quantities={quantities}
                    onQuantityChange={handleQuantityChange}
                    onClearOrder={handleClearOrder}
                    recentlyAddedId={recentlyAddedId}
                    cartBounce={cartBounce}
                    onProceedToDetails={() => {
                      const el = document.getElementById('customer-info-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  />
                </section>

                {/* 3. Customer Info, 4. Shipping Info, 5. Payment & Checkout */}
                <section>
                  <CustomerForm
                    formData={customerData}
                    onChange={setCustomerData}
                    errors={validationErrors}
                    customQrs={customQrs}
                    paymentMethods={paymentMethods}
                    onSubmitOrder={handleSubmitOrder}
                    isSubmitting={isSubmitting}
                    isOrdersClosed={isOrdersClosed}
                    totalPacks={totalPacks}
                    subtotal={subtotal}
                  />
                </section>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Sticky Quick-Action Bar */}
      {currentView === 'order' && totalPacks > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-cream/95 backdrop-blur-md border-t border-amber-200 px-4 py-3 shadow-2xl lg:hidden animate-fade-in flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('order-summary-section');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="text-left cursor-pointer active:opacity-80 transition-opacity"
            title="View Order Summary"
          >
            <div className="text-[11px] font-bold text-mani-600 flex items-center gap-1.5">
              <span>{totalPacks} tub{totalPacks > 1 ? 's' : ''} in cart</span>
              {cutoffInfo?.isOpen && cutoffInfo?.enabled && (
                <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300">
                  ⏰ Cutoff {cutoffInfo.cutoffTime || '23:59'}
                </span>
              )}
            </div>
            <div className="text-base font-black text-amber-900 flex items-center gap-1">
              <span>{formatPHP(subtotal)}</span>
              <span className="text-[10px] text-amber-700 font-bold underline">Summary</span>
            </div>
          </button>
          {isOrdersClosed ? (
            <span className="px-3.5 py-2 rounded-xl bg-red-100 text-red-800 font-black text-xs border border-red-300 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> Orders Closed
            </span>
          ) : (
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('customer-info-section');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-amber-900/20 cursor-pointer"
            >
              <span>Proceed to Details</span>
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
        paymentMethods={paymentMethods}
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
        onClose={handleCloseLoginModal}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Clean Footer (No Google Sheet IDs or connections displayed) */}
      <footer className="border-t border-mani-200/80 bg-white py-6 text-center text-xs text-mani-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-1">
          <p className="font-bold text-mani-700">
            🥜 Mani Wandering
          </p>
          <p className="text-mani-400 text-[11px]">
            Freshly roasted artisanal peanuts • Crispy na, Crunchy pa.
          </p>
        </div>
      </footer>
    </div>
  );
}
