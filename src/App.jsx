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
import BrandStoryAndSuki from './components/BrandStoryAndSuki';
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
import { AlertCircle, ChevronRight, Lock, X, Sparkles, Flame, Plus, ArrowDown } from 'lucide-react';

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

  const [activeFlavorFilter, setActiveFlavorFilter] = useState('all');

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

  // Add a curated Suki Combo in one tap
  const handleAddCombo = (combo) => {
    if (!combo || !Array.isArray(combo.items)) return;
    setQuantities((prev) => {
      const next = { ...prev };
      combo.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.id);
        if (!prod || prod.available !== false) {
          next[item.id] = (next[item.id] || 0) + (item.qty || 1);
        }
      });
      return next;
    });
    if (submissionError) setSubmissionError('');

    setCartBounce(true);
    setTimeout(() => setCartBounce(false), 400);

    const totalAdded = combo.items.reduce((s, i) => s + (i.qty || 1), 0);
    setToast({
      show: true,
      message: `Added ${combo.title} (${totalAdded} tubs) to your basket!`,
      icon: '🔥'
    });

    const summaryEl = document.getElementById('order-summary-section');
    if (summaryEl && window.innerWidth >= 1024) {
      summaryEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Add 1 tub of every available flavor (Barkada Sampler)
  const handleAddAllSampler = () => {
    let addedCount = 0;
    setQuantities((prev) => {
      const next = { ...prev };
      products.forEach((p) => {
        if (p.available !== false) {
          next[p.id] = (next[p.id] || 0) + 1;
          addedCount += 1;
        }
      });
      return next;
    });
    if (submissionError) setSubmissionError('');

    setCartBounce(true);
    setTimeout(() => setCartBounce(false), 400);

    setToast({
      show: true,
      message: `Barkada Sampler added! (+1 tub of all available flavors)`,
      icon: '🎉'
    });
  };

  // Filtered products for the Flavors Catalog
  const filteredProducts = products.filter((p) => {
    if (activeFlavorFilter === 'bestsellers') {
      return ['salted', 'spicy', 'bbq', 'bawang-only'].includes(p.id);
    }
    if (activeFlavorFilter === 'savory') {
      return ['spicy', 'bbq', 'sour-cream', 'cheese'].includes(p.id);
    }
    if (activeFlavorFilter === 'classic') {
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
    <div className="min-h-screen flex flex-col bg-peanut-pattern text-mani-900 selection:bg-amber-300 selection:text-mani-950">
      {/* Sleek Floating Toast Notification */}
      {toast.show && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 right-4 sm:right-6 z-50 flex items-center gap-3 bg-mani-950 text-white px-4 py-3 rounded-2xl shadow-snack border-2 border-amber-400 animate-fade-in transition-all max-w-sm"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-mani-950 flex items-center justify-center text-lg font-bold shrink-0">
            {toast.icon}
          </div>
          <div className="font-display text-xs sm:text-sm font-bold pr-1">
            {toast.message}
          </div>
          <button
            type="button"
            onClick={() => setToast((prev) => ({ ...prev, show: false }))}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors ml-auto cursor-pointer"
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
            onUpdateCutoff={handleUpdateCutoffImmediate}
            onRefreshCutoff={fetchCutoff}
            activeTab={adminTab}
            onTabChange={handleAdminTabChange}
          />
        ) : currentView === 'admin' && !adminToken ? (
          /* Dedicated unauthenticated /admin screen holding the AdminLoginModal */
          <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-900 mx-auto flex items-center justify-center border-2 border-mani-900 shadow-snack-sm">
              <Lock className="w-8 h-8 text-amber-700" />
            </div>
            <h2 className="font-display text-2xl font-bold text-mani-950">Admin Access Required</h2>
            <p className="text-xs sm:text-sm text-mani-600 font-medium">
              Please sign in with authorized administrator credentials to manage orders, products, and store settings.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-mani-950 font-display font-bold text-xs sm:text-sm border-2 border-mani-900 shadow-snack-sm transition-all cursor-pointer"
              >
                Open Admin Login
              </button>
              <button
                type="button"
                onClick={() => navigateTo('order')}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-mani-100 text-mani-800 font-bold text-xs sm:text-sm border-2 border-mani-200 transition-all cursor-pointer"
              >
                Return to Store
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-6 sm:space-y-8">
            {/* 🥜 HERO SECTION: Street Snack Culture Meets Modern DTC Snack Brand */}
            <section className="relative rounded-[2rem] bg-hero-snack border-2 border-mani-900/20 shadow-snack-card overflow-hidden p-5 sm:p-8 lg:p-10">
              {/* Decorative Peanut & Sparkle Vector Doodles */}
              <svg
                aria-hidden="true"
                viewBox="0 0 120 120"
                className="hidden sm:block absolute -top-6 -left-6 w-28 h-28 text-amber-300/45 rotate-12 pointer-events-none"
                fill="currentColor"
              >
                <path d="M45 20C32 20 24 31 27 44C29 52 28 58 23 65C15 76 20 94 34 99C48 104 63 96 68 83C71 75 76 70 84 66C96 60 101 44 94 32C87 20 71 17 59 23C54 25 49 20 45 20Z" />
              </svg>

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
                {/* Left Column: Brand Headline, Value Prop & Appetizing CTAs */}
                <div className="lg:col-span-7 text-center lg:text-left space-y-4">
                  {/* Top Pill Badge */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-300 text-mani-950 border-2 border-mani-900 shadow-snack-sm -rotate-1">
                    <span>🇵🇭</span>
                    <span>Crispy na, Crunchy pa • Small-Batch Pinoy Mani</span>
                  </div>

                  {/* Brand Name & Signature Tagline */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-center lg:justify-start gap-2.5 flex-wrap">
                      <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-mani-950 tracking-tight leading-[1.05]">
                        Mani Wandering
                      </h1>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-display font-bold bg-rose-600 text-white border-2 border-mani-900 shadow-snack-sm rotate-3">
                        SARAP! 🔥
                      </span>
                    </div>
                    <p className="font-display text-lg sm:text-2xl font-bold text-amber-800 leading-snug">
                      “Your favorite mani, now wandering into your cravings.”
                    </p>
                  </div>

                  {/* Clear Answer to WHAT IS THIS / WHY CARE */}
                  <p className="text-xs sm:text-base text-mani-700 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                    Freshly roasted, ultra-crunchy Filipino peanuts & golden crispy <strong className="text-mani-950 font-extrabold">bawang chips</strong> packed in resealable tubs. Made for merienda, movie nights, office desk fuel, and barkada hangouts — only <strong className="text-mani-950 font-extrabold bg-amber-200/80 px-1.5 py-0.5 rounded">₱50–₱60 per tub</strong>!
                  </p>

                  {/* Primary & Secondary Hero CTAs */}
                  <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3">
                    <a
                      href="#flavors-menu"
                      className="px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-mani-950 font-display font-bold text-base sm:text-lg border-2 border-mani-900 shadow-snack active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Order Now 🥜</span>
                      <ArrowDown className="w-4 h-4 stroke-[2.5]" />
                    </a>

                    <a
                      href="#suki-favorites"
                      className="px-5 py-3.5 rounded-2xl bg-white hover:bg-amber-50 text-mani-900 font-display font-bold text-sm sm:text-base border-2 border-mani-900/25 hover:border-mani-900 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Flame className="w-4 h-4 text-rose-600 fill-rose-600" />
                      <span>Try Suki Combos</span>
                    </a>
                  </div>

                  {/* Quick 3-Step Ordering Guide Pills (Answers HOW DO I ORDER?) */}
                  <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2 text-[11px] sm:text-xs font-extrabold text-mani-800">
                    <span className="inline-flex items-center gap-1.5 bg-white/90 px-3 py-1.5 rounded-xl border border-mani-300 shadow-2xs">
                      <span className="w-4 h-4 rounded-full bg-mani-900 text-amber-300 text-[10px] flex items-center justify-center font-black">1</span>
                      Pick Your Tubs
                    </span>
                    <span className="text-mani-400 font-black">→</span>
                    <span className="inline-flex items-center gap-1.5 bg-white/90 px-3 py-1.5 rounded-xl border border-mani-300 shadow-2xs">
                      <span className="w-4 h-4 rounded-full bg-mani-900 text-amber-300 text-[10px] flex items-center justify-center font-black">2</span>
                      Enter Delivery Address
                    </span>
                    <span className="text-mani-400 font-black">→</span>
                    <span className="inline-flex items-center gap-1.5 bg-white/90 px-3 py-1.5 rounded-xl border border-mani-300 shadow-2xs">
                      <span className="w-4 h-4 rounded-full bg-mani-900 text-amber-300 text-[10px] flex items-center justify-center font-black">3</span>
                      COD, GCash or Maribank
                    </span>
                  </div>
                </div>

                {/* Right Column: Mascot & Floating Product Tub Showcase */}
                <div className="lg:col-span-5 relative flex items-center justify-center py-2">
                  <div className="relative w-full max-w-[340px] sm:max-w-[380px] mx-auto flex items-center justify-center">
                    {/* Warm circular backdrop behind mascot */}
                    <div className="w-56 h-56 sm:w-68 sm:h-68 rounded-full bg-gradient-to-tr from-amber-300/70 via-amber-200/50 to-orange-200/40 border-2 border-dashed border-amber-500/50 flex items-center justify-center">
                      <img
                        src="./images/logo.png"
                        alt="Mani Wandering Peanut Mascot"
                        className="w-48 sm:w-60 h-auto object-contain drop-shadow-xl animate-float-slow select-none"
                      />
                    </div>

                    {/* Playful Price Sticker Badge (Top Right) */}
                    <div className="absolute top-1 right-1 sm:right-0 bg-amber-400 text-mani-950 px-3 py-1.5 rounded-2xl border-2 border-mani-900 shadow-snack-sm rotate-6 select-none text-center">
                      <span className="block text-[9px] font-black uppercase tracking-wider leading-none">Starts At</span>
                      <span className="font-display text-base sm:text-lg font-bold leading-tight">₱50/tub</span>
                    </div>

                    {/* Playful Crunch Sticker (Bottom Left) */}
                    <div className="hidden xs:flex absolute bottom-2 left-1 bg-emerald-400 text-mani-950 px-2.5 py-1 rounded-xl border-2 border-mani-900 shadow-snack-sm -rotate-6 text-[11px] font-display font-bold items-center gap-1 select-none">
                      <span>✨ 7 Flavors!</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* High-Energy Snack Ticker Strip Inside Bottom of Hero */}
              <div className="mt-6 -mx-5 sm:-mx-8 lg:-mx-10 -mb-5 sm:-mb-8 lg:-mb-10 bg-mani-950 text-amber-300 py-2.5 border-t-2 border-mani-900 overflow-hidden select-none">
                <div className="animate-marquee flex items-center gap-6 text-xs font-display font-bold tracking-wide uppercase whitespace-nowrap">
                  <span>🥜 CRISPY NA, CRUNCHY PA!</span>
                  <span>•</span>
                  <span>🧄 LOADED WITH REAL GOLDEN BAWANG CHIPS</span>
                  <span>•</span>
                  <span>🧂 SALTED • 🌱 UNSALTED • 🌶️ SPICY • 🍖 BBQ • 🥛 SOUR CREAM • 🧀 CHEESE • 🧄 BAWANG ONLY</span>
                  <span>•</span>
                  <span>🫙 SEALED IN REUSABLE CRUNCH-LOCK TUBS</span>
                  <span>•</span>
                  <span>💵 COD, GCASH & MARIBANK ACCEPTED</span>
                  <span>•</span>
                  <span>🥜 CRISPY NA, CRUNCHY PA!</span>
                  <span>•</span>
                  <span>🧄 LOADED WITH REAL GOLDEN BAWANG CHIPS</span>
                  <span>•</span>
                  <span>🧂 SALTED • 🌱 UNSALTED • 🌶️ SPICY • 🍖 BBQ • 🥛 SOUR CREAM • 🧀 CHEESE • 🧄 BAWANG ONLY</span>
                  <span>•</span>
                  <span>🫙 SEALED IN REUSABLE CRUNCH-LOCK TUBS</span>
                  <span>•</span>
                  <span>💵 COD, GCASH & MARIBANK ACCEPTED</span>
                </div>
              </div>
            </section>

            {/* ⏰ Order Cutoff Timer Banner Prominently Placed */}
            <OrderCutoffBanner 
              cutoffInfo={cutoffInfo} 
              onRefreshCutoff={fetchCutoff} 
            />

            {/* Error Banner */}
            {submissionError && (
              <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-300 text-sm font-bold text-red-700 flex items-center gap-2.5 shadow-xs animate-fade-in">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
                <span>{submissionError}</span>
              </div>
            )}

            {/* Responsive 2-Column Desktop Grid / 1-Column Mobile Stack */}
            <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start space-y-8 lg:space-y-0">
              {/* Left Column (Desktop 7 cols): Flavors Catalog */}
              <div id="flavors-menu" className="lg:col-span-7 space-y-5 scroll-mt-24">
                <section className="space-y-4">
                  {/* Section Title & Barkada Sampler Quick Action */}
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border-2 border-mani-900/15 shadow-warm">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-mani-950 border border-mani-900/20">
                          Step 1
                        </span>
                        <span className="text-xs font-extrabold text-amber-800">
                          Choose Your Tubs
                        </span>
                      </div>
                      <h2 className="font-display text-2xl sm:text-3xl font-bold text-mani-950 flex items-center gap-2 tracking-tight">
                        <span>🥜</span> Meet the 7 Flavors
                      </h2>
                      <p className="text-xs sm:text-sm text-mani-600 font-medium mt-0.5">
                        Freshly cooked in small batches. Mix & match your favorite tubs below!
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {!isOrdersClosed && (
                        <button
                          type="button"
                          onClick={handleAddAllSampler}
                          className="px-3.5 py-2 rounded-2xl bg-amber-100 hover:bg-amber-200 text-mani-950 font-display font-bold text-xs border-2 border-mani-900/25 hover:border-mani-900 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                          title="Add 1 tub of every available flavor"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                          <span>+1 of Each Flavor</span>
                        </button>
                      )}
                      {totalPacks > 0 && (
                        <span className="font-display text-xs font-bold text-mani-950 bg-amber-300 px-3 py-1.5 rounded-2xl border-2 border-mani-900 shadow-snack-sm">
                          {totalPacks} tub{totalPacks > 1 ? 's' : ''} in basket
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Interactive Flavor Filter Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {[
                      { id: 'all', label: '🥜 All Flavors', count: products.length },
                      { id: 'bestsellers', label: '🔥 Crowd Favorites' },
                      { id: 'savory', label: '🌶️ Bold & Savory' },
                      { id: 'classic', label: '🧄 Classic & Garlic' }
                    ].map((tab) => {
                      const isActive = activeFlavorFilter === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveFlavorFilter(tab.id)}
                          className={`px-3.5 py-2 rounded-2xl font-display font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                            isActive
                              ? 'bg-mani-900 text-amber-300 border-2 border-mani-950 shadow-snack-sm'
                              : 'bg-white text-mani-800 border-2 border-mani-900/15 hover:border-mani-900/50 hover:bg-amber-50'
                          }`}
                        >
                          <span>{tab.label}</span>
                          {tab.count !== undefined && (
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                              isActive ? 'bg-amber-400 text-mani-950' : 'bg-mani-100 text-mani-700'
                            }`}>
                              {tab.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Flavors Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4 xl:gap-3.5">
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

            {/* 🌟 MGA SUKI FAVORITE COMBOS & BRAND STORY SECTION */}
            <BrandStoryAndSuki
              products={products}
              onAddCombo={handleAddCombo}
              isOrdersClosed={isOrdersClosed}
            />
          </div>
        )}
      </main>

      {/* Mobile Sticky Quick-Action Bar */}
      {currentView === 'order' && totalPacks > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-cream/95 backdrop-blur-md border-t-2 border-mani-900 px-4 py-3 shadow-2xl lg:hidden animate-fade-in flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="text-left cursor-pointer active:opacity-80 transition-opacity min-w-0"
            title="View Order Summary"
          >
            <div className="text-[11px] font-extrabold text-mani-700 flex items-center gap-1.5 flex-wrap">
              <span className="bg-amber-200 text-mani-950 px-2 py-0.5 rounded-full border border-mani-900/20">
                🥜 {totalPacks} tub{totalPacks > 1 ? 's' : ''}
              </span>
              {cutoffInfo?.isOpen && cutoffInfo?.enabled && (
                <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                  ⏰ {cutoffInfo.cutoffTime || '23:59'}
                </span>
              )}
            </div>
            <div className="font-display text-lg font-bold text-mani-950 flex items-center gap-1.5 mt-0.5">
              <span>{formatPHP(subtotal)}</span>
              <span className="font-sans text-[11px] text-amber-800 font-extrabold underline">View Basket</span>
            </div>
          </button>
          {isOrdersClosed ? (
            <span className="px-3.5 py-2.5 rounded-xl bg-red-100 text-red-800 font-display font-bold text-xs border-2 border-red-300 flex items-center gap-1 shrink-0">
              <Lock className="w-3.5 h-3.5" /> Orders Closed
            </span>
          ) : (
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('customer-info-section');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-mani-950 font-display font-bold text-xs sm:text-sm border-2 border-mani-900 shadow-snack-sm active:translate-y-0.5 flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>Checkout Now 🥜</span>
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
