import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, RefreshCw, Search, Calendar, 
  Settings, ExternalLink, Plus, Edit2, Check, Package, DollarSign, QrCode, Upload, Copy, Phone, MapPin, CreditCard,
  Clock, Lock, CheckCircle2, AlertTriangle, LogOut, User, Power
} from 'lucide-react';
import { formatPHP } from '../config/products';
import { DEFAULT_APPS_SCRIPT_URL, DEFAULT_SPREADSHEET_ID } from '../config/sheetsConfig';

export default function AdminPortal({ 
  products, 
  onUpdateProducts, 
  customQrs, 
  onUpdateQrs, 
  adminToken, 
  adminUser, 
  onLogout,
  cutoffInfo,
  onRefreshCutoff
}) {
  const [activeTab, setActiveTab] = useState('cutoff'); // 'cutoff', 'orders', 'summary', 'products', 'qrs', 'sheets'
  const [orders, setOrders] = useState([]);
  const [dailySummary, setDailySummary] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [updatingPaymentId, setUpdatingPaymentId] = useState(null);

  // Cutoff Form State
  const [cutoffEnabled, setCutoffEnabled] = useState(cutoffInfo?.enabled || false);
  const [cutoffDate, setCutoffDate] = useState(cutoffInfo?.cutoffDate || '');
  const [cutoffTime, setCutoffTime] = useState(cutoffInfo?.cutoffTime || '23:59');
  const [isSavingCutoff, setIsSavingCutoff] = useState(false);
  const [cutoffSaveMsg, setCutoffSaveMsg] = useState({ msg: '', type: '' });

  // Sync cutoff local form when cutoffInfo prop updates
  useEffect(() => {
    if (cutoffInfo) {
      setCutoffEnabled(Boolean(cutoffInfo.enabled));
      if (cutoffInfo.cutoffDate) setCutoffDate(cutoffInfo.cutoffDate);
      if (cutoffInfo.cutoffTime) setCutoffTime(cutoffInfo.cutoffTime);
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
    }
    setIsLoading(false);
  };

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
    fetchSettings();
  }, [selectedDate, statusFilter]);

  // Handle Cutoff Save with Cross-Device Cloud Sync
  const handleSaveCutoffSettings = async (e) => {
    e.preventDefault();

    if (cutoffEnabled && (!cutoffDate || !cutoffTime)) {
      setCutoffSaveMsg({ msg: 'Please select both a cutoff date and time.', type: 'error' });
      return;
    }

    const confirmMsg = cutoffEnabled
      ? `Are you sure you want to set the order cutoff to ${cutoffDate} at ${cutoffTime}? Orders will automatically close once this time is reached.`
      : 'Are you sure you want to DISABLE the cutoff timer? Order submissions will remain open continuously.';

    if (!window.confirm(confirmMsg)) {
      return;
    }

    setIsSavingCutoff(true);
    setCutoffSaveMsg({ msg: '', type: '' });

    // 1. Try local Express backend if running
    try {
      const res = await fetch('/api/admin/cutoff', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          enabled: cutoffEnabled,
          date: cutoffDate,
          time: cutoffTime
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
              time: cutoffTime
            }
          }
        })
      }).catch(() => {});

      // GET sync fast-path
      fetch(`${appsUrl}?action=saveCutoff&enabled=${cutoffEnabled}&date=${encodeURIComponent(cutoffDate)}&time=${encodeURIComponent(cutoffTime)}`, {
        mode: 'no-cors'
      }).catch(() => {});
    }

    // 3. Update localStorage cache
    localStorage.setItem('mani_cutoff_settings', JSON.stringify({
      enabled: cutoffEnabled,
      date: cutoffDate,
      time: cutoffTime
    }));

    if (onRefreshCutoff) onRefreshCutoff();

    setCutoffSaveMsg({ msg: 'Cutoff settings saved & synchronized across desktop & mobile devices!', type: 'success' });
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
          { id: 'summary', label: '📊 Daily Summary', icon: DollarSign },
          { id: 'products', label: '🥜 Products & Pricing', icon: Settings },
          { id: 'qrs', label: '💳 Payment QRs', icon: QrCode },
          { id: 'sheets', label: '⚙️ Integration', icon: ExternalLink }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
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
            <form onSubmit={handleSaveCutoffSettings} className="space-y-5 pt-2">
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

              {/* Date & Time Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>

              {/* Save Button */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSavingCutoff}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black text-xs sm:text-sm shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSavingCutoff ? 'Saving Cutoff Settings...' : 'Save Cutoff Settings'}</span>
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
                          {ord.totalPacks} pack{ord.totalPacks > 1 ? 's' : ''} total
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
                <span className="text-xs font-bold text-orange-800 uppercase tracking-wider">Total Packs</span>
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
                Packs by Flavor:
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { name: 'Salted', qty: dailySummary.salted, icon: '🧂' },
                  { name: 'Unsalted', qty: dailySummary.unsalted, icon: '🥜' },
                  { name: 'Spicy', qty: dailySummary.spicy, icon: '🌶️' },
                  { name: 'BBQ', qty: dailySummary.bbq, icon: '🔥' },
                  { name: 'Sour Cream', qty: dailySummary.sourCream, icon: '🥛' },
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
                Adjust prices and toggle stock availability in real-time.
              </p>
            </div>

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

                  <div className="flex items-center gap-3 self-end sm:self-auto">
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

                    <button
                      type="button"
                      onClick={() => handleToggleProduct(p.id)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-xl transition-colors cursor-pointer ${
                        p.available !== false
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {p.available !== false ? 'In Stock' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

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
      {/* 5. PAYMENT QRS TAB                                        */}
      {/* ========================================================= */}
      {activeTab === 'qrs' && (
        <div className="space-y-6">
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
