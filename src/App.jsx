import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { DEFAULT_PAYMENT_METHODS, getPaymentMethodIdByName } from './config/paymentConfig';
import {
  evaluateClientCutoff,
  getManilaDateStr,
  getManilaTimeStr12,
  normalizeCutoffTime
} from './utils/phtTime';
import { AlertCircle, ChevronRight, Lock, X } from 'lucide-react';

// Helper to get the base root path (before any /admin segment) so relative assets never break on reload
const getBaseRootPath = () => {
  if (typeof window === 'undefined') return '/';
  const pathname = window.location.pathname || '/';
  const lower = pathname.toLowerCase();
  const adminIdx = lower.indexOf('/admin');
  if (adminIdx !== -1) {
    const base = pathname.substring(0, adminIdx);
    return base.endsWith('/') ? base : `${base}/`;
  }
  return pathname;
};

// Helper to detect if current URL or hash targets the admin route
const parseAdminRoute = () => {
  if (typeof window === 'undefined') return { isAdmin: false, subroute: '' };
  const pathname = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '');

  let isAdmin = false;
  let subroute = '';

  if (hash.startsWith('admin')) {
    isAdmin = true;
    const afterAdmin = hash.replace(/^admin\/?/, '').replace(/^\/+|\/+$/g, '');
    subroute = afterAdmin.split('/')[0] || '';
  } else {
    const adminPathIndex = pathname.indexOf('/admin');
    if (adminPathIndex !== -1) {
      isAdmin = true;
      const afterAdmin = pathname.substring(adminPathIndex + 6).replace(/^\/+|\/+$/g, '');
      subroute = afterAdmin.split('/')[0] || '';
    }
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

  // Track most recent local admin cutoff/form-status update timestamp so background polling never reverts admin edits
  const lastLocalCutoffSaveRef = useRef((() => {
    try {
      const saved = JSON.parse(localStorage.getItem('mani_cutoff_settings') || 'null');
      return Number(saved?.updatedAt || 0);
    } catch (e) {
      return 0;
    }
  })());

  // Order Cutoff State - Initialized immediately from cache or PHT (Asia/Manila, UTC+8) defaults
  const [cutoffInfo, setCutoffInfo] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('mani_cutoff_settings') || 'null');
      const manilaDateStr = getManilaDateStr();
      const conf = saved || {
        enabled: true,
        date: manilaDateStr,
        time: '23:59',
        deliveryDay: 'Wednesday',
        manualFormOpen: true,
        updatedAt: 0
      };
      return evaluateClientCutoff(conf);
    } catch (e) {
      return evaluateClientCutoff({});
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
    const fallback = paymentMethods.cod ? 'Cash on Delivery'
      : paymentMethods.maribank ? 'Maribank'
      : paymentMethods.gcash ? 'GCash'
      : '';

    if (customerData.paymentMethod) {
      const currentId = getPaymentMethodIdByName(customerData.paymentMethod);
      if (paymentMethods[currentId] === false) {
        setCustomerData((prev) => ({ ...prev, paymentMethod: fallback }));
      }
    } else if (fallback) {
      setCustomerData((prev) => ({ ...prev, paymentMethod: fallback }));
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
  const [flavorFilter, setFlavorFilter] = useState('all');

  // Auto-dismiss toast notification
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 2600);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Reset cart quantities for any unavailable flavors in a single batched state update
  useEffect(() => {
    setQuantities((prev) => {
      let changed = false;
      const next = { ...prev };
      products.forEach((p) => {
        if (p.available === false && next[p.id] > 0) {
          next[p.id] = 0;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [products]);

  // Immediate local + state updater called by AdminPortal when cutoff or form status is changed/saved
  const handleUpdateCutoffImmediate = useCallback((partialConfig) => {
    const nowTs = Date.now();
    lastLocalCutoffSaveRef.current = nowTs;

    let existingLocal = {};
    try {
      existingLocal = JSON.parse(localStorage.getItem('mani_cutoff_settings') || '{}') || {};
    } catch (e) {}

    const merged = {
      enabled: partialConfig.enabled !== undefined
        ? Boolean(partialConfig.enabled)
        : (existingLocal.enabled !== undefined ? Boolean(existingLocal.enabled) : Boolean(cutoffInfo?.enabled ?? true)),
      date: partialConfig.date !== undefined
        ? partialConfig.date
        : ( partialConfig.cutoffDate !== undefined ? partialConfig.cutoffDate : (existingLocal.date || cutoffInfo?.cutoffDate || getManilaDateStr()) ),
      time: normalizeCutoffTime(
        partialConfig.time !== undefined
          ? partialConfig.time
          : (partialConfig.cutoffTime !== undefined ? partialConfig.cutoffTime : (existingLocal.time || cutoffInfo?.cutoffTime || '23:59'))
      ),
      deliveryDay: partialConfig.deliveryDay !== undefined
        ? partialConfig.deliveryDay
        : (existingLocal.deliveryDay || cutoffInfo?.deliveryDay || 'Wednesday'),
      manualFormOpen: partialConfig.manualFormOpen !== undefined
        ? Boolean(partialConfig.manualFormOpen)
        : (existingLocal.manualFormOpen !== undefined ? Boolean(existingLocal.manualFormOpen) : (cutoffInfo?.manualFormOpen !== false)),
      flavorAvailability: partialConfig.flavorAvailability !== undefined
        ? partialConfig.flavorAvailability
        : (existingLocal.flavorAvailability || cutoffInfo?.flavorAvailability || null),
      updatedAt: partialConfig.updatedAt || nowTs
    };

    localStorage.setItem('mani_cutoff_settings', JSON.stringify(merged));
    const evaluated = evaluateClientCutoff(merged);
    setCutoffInfo(evaluated);
    return evaluated;
  }, [cutoffInfo]);

  // Apply cloud settings payload to React states & local cache (respecting newer local admin saves)
  const applyCloudSettings = (settings, serverTimeStr) => {
    if (!settings) return;

    // 1. Synchronize Cutoff Settings, Manual Form Status & Delivery Day
    if (settings.cutoff || settings.deliveryDay || settings.manualFormOpen !== undefined) {
      let localSaved = null;
      try {
        localSaved = JSON.parse(localStorage.getItem('mani_cutoff_settings') || 'null');
      } catch (e) {}

      const localUpdatedAt = Number(localSaved?.updatedAt || lastLocalCutoffSaveRef.current || 0);
      const cloudSaved = settings.cutoff || {};
      const cloudUpdatedAt = Number(cloudSaved.updatedAt || settings.updatedAt || 0);

      // Do NOT allow stale cloud data to overwrite newer local admin settings
      const isLocalNewer = localSaved && localUpdatedAt > 0 && (cloudUpdatedAt === 0 || localUpdatedAt > cloudUpdatedAt);

      const effectiveConfig = isLocalNewer
        ? {
            enabled: Boolean(localSaved.enabled),
            date: localSaved.date,
            time: normalizeCutoffTime(localSaved.time),
            deliveryDay: localSaved.deliveryDay || settings.deliveryDay || 'Wednesday',
            manualFormOpen: localSaved.manualFormOpen !== undefined ? Boolean(localSaved.manualFormOpen) : true,
            flavorAvailability: settings.flavorAvailability || localSaved.flavorAvailability || null,
            updatedAt: localUpdatedAt
          }
        : {
            enabled: cloudSaved.enabled !== undefined ? Boolean(cloudSaved.enabled) : Boolean(localSaved?.enabled ?? true),
            date: cloudSaved.date || localSaved?.date || getManilaDateStr(),
            time: normalizeCutoffTime(cloudSaved.time || localSaved?.time || '23:59'),
            deliveryDay: settings.deliveryDay || cloudSaved.deliveryDay || localSaved?.deliveryDay || 'Wednesday',
            manualFormOpen: settings.manualFormOpen !== undefined
              ? Boolean(settings.manualFormOpen)
              : (cloudSaved.manualFormOpen !== undefined
                ? Boolean(cloudSaved.manualFormOpen)
                : (localSaved?.manualFormOpen !== undefined ? Boolean(localSaved.manualFormOpen) : true)),
            flavorAvailability: cloudSaved.flavorAvailability || settings.flavorAvailability || localSaved?.flavorAvailability || null,
            updatedAt: cloudUpdatedAt || localUpdatedAt
          };

      const nowMs = serverTimeStr ? new Date(serverTimeStr).getTime() : Date.now();
      const evaluated = evaluateClientCutoff(effectiveConfig, Number.isFinite(nowMs) ? nowMs : Date.now());
      setCutoffInfo(evaluated);
      localStorage.setItem('mani_cutoff_settings', JSON.stringify(effectiveConfig));
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
        setCutoffInfo(evaluateClientCutoff(saved));
      }
    } catch (e) {}
  };

  // Real-time Cloud Settings Synchronization (Desktop <-> Mobile)
  const fetchCutoff = async () => {
    // 1. Try local Express backend if running (development/server mode)
    try {
      const res = await fetch('/api/cutoff');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data && data.status) {
          let localSaved = null;
          try {
            localSaved = JSON.parse(localStorage.getItem('mani_cutoff_settings') || 'null');
          } catch (e) {}

          const serverUpdatedAt = Number(data.updatedAt || 0);
          const localUpdatedAt = Number(localSaved?.updatedAt || lastLocalCutoffSaveRef.current || 0);

          // If local storage was just updated more recently than the server, preserve local settings
          if (localSaved && localUpdatedAt > serverUpdatedAt && serverUpdatedAt === 0) {
            const evaluatedLocal = evaluateClientCutoff(localSaved);
            setCutoffInfo(evaluatedLocal);
          } else {
            const normalizedTime = normalizeCutoffTime(data.cutoffTime || '23:59');
            const syncedLocal = {
              enabled: Boolean(data.enabled),
              date: data.cutoffDate || getManilaDateStr(),
              time: normalizedTime,
              deliveryDay: data.deliveryDay || 'Wednesday',
              manualFormOpen: data.manualFormOpen !== false,
              flavorAvailability: data.flavorAvailability || null,
              updatedAt: Math.max(serverUpdatedAt, localUpdatedAt)
            };
            localStorage.setItem('mani_cutoff_settings', JSON.stringify(syncedLocal));
            setCutoffInfo({
              ...data,
              cutoffTime: normalizedTime,
              manualFormOpen: data.manualFormOpen !== false,
              timezone: 'Asia/Manila'
            });
          }

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
    const syncInterval = setInterval(() => {
      if (typeof document === 'undefined' || document.visibilityState !== 'hidden') {
        fetchCutoff();
      }
    }, 10000); // Check cloud every 10s

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
      const baseRoot = getBaseRootPath();

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
          // Normalize pathname /admin/... to root + #/admin/... so page refresh never breaks relative ./assets/
          if (window.location.pathname.toLowerCase().includes('/admin')) {
            const sub = route.subroute || 'settings';
            window.history.replaceState(null, '', `${baseRoot}#/admin/${sub}`);
          }
        } else {
          // Unauthenticated Admin access: normalize to root + #/admin and prompt login
          if (window.location.pathname.toLowerCase().includes('/admin') || route.subroute) {
            window.history.replaceState(null, '', `${baseRoot}#/admin`);
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

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = (view, tab = '') => {
    const baseRoot = getBaseRootPath();
    const activeToken = adminToken || sessionStorage.getItem('mani_admin_token') || '';

    if (view === 'admin') {
      const activeAdminTab = tab || adminTab || 'cutoff';
      const sub = (activeAdminTab === 'cutoff' || activeAdminTab === 'settings') ? 'settings' : activeAdminTab;

      if (activeToken) {
        setCurrentView('admin');
        setIsLoginModalOpen(false);
        setAdminTab(activeAdminTab);
        window.history.pushState(null, '', `${baseRoot}#/admin/${sub}`);
      } else {
        // Unauthenticated access: prompt login modal at #/admin
        setCurrentView('admin');
        setIsLoginModalOpen(true);
        window.history.pushState(null, '', `${baseRoot}#/admin`);
      }
    } else {
      // view === 'order' (customer guest store)
      setCurrentView('order');
      setIsLoginModalOpen(false);
      window.history.pushState(null, '', baseRoot);
    }
  };

  const handleAdminTabChange = (tabId) => {
    setAdminTab(tabId);
    const routeSegment = tabId === 'cutoff' ? 'settings' : tabId;
    const baseRoot = getBaseRootPath();
    window.history.pushState(null, '', `${baseRoot}#/admin/${routeSegment}`);
  };

  const handleLoginSuccess = (token, user) => {
    setAdminToken(token);
    setAdminUser(user);
    setIsLoginModalOpen(false);
    setCurrentView('admin');
    const sub = (adminTab === 'cutoff' || adminTab === 'settings') ? 'settings' : adminTab;
    const baseRoot = getBaseRootPath();
    window.history.replaceState(null, '', `${baseRoot}#/admin/${sub}`);
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
    const baseRoot = getBaseRootPath();
    window.history.replaceState(null, '', `${baseRoot}#/admin`);
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
    const activeToken = adminToken || sessionStorage.getItem('mani_admin_token');
    if (!activeToken) {
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

  // 1-click Combo / Bundle adder for Suki Favorites
  const handleAddCombo = (comboIds, comboTitle, comboIcon = '🔥') => {
    const availableComboIds = comboIds.filter((id) => {
      const prod = products.find((p) => p.id === id);
      return prod && prod.available !== false;
    });
    if (availableComboIds.length === 0) return;

    setQuantities((prev) => {
      const next = { ...prev };
      availableComboIds.forEach((id) => {
        next[id] = (next[id] || 0) + 1;
      });
      return next;
    });

    setRecentlyAddedId(availableComboIds[0]);
    setTimeout(() => setRecentlyAddedId(null), 1800);
    setCartBounce(true);
    setTimeout(() => setCartBounce(false), 450);

    setToast({
      show: true,
      message: `Added ${comboTitle} (${availableComboIds.length} tubs) to your box!`,
      icon: comboIcon
    });
  };

  // Filtered products based on active flavor category tab
  const filteredProducts = products.filter((p) => {
    if (flavorFilter === 'bestsellers') {
      return ['salted', 'spicy', 'sour-cream', 'bawang-only'].includes(p.id);
    }
    if (flavorFilter === 'savory') {
      return ['spicy', 'bbq', 'sour-cream', 'cheese'].includes(p.id);
    }
    if (flavorFilter === 'classic') {
      return ['salted', 'unsalted', 'bawang-only'].includes(p.id);
    }
    return true;
  });

  // Calculate totals
  const totalPacks = Object.values(quantities).reduce((a, b) => a + (Number(b) || 0), 0);

  const subtotal = products.reduce((sum, p) => {
    const qty = quantities[p.id] || 0;
    return sum + qty * (p.price || 50);
  }, 0);

  // Authoritative Cutoff & Manual Form Open/Close Status
  const isOrdersClosed = Boolean(
    cutoffInfo && (
      cutoffInfo.manualFormOpen === false ||
      cutoffInfo.isOpen === false ||
      (cutoffInfo.enabled && cutoffInfo.remainingSeconds !== null && cutoffInfo.remainingSeconds <= 0)
    )
  );

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

  // Order Submission (Client & Server Cutoff + Manual Form Status Enforced)
  const handleSubmitOrder = async () => {
    if (isSubmitting) return;

    if (isOrdersClosed) {
      setSubmissionError(
        cutoffInfo?.manualFormOpen === false
          ? 'Orders are currently closed. Please check back soon.'
          : 'Orders are currently closed. Please check back soon.'
      );
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
          throw new Error(data.error || 'Orders are currently closed. Please check back soon.');
        }

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Unable to submit your order.');
        }

        setConfirmedOrder(data.order);
        setIsDrawerOpen(false);
        return;
      }
    } catch (apiErr) {
      if (apiErr.message && (apiErr.message.includes('Orders are now closed') || apiErr.message.includes('Orders are currently closed'))) {
        setSubmissionError(apiErr.message);
        setIsSubmitting(false);
        return;
      }
      // If server returned non-JSON error, proceed to static fallback
    }

    // Static GitHub Pages fallback
    try {
      const now = new Date();
      const dateStr = getManilaDateStr(now);
      const timeStr = getManilaTimeStr12(now);
      const savedOrders = JSON.parse(localStorage.getItem('mani_orders') || '[]');
      const prefix = `MANI-${dateStr.replace(/-/g, '')}-`;
      let maxSeq = 0;
      savedOrders.forEach((o) => {
        if (o && typeof o.orderId === 'string' && o.orderId.startsWith(prefix)) {
          const seqNum = parseInt(o.orderId.slice(prefix.length), 10);
          if (Number.isFinite(seqNum) && seqNum > maxSeq) maxSeq = seqNum;
        } else if (o && o.orderDate === dateStr) {
          maxSeq += 1;
        }
      });
      const orderId = `${prefix}${String(maxSeq + 1).padStart(3, '0')}`;
      const uniqueId = `ord_${now.getTime()}_${Math.random().toString(36).substring(2, 8)}`;

      const clientOrder = {
        id: uniqueId,
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
    <div className="min-h-screen flex flex-col bg-[#FDF9F0] bg-snack-pattern text-mani-900 selection:bg-amber-200">
      {/* Top Filipino Snack Culture Ribbon (Customer View) */}
      {currentView === 'order' && (
        <div className="bg-mani-950 text-amber-200 border-b border-amber-500/30 py-1.5 px-3 text-[11px] sm:text-xs font-extrabold tracking-wide text-center">
          <div className="max-w-7xl mx-auto flex items-center justify-center flex-wrap gap-x-4 gap-y-1">
            <span className="inline-flex items-center gap-1 text-amber-300">
              <span>🥜</span> BAGONG LUTO EVERY BATCH
            </span>
            <span className="hidden sm:inline text-amber-500/60">•</span>
            <span className="inline-flex items-center gap-1">
              <span>🧄</span> LOADED WITH REAL CRISPY BAWANG
            </span>
            <span className="hidden md:inline text-amber-500/60">•</span>
            <span className="hidden md:inline-flex items-center gap-1 text-orange-300">
              <span>🔥</span> 7 ADDICTING FLAVORS IN REUSABLE TUBS
            </span>
            <span className="hidden lg:inline text-amber-500/60">•</span>
            <span className="hidden lg:inline-flex items-center gap-1 text-emerald-300">
              <span>🇵🇭</span> STARTS AT ₱50 / TUB
            </span>
          </div>
        </div>
      )}

      {/* Sleek Floating Toast Notification */}
      {toast.show && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 right-4 sm:right-6 z-50 flex items-center gap-3 bg-mani-950 text-white px-4 py-3 rounded-2xl shadow-snack border-2 border-amber-400 animate-fade-in transition-all max-w-sm"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-mani-950 border border-mani-950 flex items-center justify-center text-lg shrink-0 font-black">
            {toast.icon}
          </div>
          <div className="text-xs sm:text-sm font-extrabold pr-1">
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
        subtotal={subtotal}
        cartBounce={cartBounce}
        onOpenCart={() => setIsDrawerOpen(true)}
        isAdminAuthenticated={Boolean(adminToken)}
        adminUser={adminUser}
        onLogout={handleLogout}
        cutoffInfo={cutoffInfo}
      />

      {/* Main Content */}
      <main className={`flex-1 ${totalPacks > 0 ? 'pb-32 sm:pb-20' : 'pb-24 sm:pb-16'}`}>
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
            onUpdateCutoff={handleUpdateCutoffImmediate}
            onRefreshCutoff={fetchCutoff}
            activeTab={adminTab}
            onTabChange={handleAdminTabChange}
          />
        ) : currentView === 'admin' && !adminToken ? (
          /* Dedicated unauthenticated /admin screen holding the AdminLoginModal */
          <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-900 mx-auto flex items-center justify-center border-2 border-mani-950 shadow-snack-sm">
              <Lock className="w-8 h-8 text-amber-700" />
            </div>
            <h2 className="font-display text-2xl font-black text-mani-950">Admin Access Required</h2>
            <p className="text-xs sm:text-sm text-mani-600 font-medium">
              Please sign in with authorized administrator credentials to manage orders, products, and store settings.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-mani-950 font-extrabold text-xs sm:text-sm border-2 border-mani-950 shadow-snack-sm transition-all cursor-pointer"
              >
                Open Admin Login
              </button>
              <button
                type="button"
                onClick={() => navigateTo('order')}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-mani-100 text-mani-700 font-bold text-xs sm:text-sm border-2 border-mani-200 transition-all cursor-pointer"
              >
                Return to Store
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-8">
            {/* 🥜 High-Impact Filipino Snack Brand Hero Section */}
            <section className="relative overflow-hidden rounded-[2rem] border-2 border-mani-950 bg-gradient-to-br from-[#FFF5D6] via-[#FFFDF7] to-[#FFE4B5] p-5 sm:p-8 lg:p-10 shadow-snack-lg">
              {/* Decorative Floating Peanut & Garlic SVG Doodles */}
              <svg
                aria-hidden="true"
                viewBox="0 0 120 120"
                className="hidden sm:block absolute -top-6 -right-6 w-36 h-36 text-amber-400/25 pointer-events-none animate-float-slow"
              >
                <path
                  fill="currentColor"
                  d="M42 18c14-6 30 2 33 16 2 9-2 17 4 24 7 9 20 14 21 27 1 15-14 27-29 25-13-2-23-12-30-23-6-9-4-18-11-26-9-10-12-28 12-43z"
                />
              </svg>
              <svg
                aria-hidden="true"
                viewBox="0 0 100 100"
                className="hidden lg:block absolute -bottom-8 left-1/2 w-28 h-28 text-orange-400/20 pointer-events-none animate-float-reverse"
              >
                <circle cx="50" cy="50" r="36" fill="currentColor" />
              </svg>

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
                {/* Left Column: Brand Hook, Tagline, Value Props & CTAs */}
                <div className="lg:col-span-7 text-center lg:text-left space-y-4">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-mani-950 text-amber-300 border-2 border-mani-950 shadow-snack-sm">
                    <span>🇵🇭</span>
                    <span>Crispy na, Crunchy pa • Small-Batch Artisanal Mani</span>
                  </div>

                  <h1 className="font-display text-3xl sm:text-5xl lg:text-[3.35rem] font-extrabold text-mani-950 tracking-tight leading-[1.08]">
                    Your Favorite Kanto-Style{' '}
                    <span className="inline-block bg-amber-300 px-2.5 py-0.5 rounded-2xl border-2 border-mani-950 shadow-snack-sm -rotate-1">
                      Mani &amp; Bawang
                    </span>{' '}
                    — Levelled Up in Tubs!
                  </h1>

                  <p className="text-sm sm:text-base text-mani-800 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
                    Golden-roasted peanuts generously loaded with real crispy garlic chips and bold, addicting seasonings. Sealed fresh in reusable tubs for maximum crunch from the first scoop to the last!
                  </p>

                  {/* Primary & Secondary CTAs */}
                  <div className="pt-1 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setFlavorFilter('all');
                        const el = document.getElementById('flavors-menu-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className="px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-500 active:translate-y-0.5 text-mani-950 font-display font-black text-sm sm:text-base border-2 border-mani-950 shadow-snack flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <span>Order Now 🥜</span>
                      <span className="text-xs font-extrabold px-2 py-0.5 rounded-lg bg-mani-950 text-amber-300">
                        ₱50 / tub
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setFlavorFilter('bestsellers');
                        const el = document.getElementById('flavors-menu-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className="px-5 py-3.5 rounded-2xl bg-white hover:bg-amber-50 active:translate-y-0.5 text-mani-950 font-display font-extrabold text-xs sm:text-sm border-2 border-mani-950 shadow-snack-sm flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>🔥 See Suki Bestsellers</span>
                    </button>
                  </div>

                  {/* 3-Step Quick Ordering Flow Strip */}
                  <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs font-extrabold text-mani-900">
                    <span className="inline-flex items-center gap-1.5 bg-white/90 px-3 py-1.5 rounded-xl border border-amber-300/80 shadow-2xs">
                      <span className="w-5 h-5 rounded-full bg-mani-950 text-amber-300 flex items-center justify-center text-[10px] font-black">
                        1
                      </span>
                      <span>Pick Your Tubs</span>
                    </span>
                    <span className="text-amber-700/70 hidden sm:inline">→</span>
                    <span className="inline-flex items-center gap-1.5 bg-white/90 px-3 py-1.5 rounded-xl border border-amber-300/80 shadow-2xs">
                      <span className="w-5 h-5 rounded-full bg-mani-950 text-amber-300 flex items-center justify-center text-[10px] font-black">
                        2
                      </span>
                      <span>Enter Delivery Address</span>
                    </span>
                    <span className="text-amber-700/70 hidden sm:inline">→</span>
                    <span className="inline-flex items-center gap-1.5 bg-white/90 px-3 py-1.5 rounded-xl border border-amber-300/80 shadow-2xs">
                      <span className="w-5 h-5 rounded-full bg-mani-950 text-amber-300 flex items-center justify-center text-[10px] font-black">
                        3
                      </span>
                      <span>COD, GCash or Maribank</span>
                    </span>
                  </div>
                </div>

                {/* Right Column: Mascot Showcase + Floating Stickers + Quick-Tap Flavor Pills */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
                  <div className="relative bg-white/90 backdrop-blur-xs rounded-3xl p-5 sm:p-6 border-2 border-mani-950 shadow-snack w-full max-w-md mx-auto text-center">
                    {/* Top Left Sticker */}
                    <div className="absolute -top-3.5 -left-3 -rotate-6 bg-red-600 text-white font-display font-black text-[11px] sm:text-xs px-3 py-1 rounded-full border-2 border-mani-950 shadow-snack-sm uppercase tracking-wider">
                      🔥 Mapapa-Extra Tub Ka!
                    </div>

                    {/* Top Right Price Sticker */}
                    <div className="absolute -top-3.5 -right-2 rotate-6 bg-amber-300 text-mani-950 font-display font-black text-xs sm:text-sm px-3 py-1 rounded-2xl border-2 border-mani-950 shadow-snack-sm">
                      ₱50 <span className="text-[10px] font-extrabold">/ tub</span>
                    </div>

                    <div className="py-2 flex justify-center">
                      <img
                        src="./images/logo.png"
                        alt="Mani Wandering"
                        className="w-36 sm:w-44 md:w-48 h-auto drop-shadow-md animate-float-slow select-none"
                      />
                    </div>

                    <div className="mt-1 space-y-2">
                      <div className="text-[11px] font-black uppercase tracking-wider text-amber-800">
                        ⚡ Tap a Flavor Below to Quick-Add +1 Tub:
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-1.5">
                        {products.slice(0, 5).map((prod) => {
                          const isOut = prod.available === false;
                          const currQty = quantities[prod.id] || 0;
                          return (
                            <button
                              key={prod.id}
                              type="button"
                              disabled={isOut}
                              onClick={() => {
                                handleQuantityChange(prod.id, currQty + 1);
                                handleAddToCartFeedback(prod, 1);
                              }}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-extrabold border transition-all ${
                                isOut
                                  ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed line-through'
                                  : currQty > 0
                                  ? 'bg-amber-300 text-mani-950 border-mani-950 shadow-2xs cursor-pointer'
                                  : 'bg-[#FDF9F0] hover:bg-amber-100 text-mani-900 border-amber-300 cursor-pointer active:scale-95'
                              }`}
                              title={isOut ? 'Currently Sold Out' : `Add 1 tub of ${prod.name}`}
                            >
                              <span>{prod.icon}</span>
                              <span>{prod.name.replace(/^Mani\s+/i, '')}</span>
                              {currQty > 0 && (
                                <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-mani-950 text-amber-300 text-[10px] font-black">
                                  {currQty}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ⏰ Order Cutoff Timer Banner Prominently Placed Below Hero */}
            <OrderCutoffBanner 
              cutoffInfo={cutoffInfo} 
              onRefreshCutoff={fetchCutoff} 
            />

            {/* Error Banner */}
            {submissionError && (
              <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-400 text-sm font-bold text-red-800 flex items-center gap-2.5 shadow-xs animate-fade-in">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
                <span>{submissionError}</span>
              </div>
            )}

            {/* Responsive 2-Column Desktop Grid / 1-Column Mobile Stack */}
            <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start space-y-8 lg:space-y-0">
              {/* Left Column (Desktop 7 cols): Flavors Catalog */}
              <div id="flavors-menu-section" className="lg:col-span-7 space-y-5 scroll-mt-24">
                <section className="space-y-4">
                  {/* Menu Section Heading + Suki Trio Quick-Add */}
                  <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-mani-950 shadow-snack-sm space-y-3.5">
                    <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
                      <div>
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300 mb-1">
                          <span>🥜</span> Choose Your Crunch
                        </div>
                        <h2 className="font-display text-xl sm:text-2xl font-extrabold text-mani-950 flex items-center gap-2">
                          <span>Mani Flavors Menu</span>
                        </h2>
                        <p className="text-xs text-mani-600 font-medium">
                          Mix and match tubs! Every flavor is roasted fresh per batch.
                        </p>
                      </div>

                      {/* 1-Click Suki Trio Starter Button */}
                      <button
                        type="button"
                        onClick={() => handleAddCombo(['salted', 'spicy', 'sour-cream'], 'Suki Trio (Salted, Spicy & Sour Cream)', '🔥')}
                        className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-300 to-orange-300 hover:from-amber-400 hover:to-orange-400 text-mani-950 font-display font-extrabold text-xs border-2 border-mani-950 shadow-snack-sm active:translate-y-0.5 transition-all cursor-pointer"
                      >
                        <span>🔥</span>
                        <span>+ Add Top 3 Suki Trio</span>
                      </button>
                    </div>

                    {/* Interactive Flavor Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
                      {[
                        { id: 'all', label: '🥜 All 7 Flavors', count: products.length },
                        { id: 'bestsellers', label: '🔥 Mga Suki Bestsellers', count: 4 },
                        { id: 'savory', label: '🧀 Savory & Coated', count: 4 },
                        { id: 'classic', label: '🧄 Classic & Bawang', count: 3 }
                      ].map((tab) => {
                        const isActive = flavorFilter === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setFlavorFilter(tab.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                              isActive
                                ? 'bg-mani-950 text-amber-300 border-2 border-mani-950 shadow-2xs'
                                : 'bg-[#FDF9F0] hover:bg-amber-100/80 text-mani-800 border border-mani-200'
                            }`}
                          >
                            <span>{tab.label}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                              isActive ? 'bg-amber-400 text-mani-950' : 'bg-mani-200/70 text-mani-700'
                            }`}>
                              {tab.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Flavors Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                    {filteredProducts.map((product) => (
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
                    onAddToCart={handleAddToCartFeedback}
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

            {/* 🔥 Paborito ng Mga Suki: Crowd-Favorite Combos & Bawang Mixer Pro-Tip */}
            <section
              id="suki-favorites-section"
              className="scroll-mt-24 rounded-[2rem] border-2 border-mani-950 bg-gradient-to-br from-amber-100/90 via-white to-orange-100/80 p-5 sm:p-8 shadow-snack space-y-6"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b-2 border-mani-950/10 pb-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-600 text-white border-2 border-mani-950 shadow-2xs">
                    <span>🔥</span> Paborito ng Mga Suki
                  </span>
                  <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-mani-950 mt-2">
                    Not Sure Which Tubs to Pick? Try These Crowd Combos!
                  </h2>
                  <p className="text-xs sm:text-sm text-mani-700 font-medium mt-0.5">
                    Our most re-ordered flavor pairings for office merienda, road trips, and barkada movie nights.
                  </p>
                </div>
                <div className="text-xs font-extrabold text-amber-950 bg-amber-200/80 px-3.5 py-2 rounded-2xl border-2 border-mani-950 self-start md:self-auto">
                  💡 1-Click adds 1 tub of each flavor in the combo!
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                {/* Combo 1: The OG Kanto Duo */}
                <div className="bg-white rounded-3xl p-5 border-2 border-mani-950 shadow-snack-sm flex flex-col justify-between space-y-4 hover:-translate-y-1 transition-transform">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-300 text-mani-950 border border-mani-950">
                        🏆 #1 Most Ordered Duo
                      </span>
                      <span className="font-display font-black text-base text-mani-950">₱100</span>
                    </div>
                    <h3 className="font-display text-lg font-extrabold text-mani-950">
                      The OG Kanto Duo 🥜🌶️
                    </h3>
                    <p className="text-xs text-mani-600 font-medium leading-relaxed">
                      <strong className="text-mani-900">1x Mani Salted + 1x Mani Spicy.</strong> Classic savory rock-salt crunch paired with fiery chili-garlic heat.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddCombo(['salted', 'spicy'], 'The OG Kanto Duo', '🥜')}
                    className="w-full py-2.5 px-4 rounded-2xl bg-amber-400 hover:bg-amber-500 active:translate-y-0.5 text-mani-950 font-display font-black text-xs border-2 border-mani-950 shadow-snack-sm transition-all cursor-pointer"
                  >
                    + Add OG Duo (2 Tubs)
                  </button>
                </div>

                {/* Combo 2: Barkada Flavor Fiesta */}
                <div className="bg-white rounded-3xl p-5 border-2 border-mani-950 shadow-snack-sm flex flex-col justify-between space-y-4 hover:-translate-y-1 transition-transform">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-200 text-emerald-950 border border-mani-950">
                        🎬 Movie Night Pick
                      </span>
                      <span className="font-display font-black text-base text-mani-950">₱150</span>
                    </div>
                    <h3 className="font-display text-lg font-extrabold text-mani-950">
                      Barkada Flavor Fiesta 🌿🍖🧀
                    </h3>
                    <p className="text-xs text-mani-600 font-medium leading-relaxed">
                      <strong className="text-mani-900">Sour Cream + BBQ + Cheese.</strong> Tangy, smoky, and cheesy coated tubs that disappear fast during kwentuhan!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddCombo(['sour-cream', 'bbq', 'cheese'], 'Barkada Flavor Fiesta', '🎉')}
                    className="w-full py-2.5 px-4 rounded-2xl bg-amber-400 hover:bg-amber-500 active:translate-y-0.5 text-mani-950 font-display font-black text-xs border-2 border-mani-950 shadow-snack-sm transition-all cursor-pointer"
                  >
                    + Add Fiesta Trio (3 Tubs)
                  </button>
                </div>

                {/* Combo 3: The Ultimate Garlic Lovers Box */}
                <div className="bg-white rounded-3xl p-5 border-2 border-mani-950 shadow-snack-sm flex flex-col justify-between space-y-4 hover:-translate-y-1 transition-transform">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-yellow-300 text-mani-950 border border-mani-950">
                        🧄 Bawang Overload
                      </span>
                      <span className="font-display font-black text-base text-mani-950">₱110</span>
                    </div>
                    <h3 className="font-display text-lg font-extrabold text-mani-950">
                      Bawang Lovers Upgrade 🧄🥜
                    </h3>
                    <p className="text-xs text-mani-600 font-medium leading-relaxed">
                      <strong className="text-mani-900">1x Mani Salted + 1x Bawang Only (₱60).</strong> Pour extra golden garlic chips into your peanut tub or over hot rice!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddCombo(['salted', 'bawang-only'], 'Bawang Lovers Upgrade', '🧄')}
                    className="w-full py-2.5 px-4 rounded-2xl bg-amber-400 hover:bg-amber-500 active:translate-y-0.5 text-mani-950 font-display font-black text-xs border-2 border-mani-950 shadow-snack-sm transition-all cursor-pointer"
                  >
                    + Add Garlic Upgrade (2 Tubs)
                  </button>
                </div>
              </div>
            </section>

            {/* ✨ Brand Story & Filipino Snack Culture Section */}
            <section
              id="brand-story-section"
              className="scroll-mt-24 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
            >
              {/* Left 7 Cols: Made for Every Filipino Craving */}
              <div className="lg:col-span-7 bg-white rounded-[2rem] border-2 border-mani-950 p-5 sm:p-8 shadow-snack flex flex-col justify-between space-y-5">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-300 text-mani-950 border border-mani-950">
                    <span>🇵🇭</span> The Mani Wandering Story
                  </span>
                  <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-mani-950">
                    Street-Snack Soul, Sealed Fresh for Your Desk &amp;Pantry
                  </h2>
                  <p className="text-xs sm:text-sm text-mani-700 font-medium leading-relaxed">
                    Everyone loves warm, freshly fried kanto-style mani loaded with aromatic crispy bawang—until the paper bag gets soggy or the peanuts go stale. We created <strong className="text-mani-950">Mani Wandering</strong> so you can enjoy that unmistakable golden crunch anytime in clean, stackable, air-tight snack tubs.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-2xl bg-[#FDF9F0] border border-amber-200/90 space-y-1">
                    <div className="text-xl">☕</div>
                    <h3 className="font-display text-sm font-extrabold text-mani-950">3PM Merienda Rescue</h3>
                    <p className="text-xs text-mani-600 font-medium">
                      Pair Salted or Cheese Mani with iced coffee or cold softdrinks for an instant afternoon energy boost.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FDF9F0] border border-amber-200/90 space-y-1">
                    <div className="text-xl">💻</div>
                    <h3 className="font-display text-sm font-extrabold text-mani-950">WFH &amp; Study Buddy</h3>
                    <p className="text-xs text-mani-600 font-medium">
                      Pop the lid open while working or gaming, then snap it shut to keep every peanut loud and crunchy.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FDF9F0] border border-amber-200/90 space-y-1">
                    <div className="text-xl">🍻</div>
                    <h3 className="font-display text-sm font-extrabold text-mani-950">Barkada &amp; Pulutan Hero</h3>
                    <p className="text-xs text-mani-600 font-medium">
                      Spicy and BBQ tubs bring effortless heat and smokiness to weekend tambay and movie marathons.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FDF9F0] border border-amber-200/90 space-y-1">
                    <div className="text-xl">🧄</div>
                    <h3 className="font-display text-sm font-extrabold text-mani-950">Never Tipid sa Bawang</h3>
                    <p className="text-xs text-mani-600 font-medium">
                      Everybody digs to the bottom for the garlic chips—so we pack every tub with real golden bawang slices!
                    </p>
                  </div>
                </div>
              </div>

              {/* Right 5 Cols: 3-Step How Batch Ordering Works */}
              <div className="lg:col-span-5 bg-mani-950 text-white rounded-[2rem] border-2 border-mani-950 p-5 sm:p-8 shadow-snack flex flex-col justify-between space-y-6">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400 text-mani-950">
                    <span>⚡</span> Fast &amp; Easy Ordering
                  </span>
                  <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-amber-300">
                    How Your Mani Order Works
                  </h2>
                  <p className="text-xs sm:text-sm text-amber-100/80 font-medium">
                    We roast in scheduled batches so your tubs never sit on a dusty shelf.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3.5 bg-white/5 p-3.5 rounded-2xl border border-white/10">
                    <div className="w-9 h-9 rounded-xl bg-amber-400 text-mani-950 font-display font-black text-base flex items-center justify-center shrink-0">
                      1
                    </div>
                    <div>
                      <h3 className="font-display text-sm font-extrabold text-white">
                        Pick Your Tubs &amp; Flavors
                      </h3>
                      <p className="text-xs text-amber-100/75 font-medium mt-0.5">
                        Choose from 7 flavors (₱50/tub, or ₱60 for pure Crispy Bawang Only).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 bg-white/5 p-3.5 rounded-2xl border border-white/10">
                    <div className="w-9 h-9 rounded-xl bg-amber-400 text-mani-950 font-display font-black text-base flex items-center justify-center shrink-0">
                      2
                    </div>
                    <div>
                      <h3 className="font-display text-sm font-extrabold text-white">
                        Beat the Batch Cutoff Timer
                      </h3>
                      <p className="text-xs text-amber-100/75 font-medium mt-0.5">
                        Enter your delivery details and pay via Cash on Delivery, GCash, or Maribank QR.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 bg-white/5 p-3.5 rounded-2xl border border-white/10">
                    <div className="w-9 h-9 rounded-xl bg-amber-400 text-mani-950 font-display font-black text-base flex items-center justify-center shrink-0">
                      3
                    </div>
                    <div>
                      <h3 className="font-display text-sm font-extrabold text-white">
                        Freshly Roasted &amp; Delivered
                      </h3>
                      <p className="text-xs text-amber-100/75 font-medium mt-0.5">
                        Your batch is roasted golden, sealed in tubs, and delivered straight to your doorstep!
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('flavors-menu-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="w-full py-3.5 px-5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-mani-950 font-display font-black text-sm border-2 border-amber-300 shadow-xs transition-all cursor-pointer"
                >
                  Start Building Your Mani Box 🥜
                </button>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Mobile Sticky Quick-Action Bar */}
      {currentView === 'order' && totalPacks > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#FFFDF9]/95 backdrop-blur-md border-t-2 border-mani-950 px-4 py-3 shadow-2xl lg:hidden animate-fade-in flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('order-summary-section');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="text-left cursor-pointer active:opacity-80 transition-opacity"
            title="View Order Summary"
          >
            <div className="text-[11px] font-extrabold text-mani-700 flex items-center gap-1.5">
              <span>🥜 {totalPacks} tub{totalPacks > 1 ? 's' : ''} in box</span>
              {cutoffInfo?.isOpen && cutoffInfo?.enabled && (
                <span className="text-[10px] font-bold text-amber-950 bg-amber-200 px-1.5 py-0.2 rounded border border-mani-950/30">
                  ⏰ Cutoff {cutoffInfo.cutoffTime || '23:59'}
                </span>
              )}
            </div>
            <div className="font-display text-lg font-black text-mani-950 flex items-center gap-1.5">
              <span>{formatPHP(subtotal)}</span>
              <span className="text-[10px] text-amber-800 font-extrabold underline">View Box</span>
            </div>
          </button>
          {isOrdersClosed ? (
            <span className="px-3.5 py-2 rounded-xl bg-red-100 text-red-800 font-black text-xs border-2 border-red-300 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> Orders Closed
            </span>
          ) : (
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('customer-info-section');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 active:translate-y-0.5 text-mani-950 font-display font-black text-xs border-2 border-mani-950 shadow-snack-sm flex items-center gap-1 cursor-pointer"
            >
              <span>Checkout Now</span>
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
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
          customQrs={customQrs}
        />
      )}

      {/* Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={handleCloseLoginModal}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
