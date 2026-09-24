import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, RefreshCw, Search, Calendar, 
  Settings, ExternalLink, Plus, Edit2, Edit3, Check, Package, DollarSign, QrCode, Upload, Copy, Phone, MapPin, CreditCard,
  Clock, Lock, CheckCircle2, AlertTriangle, LogOut, User, Power, BarChart3, TrendingUp, CalendarRange, Filter, X
} from 'lucide-react';
import { formatPHP } from '../config/products';
import { DEFAULT_APPS_SCRIPT_URL, DEFAULT_SPREADSHEET_ID } from '../config/sheetsConfig';
import { DEFAULT_PAYMENT_METHODS, PAYMENT_METHOD_METADATA } from '../config/paymentConfig';

// Asia/Manila (PHT, UTC+8) Date Preset Helpers
const getManilaTodayObj = () => {
  const now = new Date();
  const manilaStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila' }).format(now);
  const [y, m, d] = manilaStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

const formatUtcYMD = (utcDate) => {
  const y = utcDate.getUTCFullYear();
  const m = String(utcDate.getUTCMonth() + 1).padStart(2, '0');
  const d = String(utcDate.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getPresetDateRange = (preset) => {
  if (preset === 'all-time') {
    return { start: '', end: '' };
  }
  const todayObj = getManilaTodayObj();
  const todayStr = formatUtcYMD(todayObj);

  switch (preset) {
    case 'all-time':
      return { start: '', end: '' };

    case 'today':
      return { start: todayStr, end: todayStr };

    case 'yesterday': {
      const yestObj = new Date(todayObj.getTime() - 86400000);
      const yestStr = formatUtcYMD(yestObj);
      return { start: yestStr, end: yestStr };
    }

    case 'this-week': {
      // Monday to Sunday of the current week in Manila
      const dayOfWeek = todayObj.getUTCDay();
      const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monObj = new Date(todayObj.getTime() + diffToMon * 86400000);
      const sunObj = new Date(monObj.getTime() + 6 * 86400000);
      return { start: formatUtcYMD(monObj), end: formatUtcYMD(sunObj) };
    }

    case 'last-week': {
      // Monday to Sunday of the previous week
      const dayOfWeek = todayObj.getUTCDay();
      const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const thisMonObj = new Date(todayObj.getTime() + diffToMon * 86400000);
      const lastMonObj = new Date(thisMonObj.getTime() - 7 * 86400000);
      const lastSunObj = new Date(thisMonObj.getTime() - 1 * 86400000);
      return { start: formatUtcYMD(lastMonObj), end: formatUtcYMD(lastSunObj) };
    }

    case 'this-month': {
      const year = todayObj.getUTCFullYear();
      const month = todayObj.getUTCMonth();
      const startStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const nextMonthObj = new Date(Date.UTC(year, month + 1, 1));
      const endObj = new Date(nextMonthObj.getTime() - 86400000);
      return { start: startStr, end: formatUtcYMD(endObj) };
    }

    case 'last-month': {
      const year = todayObj.getUTCFullYear();
      const month = todayObj.getUTCMonth();
      const lastMonthObj = new Date(Date.UTC(year, month - 1, 1));
      const lmYear = lastMonthObj.getUTCFullYear();
      const lmMonth = lastMonthObj.getUTCMonth();
      const startStr = `${lmYear}-${String(lmMonth + 1).padStart(2, '0')}-01`;
      const thisMonthObj = new Date(Date.UTC(year, month, 1));
      const endObj = new Date(thisMonthObj.getTime() - 86400000);
      return { start: startStr, end: formatUtcYMD(endObj) };
    }

    default:
      return { start: todayStr, end: todayStr };
  }
};

const formatDateDisplay = (dateStr) => {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const [y, m, d] = parts.map(Number);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return dateStr;
    const dateObj = new Date(Date.UTC(y, m - 1, d));
    if (isNaN(dateObj.getTime())) return dateStr;
    return dateObj.toLocaleDateString('en-US', {
      timeZone: 'UTC',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
};

const FLAVOR_THEME = {
  salted: { bar: 'bg-amber-500', text: 'text-amber-800', light: 'bg-amber-50', border: 'border-amber-200' },
  unsalted: { bar: 'bg-stone-500', text: 'text-stone-800', light: 'bg-stone-50', border: 'border-stone-200' },
  spicy: { bar: 'bg-red-500', text: 'text-red-800', light: 'bg-red-50', border: 'border-red-200' },
  bbq: { bar: 'bg-orange-600', text: 'text-orange-800', light: 'bg-orange-50', border: 'border-orange-200' },
  'sour-cream': { bar: 'bg-teal-500', text: 'text-teal-800', light: 'bg-teal-50', border: 'border-teal-200' },
  cheese: { bar: 'bg-yellow-500', text: 'text-yellow-800', light: 'bg-yellow-50', border: 'border-yellow-200' },
  'bawang-only': { bar: 'bg-purple-600', text: 'text-purple-800', light: 'bg-purple-50', border: 'border-purple-200' }
};

const PRESET_OPTIONS = [
  { id: 'all-time', label: 'All Time (Master List)' },
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'this-week', label: 'This Week' },
  { id: 'last-week', label: 'Last Week' },
  { id: 'this-month', label: 'This Month' },
  { id: 'last-month', label: 'Last Month' },
  { id: 'custom', label: 'Custom Range' },
];

export default function AdminPortal({ 
  products, 
  onUpdateProducts, 
  customQrs, 
  onUpdateQrs, 
  paymentMethods = DEFAULT_PAYMENT_METHODS,
  onUpdatePaymentMethods,
  adminToken, 
  adminUser, 
  onLogout,
  cutoffInfo,
  onRefreshCutoff,
  activeTab: controlledTab,
  onTabChange
}) {
  const [internalTab, setInternalTab] = useState('cutoff');
  const activeTab = controlledTab || internalTab;

  const handleTabClick = (tabId) => {
    setInternalTab(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
  };
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [dailySummary, setDailySummary] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [updatingPaymentId, setUpdatingPaymentId] = useState(null);

  // Order Summary (Date Range Analytics) State
  const initialPreset = 'all-time';
  const initialRange = getPresetDateRange(initialPreset);
  const [summaryPreset, setSummaryPreset] = useState(initialPreset);
  const [summaryStartDate, setSummaryStartDate] = useState(initialRange.start);
  const [summaryEndDate, setSummaryEndDate] = useState(initialRange.end);

  // Cutoff Form State
  const [cutoffEnabled, setCutoffEnabled] = useState(cutoffInfo?.enabled || false);
  const [cutoffDate, setCutoffDate] = useState(cutoffInfo?.cutoffDate || '');
  const [cutoffTime, setCutoffTime] = useState(cutoffInfo?.cutoffTime || '23:59');
  const [deliveryDay, setDeliveryDay] = useState(cutoffInfo?.deliveryDay || 'Wednesday');
  const [isSavingCutoff, setIsSavingCutoff] = useState(false);
  const [cutoffSaveMsg, setCutoffSaveMsg] = useState({ msg: '', type: '' });

  // Sync cutoff local form when cutoffInfo prop updates
  useEffect(() => {
    if (cutoffInfo) {
      setCutoffEnabled(Boolean(cutoffInfo.enabled));
      if (cutoffInfo.cutoffDate) setCutoffDate(cutoffInfo.cutoffDate);
      if (cutoffInfo.cutoffTime) setCutoffTime(cutoffInfo.cutoffTime);
      if (cutoffInfo.deliveryDay) setDeliveryDay(cutoffInfo.deliveryDay);
    }
  }, [cutoffInfo]);

  const [settings, setSettings] = useState({
    spreadsheetId: localStorage.getItem('mani_spreadsheet_id') || DEFAULT_SPREADSHEET_ID || '',
    appsScriptUrl: localStorage.getItem('mani_apps_script_url') || DEFAULT_APPS_SCRIPT_URL || ''
  });
  const [settingsStatus, setSettingsStatus] = useState({ msg: '', type: '' });
  const [isTestingSheet, setIsTestingSheet] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // QR Edit State
  const [localGcashNum, setLocalGcashNum] = useState(customQrs?.gcashNumber || '09055182263');
  const [qrSaveMsg, setQrSaveMsg] = useState('');

  // Product edit state
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [tempPrice, setTempPrice] = useState('');
  const [newFlavorName, setNewFlavorName] = useState('');
  const [newFlavorPrice, setNewFlavorPrice] = useState('50');
  const [newFlavorDesc, setNewFlavorDesc] = useState('');

  // Product details editing state (Name & Description modal)
  const [editingProduct, setEditingProduct] = useState(null);
  const [editProductName, setEditProductName] = useState('');
  const [editProductDesc, setEditProductDesc] = useState('');
  const [editProductError, setEditProductError] = useState('');
  const [productSaveMsg, setProductSaveMsg] = useState({ msg: '', type: '' });

  // Mode of Payment Availability state & handlers
  const [paymentSaveMsg, setPaymentSaveMsg] = useState({ msg: '', type: '' });

  const handleTogglePaymentMethod = (id) => {
    const currentStatus = paymentMethods[id] !== false;
    const updated = {
      ...paymentMethods,
      [id]: !currentStatus
    };
    if (onUpdatePaymentMethods) {
      onUpdatePaymentMethods(updated);
    }
    const target = PAYMENT_METHOD_METADATA.find((p) => p.id === id);
    const newStatusLabel = !currentStatus ? 'Enabled' : 'Disabled';
    setPaymentSaveMsg({
      msg: `${target?.name || id} is now ${newStatusLabel}.`,
      type: 'success'
    });
    setTimeout(() => {
      setPaymentSaveMsg({ msg: '', type: '' });
    }, 4000);
  };

  const handleBulkPaymentMethods = (enable) => {
    const updated = {
      cod: enable,
      maribank: enable,
      gcash: enable
    };
    if (onUpdatePaymentMethods) {
      onUpdatePaymentMethods(updated);
    }
    setPaymentSaveMsg({
      msg: enable ? 'All payment methods enabled successfully.' : 'All payment methods disabled.',
      type: enable ? 'success' : 'info'
    });
    setTimeout(() => {
      setPaymentSaveMsg({ msg: '', type: '' });
    }, 4000);
  };

  const STATUS_CONFIG = {
    New: { label: 'New', color: 'bg-amber-100 text-amber-900 border-amber-300', dot: '🟡' },
    Confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-900 border-blue-300', dot: '🔵' },
    Preparing: { label: 'Preparing', color: 'bg-orange-100 text-orange-900 border-orange-300', dot: '🟠' },
    Ready: { label: 'Ready', color: 'bg-purple-100 text-purple-900 border-purple-300', dot: '🟣' },
    Completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-900 border-emerald-300', dot: '🟢' },
    Cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-900 border-red-300', dot: '🔴' },
  };

  const getAuthHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    if (adminToken) {
      headers['Authorization'] = `Bearer ${adminToken}`;
    }
    return headers;
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    let ordersFetched = false;
    try {
      let url = '/api/orders';
      const params = new URLSearchParams();
      if (selectedDate) params.append('date', selectedDate);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url, { headers: getAuthHeaders() });
      if (res.status === 401) {
        onLogout();
        return;
      }
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data && data.orders) {
          setOrders(data.orders);
          if (Array.isArray(data.allOrders)) {
            setAllOrders(data.allOrders);
          } else {
            setAllOrders((prev) => (prev.length > 0 ? prev : data.orders));
          }
          setDailySummary(data.dailySummary);
          if (!selectedDate && data.todayDate) {
            setSelectedDate(data.todayDate);
          }
          ordersFetched = true;
          return;
        }
      }
    } catch (e) {
      console.warn('Backend /api/orders fetch error:', e.message);
    }

    // Google Apps Script Cloud fallback for GitHub Pages (Desktop & Mobile)
    if (!ordersFetched) {
      const appsUrl = (settings.appsScriptUrl || localStorage.getItem('mani_apps_script_url') || DEFAULT_APPS_SCRIPT_URL || '').trim();
      if (appsUrl) {
        try {
          const qDate = selectedDate || '';
          const res = await fetch(`${appsUrl}?action=getOrders&date=${encodeURIComponent(qDate)}`, { mode: 'cors' });
          if (res.ok) {
            const cloudData = await res.json();
            if (cloudData && cloudData.success && Array.isArray(cloudData.orders)) {
              let filtered = cloudData.orders;
              if (statusFilter && statusFilter !== 'all') {
                filtered = filtered.filter(o => o.status === statusFilter);
              }
              setOrders(filtered);
              if (!qDate || allOrders.length === 0) {
                setAllOrders(cloudData.orders);
              }
              if (cloudData.dailySummary) {
                setDailySummary(cloudData.dailySummary);
              }
              if (!selectedDate && cloudData.todayDate) {
                setSelectedDate(cloudData.todayDate);
              }
              ordersFetched = true;
              return;
            }
          }
        } catch (cloudErr) {
          // JSONP fallback for mobile browsers
          try {
            const cbName = `mani_orders_${Date.now()}`;
            const script = document.createElement('script');
            const qDate = selectedDate || '';
            window[cbName] = (cloudData) => {
              if (cloudData && cloudData.success && Array.isArray(cloudData.orders)) {
                let filtered = cloudData.orders;
                if (statusFilter && statusFilter !== 'all') {
                  filtered = filtered.filter(o => o.status === statusFilter);
                }
                setOrders(filtered);
                if (!qDate || allOrders.length === 0) {
                  setAllOrders(cloudData.orders);
                }
                if (cloudData.dailySummary) {
                  setDailySummary(cloudData.dailySummary);
                }
                if (!selectedDate && cloudData.todayDate) {
                  setSelectedDate(cloudData.todayDate);
                }
              }
              delete window[cbName];
              script.remove();
            };
            script.src = `${appsUrl}?action=getOrders&date=${encodeURIComponent(qDate)}&callback=${cbName}`;
            script.onerror = () => {
              delete window[cbName];
              script.remove();
            };
            document.head.appendChild(script);
            ordersFetched = true;
          } catch (jpErr) {}
        }
      }
    }

    if (!ordersFetched) {
      const local = JSON.parse(localStorage.getItem('mani_orders') || '[]');
      setOrders(local);
      if (allOrders.length === 0) {
        setAllOrders(local);
      }
    }
    setIsLoading(false);
  };

  const fetchAllOrders = async () => {
    let fetched = false;
    try {
      const res = await fetch('/api/orders', { headers: getAuthHeaders() });
      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (data) {
            const list = Array.isArray(data.allOrders) && data.allOrders.length > 0 
              ? data.allOrders 
              : (Array.isArray(data.orders) ? data.orders : []);
            if (list.length > 0) {
              setAllOrders(list);
              fetched = true;
            }
          }
        }
      }
    } catch (e) {}

    // Cloud fallback to Google Apps Script Master list for GitHub Pages / static
    if (!fetched) {
      const appsUrl = (settings.appsScriptUrl || localStorage.getItem('mani_apps_script_url') || DEFAULT_APPS_SCRIPT_URL || '').trim();
      if (appsUrl) {
        try {
          const res = await fetch(`${appsUrl}?action=getOrders`, { mode: 'cors' });
          if (res.ok) {
            const cloudData = await res.json();
            if (cloudData && cloudData.success && Array.isArray(cloudData.orders)) {
              setAllOrders(cloudData.orders);
              fetched = true;
            }
          }
        } catch (cloudErr) {
          // JSONP fallback
          try {
            const cbName = `mani_all_orders_${Date.now()}`;
            const script = document.createElement('script');
            window[cbName] = (cloudData) => {
              if (cloudData && cloudData.success && Array.isArray(cloudData.orders)) {
                setAllOrders(cloudData.orders);
              }
              delete window[cbName];
              script.remove();
            };
            script.src = `${appsUrl}?action=getOrders&callback=${cbName}`;
            script.onerror = () => {
              delete window[cbName];
              script.remove();
            };
            document.head.appendChild(script);
            fetched = true;
          } catch (jpErr) {}
        }
      }
    }

    if (!fetched) {
      const local = JSON.parse(localStorage.getItem('mani_orders') || '[]');
      if (local.length > 0) {
        setAllOrders(local);
      }
    }
  };

  // Order Summary Presets & Calculations
  const handleSelectPreset = (presetId) => {
    setSummaryPreset(presetId);
    if (presetId !== 'custom') {
      const range = getPresetDateRange(presetId);
      setSummaryStartDate(range.start);
      setSummaryEndDate(range.end);
    }
  };

  // Active non-cancelled orders filtered by inclusive date range
  const activeOrdersForSummary = useMemo(() => {
    const source = allOrders.length > 0 ? allOrders : orders;
    const seenKeys = new Set();
    return source.filter((o, idx) => {
      // Use composite unique key so distinct orders sharing an orderId prefix are NOT dropped
      const uniqueKey = o.id || `${o.orderId || 'ord'}_${o.orderDate || ''}_${o.orderTime || ''}_${o.customerName || ''}_${o.subtotal || o.totalAmount || 0}_${idx}`;
      if (seenKeys.has(uniqueKey)) return false;
      seenKeys.add(uniqueKey);

      // Exclude cancelled orders from summary totals
      if ((o.status || '').toLowerCase() === 'cancelled') return false;

      // Inclusive date range filter
      const orderDate = o.orderDate || '';
      if (summaryStartDate && orderDate < summaryStartDate) return false;
      if (summaryEndDate && orderDate > summaryEndDate) return false;

      return true;
    });
  }, [allOrders, orders, summaryStartDate, summaryEndDate]);

  // High-level KPI metrics
  const summaryKpis = useMemo(() => {
    const totalOrders = activeOrdersForSummary.length;
    const totalTubs = activeOrdersForSummary.reduce((sum, o) => {
      const tubs = o.totalTubs !== undefined ? Number(o.totalTubs) : (Number(o.totalPacks) || 0);
      return sum + (isNaN(tubs) ? 0 : tubs);
    }, 0);
    const totalRevenue = activeOrdersForSummary.reduce((sum, o) => {
      const rev = Number(o.subtotal) || Number(o.totalAmount) || 0;
      return sum + (isNaN(rev) ? 0 : rev);
    }, 0);

    return { totalOrders, totalTubs, totalRevenue };
  }, [activeOrdersForSummary]);

  // Detailed breakdown per flavor (including 0-order flavors & availability)
  const flavorStats = useMemo(() => {
    const map = {};

    // 1. Seed with catalog products
    products.forEach((p) => {
      map[p.id] = {
        id: p.id,
        name: p.name,
        icon: p.icon || '🥜',
        available: p.available !== false,
        price: Number(p.price) || (p.id === 'bawang-only' ? 60 : 50),
        quantity: 0,
        sales: 0
      };
    });

    // 2. Aggregate quantities and sales from matching orders
    activeOrdersForSummary.forEach((o) => {
      if (Array.isArray(o.items) && o.items.length > 0) {
        o.items.forEach((it) => {
          const id = it.id || it.productId || it.name?.toLowerCase().replace(/\s+/g, '-');
          const q = Number(it.quantity) || 0;
          const defaultPrice = id === 'bawang-only' ? 60 : (map[id]?.price || 50);
          const p = Number(it.price) || defaultPrice;
          if (!map[id]) {
            map[id] = {
              id,
              name: it.name || id,
              icon: '🥜',
              available: true,
              price: p,
              quantity: 0,
              sales: 0
            };
          }
          map[id].quantity += q;
          map[id].sales += q * p;
        });
      } else if (o.flavorQuantities) {
        Object.entries(o.flavorQuantities).forEach(([flavorId, qty]) => {
          const q = Number(qty) || 0;
          if (q > 0) {
            const unitPrice = flavorId === 'bawang-only' ? 60 : (map[flavorId]?.price || 50);
            if (!map[flavorId]) {
              map[flavorId] = {
                id: flavorId,
                name: flavorId.charAt(0).toUpperCase() + flavorId.slice(1).replace(/-/g, ' '),
                icon: '🥜',
                available: true,
                price: unitPrice,
                quantity: 0,
                sales: 0
              };
            }
            map[flavorId].quantity += q;
            map[flavorId].sales += q * unitPrice;
          }
        });
      }
    });

    const list = Object.values(map);
    const totalTubsCount = list.reduce((sum, f) => sum + f.quantity, 0);

    return list.map((f) => ({
      ...f,
      sharePercent: totalTubsCount > 0 ? ((f.quantity / totalTubsCount) * 100).toFixed(1) : '0.0'
    }));
  }, [products, activeOrdersForSummary]);

  const distinctFlavorsOrdered = useMemo(() => {
    return flavorStats.filter((f) => f.quantity > 0).length;
  }, [flavorStats]);

  const maxChartQty = useMemo(() => {
    return Math.max(...flavorStats.map((f) => f.quantity), 1);
  }, [flavorStats]);

  const chartFlavors = useMemo(() => {
    return [...flavorStats].sort((a, b) => b.quantity - a.quantity);
  }, [flavorStats]);

  const rangeDaysCount = useMemo(() => {
    if (!summaryStartDate || !summaryEndDate) return 0;
    try {
      const parts1 = summaryStartDate.split('-');
      const parts2 = summaryEndDate.split('-');
      if (parts1.length !== 3 || parts2.length !== 3) return 1;
      const [y1, m1, d1] = parts1.map(Number);
      const [y2, m2, d2] = parts2.map(Number);
      if (isNaN(y1) || isNaN(m1) || isNaN(d1) || isNaN(y2) || isNaN(m2) || isNaN(d2)) return 1;
      const t1 = Date.UTC(y1, m1 - 1, d1);
      const t2 = Date.UTC(y2, m2 - 1, d2);
      const diff = Math.round((t2 - t1) / 86400000) + 1;
      return diff > 0 ? diff : 1;
    } catch (e) {
      return 1;
    }
  }, [summaryStartDate, summaryEndDate]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings', { headers: getAuthHeaders() });
      if (res.status === 401) {
        onLogout();
        return;
      }
      const data = await res.json();
      if (data) {
        const sid = data.spreadsheetId || localStorage.getItem('mani_spreadsheet_id') || DEFAULT_SPREADSHEET_ID || '';
        const aurl = data.appsScriptUrl || localStorage.getItem('mani_apps_script_url') || DEFAULT_APPS_SCRIPT_URL || '';
        setSettings({
          spreadsheetId: sid,
          appsScriptUrl: aurl
        });
        if (sid) localStorage.setItem('mani_spreadsheet_id', sid);
        if (aurl) localStorage.setItem('mani_apps_script_url', aurl);
      }
    } catch (e) {
      setSettings({
        spreadsheetId: localStorage.getItem('mani_spreadsheet_id') || DEFAULT_SPREADSHEET_ID || '',
        appsScriptUrl: localStorage.getItem('mani_apps_script_url') || DEFAULT_APPS_SCRIPT_URL || ''
      });
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchAllOrders();
    fetchSettings();
  }, [selectedDate, statusFilter]);

  useEffect(() => {
    if (activeTab === 'order-summary') {
      fetchAllOrders();
    }
  }, [activeTab]);

  // Handle Flavor Availability Toggle
  const handleToggleFlavorAvailability = async (id) => {
    const updated = products.map((p) =>
      p.id === id ? { ...p, available: p.available === false ? true : false } : p
    );
    onUpdateProducts(updated);

    const availabilityMap = {};
    updated.forEach(p => {
      availabilityMap[p.id] = p.available !== false;
    });

    localStorage.setItem('mani_products', JSON.stringify(updated));
    localStorage.setItem('mani_flavor_availability', JSON.stringify(availabilityMap));

    // Fast sync to Express backend
    try {
      await fetch('/api/admin/flavor-availability', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ flavorAvailability: availabilityMap })
      });
    } catch (e) {}

    // Cloud sync to Google Apps Script Web App
    const appsUrl = (settings.appsScriptUrl || localStorage.getItem('mani_apps_script_url') || DEFAULT_APPS_SCRIPT_URL || '').trim();
    if (appsUrl) {
      fetch(appsUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'saveSettings',
          settings: {
            products: updated,
            flavorAvailability: availabilityMap
          }
        })
      }).catch(() => {});
    }
  };

  const handleBulkFlavorAvailability = async (setAllToAvailable) => {
    const updated = products.map(p => ({ ...p, available: setAllToAvailable }));
    onUpdateProducts(updated);

    const availabilityMap = {};
    updated.forEach(p => {
      availabilityMap[p.id] = setAllToAvailable;
    });

    localStorage.setItem('mani_products', JSON.stringify(updated));
    localStorage.setItem('mani_flavor_availability', JSON.stringify(availabilityMap));

    try {
      await fetch('/api/admin/flavor-availability', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ flavorAvailability: availabilityMap })
      });
    } catch (e) {}

    const appsUrl = (settings.appsScriptUrl || localStorage.getItem('mani_apps_script_url') || DEFAULT_APPS_SCRIPT_URL || '').trim();
    if (appsUrl) {
      fetch(appsUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'saveSettings',
          settings: {
            products: updated,
            flavorAvailability: availabilityMap
          }
        })
      }).catch(() => {});
    }
  };

  // Handle Cutoff & Delivery Day Save with Cross-Device Cloud Sync
  const handleSaveCutoffSettings = async (e) => {
    e.preventDefault();

    if (cutoffEnabled && (!cutoffDate || !cutoffTime)) {
      setCutoffSaveMsg({ msg: 'Please select both a cutoff date and time.', type: 'error' });
      return;
    }

    const currentDelivery = (deliveryDay || 'Wednesday').trim();
    const confirmMsg = cutoffEnabled
      ? `Are you sure you want to set the order cutoff to ${cutoffDate} at ${cutoffTime} with delivery on ${currentDelivery}? Orders will automatically close once this time is reached.`
      : `Are you sure you want to DISABLE the cutoff timer? Order submissions will remain open continuously with delivery on ${currentDelivery}.`;

    if (!window.confirm(confirmMsg)) {
      return;
    }

    setIsSavingCutoff(true);
    setCutoffSaveMsg({ msg: '', type: '' });

    const availabilityMap = {};
    products.forEach(p => {
      availabilityMap[p.id] = p.available !== false;
    });

    // 1. Try local Express backend if running
    try {
      const res = await fetch('/api/admin/cutoff', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          enabled: cutoffEnabled,
          date: cutoffDate,
          time: cutoffTime,
          deliveryDay: currentDelivery,
          flavorAvailability: availabilityMap
        })
      });

      if (res.status === 401) {
        onLogout();
        setIsSavingCutoff(false);
        return;
      }
    } catch (err) {}

    // 2. Synchronize to Google Apps Script cloud (Shared across Desktop & Mobile)
    const appsUrl = (settings.appsScriptUrl || localStorage.getItem('mani_apps_script_url') || DEFAULT_APPS_SCRIPT_URL || '').trim();
    if (appsUrl) {
      // POST sync
      fetch(appsUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'saveSettings',
          settings: {
            cutoff: {
              enabled: cutoffEnabled,
              date: cutoffDate,
              time: cutoffTime,
              deliveryDay: currentDelivery
            },
            deliveryDay: currentDelivery,
            products,
            flavorAvailability: availabilityMap
          }
        })
      }).catch(() => {});

      // GET sync fast-path
      fetch(`${appsUrl}?action=saveCutoff&enabled=${cutoffEnabled}&date=${encodeURIComponent(cutoffDate)}&time=${encodeURIComponent(cutoffTime)}&deliveryDay=${encodeURIComponent(currentDelivery)}`, {
        mode: 'no-cors'
      }).catch(() => {});
    }

    // 3. Update localStorage cache
    localStorage.setItem('mani_cutoff_settings', JSON.stringify({
      enabled: cutoffEnabled,
      date: cutoffDate,
      time: cutoffTime,
      deliveryDay: currentDelivery,
      flavorAvailability: availabilityMap
    }));

    if (onRefreshCutoff) onRefreshCutoff();

    setCutoffSaveMsg({ msg: 'Cutoff and Delivery Day settings saved & synchronized across desktop & mobile devices!', type: 'success' });
    setTimeout(() => setCutoffSaveMsg({ msg: '', type: '' }), 4000);
    setIsSavingCutoff(false);
  };

  const handleUpdateStatus = async (orderId, newStatus, orderDate) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      if (res.status === 401) {
        onLogout();
        return;
      }
    } catch (e) {}

    // Cloud sync to Google Sheets via Apps Script Web App
    const appsUrl = (settings.appsScriptUrl || localStorage.getItem('mani_apps_script_url') || DEFAULT_APPS_SCRIPT_URL || '').trim();
    if (appsUrl) {
      const target = orders.find(o => o.orderId === orderId);
      const dateStr = orderDate || (target ? target.orderDate : '') || '';
      fetch(`${appsUrl}?action=updateStatus&orderId=${encodeURIComponent(orderId)}&orderDate=${encodeURIComponent(dateStr)}&status=${encodeURIComponent(newStatus)}`, {
        mode: 'no-cors'
      }).catch(() => {});
    }

    const local = JSON.parse(localStorage.getItem('mani_orders') || '[]');
    const updated = local.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o);
    localStorage.setItem('mani_orders', JSON.stringify(updated));
    setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));
    setAllOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));
    setUpdatingOrderId(null);
  };

  const handleUpdatePaymentStatus = async (orderId, newPaymentStatus, orderDate) => {
    setUpdatingPaymentId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/payment-status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ paymentStatus: newPaymentStatus })
      });
      if (res.status === 401) {
        onLogout();
        return;
      }
    } catch (e) {}

    // Cloud sync to Google Sheets via Apps Script Web App
    const appsUrl = (settings.appsScriptUrl || localStorage.getItem('mani_apps_script_url') || DEFAULT_APPS_SCRIPT_URL || '').trim();
    if (appsUrl) {
      const target = orders.find(o => o.orderId === orderId);
      const dateStr = orderDate || (target ? target.orderDate : '') || '';
      fetch(`${appsUrl}?action=updatePaymentStatus&orderId=${encodeURIComponent(orderId)}&orderDate=${encodeURIComponent(dateStr)}&paymentStatus=${encodeURIComponent(newPaymentStatus)}`, {
        mode: 'no-cors'
      }).catch(() => {});
    }

    const local = JSON.parse(localStorage.getItem('mani_orders') || '[]');
    const updated = local.map(o => o.orderId === orderId ? { ...o, paymentStatus: newPaymentStatus } : o);
    localStorage.setItem('mani_orders', JSON.stringify(updated));
    setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, paymentStatus: newPaymentStatus } : o));
    setAllOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, paymentStatus: newPaymentStatus } : o));
    setUpdatingPaymentId(null);
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    const cleanUrl = (settings.appsScriptUrl || '').trim();
    const cleanId = (settings.spreadsheetId || '').trim();

    localStorage.setItem('mani_apps_script_url', cleanUrl);
    localStorage.setItem('mani_spreadsheet_id', cleanId);

    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ appsScriptUrl: cleanUrl, spreadsheetId: cleanId })
      });
    } catch (e) {}

    setSettingsStatus({ msg: 'Integration settings saved securely on backend & browser cache!', type: 'success' });
    setTimeout(() => setSettingsStatus({ msg: '', type: '' }), 4000);
  };

  const handleTestConnection = async () => {
    const urlToTest = (settings.appsScriptUrl || '').trim();
    if (!urlToTest) {
      setSettingsStatus({ msg: 'Please enter a Google Apps Script Web App URL first.', type: 'error' });
      return;
    }
    setIsTestingSheet(true);
    setSettingsStatus({ msg: 'Testing connection to Google Apps Script...', type: 'info' });
    try {
      const res = await fetch(urlToTest, { method: 'GET', mode: 'cors' });
      const data = await res.json();
      if (data && data.status === 'ok') {
        setSettingsStatus({ msg: `✅ Connection verified! Server time: ${data.serverTime}`, type: 'success' });
      } else {
        setSettingsStatus({ msg: '✅ Web App reachable! Ready to record orders.', type: 'success' });
      }
    } catch (err) {
      setSettingsStatus({ msg: 'ℹ️ Endpoint registered.', type: 'info' });
    } finally {
      setIsTestingSheet(false);
    }
  };

  const handleToggleProduct = (id) => {
    const updated = products.map((p) =>
      p.id === id ? { ...p, available: p.available === false ? true : false } : p
    );
    onUpdateProducts(updated);
  };

  const handleSavePrice = (id) => {
    const pVal = parseFloat(tempPrice);
    if (isNaN(pVal) || pVal < 0) return;
    const updated = products.map((p) => (p.id === id ? { ...p, price: pVal } : p));
    onUpdateProducts(updated);
    setEditingPriceId(null);
  };

  const handleStartEditProduct = (product) => {
    setEditingProduct(product);
    setEditProductName(product.name || '');
    setEditProductDesc(product.description || '');
    setEditProductError('');
  };

  const handleCancelEditProduct = () => {
    setEditingProduct(null);
    setEditProductName('');
    setEditProductDesc('');
    setEditProductError('');
  };

  const handleSaveEditProduct = (e) => {
    if (e) e.preventDefault();
    const trimmedName = editProductName.trim();
    if (!trimmedName) {
      setEditProductError('Product Name cannot be empty.');
      return;
    }

    if (!editingProduct) return;

    const updated = products.map((p) =>
      p.id === editingProduct.id
        ? {
            ...p,
            name: trimmedName,
            description: editProductDesc.trim()
          }
        : p
    );

    onUpdateProducts(updated);
    setEditingProduct(null);
    setEditProductName('');
    setEditProductDesc('');
    setEditProductError('');

    setProductSaveMsg({ msg: 'Product updated successfully.', type: 'success' });
    setTimeout(() => {
      setProductSaveMsg({ msg: '', type: '' });
    }, 4000);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && editingProduct) {
        handleCancelEditProduct();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingProduct]);

  const handleAddNewFlavor = (e) => {
    e.preventDefault();
    if (!newFlavorName.trim()) return;
    const newId = newFlavorName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const newProd = {
      id: newId,
      name: newFlavorName.trim(),
      price: parseFloat(newFlavorPrice) || 50,
      description: newFlavorDesc.trim() || 'New artisanal roasted flavor.',
      icon: '🥜',
      badge: 'New',
      available: true
    };
    onUpdateProducts([...products, newProd]);
    setNewFlavorName('');
    setNewFlavorPrice('50');
    setNewFlavorDesc('');
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      const updated = { ...customQrs, [type]: base64 };
      onUpdateQrs(updated);
      setQrSaveMsg(`✅ ${type === 'maribank' ? 'Maribank' : 'GCash'} QR code updated successfully!`);
      setTimeout(() => setQrSaveMsg(''), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveGcashNum = (e) => {
    e.preventDefault();
    const updated = { ...customQrs, gcashNumber: localGcashNum.trim() };
    onUpdateQrs(updated);
    setQrSaveMsg('✅ GCash contact number updated successfully!');
    setTimeout(() => setQrSaveMsg(''), 3000);
  };

  // Filter orders by search
  const displayOrders = orders.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (o.orderId || '').toLowerCase().includes(q) ||
      (o.customerName || '').toLowerCase().includes(q) ||
      (o.mobileNumber || '').toLowerCase().includes(q) ||
      (o.deliveryAddress || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-mani-200/90 shadow-warm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-600 to-mani-900 text-white flex items-center justify-center text-2xl shadow-md shadow-mani-900/10">
            <ShieldCheck className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-mani-950 tracking-tight">
                Admin Portal
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300/80">
                Authenticated
              </span>
            </div>
            <p className="text-xs sm:text-sm text-mani-600 font-medium">
              Signed in as: <span className="font-bold text-mani-900">{adminUser?.username || 'kvn000'}</span> • Business Timezone: <span className="font-bold text-mani-900">Asia/Manila (UTC+8)</span>
            </p>
          </div>
        </div>

        {/* Top Actions: Cutoff status badge & Logout */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Live Order Status Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-cream text-xs font-bold">
            <span className="text-mani-600 font-medium">Form Status:</span>
            {cutoffInfo?.status === 'CLOSED' ? (
              <span className="text-red-700 bg-red-100 px-2 py-0.5 rounded-lg border border-red-300">
                🔴 CLOSED
              </span>
            ) : cutoffInfo?.status === 'CUTOFF SCHEDULED' ? (
              <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-300">
                🟡 CUTOFF SCHEDULED
              </span>
            ) : (
              <span className="text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-300">
                🟢 OPEN
              </span>
            )}
          </div>

          <button
            onClick={onLogout}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-mani-200/80">
        {[
          { id: 'cutoff', label: '⏰ Cutoff & Availability', icon: Clock },
          { id: 'orders', label: '📦 Orders Manager', icon: Package },
          { id: 'order-summary', label: '📊 Order Summary', icon: BarChart3 },
          { id: 'summary', label: '📅 Daily Summary', icon: DollarSign },
          { id: 'products', label: '🥜 Products & Pricing', icon: Settings },
          { id: 'qrs', label: '💳 Payment Options & QRs', icon: CreditCard },
          { id: 'sheets', label: '⚙️ Integration', icon: ExternalLink }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-mani-900 text-amber-200 shadow-sm shadow-mani-900/10'
                  : 'text-mani-600 hover:text-mani-900 hover:bg-white/80'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* 1. ORDER CUTOFF & AVAILABILITY TAB                        */}
      {/* ========================================================= */}
      {activeTab === 'cutoff' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-mani-200/90 shadow-warm space-y-6">
            <div className="border-b border-mani-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-black text-mani-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  Order Form Availability & Cutoff Timer Settings
                </h3>
                <p className="text-xs sm:text-sm text-mani-600">
                  Control whether customers can place orders and schedule automatic end times.
                </p>
              </div>

              {/* Status Pill */}
              <div className="self-start sm:self-auto">
                {cutoffInfo?.status === 'CLOSED' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-100 text-red-800 border border-red-300">
                    <Lock className="w-3.5 h-3.5 text-red-600" /> CLOSED (Orders Blocked)
                  </span>
                ) : cutoffInfo?.status === 'CUTOFF SCHEDULED' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">
                    <Clock className="w-3.5 h-3.5 text-amber-600" /> CUTOFF SCHEDULED
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> OPEN (Accepting Orders)
                  </span>
                )}
              </div>
            </div>

            {/* Alert Message */}
            {cutoffSaveMsg.msg && (
              <div className={`p-4 rounded-2xl text-xs sm:text-sm font-bold border flex items-center gap-2 ${
                cutoffSaveMsg.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300' 
                  : 'bg-red-50 text-red-900 border-red-300'
              }`}>
                {cutoffSaveMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
                <span>{cutoffSaveMsg.msg}</span>
              </div>
            )}

            {/* Dashboard Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Form Status</span>
                <div className="text-xl sm:text-2xl font-black text-amber-950 mt-1">
                  {cutoffInfo?.isOpen ? '🟢 OPEN' : '🔴 CLOSED'}
                </div>
                <p className="text-[11px] text-mani-600 mt-1 font-medium">
                  {cutoffInfo?.isOpen ? 'Customers can currently submit orders.' : 'Submissions are blocked by server.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200">
                <span className="text-xs font-bold text-orange-800 uppercase tracking-wider">Cutoff Timer</span>
                <div className="text-xl sm:text-2xl font-black text-orange-950 mt-1">
                  {cutoffEnabled ? 'ENABLED' : 'DISABLED'}
                </div>
                <p className="text-[11px] text-mani-600 mt-1 font-medium">
                  {cutoffEnabled ? `Ending on ${cutoffDate} at ${cutoffTime}` : 'Form remains open continuously'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Delivery Day</span>
                <div className="text-xl sm:text-2xl font-black text-blue-950 mt-1 flex items-center gap-1.5 truncate">
                  <span className="text-xl">🚚</span>
                  <span className="truncate">{deliveryDay || 'Wednesday'}</span>
                </div>
                <p className="text-[11px] text-mani-600 mt-1 font-medium">
                  Displayed live in customer cutoff banners
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Timezone Standard</span>
                <div className="text-xl sm:text-2xl font-black text-emerald-950 mt-1">
                  Asia/Manila
                </div>
                <p className="text-[11px] text-mani-600 mt-1 font-medium">
                  Authoritative Philippine Time (PHT)
                </p>
              </div>
            </div>

            {/* Form Settings */}
            <form onSubmit={handleSaveCutoffSettings} className="space-y-6 pt-2">
              {/* Enable / Disable Switch */}
              <div className="p-4 rounded-2xl bg-cream border border-mani-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-black text-mani-900">Enable Order-Cutoff Timer</h4>
                  <p className="text-xs text-mani-600 font-medium">
                    When enabled, orders automatically close and reject submissions when the cutoff time arrives.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCutoffEnabled(!cutoffEnabled)}
                  className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    cutoffEnabled ? 'bg-amber-600' : 'bg-mani-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      cutoffEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Date, Time & Delivery Day Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-mani-800 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    Cutoff Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={cutoffDate}
                    onChange={(e) => setCutoffDate(e.target.value)}
                    disabled={!cutoffEnabled}
                    className="w-full text-sm px-4 py-2.5 rounded-xl border border-mani-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all disabled:opacity-50 disabled:bg-mani-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-mani-800 mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Cutoff Time (Philippine Time) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={cutoffTime}
                    onChange={(e) => setCutoffTime(e.target.value)}
                    disabled={!cutoffEnabled}
                    className="w-full text-sm px-4 py-2.5 rounded-xl border border-mani-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all disabled:opacity-50 disabled:bg-mani-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-mani-800 mb-1.5 flex items-center gap-1.5">
                    <span>🚚</span>
                    Delivery Day <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={deliveryDay}
                    onChange={(e) => setDeliveryDay(e.target.value)}
                    className="w-full text-sm px-4 py-2.5 rounded-xl border border-mani-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all bg-white font-bold text-mani-900 cursor-pointer shadow-2xs"
                  >
                    {[
                      'Monday',
                      'Tuesday',
                      'Wednesday',
                      'Thursday',
                      'Friday',
                      'Saturday',
                      'Sunday'
                    ].map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                    {!['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(deliveryDay) && deliveryDay && (
                      <option value={deliveryDay}>{deliveryDay}</option>
                    )}
                  </select>
                  <p className="text-[11px] text-mani-500 mt-1 font-medium">
                    Select the upcoming delivery day (Monday – Sunday).
                  </p>
                </div>
              </div>

              {/* Flavor Availability Section */}
              <div className="pt-4 border-t border-mani-200/80 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h4 className="text-sm font-black text-mani-900 flex items-center gap-2">
                      <span>🥜</span>
                      Flavor Availability Controls
                    </h4>
                    <p className="text-xs text-mani-600 font-medium">
                      Control whether each flavor can be selected on the customer order form. Unavailable flavors are disabled with an “Unavailable” badge.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleBulkFlavorAvailability(true)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      🟢 Enable All
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkFlavorAvailability(false)}
                      className="px-2.5 py-1 rounded-lg bg-red-50 text-red-800 border border-red-300 font-bold hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      🔴 Disable All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {products.map((p) => {
                    const isAvail = p.available !== false;
                    return (
                      <div
                        key={p.id}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isAvail
                            ? 'bg-white border-mani-200 shadow-xs'
                            : 'bg-red-50/50 border-red-200/90'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-2xl shrink-0">{p.icon || '🥜'}</span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-extrabold text-sm text-mani-900 truncate">
                                {p.name}
                              </span>
                              {p.badge && (
                                <span className="text-[9px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
                                  {p.badge}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-bold text-mani-700">
                                {formatPHP(p.price)}
                              </span>
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                                  isAvail
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : 'bg-red-100 text-red-800 border-red-300'
                                }`}
                              >
                                <span>{isAvail ? '🟢 Available' : '🔴 Unavailable'}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Individual ON / OFF Toggle Switch */}
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleFlavorAvailability(p.id)}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              isAvail ? 'bg-emerald-600' : 'bg-red-400'
                            }`}
                            title={`Click to mark ${p.name} as ${isAvail ? 'Unavailable' : 'Available'}`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                isAvail ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <span className="text-[9px] font-black tracking-wider uppercase text-mani-600">
                            {isAvail ? 'ON' : 'OFF'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mode of Payment Availability Controls */}
              <div className="p-5 rounded-2xl bg-cream border border-mani-200/90 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-mani-200/70 pb-3">
                  <div>
                    <h4 className="text-sm font-black text-mani-900 flex items-center gap-2">
                      <span>💳</span> Mode of Payment Availability Controls
                    </h4>
                    <p className="text-xs text-mani-600 font-medium">
                      Enable or disable payment options in real time. Disabled methods cannot be chosen by customers at checkout.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleBulkPaymentMethods(true)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold hover:bg-emerald-100 transition-colors cursor-pointer text-xs"
                    >
                      🟢 Enable All
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkPaymentMethods(false)}
                      className="px-2.5 py-1 rounded-lg bg-red-50 text-red-800 border border-red-300 font-bold hover:bg-red-100 transition-colors cursor-pointer text-xs"
                    >
                      🔴 Disable All
                    </button>
                  </div>
                </div>

                {paymentSaveMsg.msg && (
                  <div className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 animate-fade-in ${
                    paymentSaveMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-blue-50 text-blue-800 border-blue-300'
                  }`}>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{paymentSaveMsg.msg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PAYMENT_METHOD_METADATA.map((method) => {
                    const isEnabled = paymentMethods[method.id] !== false;
                    return (
                      <div
                        key={method.id}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isEnabled
                            ? 'bg-white border-mani-200 shadow-xs'
                            : 'bg-red-50/50 border-red-200/90'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-2xl shrink-0">{method.icon}</span>
                          <div className="min-w-0">
                            <span className="font-extrabold text-sm text-mani-900 truncate block">
                              {method.name}
                            </span>
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-full border inline-flex items-center gap-1 mt-0.5 ${
                                isEnabled
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : 'bg-red-100 text-red-800 border-red-300'
                              }`}
                            >
                              <span>{isEnabled ? '🟢 Available' : '🔴 Disabled'}</span>
                            </span>
                          </div>
                        </div>

                        {/* Individual Toggle Switch */}
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleTogglePaymentMethod(method.id)}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              isEnabled ? 'bg-emerald-600' : 'bg-red-400'
                            }`}
                            title={`Click to mark ${method.name} as ${isEnabled ? 'Disabled' : 'Enabled'}`}
                            aria-label={`Toggle ${method.name}`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                isEnabled ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <span className="text-[9px] font-black tracking-wider uppercase text-mani-600">
                            {isEnabled ? 'ON' : 'OFF'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSavingCutoff}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black text-xs sm:text-sm shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSavingCutoff ? 'Saving Settings...' : 'Save Cutoff & Delivery Settings'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. ORDERS MANAGER TAB                                     */}
      {/* ========================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-mani-200 shadow-warm">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-mani-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by customer, phone, order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm border border-mani-200 bg-cream outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs border border-mani-200 bg-cream outline-none cursor-pointer"
                title="Filter by Order Date"
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs font-semibold border border-mani-200 bg-cream outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="New">🟡 New</option>
                <option value="Confirmed">🔵 Confirmed</option>
                <option value="Preparing">🟠 Preparing</option>
                <option value="Ready">🟣 Ready</option>
                <option value="Completed">🟢 Completed</option>
                <option value="Cancelled">🔴 Cancelled</option>
              </select>

              <button
                type="button"
                onClick={fetchOrders}
                className="p-2 rounded-xl bg-mani-100 hover:bg-mani-200 text-mani-700 transition-colors"
                title="Refresh orders"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {displayOrders.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-mani-200 text-mani-500 space-y-2">
              <span className="text-4xl block">📦</span>
              <p className="font-bold text-sm text-mani-800">No orders found</p>
              <p className="text-xs">Submit an order from the shop menu to see it here.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {displayOrders.map((ord) => {
                const statusInfo = STATUS_CONFIG[ord.status] || STATUS_CONFIG.New;

                return (
                  <div
                    key={ord.orderId}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-mani-200 shadow-warm hover:shadow-warm-lg transition-shadow space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-mani-100 pb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-black text-amber-900 font-mono">
                          {ord.orderId}
                        </span>
                        <span className="text-xs text-mani-500">
                          {ord.orderDate} at {ord.orderTime}
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                          {ord.paymentMethod || 'Cash on Delivery'}
                        </span>
                        {ord.syncedToGoogleSheets && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded-md font-bold">
                            Sheets Synced
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
                        {/* Paid / Unpaid Status */}
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-mani-500 font-medium">Payment:</span>
                          <select
                            value={ord.paymentStatus || 'Unpaid'}
                            disabled={updatingPaymentId === ord.orderId}
                            onChange={(e) => handleUpdatePaymentStatus(ord.orderId, e.target.value, ord.orderDate)}
                            className={`text-xs font-black px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
                              (ord.paymentStatus || 'Unpaid').toLowerCase() === 'paid'
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                : 'bg-amber-100 text-amber-900 border-amber-300'
                            }`}
                          >
                            <option value="Unpaid">🟡 Unpaid</option>
                            <option value="Paid">🟢 Paid</option>
                          </select>
                        </div>

                        {/* Order Status */}
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-mani-500 font-medium">Status:</span>
                          <select
                            value={ord.status}
                            disabled={updatingOrderId === ord.orderId}
                            onChange={(e) => handleUpdateStatus(ord.orderId, e.target.value, ord.orderDate)}
                            className={`text-xs font-bold px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${statusInfo.color}`}
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      {/* Customer & Mobile */}
                      <div className="space-y-1">
                        <span className="font-bold text-mani-500 uppercase tracking-wider text-[10px]">
                          Customer & Contact
                        </span>
                        <div className="font-bold text-mani-900 text-sm">{ord.customerName}</div>
                        <div className="text-mani-600 font-medium flex items-center gap-1">
                          <Phone className="w-3 h-3 text-amber-600" /> {ord.mobileNumber}
                        </div>
                      </div>

                      {/* Delivery Address */}
                      <div className="space-y-1">
                        <span className="font-bold text-mani-500 uppercase tracking-wider text-[10px]">
                          Delivery Address
                        </span>
                        <div className="text-mani-800 font-medium flex items-start gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span>{ord.deliveryAddress}</span>
                        </div>
                      </div>

                      {/* Items & Amount */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-mani-500 uppercase tracking-wider text-[10px]">
                            Total Amount
                          </span>
                          <span className="font-black text-amber-950 text-sm">
                            {formatPHP(ord.subtotal)}
                          </span>
                        </div>
                        <div className="text-[11px] text-mani-600 font-medium">
                          {ord.totalPacks} tub{ord.totalPacks > 1 ? 's' : ''} total
                        </div>
                      </div>
                    </div>

                    {/* Flavors breakdown badges */}
                    <div className="pt-2 border-t border-mani-100 flex flex-wrap gap-1.5 text-[11px]">
                      {ord.items && ord.items.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-mani-50 text-mani-800 font-semibold border border-mani-200"
                        >
                          {item.name} × {item.quantity}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 2.5. ORDER SUMMARY TAB (DATE RANGE & FLAVOR BREAKDOWN)    */}
      {/* ========================================================= */}
      {activeTab === 'order-summary' && (
        <div className="space-y-6 animate-fade-in">
          {/* Main Controls Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-mani-200/90 shadow-warm space-y-6">
            <div className="border-b border-mani-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-mani-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-amber-600" />
                  Order Summary & Flavor Performance
                </h3>
                <p className="text-xs sm:text-sm text-mani-600">
                  Interactive sales breakdown and volume metrics across customizable date ranges.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={fetchAllOrders}
                  className="px-3 py-1.5 rounded-xl bg-mani-100 hover:bg-mani-200 text-mani-800 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Reload all order records"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh Data</span>
                </button>
              </div>
            </div>

            {/* Date Range Selection & Quick Presets */}
            <div className="space-y-3.5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                {/* 1-Click Preset Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {PRESET_OPTIONS.map((opt) => {
                    const isSelected = summaryPreset === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectPreset(opt.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-600 text-white shadow-xs scale-102'
                            : 'bg-cream text-mani-700 hover:bg-mani-100 border border-mani-200/80 hover:text-mani-900'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Date Pickers */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <div className="flex items-center gap-1.5 bg-cream px-3 py-1.5 rounded-xl border border-mani-200">
                    <span className="text-[11px] font-bold text-mani-500 uppercase tracking-wider">Start</span>
                    <input
                      type="date"
                      value={summaryStartDate}
                      onChange={(e) => {
                        setSummaryStartDate(e.target.value);
                        setSummaryPreset('custom');
                      }}
                      className="text-xs font-bold text-mani-900 bg-transparent outline-none cursor-pointer"
                    />
                  </div>

                  <span className="text-mani-400 font-bold text-xs">to</span>

                  <div className="flex items-center gap-1.5 bg-cream px-3 py-1.5 rounded-xl border border-mani-200">
                    <span className="text-[11px] font-bold text-mani-500 uppercase tracking-wider">End</span>
                    <input
                      type="date"
                      value={summaryEndDate}
                      onChange={(e) => {
                        setSummaryEndDate(e.target.value);
                        setSummaryPreset('custom');
                      }}
                      className="text-xs font-bold text-mani-900 bg-transparent outline-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Active Date Range Display Banner */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-amber-50 to-orange-50/60 p-3 sm:px-4 rounded-2xl border border-amber-200/80 text-xs">
                <div className="flex items-center gap-2 text-mani-900 font-bold flex-wrap">
                  <CalendarRange className="w-4 h-4 text-amber-700 shrink-0" />
                  {summaryPreset === 'all-time' || (!summaryStartDate && !summaryEndDate) ? (
                    <span>
                      Selected Range: <span className="font-black text-amber-950">All Time (Full Google Sheet Master List)</span>
                    </span>
                  ) : (
                    <span>
                      Selected Range: <span className="font-black text-amber-950">{formatDateDisplay(summaryStartDate)}</span> to <span className="font-black text-amber-950">{formatDateDisplay(summaryEndDate)}</span>
                    </span>
                  )}
                  <span className="text-mani-300">•</span>
                  <span className="text-amber-800 font-black">
                    {summaryPreset === 'all-time' || (!summaryStartDate && !summaryEndDate) 
                      ? 'Full Master Record' 
                      : `${rangeDaysCount} day${rangeDaysCount > 1 ? 's' : ''}`}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 font-bold">
                  <span className="text-mani-600">Matching Orders:</span>
                  <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-white font-black text-xs">
                    {activeOrdersForSummary.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Summary Highlights / KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Total Orders Placed */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-xs font-extrabold text-amber-900 uppercase tracking-wider">
                  <span>Total Orders</span>
                  <Package className="w-4 h-4 text-amber-700" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-950 mt-1">
                  {summaryKpis.totalOrders}
                </div>
                <p className="text-[11px] text-mani-600 font-medium">
                  Non-cancelled orders in period
                </p>
              </div>

              {/* Total Tubs Sold */}
              <div className="p-4 sm:p-5 rounded-2xl bg-orange-50/80 border border-orange-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-xs font-extrabold text-orange-900 uppercase tracking-wider">
                  <span>Total Tubs Sold</span>
                  <span className="text-base">🥜</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-orange-950 mt-1">
                  {summaryKpis.totalTubs}
                </div>
                <p className="text-[11px] text-mani-600 font-medium">
                  Total tubs across all flavors
                </p>
              </div>

              {/* Distinct Flavors Ordered */}
              <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/80 border border-blue-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-xs font-extrabold text-blue-900 uppercase tracking-wider">
                  <span>Flavors Ordered</span>
                  <TrendingUp className="w-4 h-4 text-blue-700" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-blue-950 mt-1">
                  {distinctFlavorsOrdered} <span className="text-xs sm:text-sm font-bold text-blue-700">/ {flavorStats.length}</span>
                </div>
                <p className="text-[11px] text-mani-600 font-medium">
                  Distinct flavors with volume
                </p>
              </div>

              {/* Total Revenue */}
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-xs font-extrabold text-emerald-900 uppercase tracking-wider">
                  <span>Total Revenue</span>
                  <DollarSign className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-950 mt-1">
                  {formatPHP(summaryKpis.totalRevenue)}
                </div>
                <p className="text-[11px] text-mani-600 font-medium">
                  Gross sales for selected range
                </p>
              </div>
            </div>

            {/* Empty State Banner if no orders in selected period */}
            {activeOrdersForSummary.length === 0 && (
              <div className="p-8 sm:p-12 text-center rounded-2xl bg-cream/70 border border-dashed border-mani-300 text-mani-500 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center text-2xl border border-amber-200">
                  📦
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h4 className="text-base font-black text-mani-900">
                    No orders found for the selected date range.
                  </h4>
                  <p className="text-xs text-mani-600">
                    {summaryPreset === 'all-time' || (!summaryStartDate && !summaryEndDate)
                      ? 'No orders are currently recorded in the system.'
                      : (
                        <>No orders exist between <span className="font-bold text-mani-900">{formatDateDisplay(summaryStartDate)}</span> and <span className="font-bold text-mani-900">{formatDateDisplay(summaryEndDate)}</span>. Try choosing a different preset below:</>
                      )}
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectPreset('all-time')}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors cursor-pointer"
                  >
                    View All Time (Master List)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPreset('this-month')}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-mani-100 hover:bg-mani-200 text-mani-800 transition-colors cursor-pointer"
                  >
                    Select This Month
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPreset('today')}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-mani-100 hover:bg-mani-200 text-mani-800 transition-colors cursor-pointer"
                  >
                    Reset to Today
                  </button>
                </div>
              </div>
            )}

            {/* Visual Summary: Flavor vs Quantity Bar Chart */}
            <div className="space-y-4 pt-2">
              <div className="border-b border-mani-100 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <h4 className="text-sm font-black text-mani-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-600" />
                    Visual Breakdown: Flavor vs. Quantity Sold
                  </h4>
                  <p className="text-xs text-mani-600">
                    Ranked by highest quantity ordered (tubs) within selected range
                  </p>
                </div>
                <span className="text-[11px] font-bold text-mani-500 self-start sm:self-auto">
                  {summaryKpis.totalTubs} Total Tubs
                </span>
              </div>

              <div className="space-y-3 bg-cream/50 p-4 sm:p-5 rounded-2xl border border-mani-200/80">
                {chartFlavors.map((f) => {
                  const theme = FLAVOR_THEME[f.id] || { bar: 'bg-amber-500', text: 'text-amber-800', light: 'bg-amber-50' };
                  const barWidthPercent = maxChartQty > 0
                    ? Math.max(f.quantity > 0 ? 4 : 0, (f.quantity / maxChartQty) * 100)
                    : 0;

                  return (
                    <div key={f.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 font-bold text-mani-900">
                          <span className="text-base">{f.icon}</span>
                          <span className="font-extrabold">{f.name}</span>
                          {!f.available && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-100 text-red-700 border border-red-200">
                              Out of stock
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-black text-mani-950 text-xs sm:text-sm">
                            {f.quantity} {f.quantity === 1 ? 'tub' : 'tubs'}
                          </span>
                          <span className="text-[11px] text-mani-500 font-semibold w-12 text-right">
                            ({f.sharePercent}%)
                          </span>
                        </div>
                      </div>

                      {/* Bar Track */}
                      <div className="h-4 sm:h-5 bg-white rounded-full overflow-hidden p-0.5 border border-mani-200/90 shadow-inner">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${theme.bar}`}
                          style={{ width: `${barWidthPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Flavor Summary Table */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-mani-100 pb-2">
                <div>
                  <h4 className="text-sm font-black text-mani-900 flex items-center gap-2">
                    <span>📋</span> Detailed Flavor Breakdown Table
                  </h4>
                  <p className="text-xs text-mani-600">
                    Comprehensive table including stock status, unit pricing, sales volume, and portfolio share
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-mani-200 shadow-xs">
                <table className="w-full text-left text-xs sm:text-sm border-collapse bg-white">
                  <thead>
                    <tr className="border-b-2 border-mani-200 bg-amber-50/70 text-mani-800">
                      <th className="py-3 px-3.5 font-black uppercase text-[11px] tracking-wider">Flavor</th>
                      <th className="py-3 px-3.5 font-black uppercase text-[11px] tracking-wider text-center">Status</th>
                      <th className="py-3 px-3.5 font-black uppercase text-[11px] tracking-wider text-right">Quantity Ordered</th>
                      <th className="py-3 px-3.5 font-black uppercase text-[11px] tracking-wider text-right">Unit Price</th>
                      <th className="py-3 px-3.5 font-black uppercase text-[11px] tracking-wider text-right">Total Sales</th>
                      <th className="py-3 px-3.5 font-black uppercase text-[11px] tracking-wider text-right">Share (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-mani-100">
                    {flavorStats.map((f) => (
                      <tr key={f.id} className="hover:bg-amber-50/40 transition-colors">
                        <td className="py-3 px-3.5 font-bold text-mani-900">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl shrink-0">{f.icon}</span>
                            <span className="font-extrabold text-mani-950">{f.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3.5 text-center whitespace-nowrap">
                          {f.available ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Available
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Out of Stock
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3.5 text-right whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-0.5 rounded-lg font-black ${
                            f.quantity > 0 
                              ? 'bg-amber-100 text-amber-950 border border-amber-300/70' 
                              : 'text-mani-400 bg-mani-50'
                          }`}>
                            {f.quantity} {f.quantity === 1 ? 'tub' : 'tubs'}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-right text-mani-700 font-semibold whitespace-nowrap">
                          {formatPHP(f.price)}
                        </td>
                        <td className="py-3 px-3.5 text-right font-black text-amber-950 whitespace-nowrap">
                          {formatPHP(f.sales)}
                        </td>
                        <td className="py-3 px-3.5 text-right text-mani-700 font-bold whitespace-nowrap">
                          {f.sharePercent}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-amber-300 bg-gradient-to-r from-amber-100/90 to-orange-100/80 font-black text-mani-950">
                      <td className="py-3.5 px-3.5 font-black tracking-wide text-mani-950">
                        TOTAL SUMMARY
                      </td>
                      <td className="py-3.5 px-3.5 text-center text-xs text-mani-700 font-bold">
                        {distinctFlavorsOrdered} of {flavorStats.length} ordered
                      </td>
                      <td className="py-3.5 px-3.5 text-right text-sm sm:text-base text-amber-950 font-black whitespace-nowrap">
                        {summaryKpis.totalTubs} tubs
                      </td>
                      <td className="py-3.5 px-3.5 text-right text-mani-400 font-normal">
                        —
                      </td>
                      <td className="py-3.5 px-3.5 text-right text-sm sm:text-base text-amber-950 font-black whitespace-nowrap">
                        {formatPHP(summaryKpis.totalRevenue)}
                      </td>
                      <td className="py-3.5 px-3.5 text-right font-black text-amber-950 whitespace-nowrap">
                        {summaryKpis.totalTubs > 0 ? '100.0%' : '0.0%'}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. DAILY SUMMARY TAB                                      */}
      {/* ========================================================= */}
      {activeTab === 'summary' && dailySummary && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-mani-200/90 shadow-warm space-y-6">
            <div className="border-b border-mani-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black text-mani-900">
                  Daily Performance Summary
                </h3>
                <p className="text-xs sm:text-sm text-mani-600">
                  Metrics for date: <span className="font-bold text-mani-900">{dailySummary.date}</span>
                </p>
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs border border-mani-200 bg-cream outline-none"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Total Orders</span>
                <div className="text-2xl sm:text-3xl font-black text-amber-950 mt-1">{dailySummary.totalOrders}</div>
              </div>

              <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200">
                <span className="text-xs font-bold text-orange-800 uppercase tracking-wider">Total Tubs</span>
                <div className="text-2xl sm:text-3xl font-black text-orange-950 mt-1">{dailySummary.totalPacks}</div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 col-span-2 sm:col-span-1">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Total Sales</span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-950 mt-1">{formatPHP(dailySummary.totalSales || dailySummary.totalRevenue || 0)}</div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-300">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">🟢 Paid Orders</span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-950 mt-1">
                  {dailySummary.paid !== undefined ? dailySummary.paid : (dailySummary.paidOrders || 0)}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">🟡 Unpaid Orders</span>
                <div className="text-2xl sm:text-3xl font-black text-amber-950 mt-1">
                  {dailySummary.unpaid !== undefined ? dailySummary.unpaid : (dailySummary.unpaidOrders || 0)}
                </div>
              </div>
            </div>

            {/* Flavor breakdown count */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-mani-500 mb-2.5">
                Tubs by Flavor:
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { name: 'Salted', qty: dailySummary.salted, icon: '🧂' },
                  { name: 'Unsalted', qty: dailySummary.unsalted, icon: '🥜' },
                  { name: 'Spicy', qty: dailySummary.spicy, icon: '🌶️' },
                  { name: 'BBQ', qty: dailySummary.bbq, icon: '🔥' },
                  { name: 'Sour Cream', qty: dailySummary.sourCream, icon: '🥛' },
                  { name: 'Cheese', qty: dailySummary.cheese, icon: '🧀' },
                  { name: 'Bawang Only', qty: dailySummary.bawangOnly, icon: '🧄' }
                ].map((fl) => (
                  <div key={fl.name} className="bg-cream p-3 rounded-xl border border-mani-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{fl.icon}</span>
                      <span className="text-xs font-semibold text-mani-800">{fl.name}</span>
                    </div>
                    <span className="text-sm font-black text-mani-900">{fl.qty || 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. PRODUCTS TAB                                           */}
      {/* ========================================================= */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-mani-200/90 shadow-warm space-y-4">
            <div className="border-b border-mani-100 pb-3">
              <h3 className="text-base sm:text-lg font-extrabold text-mani-900">
                Flavors & Pricing Manager
              </h3>
              <p className="text-xs text-mani-600">
                Update product names, descriptions, adjust prices, and toggle stock availability in real-time.
              </p>
            </div>

            {/* Product Update Feedback Banner */}
            {productSaveMsg.msg && (
              <div
                className={`p-3.5 rounded-2xl text-xs sm:text-sm font-bold border flex items-center justify-between gap-2 shadow-xs transition-all ${
                  productSaveMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                    : 'bg-red-50 text-red-900 border-red-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {productSaveMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span>{productSaveMsg.msg}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setProductSaveMsg({ msg: '', type: '' })}
                  className="p-1 text-mani-400 hover:text-mani-800 rounded-lg cursor-pointer"
                  title="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="grid gap-3">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-2xl bg-cream border border-mani-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{p.icon || '🥜'}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm text-mani-900">{p.name}</span>
                        {p.badge && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 rounded">
                            {p.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-mani-500 line-clamp-1">{p.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap self-end sm:self-auto">
                    {/* Edit Product Name & Description button */}
                    <button
                      type="button"
                      onClick={() => handleStartEditProduct(p)}
                      className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-amber-900 border border-mani-200 hover:border-amber-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs active:scale-98"
                      title={`Edit ${p.name} details`}
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                      <span>Edit</span>
                    </button>

                    {/* Price edit */}
                    {editingPriceId === p.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-mani-700">₱</span>
                        <input
                          type="number"
                          value={tempPrice}
                          onChange={(e) => setTempPrice(e.target.value)}
                          className="w-16 text-xs font-bold px-2 py-1 rounded border border-amber-500 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleSavePrice(p.id)}
                          className="p-1 rounded bg-amber-500 text-white cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-amber-900 bg-white px-2.5 py-1 rounded-lg border border-mani-200">
                          {formatPHP(p.price)}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPriceId(p.id);
                            setTempPrice(String(p.price));
                          }}
                          className="p-1 text-mani-400 hover:text-mani-800 cursor-pointer"
                          title="Edit price"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Availability Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleFlavorAvailability(p.id)}
                      className={`text-xs font-black px-3 py-1 rounded-xl transition-all cursor-pointer border ${
                        p.available !== false
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                          : 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200'
                      }`}
                    >
                      {p.available !== false ? '🟢 Available' : '🔴 Unavailable'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Edit Product Modal */}
            {editingProduct && (
              <div 
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-mani-950/60 backdrop-blur-xs animate-fade-in"
                onClick={handleCancelEditProduct}
              >
                <div 
                  className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-mani-200 overflow-hidden space-y-5"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-mani-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center text-xl shadow-md shadow-amber-900/10">
                        {editingProduct.icon || '🥜'}
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-black text-mani-950">
                          Edit Product Details
                        </h3>
                        <p className="text-xs text-mani-500 font-medium">
                          Update flavor display name and customer-facing description
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCancelEditProduct}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-mani-400 hover:text-mani-800 hover:bg-mani-100 transition-colors cursor-pointer"
                      title="Cancel"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Validation Error Banner */}
                  {editProductError && (
                    <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{editProductError}</span>
                    </div>
                  )}

                  {/* Edit Form */}
                  <form onSubmit={handleSaveEditProduct} className="space-y-4">
                    {/* Product Name */}
                    <div>
                      <label className="block text-xs font-bold text-mani-800 mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span>🏷️</span>
                          Product Name <span className="text-red-500">*</span>
                        </span>
                        <span className="text-[11px] font-normal text-mani-400">Displayed in catalog & cart</span>
                      </label>
                      <input
                        type="text"
                        value={editProductName}
                        onChange={(e) => {
                          setEditProductName(e.target.value);
                          if (editProductError && e.target.value.trim()) {
                            setEditProductError('');
                          }
                        }}
                        placeholder="e.g., Salted, Spicy Mani, Truffle"
                        autoFocus
                        className={`w-full text-sm px-4 py-2.5 rounded-xl border bg-cream focus:bg-white outline-none transition-all ${
                          editProductError
                            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                            : 'border-mani-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200'
                        }`}
                      />
                    </div>

                    {/* Product Description */}
                    <div>
                      <label className="block text-xs font-bold text-mani-800 mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span>📝</span>
                          Product Description
                        </span>
                        <span className="text-[11px] font-normal text-mani-400">Visible on product cards</span>
                      </label>
                      <textarea
                        rows={3}
                        value={editProductDesc}
                        onChange={(e) => setEditProductDesc(e.target.value)}
                        placeholder="Describe the flavor, crunch, seasoning, or ingredients..."
                        className="w-full text-sm px-4 py-2.5 rounded-xl border border-mani-200 bg-cream focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all resize-y min-h-[80px]"
                      />
                    </div>

                    {/* Product Summary Preview Box */}
                    <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-amber-950">
                        <span>Price: {formatPHP(editingProduct.price || 50)}</span>
                        <span className={editingProduct.available !== false ? 'text-emerald-700' : 'text-red-700'}>
                          {editingProduct.available !== false ? '🟢 Currently Available' : '🔴 Out of Stock'}
                        </span>
                      </div>
                      <p className="text-[11px] text-mani-600">
                        Note: Price and availability can be adjusted anytime via their dedicated controls in the products table.
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-mani-100 flex items-center justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={handleCancelEditProduct}
                        className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-mani-700 bg-mani-100 hover:bg-mani-200 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <form onSubmit={handleAddNewFlavor} className="p-4 rounded-2xl bg-mani-50 border border-dashed border-mani-300 space-y-3 pt-4 mt-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-mani-700 flex items-center gap-1">
                <Plus className="w-4 h-4 text-amber-600" />
                Add Future Flavor
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
                <input
                  type="text"
                  placeholder="Flavor Name"
                  value={newFlavorName}
                  onChange={(e) => setNewFlavorName(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-mani-200 bg-white outline-none"
                  required
                />
                <input
                  type="number"
                  placeholder="Price (₱)"
                  value={newFlavorPrice}
                  onChange={(e) => setNewFlavorPrice(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-mani-200 bg-white outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Short Description"
                  value={newFlavorDesc}
                  onChange={(e) => setNewFlavorDesc(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-mani-200 bg-white outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all cursor-pointer"
                >
                  + Add Flavor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. PAYMENT OPTIONS & QRS TAB                              */}
      {/* ========================================================= */}
      {activeTab === 'qrs' && (
        <div className="space-y-6">
          {/* Mode of Payment Availability Controls */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-mani-200/90 shadow-warm space-y-5">
            <div className="border-b border-mani-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-mani-900 flex items-center gap-2">
                  <span>💳</span> Mode of Payment Availability Controls
                </h3>
                <p className="text-xs text-mani-600">
                  Enable or disable individual payment options. Disabled options cannot be selected by customers at checkout.
                </p>
              </div>

              {/* Bulk Quick Actions */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleBulkPaymentMethods(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  🟢 Enable All
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkPaymentMethods(false)}
                  className="px-3 py-1.5 rounded-xl bg-red-50 text-red-800 border border-red-300 text-xs font-bold hover:bg-red-100 transition-colors cursor-pointer"
                >
                  🔴 Disable All
                </button>
              </div>
            </div>

            {paymentSaveMsg.msg && (
              <div className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 animate-fade-in ${
                paymentSaveMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-blue-50 text-blue-800 border-blue-300'
              }`}>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{paymentSaveMsg.msg}</span>
              </div>
            )}

            {/* Payment Method Toggle Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {PAYMENT_METHOD_METADATA.map((method) => {
                const isEnabled = paymentMethods[method.id] !== false;
                return (
                  <div
                    key={method.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                      isEnabled
                        ? 'bg-white border-mani-200 shadow-xs'
                        : 'bg-red-50/40 border-red-200/90'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="p-2.5 rounded-xl bg-cream border border-mani-200 text-2xl shrink-0">
                          {method.icon}
                        </span>
                        <div>
                          <div className="font-extrabold text-sm text-mani-900">
                            {method.name}
                          </div>
                          <div className="text-xs text-mani-500 mt-0.5">
                            {method.description}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-mani-100">
                      <span
                        className={`text-[10px] font-black px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                          isEnabled
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-red-100 text-red-800 border-red-300'
                        }`}
                      >
                        {isEnabled ? '🟢 Available' : '🔴 Disabled'}
                      </span>

                      {/* Individual Toggle Switch */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleTogglePaymentMethod(method.id)}
                          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            isEnabled ? 'bg-emerald-600' : 'bg-red-400'
                          }`}
                          title={`Click to ${isEnabled ? 'disable' : 'enable'} ${method.name}`}
                          aria-label={`Toggle ${method.name}`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              isEnabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span className="text-[10px] font-black tracking-wider uppercase text-mani-700 min-w-7">
                          {isEnabled ? 'ON' : 'OFF'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-mani-200/90 shadow-warm space-y-5">
            <div className="border-b border-mani-100 pb-3">
              <h3 className="text-base sm:text-lg font-extrabold text-mani-900">
                Payment QR Codes & GCash Settings
              </h3>
              <p className="text-xs text-mani-600">
                View or upload custom QR codes for Maribank and GCash, or edit the GCash phone number.
              </p>
            </div>

            {qrSaveMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold">
                {qrSaveMsg}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Maribank QR Configuration */}
              <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-orange-950 flex items-center gap-1.5">
                    <span>🏦</span> Maribank QR Code
                  </span>
                  <label className="cursor-pointer px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload QR</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'maribank')}
                    />
                  </label>
                </div>

                <div className="bg-white p-3 rounded-xl border border-orange-200 text-center">
                  <img
                    src={customQrs?.maribank}
                    alt="Current Maribank QR"
                    className="max-h-56 mx-auto rounded-lg object-contain"
                  />
                </div>
              </div>

              {/* GCash QR Configuration */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-blue-950 flex items-center gap-1.5">
                    <span>📱</span> GCash QR Code & Number
                  </span>
                  <label className="cursor-pointer px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload QR</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'gcash')}
                    />
                  </label>
                </div>

                <form onSubmit={handleSaveGcashNum} className="flex gap-2">
                  <input
                    type="text"
                    value={localGcashNum}
                    onChange={(e) => setLocalGcashNum(e.target.value)}
                    placeholder="09055182263"
                    className="flex-1 text-xs px-3 py-2 rounded-xl border border-blue-200 bg-white outline-none font-mono font-bold"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Save Number
                  </button>
                </form>

                <div className="bg-white p-3 rounded-xl border border-blue-200 text-center">
                  <img
                    src={customQrs?.gcash}
                    alt="Current GCash QR"
                    className="max-h-56 mx-auto rounded-lg object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. INTERNAL INTEGRATION TAB                               */}
      {/* ========================================================= */}
      {activeTab === 'sheets' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-mani-200/90 shadow-warm space-y-5">
            <div className="border-b border-mani-100 pb-3">
              <h3 className="text-base sm:text-lg font-extrabold text-mani-900">
                Google Sheets Internal Synchronization Settings
              </h3>
              <p className="text-xs text-mani-600">
                Manage internal server-to-sheets synchronization. Sensitive details are hidden from customers.
              </p>
            </div>

            {settingsStatus.msg && (
              <div className={`p-3 rounded-xl text-xs font-bold border ${
                settingsStatus.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                settingsStatus.type === 'error' ? 'bg-red-50 text-red-800 border-red-300' :
                'bg-blue-50 text-blue-800 border-blue-300'
              }`}>
                {settingsStatus.msg}
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-mani-800 mb-1">
                  Google Spreadsheet ID (Internal)
                </label>
                <input
                  type="text"
                  value={settings.spreadsheetId}
                  onChange={(e) => setSettings({ ...settings, spreadsheetId: e.target.value })}
                  placeholder="Configured via GOOGLE_SHEET_ID environment variable"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-mani-200 bg-cream text-mani-700 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-mani-800 mb-1">
                  Google Apps Script Web App URL (Internal)
                </label>
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={settings.appsScriptUrl || ''}
                  onChange={(e) => setSettings({ ...settings, appsScriptUrl: e.target.value })}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-mani-200 focus:border-amber-500 outline-none font-mono"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                >
                  Save Internal Settings
                </button>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTestingSheet}
                  className="px-4 py-2.5 rounded-xl bg-cream-warm hover:bg-mani-100 border border-mani-200 text-mani-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  {isTestingSheet ? 'Testing...' : 'Test Connection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
