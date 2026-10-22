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
import HalloweenAtmosphere, { PlayfulSkeletonSvg, SharpBatSvg, CornerWebWithSpider } from './components/HalloweenAtmosphere';
import HalloweenMascotVideo from './components/HalloweenMascotVideo';
import SeasonalAtmosphere from './components/SeasonalAtmosphere';
import SeasonalHeroVisual from './components/SeasonalHeroVisual';
import { SantaPeanutSvg, ChristmasCornerGarland, ChristmasStarOrnament, ChristmasFairyLights, ChristmasGiftBoxSvg } from './components/ChristmasDecorations';
import { HarvestPeanutSvg, ThanksgivingCornerGarland, ThanksgivingLeafOrnament } from './components/ThanksgivingDecorations';
import { NewYearPeanutSvg, NewYearCornerGarland, NewYearSparkleOrnament, NewYearPartyHatSvg, NewYearFireworkBurstSvg } from './components/NewYearDecorations';
import { ChineseNewYearPeanutSvg, ChineseNewYearCornerGarland, ChineseNewYearLanternOrnament, ChineseNewYearAngpaoCoinSvg, ChineseNewYearGoldIngotSvg } from './components/ChineseNewYearDecorations';
import { ValentinesPeanutSvg, ValentinesCornerGarland, ValentinesHeartOrnament, ValentinesHeartBoxSvg, ValentinesCupidHeartSvg } from './components/ValentinesDecorations';
import { THEMES, getTheme, VALID_THEME_IDS, DEFAULT_THEME } from './config/themes';
import { initThanksgivingLeaves } from './utils/thanksgivingLeaves';
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
import { AlertCircle, ChevronRight, Lock, X, Sparkles, Flame, ArrowDown } from 'lucide-react';

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

// Clean & resilient merger: ensures all DEFAULT_PRODUCTS are permanently present and prices are enforced
const mergeProductsWithDefaults = (incomingProducts, availabilityMap) => {
  let list = Array.isArray(incomingProducts) && incomingProducts.length > 0
    ? [...incomingProducts]
    : [...DEFAULT_PRODUCTS];

  const incomingIds = new Set(list.map((p) => p.id));
  const missing = DEFAULT_PRODUCTS.filter((p) => !incomingIds.has(p.id));
  if (missing.length > 0) {
    list = [...list, ...missing];
  }

  list = list.map((p) => {
    const defaultItem = DEFAULT_PRODUCTS.find((d) => d.id === p.id);
    if (!defaultItem) return p;

    // Enforce tier pricing: Salted Egg & Spicy Salted Egg @ ₱65, Bawang Only @ ₱60, others @ ₱50
    const price = (p.id === 'salted-egg' || p.id === 'spicy-salted-egg')
      ? 65
      : (p.id === 'bawang-only' ? (p.price || 60) : (p.price || defaultItem.price || 50));

    const isAvailable = availabilityMap && availabilityMap[p.id] !== undefined
      ? Boolean(availabilityMap[p.id])
      : (p.available !== undefined ? Boolean(p.available) : defaultItem.available);

    return {
      ...defaultItem,
      ...p,
      price,
      available: isAvailable,
      image: p.image || defaultItem.image,
      badge: p.badge || defaultItem.badge,
      sortOrder: p.sortOrder !== undefined ? p.sortOrder : defaultItem.sortOrder
    };
  });

  list.sort((a, b) => (a.sortOrder || 99) - (b.sortOrder || 99));
  return list;
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
      const merged = mergeProductsWithDefaults(savedProds, savedAvailability);
      localStorage.setItem('mani_products', JSON.stringify(merged));
      return merged;
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

  // Track most recent local admin theme update timestamp so background polling never reverts admin theme edits
  const lastLocalThemeSaveRef = useRef((() => {
    try {
      const saved = JSON.parse(localStorage.getItem('mani_theme_settings') || 'null');
      return Number(saved?.updatedAt || 0);
    } catch (e) {
      return 0;
    }
  })());

  // Active Theme State (Initialized from cached settings or server default)
  const [currentThemeId, setCurrentThemeId] = useState(() => {
    try {
      const themeSettings = JSON.parse(localStorage.getItem('mani_theme_settings') || 'null');
      if (themeSettings?.theme && VALID_THEME_IDS.includes(themeSettings.theme)) {
        return themeSettings.theme;
      }
      const savedTheme = localStorage.getItem('mani_active_theme');
      if (savedTheme && VALID_THEME_IDS.includes(savedTheme)) {
        return savedTheme;
      }
    } catch (e) {}
    return 'christmas';
  });

  // Admin Preview Theme (does not affect public visitors until published)
  const [adminPreviewThemeId, setAdminPreviewThemeId] = useState(null);

  const effectiveThemeId = (currentView === 'admin' && adminPreviewThemeId)
    ? adminPreviewThemeId
    : currentThemeId;

  const currentTheme = getTheme(effectiveThemeId);

  // Synchronize documentElement & body data-theme attribute with active theme
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', effectiveThemeId);
      document.body.setAttribute('data-theme', effectiveThemeId);
      document.documentElement.classList.toggle('thanksgiving-theme', effectiveThemeId === 'thanksgiving');
      document.body.classList.toggle('thanksgiving-theme', effectiveThemeId === 'thanksgiving');
      initThanksgivingLeaves();
    }
  }, [effectiveThemeId]);

  // Flavors cart: { [productId]: quantity } with localStorage persistence
  const [quantities, setQuantities] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('mani_cart_quantities') || 'null');
      if (saved && typeof saved === 'object') {
        return {
          salted: 0,
          unsalted: 0,
          spicy: 0,
          bbq: 0,
          'sour-cream': 0,
          cheese: 0,
          'salted-egg': 0,
          'spicy-salted-egg': 0,
          'bawang-only': 0,
          ...saved
        };
      }
    } catch (e) {}
    return {
      salted: 0,
      unsalted: 0,
      spicy: 0,
      bbq: 0,
      'sour-cream': 0,
      cheese: 0,
      'salted-egg': 0,
      'spicy-salted-egg': 0,
      'bawang-only': 0
    };
  });

  // Auto-save cart quantities to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mani_cart_quantities', JSON.stringify(quantities));
    } catch (e) {}
  }, [quantities]);

  // Customer Form Data with localStorage persistence
  const [customerData, setCustomerData] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('mani_customer_data') || 'null');
      if (saved && typeof saved === 'object') {
        return {
          customerName: '',
          mobileNumber: '',
          deliveryAddress: '',
          paymentMethod: 'Cash on Delivery',
          ...saved
        };
      }
    } catch (e) {}
    return {
      customerName: '',
      mobileNumber: '',
      deliveryAddress: '',
      paymentMethod: 'Cash on Delivery'
    };
  });

  // Auto-save customer details to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mani_customer_data', JSON.stringify(customerData));
    } catch (e) {}
  }, [customerData]);

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

    // 2. Synchronize Flavor Availability & Products
    const incomingAvailability = (settings.flavorAvailability && typeof settings.flavorAvailability === 'object')
      ? settings.flavorAvailability
      : null;

    if (incomingAvailability) {
      localStorage.setItem('mani_flavor_availability', JSON.stringify(incomingAvailability));
    }

    // 3. Synchronize Products & Pricing (never discard newly added flavors)
    if (Array.isArray(settings.products) && settings.products.length > 0) {
      const merged = mergeProductsWithDefaults(settings.products, incomingAvailability);
      setProducts(merged);
      localStorage.setItem('mani_products', JSON.stringify(merged));
    } else if (incomingAvailability) {
      setProducts((prev) => mergeProductsWithDefaults(prev, incomingAvailability));
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

    // 6. Synchronize Seasonal Theme
    if (settings.theme && VALID_THEME_IDS.includes(settings.theme)) {
      let localThemeSaved = null;
      try {
        localThemeSaved = JSON.parse(localStorage.getItem('mani_theme_settings') || 'null');
      } catch (e) {}

      const localThemeUpdatedAt = Number(localThemeSaved?.updatedAt || lastLocalThemeSaveRef.current || 0);
      const cloudThemeUpdatedAt = Number(settings.themeUpdatedAt || settings.updatedAt || 0);

      // Guard: do NOT let stale cloud data overwrite newer local admin theme edits
      const isLocalNewer = localThemeSaved && localThemeUpdatedAt > 0 && (cloudThemeUpdatedAt === 0 || localThemeUpdatedAt > cloudThemeUpdatedAt);

      if (!isLocalNewer) {
        setCurrentThemeId(settings.theme);
        localStorage.setItem('mani_active_theme', settings.theme);
        localStorage.setItem('mani_theme_settings', JSON.stringify({
          theme: settings.theme,
          updatedAt: cloudThemeUpdatedAt || Date.now()
        }));
      }
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
            setProducts((prev) => mergeProductsWithDefaults(prev, data.flavorAvailability));
          }
          if (data.paymentMethods && typeof data.paymentMethods === 'object') {
            setPaymentMethods((prev) => ({ ...prev, ...data.paymentMethods }));
            localStorage.setItem('mani_payment_methods', JSON.stringify(data.paymentMethods));
          }
          if (data.theme && VALID_THEME_IDS.includes(data.theme)) {
            let localThemeSaved = null;
            try {
              localThemeSaved = JSON.parse(localStorage.getItem('mani_theme_settings') || 'null');
            } catch (e) {}
            const localThemeUpdatedAt = Number(localThemeSaved?.updatedAt || lastLocalThemeSaveRef.current || 0);
            const serverThemeUpdatedAt = Number(data.themeUpdatedAt || data.updatedAt || 0);
            const isLocalNewer = localThemeSaved && localThemeUpdatedAt > 0 && (serverThemeUpdatedAt === 0 || localThemeUpdatedAt > serverThemeUpdatedAt);

            if (!isLocalNewer) {
              setCurrentThemeId(data.theme);
              localStorage.setItem('mani_active_theme', data.theme);
              localStorage.setItem('mani_theme_settings', JSON.stringify({
                theme: data.theme,
                updatedAt: serverThemeUpdatedAt || Date.now()
              }));
            }
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
      .then((res) => {
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          return res.json();
        }
        return null;
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts((prev) => mergeProductsWithDefaults(data));
        }
      })
      .catch(() => {});

    fetch('/api/theme')
      .then((res) => {
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          return res.json();
        }
        return null;
      })
      .then((data) => {
        if (data && data.theme && VALID_THEME_IDS.includes(data.theme)) {
          let localThemeSaved = null;
          try {
            localThemeSaved = JSON.parse(localStorage.getItem('mani_theme_settings') || 'null');
          } catch (e) {}
          const localThemeUpdatedAt = Number(localThemeSaved?.updatedAt || lastLocalThemeSaveRef.current || 0);
          const serverThemeUpdatedAt = Number(data.themeUpdatedAt || 0);
          const isLocalNewer = localThemeSaved && localThemeUpdatedAt > 0 && (serverThemeUpdatedAt === 0 || localThemeUpdatedAt > serverThemeUpdatedAt);

          if (!isLocalNewer) {
            setCurrentThemeId(data.theme);
            localStorage.setItem('mani_active_theme', data.theme);
            localStorage.setItem('mani_theme_settings', JSON.stringify({
              theme: data.theme,
              updatedAt: serverThemeUpdatedAt || Date.now()
            }));
          }
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
    const merged = mergeProductsWithDefaults(newProducts);
    setProducts(merged);
    localStorage.setItem('mani_products', JSON.stringify(merged));

    // 1. Sync to local backend if available
    fetch('/api/products', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(merged)
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
          settings: { products: merged }
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

  const handlePublishTheme = async (themeId) => {
    if (!VALID_THEME_IDS.includes(themeId)) return;
    const nowTs = Date.now();
    lastLocalThemeSaveRef.current = nowTs;
    setCurrentThemeId(themeId);
    setAdminPreviewThemeId(null);
    localStorage.setItem('mani_active_theme', themeId);
    localStorage.setItem('mani_theme_settings', JSON.stringify({
      theme: themeId,
      updatedAt: nowTs
    }));

    // 1. Sync to local backend if running
    try {
      if (adminToken) {
        await fetch('/api/admin/theme', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`
          },
          body: JSON.stringify({ theme: themeId, updatedAt: nowTs })
        });
      }
    } catch (err) {}

    // 2. Sync to Google Apps Script Cloud so all visitors & mobile immediately receive updated theme
    const appsUrl = (localStorage.getItem('mani_apps_script_url') || DEFAULT_APPS_SCRIPT_URL || '').trim();
    if (appsUrl) {
      // POST sync
      fetch(appsUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'saveSettings',
          settings: { theme: themeId, themeUpdatedAt: nowTs, updatedAt: nowTs }
        })
      }).catch(() => {});

      // GET fast-path sync
      fetch(`${appsUrl}?action=saveTheme&theme=${encodeURIComponent(themeId)}&updatedAt=${nowTs}`, {
        mode: 'no-cors'
      }).catch(() => {});
    }

    setToast({
      show: true,
      message: `Theme updated to ${getTheme(themeId).name}! Live across the entire website.`,
      icon: '🎨'
    });
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
      return ['salted', 'spicy', 'bbq', 'salted-egg', 'spicy-salted-egg', 'bawang-only'].includes(p.id);
    }
    if (activeFlavorFilter === 'savory') {
      return ['spicy', 'bbq', 'sour-cream', 'cheese', 'salted-egg', 'spicy-salted-egg'].includes(p.id);
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
      errors.customerName = 'Please enter your name.';
    }

    if (!customerData.deliveryAddress || !customerData.deliveryAddress.trim()) {
      errors.deliveryAddress = 'Please enter your delivery address.';
    }

    const cleanMobile = (customerData.mobileNumber || '').replace(/[\s\-()]/g, '');
    const mobileRegex = /^(09|\+639|639)\d{9}$/;
    if (cleanMobile && !mobileRegex.test(cleanMobile)) {
      errors.mobileNumber = 'Please enter a valid mobile number (e.g. 0917 123 4567).';
    }

    const hasAnyPaymentMethod = Object.values(paymentMethods).some(Boolean);
    if (!hasAnyPaymentMethod) {
      errors.paymentMethod = 'Online payments are temporarily paused. Please reach out to us directly.';
    } else if (!customerData.paymentMethod) {
      errors.paymentMethod = 'Please choose a payment method.';
    } else {
      const pmId = getPaymentMethodIdByName(customerData.paymentMethod);
      if (paymentMethods[pmId] === false) {
        errors.paymentMethod = `${customerData.paymentMethod} is temporarily unavailable. Please pick another option.`;
      }
    }

    if (totalPacks <= 0) {
      errors.items = 'Please select at least 1 tub to order.';
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
      customerName: (customerData.customerName || '').trim(),
      mobileNumber: (customerData.mobileNumber || '').trim(),
      deliveryAddress: (customerData.deliveryAddress || '').trim(),
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
    <div data-theme={effectiveThemeId} className={`relative min-h-screen flex flex-col bg-peanut-pattern text-mani-900 ${effectiveThemeId === 'thanksgiving' ? 'thanksgiving-theme' : ''} ${effectiveThemeId === 'christmas' ? 'christmas-theme' : ''} ${effectiveThemeId === 'new-year' ? 'new-year-theme' : ''} ${effectiveThemeId === 'chinese-new-year' ? 'chinese-new-year-theme' : ''} ${effectiveThemeId === 'valentines-day' ? 'valentines-day-theme' : ''} ${effectiveThemeId === 'christmas' ? 'selection:bg-[#DC2626] selection:text-white' : effectiveThemeId === 'thanksgiving' ? 'selection:bg-[#D4A373] selection:text-[#2E1C0C]' : effectiveThemeId === 'new-year' ? 'selection:bg-[#FFD700] selection:text-[#0B132B]' : effectiveThemeId === 'chinese-new-year' ? 'selection:bg-[#FFD700] selection:text-[#800020]' : effectiveThemeId === 'valentines-day' ? 'selection:bg-[#FFCCD5] selection:text-[#800F2F]' : 'selection:bg-[#FF6B00] selection:text-white'}`}>
      {/* Skip to Content for Keyboard & Screen Reader Users */}
      <a
        href="#flavors-menu"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:rounded-xl focus:bg-amber-400 focus:text-stone-950 focus:font-extrabold focus:border-2 focus:border-stone-900 focus:shadow-xl focus:outline-none"
      >
        Skip to Flavors Menu
      </a>

      {/* 🌟 Seasonal Atmosphere Particles & Ambient Visuals (Halloween bats/ghosts/skeletons, Christmas snow, etc.) */}
      {currentView === 'order' && <SeasonalAtmosphere themeId={effectiveThemeId} />}

      {/* Sleek Floating Toast Notification */}
      {toast.show && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-20 right-4 sm:right-6 z-50 flex items-center gap-3 ${currentTheme?.toastBg || 'bg-[#1F1025] text-white border-2 border-[#FF6B00]'} px-4 py-3 rounded-2xl shadow-snack-card animate-fade-in transition-all max-w-sm`}
        >
          <div className={`w-9 h-9 rounded-xl ${currentTheme?.toastIconBg || 'bg-[#FF6B00] text-white border border-amber-300'} flex items-center justify-center text-lg font-bold shrink-0`}>
            {toast.icon}
          </div>
          <div className="font-display text-xs sm:text-sm font-bold pr-1 text-amber-100">
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
        onOpenCart={() => {
          if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
            const el = document.getElementById('order-summary-section');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              return;
            }
          }
          setIsDrawerOpen(true);
        }}
        isAdminAuthenticated={Boolean(adminToken)}
        adminUser={adminUser}
        onLogout={handleLogout}
        cutoffInfo={cutoffInfo}
        themeId={effectiveThemeId}
      />

      {/* Main Content */}
      <main className={`relative z-10 flex-1 ${totalPacks > 0 ? 'pb-32 sm:pb-16' : 'pb-24 sm:pb-12'}`}>
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
            currentThemeId={currentThemeId}
            onPublishTheme={handlePublishTheme}
            onResetThemeToDefault={() => handlePublishTheme('default')}
            onPreviewTheme={setAdminPreviewThemeId}
          />
        ) : currentView === 'admin' && !adminToken ? (
          /* Dedicated unauthenticated /admin screen holding the AdminLoginModal */
          <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-[#2B1B30] text-amber-300 mx-auto flex items-center justify-center border-2 border-[#FF6B00] shadow-pumpkin-tub">
              <Lock className="w-8 h-8 text-[#FF6B00]" />
            </div>
            <h2 className="font-display text-2xl font-bold text-white">Admin Access Required</h2>
            <p className="text-xs sm:text-sm text-amber-200/85 font-medium">
              Please sign in with authorized administrator credentials to manage orders, products, and store settings.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-amber-400 text-white hover:text-[#1F1025] font-display font-bold text-xs sm:text-sm border-2 border-amber-300 shadow-snack-sm transition-all cursor-pointer"
              >
                Open Admin Login
              </button>
              <button
                type="button"
                onClick={() => navigateTo('order')}
                className="px-4 py-2.5 rounded-xl bg-[#2B1B30] hover:bg-[#382240] text-amber-200 font-bold text-xs sm:text-sm border-2 border-[#FF6B00]/50 transition-all cursor-pointer"
              >
                Return to Store
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-6 sm:space-y-8">
            {/* 🌟 HERO SECTION: Dynamic Seasonal Hero */}
            <section className={`hero relative rounded-[2rem] ${currentTheme?.heroBg || 'bg-hero-snack border-2 border-[#FF6B00] shadow-pumpkin-card'} overflow-hidden p-5 sm:p-8 lg:p-10`}>
              {/* Corner & Atmospheric Theme Decorations */}
              {effectiveThemeId === 'halloween' && (
                <>
                  <CornerWebWithSpider position="right" size="sm" showSpider={true} />
                  <div className="pointer-events-none select-none absolute top-3 right-28 sm:right-36 opacity-80 animate-float-slow">
                    <SharpBatSvg className="w-14 sm:w-20 h-auto drop-shadow-[0_2px_8px_rgba(255,107,0,0.45)] -rotate-12" />
                  </div>
                  <div className="pointer-events-none select-none hidden sm:block absolute top-6 left-[44%] opacity-70 animate-float-reverse">
                    <SharpBatSvg className="w-12 h-auto drop-shadow-[0_2px_8px_rgba(251,191,36,0.4)] rotate-6" />
                  </div>
                </>
              )}
              {effectiveThemeId === 'christmas' && (
                <>
                  <ChristmasCornerGarland position="left" />
                  <ChristmasCornerGarland position="right" />
                  <div className="pointer-events-none select-none absolute top-3 right-28 sm:right-36 opacity-90 animate-float-slow">
                    <ChristmasStarOrnament className="w-10 sm:w-14 h-auto drop-shadow-[0_2px_12px_rgba(233,216,166,0.6)]" />
                  </div>
                  <div className="pointer-events-none select-none absolute top-3 left-28 sm:left-36 opacity-90 animate-float-reverse hidden sm:block">
                    <ChristmasStarOrnament className="w-8 sm:w-12 h-auto drop-shadow-[0_2px_10px_rgba(233,216,166,0.5)]" />
                  </div>
                  <div className="absolute top-0 inset-x-0 z-20 pointer-events-none">
                    <ChristmasFairyLights className="w-full h-5" />
                  </div>
                </>
              )}
              {effectiveThemeId === 'thanksgiving' && (
                <>
                  <ThanksgivingCornerGarland position="left" />
                  <ThanksgivingCornerGarland position="right" />
                  <div className="pointer-events-none select-none absolute top-3 right-28 sm:right-36 opacity-90 animate-float-slow">
                    <ThanksgivingLeafOrnament className="w-10 sm:w-14 h-auto drop-shadow-[0_2px_12px_rgba(234,88,12,0.6)]" />
                  </div>
                  <div className="pointer-events-none select-none hidden sm:block absolute top-6 left-[44%] opacity-80 animate-float-reverse">
                    <ThanksgivingLeafOrnament variant="acorn" className="w-8 sm:w-10 h-auto drop-shadow-[0_2px_10px_rgba(217,119,6,0.5)]" />
                  </div>
                </>
              )}
              {effectiveThemeId === 'new-year' && (
                <>
                  <NewYearCornerGarland position="left" />
                  <NewYearCornerGarland position="right" />
                  <div className="pointer-events-none select-none absolute top-3 right-28 sm:right-36 opacity-90 animate-float-slow">
                    <NewYearSparkleOrnament className="w-10 sm:w-14 h-auto drop-shadow-[0_2px_12px_rgba(234,179,8,0.6)]" />
                  </div>
                  <div className="pointer-events-none select-none hidden sm:block absolute top-6 left-[44%] opacity-80 animate-float-reverse">
                    <NewYearSparkleOrnament variant="burst" className="w-8 sm:w-10 h-auto drop-shadow-[0_2px_10px_rgba(248,250,252,0.5)]" />
                  </div>
                </>
              )}
              {effectiveThemeId === 'chinese-new-year' && (
                <>
                  <ChineseNewYearCornerGarland position="left" />
                  <ChineseNewYearCornerGarland position="right" />
                  <div className="pointer-events-none select-none absolute top-3 right-28 sm:right-36 opacity-90 animate-float-slow">
                    <ChineseNewYearLanternOrnament className="w-10 sm:w-14 h-auto drop-shadow-[0_2px_12px_rgba(220,38,38,0.6)]" />
                  </div>
                  <div className="pointer-events-none select-none hidden sm:block absolute top-6 left-[44%] opacity-85 animate-float-reverse">
                    <ChineseNewYearLanternOrnament className="w-8 sm:w-10 h-auto drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)]" />
                  </div>
                </>
              )}
              {effectiveThemeId === 'valentines-day' && (
                <>
                  <ValentinesCornerGarland position="left" />
                  <ValentinesCornerGarland position="right" />
                  <div className="pointer-events-none select-none absolute top-3 right-28 sm:right-36 opacity-90 animate-float-slow">
                    <ValentinesHeartOrnament className="w-10 sm:w-14 h-auto drop-shadow-[0_2px_12px_rgba(225,29,72,0.6)]" />
                  </div>
                  <div className="pointer-events-none select-none hidden sm:block absolute top-6 left-[44%] opacity-85 animate-float-reverse">
                    <ValentinesHeartOrnament className="w-8 sm:w-10 h-auto drop-shadow-[0_2px_10px_rgba(251,113,133,0.5)]" />
                  </div>
                </>
              )}

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-6 items-center">
                {/* Left Column: Headline, Sub-headline & Appetizing CTAs */}
                <div className="lg:col-span-5 text-center lg:text-left space-y-4">
                  {/* Top Pill Badge */}
                  <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider ${currentTheme?.badgeClass || 'bg-[#FF6B00] text-white border-2 border-amber-300 shadow-snack-sm'} -rotate-1`}>
                    <span>
                      {currentTheme?.heroPill || `${currentTheme?.badge || '🎃 Trick or Treat Crunch!'} • ${currentTheme?.name || 'Spooky'} Special`}
                    </span>
                  </div>

                  {/* Main Headline & Sub-Headline */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-center lg:justify-start gap-2.5 flex-wrap">
                      <h1
                        data-testid="hero-headline"
                        className={`hero-title font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] ${currentTheme?.heroHeadlineColor || 'text-white drop-shadow-[0_4px_16px_rgba(255,107,0,0.45)]'}`}
                      >
                        {currentTheme?.heroHeadline || 'ANONG FEAR MO TODAY?'}
                      </h1>
                    </div>
                    <p
                      data-testid="hero-subheadline"
                      className={`font-display text-lg sm:text-2xl font-bold leading-snug drop-shadow-xs ${currentTheme?.heroSubheadlineColor || 'text-amber-300'}`}
                    >
                      {currentTheme?.heroSubheadline || "Mani so good, it's scary. No tricks, just pure crunch!"}
                    </p>
                  </div>

                  {/* Clear Value Proposition */}
                  <p className="text-xs sm:text-base text-amber-100/90 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                    {currentTheme?.heroDescription || 'Freshly roasted, ultra-crunchy Filipino peanuts & golden crispy bawang chips packed in resealable tubs. Made for movie nights, merienda, office desk fuel, and barkada hangouts — only ₱50–₱65 per tub!'}
                  </p>

                  {/* Primary & Secondary Hero CTAs */}
                  <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3">
                    <a
                      href="#flavors-menu"
                      className={`px-6 py-3.5 rounded-2xl ${currentTheme?.primaryBtn || 'bg-[#FF6B00] hover:bg-amber-400 text-white border-2 border-amber-300 shadow-pumpkin-tub'} font-display font-bold text-base sm:text-lg active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer`}
                    >
                      <span>{currentTheme?.heroOrderBtnText || 'Order Now 🎃🥜'}</span>
                      <ArrowDown className="w-4 h-4 stroke-[2.5]" />
                    </a>

                    <a
                      href="#suki-favorites"
                      className={`px-5 py-3.5 rounded-2xl ${currentTheme?.secondaryBtn || 'bg-[#1F1025]/90 hover:bg-[#2B1B30] text-amber-300 border-2 border-[#FF6B00]'} font-display font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 cursor-pointer`}
                    >
                      <Flame style={{ color: currentTheme?.accentColor || '#FF6B00', fill: currentTheme?.accentColor || '#FF6B00' }} className="w-4 h-4" />
                      <span>Try Suki Combos</span>
                    </a>
                  </div>

                  {/* Quick 3-Step Ordering Guide Pills */}
                  <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2 text-[11px] sm:text-xs font-extrabold text-amber-100">
                    <span className={`inline-flex items-center gap-1.5 ${currentTheme?.stepPillBg || 'bg-[#1F1025]/85 text-amber-300 border-[#FF6B00]/60'} px-3 py-1.5 rounded-xl border shadow-2xs`}>
                      <span className={`w-4 h-4 rounded-full ${currentTheme?.stepPillActive || 'bg-[#FF6B00] text-[#1F1025]'} text-[10px] flex items-center justify-center font-black`}>1</span>
                      Pick Flavors
                    </span>
                    <span className="text-amber-400 font-black">→</span>
                    <span className={`inline-flex items-center gap-1.5 ${currentTheme?.stepPillBg || 'bg-[#1F1025]/85 text-amber-300 border-[#FF6B00]/60'} px-3 py-1.5 rounded-xl border shadow-2xs`}>
                      <span className={`w-4 h-4 rounded-full ${currentTheme?.stepPillActive || 'bg-[#FF6B00] text-[#1F1025]'} text-[10px] flex items-center justify-center font-black`}>2</span>
                      Review Basket
                    </span>
                    <span className="text-amber-400 font-black">→</span>
                    <span className={`inline-flex items-center gap-1.5 ${currentTheme?.stepPillBg || 'bg-[#1F1025]/85 text-amber-300 border-[#FF6B00]/60'} px-3 py-1.5 rounded-xl border shadow-2xs`}>
                      <span className={`w-4 h-4 rounded-full ${currentTheme?.stepPillActive || 'bg-[#FF6B00] text-[#1F1025]'} text-[10px] flex items-center justify-center font-black`}>3</span>
                      Delivery &amp; Checkout
                    </span>
                  </div>
                </div>

                {/* Right Column: Dynamic Seasonal Hero Visual (Mascot Video for Halloween, Christmas Composition for Christmas, etc.) */}
                <div className="lg:col-span-7 relative flex items-center justify-center">
                  <SeasonalHeroVisual themeId={effectiveThemeId} />
                </div>
              </div>

              {/* Dynamic Snack Ticker Strip Inside Bottom of Hero */}
              <div className={`mt-6 -mx-5 sm:-mx-8 lg:-mx-10 -mb-5 sm:-mb-8 lg:-mb-10 ${currentTheme?.tickerBg || 'bg-[#1F1025] text-amber-300 border-t-2 border-[#FF6B00]'} py-2.5 overflow-hidden select-none`}>
                <div className="animate-marquee flex items-center gap-6 text-xs font-display font-bold tracking-wide uppercase whitespace-nowrap">
                  {(currentTheme?.heroMarqueeItems || [
                    '🥜 CRISPY NA, CRUNCHY PA!',
                    '✨ HANDCRAFTED GARLIC PEANUTS COOKED FRESH IN SMALL BATCHES',
                    '🫙 SEALED IN REUSABLE CRUNCH-LOCK TUBS',
                    '💵 COD, GCASH & MARIBANK ACCEPTED'
                  ]).concat(currentTheme?.heroMarqueeItems || [
                    '🥜 CRISPY NA, CRUNCHY PA!',
                    '✨ HANDCRAFTED GARLIC PEANUTS COOKED FRESH IN SMALL BATCHES',
                    '🫙 SEALED IN REUSABLE CRUNCH-LOCK TUBS',
                    '💵 COD, GCASH & MARIBANK ACCEPTED'
                  ]).map((item, idx) => (
                    <React.Fragment key={idx}>
                      <span>{item}</span>
                      <span>•</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </section>

            {/* ⏰ Order Cutoff Timer Banner Prominently Placed */}
            <OrderCutoffBanner 
              cutoffInfo={cutoffInfo} 
              onRefreshCutoff={fetchCutoff} 
              themeId={effectiveThemeId}
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
                  {/* Section Title, Seasonal Mascot Character & Quick Action */}
                  <div className={`relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${currentTheme?.sectionHeaderBg || 'bg-[#2B1B30]/95 text-white border-2 border-[#FF6B00]'} p-4 sm:p-5 rounded-3xl shadow-snack-card`}>
                    <div className="flex items-center gap-3.5">
                      {/* Supporting Seasonal Character */}
                      <div className={`shrink-0 ${
                        effectiveThemeId === 'christmas' ? 'bg-[#0B2545]/95 border border-[#E9D8A6]'
                        : effectiveThemeId === 'thanksgiving' ? 'bg-[#3B1F0E]/95 border border-[#D4A373]'
                        : effectiveThemeId === 'new-year' ? 'bg-[#1C2541]/90 border border-[#FFD700]/60'
                        : effectiveThemeId === 'chinese-new-year' ? 'bg-[#500014]/90 border border-[#FFD700]/60'
                        : effectiveThemeId === 'valentines-day' ? 'bg-[#590D22]/90 border border-[#FFCCD5]/60'
                        : 'bg-[#1F1025]/90 border border-[#FF6B00]/60'
                      } p-1.5 rounded-2xl shadow-inner`}>
                        {effectiveThemeId === 'christmas' ? (
                          <SantaPeanutSvg className="w-14 h-16 sm:w-16 sm:h-20 drop-shadow-[0_2px_10px_rgba(220,38,38,0.5)]" />
                        ) : effectiveThemeId === 'thanksgiving' ? (
                          <HarvestPeanutSvg className="w-14 h-16 sm:w-16 sm:h-20 drop-shadow-[0_2px_10px_rgba(234,88,12,0.5)]" />
                        ) : effectiveThemeId === 'new-year' ? (
                          <NewYearPeanutSvg className="w-14 h-16 sm:w-16 sm:h-20 drop-shadow-[0_2px_10px_rgba(234,179,8,0.5)]" />
                        ) : effectiveThemeId === 'chinese-new-year' ? (
                          <ChineseNewYearPeanutSvg className="w-14 h-16 sm:w-16 sm:h-20 drop-shadow-[0_2px_10px_rgba(220,38,38,0.5)]" />
                        ) : effectiveThemeId === 'valentines-day' ? (
                          <ValentinesPeanutSvg className="w-14 h-16 sm:w-16 sm:h-20 drop-shadow-[0_2px_10px_rgba(225,29,72,0.5)]" />
                        ) : effectiveThemeId === 'halloween' ? (
                          <PlayfulSkeletonSvg className="w-14 h-16 sm:w-16 sm:h-20 drop-shadow-[0_2px_10px_rgba(255,107,0,0.35)]" />
                        ) : (
                          <div className="w-14 h-16 sm:w-16 sm:h-20 flex items-center justify-center text-3xl">🥜</div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${currentTheme?.stepPillActive || 'bg-[#FF6B00] text-white border border-amber-300'}`}>
                            Step 1
                          </span>
                          <span className="text-xs font-extrabold text-amber-300">
                            {currentTheme?.flavorSectionTitle || 'Choose Your Spooky Tubs 🎃'}
                          </span>
                        </div>
                        <h2 className="font-display text-2xl sm:text-3xl font-bold text-white flex items-center gap-2 tracking-tight">
                          <span>🥜</span> All 9 Flavors
                        </h2>
                        <p className="text-xs sm:text-sm text-amber-100/85 font-medium mt-0.5">
                          Freshly cooked in small batches. Pick your single tubs or mix and match your favorites below!
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {!isOrdersClosed && (
                        <button
                          type="button"
                          onClick={handleAddAllSampler}
                          className={`px-3.5 py-2 rounded-2xl ${currentTheme?.primaryBtn || 'bg-[#FF6B00] hover:bg-amber-400 text-white border-2 border-amber-300'} font-display font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95`}
                          title="Add 1 tub of every available flavor"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                          <span>+1 of Each Flavor</span>
                        </button>
                      )}
                      {totalPacks > 0 && (
                        <span className={`font-display text-xs font-bold ${currentTheme?.stepPillBg || 'text-[#1F1025] bg-amber-400 border-2 border-[#FF6B00]'} px-3 py-1.5 rounded-2xl shadow-snack-sm`}>
                          {totalPacks} tub{totalPacks > 1 ? 's' : ''} in basket
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Interactive Flavor Filter Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {[
                      { id: 'all', label: currentTheme?.filterAllLabel || '🎃 All Flavors', count: products.length },
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
                              ? (currentTheme?.filterActive || 'bg-[#FF6B00] text-white border-2 border-amber-300 shadow-pumpkin-tub')
                              : (currentTheme?.filterInactive || 'bg-[#2B1B30] text-amber-200 border-2 border-[#FF6B00]/45 hover:border-amber-300 hover:bg-[#382240]')
                          }`}
                        >
                          <span>{tab.label}</span>
                          {tab.count !== undefined && (
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                              isActive 
                                ? (effectiveThemeId === 'christmas' ? 'bg-[#0B2545] text-[#E9D8A6]' : effectiveThemeId === 'thanksgiving' ? 'bg-[#2A170B] text-amber-300' : effectiveThemeId === 'new-year' ? 'bg-[#0B132B] text-[#FFD700]' : effectiveThemeId === 'chinese-new-year' ? 'bg-[#500014] text-[#FFD700]' : effectiveThemeId === 'valentines-day' ? 'bg-[#590D22] text-[#FFCCD5]' : 'bg-[#1F1025] text-amber-300')
                                : 'bg-black/30 text-amber-300'
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
                    {filteredProducts.map((product, index) => (
                      <FlavorCard
                        key={product.id}
                        product={product}
                        index={index}
                        themeId={effectiveThemeId}
                        quantity={quantities[product.id] || 0}
                        onQuantityChange={handleQuantityChange}
                        onAddToCart={handleAddToCartFeedback}
                        isOrdersClosed={isOrdersClosed}
                      />
                    ))}
                  </div>
                </section>
              </div>

              {/* Right Column (Desktop 5 cols, Sticky): 2. Order Summary, 3. Customer Info, 4. Shipping Info, 5. Payment & Checkout */}
              <div id="checkout-section" className="lg:col-span-5 space-y-6">
                {/* 2. Active Order Summary / Cart */}
                <section>
                  <OrderSummaryCard
                    items={products}
                    quantities={quantities}
                    onQuantityChange={handleQuantityChange}
                    onClearOrder={handleClearOrder}
                    recentlyAddedId={recentlyAddedId}
                    cartBounce={cartBounce}
                    themeId={effectiveThemeId}
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
                    themeId={effectiveThemeId}
                  />
                </section>
              </div>
            </div>

            {/* 🌟 MGA SUKI FAVORITE COMBOS & BRAND STORY SECTION */}
            <BrandStoryAndSuki
              products={products}
              onAddCombo={handleAddCombo}
              isOrdersClosed={isOrdersClosed}
              themeId={effectiveThemeId}
            />
          </div>
        )}
      </main>

      {/* Mobile Sticky Quick-Action Bar */}
      {currentView === 'order' && totalPacks > 0 && (
        <div className={`fixed bottom-0 left-0 right-0 z-30 ${currentTheme?.stickyBarBg || 'bg-[#1F1025]/95 border-t-2 border-[#FF6B00]'} backdrop-blur-md px-4 py-3 shadow-2xl lg:hidden animate-fade-in flex items-center justify-between gap-3`}>
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="text-left cursor-pointer active:opacity-80 transition-opacity min-w-0"
            title="View Order Summary"
          >
            <div className="text-[11px] font-extrabold text-amber-200 flex items-center gap-1.5 flex-wrap">
              <span className={`px-2 py-0.5 rounded-full ${currentTheme?.cartPillBg || 'bg-[#FF6B00] text-white border border-amber-300'}`}>
                {effectiveThemeId === 'christmas' ? '🎄' : effectiveThemeId === 'thanksgiving' ? '🍂' : effectiveThemeId === 'new-year' ? '✨' : effectiveThemeId === 'chinese-new-year' ? '🧧' : effectiveThemeId === 'valentines-day' ? '💘' : '🎃'} {totalPacks} tub{totalPacks > 1 ? 's' : ''}
              </span>
              {cutoffInfo?.isOpen && cutoffInfo?.enabled && (
                <span className={`text-[10px] font-bold text-amber-300 ${currentTheme?.headerNavBg || 'bg-[#2B1B30] border border-[#FF6B00]/60'} px-1.5 py-0.5 rounded`}>
                  ⏰ {cutoffInfo.cutoffTime || '23:59'}
                </span>
              )}
            </div>
            <div className="font-display text-lg font-bold text-white flex items-center gap-1.5 mt-0.5">
              <span>{formatPHP(subtotal)}</span>
              <span className="font-sans text-[11px] text-amber-300 font-extrabold underline">View Basket</span>
            </div>
          </button>
          {isOrdersClosed ? (
            <span className="px-3.5 py-2.5 rounded-xl bg-red-950 text-red-200 font-display font-bold text-xs border-2 border-red-500/60 flex items-center gap-1 shrink-0">
              <Lock className="w-3.5 h-3.5" /> Orders Closed
            </span>
          ) : (
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('customer-info-section');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={`px-4 py-2.5 rounded-2xl ${currentTheme?.primaryBtn || 'bg-[#FF6B00] hover:bg-amber-400 text-white border-2 border-amber-300 shadow-snack-sm'} font-display font-bold text-xs sm:text-sm active:translate-y-0.5 flex items-center gap-1.5 cursor-pointer shrink-0`}
            >
              <span>{currentTheme?.mobileCheckoutText || 'Checkout Now 🎃'}</span>
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
        themeId={effectiveThemeId}
      />

      {/* Order Confirmation Modal */}
      {confirmedOrder && (
        <OrderConfirmationModal
          order={confirmedOrder}
          onReset={handleResetForNewOrder}
          customQrs={customQrs}
          themeId={effectiveThemeId}
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
