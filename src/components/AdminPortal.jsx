import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, RefreshCw, Search, Calendar, 
  Settings, ExternalLink, Plus, Edit2, Check, Package, DollarSign, QrCode, Upload, Copy, Phone, MapPin, CreditCard
} from 'lucide-react';
import { formatPHP } from '../config/products';
import { DEFAULT_SPREADSHEET_ID, DEFAULT_APPS_SCRIPT_URL } from '../config/sheetsConfig';

export default function AdminPortal({ products, onUpdateProducts, customQrs, onUpdateQrs }) {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'summary', 'products', 'qrs', 'sheets'
  const [orders, setOrders] = useState([]);
  const [dailySummary, setDailySummary] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const [settings, setSettings] = useState(() => ({
    spreadsheetId: localStorage.getItem('mani_spreadsheet_id') || DEFAULT_SPREADSHEET_ID,
    appsScriptUrl: localStorage.getItem('mani_apps_script_url') || DEFAULT_APPS_SCRIPT_URL
  }));
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
  const [newFlavorIcon, setNewFlavorIcon] = useState('🥜');

  const STATUS_CONFIG = {
    New: { label: 'New', color: 'bg-amber-100 text-amber-900 border-amber-300', dot: '🟡' },
    Confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-900 border-blue-300', dot: '🔵' },
    Preparing: { label: 'Preparing', color: 'bg-orange-100 text-orange-900 border-orange-300', dot: '🟠' },
    Ready: { label: 'Ready', color: 'bg-purple-100 text-purple-900 border-purple-300', dot: '🟣' },
    Completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-900 border-emerald-300', dot: '🟢' },
    Cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-900 border-red-300', dot: '🔴' },
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      let url = '/api/orders';
      const params = new URLSearchParams();
      if (selectedDate) params.append('date', selectedDate);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data && data.orders) {
        setOrders(data.orders);
        setDailySummary(data.dailySummary);
        if (!selectedDate && data.todayDate) {
          setSelectedDate(data.todayDate);
        }
      }
    } catch (e) {
      console.warn('Backend /api/orders unavailable, loading orders from localStorage:', e.message);
      const local = JSON.parse(localStorage.getItem('mani_orders') || '[]');
      setOrders(local);
      const totalPacks = local.reduce((sum, o) => sum + (o.totalPacks || 0), 0);
      const totalRevenue = local.reduce((sum, o) => sum + (o.subtotal || 0), 0);
      setDailySummary({
        totalOrders: local.length,
        totalPacks,
        totalRevenue,
        newOrders: local.filter(o => o.status === 'New').length,
        completedOrders: local.filter(o => o.status === 'Completed').length,
        cancelledOrders: local.filter(o => o.status === 'Cancelled').length
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data && data.spreadsheetId) {
        setSettings({
          spreadsheetId: data.spreadsheetId || DEFAULT_SPREADSHEET_ID,
          appsScriptUrl: data.appsScriptUrl || localStorage.getItem('mani_apps_script_url') || DEFAULT_APPS_SCRIPT_URL
        });
      }
    } catch (e) {
      // Static GitHub Pages fallback: read from localStorage
      setSettings({
        spreadsheetId: localStorage.getItem('mani_spreadsheet_id') || DEFAULT_SPREADSHEET_ID,
        appsScriptUrl: localStorage.getItem('mani_apps_script_url') || DEFAULT_APPS_SCRIPT_URL
      });
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchSettings();
  }, [selectedDate, statusFilter]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data && data.success) {
        setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));
      } else {
        throw new Error('Fallback to local');
      }
    } catch (e) {
      // LocalStorage update for static GitHub Pages
      const local = JSON.parse(localStorage.getItem('mani_orders') || '[]');
      const updated = local.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o);
      localStorage.setItem('mani_orders', JSON.stringify(updated));
      setOrders(updated);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    const cleanUrl = (settings.appsScriptUrl || '').trim();
    const cleanId = (settings.spreadsheetId || DEFAULT_SPREADSHEET_ID).trim();
    
    // Always persist to localStorage for static GitHub Pages execution
    localStorage.setItem('mani_apps_script_url', cleanUrl);
    localStorage.setItem('mani_spreadsheet_id', cleanId);

    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appsScriptUrl: cleanUrl, spreadsheetId: cleanId })
      });
    } catch (e) {
      // Silently handled on static GitHub Pages
    }

    setSettingsStatus({ msg: 'Settings saved! All incoming orders will sync using this configuration.', type: 'success' });
    setTimeout(() => setSettingsStatus({ msg: '', type: '' }), 4000);
  };

  const handleTestConnection = async () => {
    const urlToTest = (settings.appsScriptUrl || localStorage.getItem('mani_apps_script_url') || DEFAULT_APPS_SCRIPT_URL).trim();
    if (!urlToTest) {
      setSettingsStatus({ msg: 'Please enter your Google Apps Script Web App URL first.', type: 'error' });
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
      if (urlToTest.includes('script.google.com/macros/s/')) {
        setSettingsStatus({ 
          msg: 'ℹ️ Web App endpoint registered! Tip: In Google Apps Script, confirm "Who has access" is set to "Anyone".',
          type: 'info'
        });
      } else {
        setSettingsStatus({ 
          msg: '⚠️ Please make sure the URL begins with https://script.google.com/macros/s/.../exec',
          type: 'error'
        });
      }
    } finally {
      setIsTestingSheet(false);
    }
  };

  const handleSyncPendingOrders = async () => {
    const url = (settings.appsScriptUrl || localStorage.getItem('mani_apps_script_url') || DEFAULT_APPS_SCRIPT_URL).trim();
    if (!url) {
      setSettingsStatus({ msg: 'Please configure and save your Google Apps Script Web App URL first.', type: 'error' });
      return;
    }

    setIsSyncing(true);
    setSettingsStatus({ msg: 'Syncing pending orders to Google Sheets...', type: 'info' });

    try {
      const localOrders = JSON.parse(localStorage.getItem('mani_orders') || '[]');
      let syncedCount = 0;

      for (let i = 0; i < localOrders.length; i++) {
        const ord = localOrders[i];
        if (!ord.syncedToGoogleSheets) {
          try {
            await fetch(url, {
              method: 'POST',
              mode: 'no-cors',
              headers: { 'Content-Type': 'text/plain;charset=utf-8' },
              body: JSON.stringify({
                action: 'addOrder',
                spreadsheetId: settings.spreadsheetId || DEFAULT_SPREADSHEET_ID,
                order: ord
              })
            });
            ord.syncedToGoogleSheets = true;
            syncedCount++;
          } catch (err) {
            console.warn('Failed to sync order:', ord.orderId, err);
          }
        }
      }

      localStorage.setItem('mani_orders', JSON.stringify(localOrders));
      setOrders([...localOrders]);

      if (syncedCount > 0) {
        setSettingsStatus({ msg: `🎉 Successfully synced ${syncedCount} pending order(s) directly to your Google Sheet!`, type: 'success' });
      } else {
        setSettingsStatus({ msg: 'All current orders are already synced to Google Sheets!', type: 'success' });
      }
    } catch (err) {
      setSettingsStatus({ msg: 'Error syncing orders: ' + err.message, type: 'error' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFileUpload = (e, qrKey) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const updated = {
        ...customQrs,
        [qrKey]: reader.result
      };
      onUpdateQrs(updated);
      setQrSaveMsg(`${qrKey === 'maribank' ? 'Maribank' : 'GCash'} QR code updated successfully!`);
      setTimeout(() => setQrSaveMsg(''), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveGcashNum = (e) => {
    e.preventDefault();
    const updated = {
      ...customQrs,
      gcashNumber: localGcashNum.trim()
    };
    onUpdateQrs(updated);
    setQrSaveMsg('GCash number saved successfully!');
    setTimeout(() => setQrSaveMsg(''), 3000);
  };

  const handleToggleProduct = (id) => {
    const updated = products.map(p => p.id === id ? { ...p, available: !p.available } : p);
    onUpdateProducts(updated);
  };

  const handleSavePrice = (id) => {
    const val = Number(tempPrice);
    if (!isNaN(val) && val > 0) {
      const updated = products.map(p => p.id === id ? { ...p, price: val } : p);
      onUpdateProducts(updated);
    }
    setEditingPriceId(null);
  };

  const handleAddNewFlavor = (e) => {
    e.preventDefault();
    if (!newFlavorName.trim()) return;

    const newProd = {
      id: newFlavorName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: newFlavorName.trim(),
      tagline: 'Specialty Flavor',
      description: newFlavorDesc.trim() || 'Freshly roasted mani seasoned to perfection.',
      price: Number(newFlavorPrice) || 50,
      icon: newFlavorIcon || '🥜',
      badge: 'New',
      available: true,
      sortOrder: products.length + 1,
      accentColor: 'bg-yellow-100 text-yellow-900 border-yellow-300'
    };

    onUpdateProducts([...products, newProd]);
    setNewFlavorName('');
    setNewFlavorDesc('');
    setNewFlavorPrice('50');
    setNewFlavorIcon('🥜');
  };

  const displayOrders = orders.filter(o => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.orderId.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.mobileNumber.includes(q) ||
      (o.deliveryAddress && o.deliveryAddress.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-mani-200/90 shadow-warm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-mani-800 text-amber-200 flex items-center justify-center text-sm font-bold shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-mani-900">
              MANI G? Seller Dashboard
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-mani-600 mt-1">
            Manage orders, update status, configure payment QR codes, and monitor Google Sheet sync.
          </p>
        </div>

        <a
          href={`https://docs.google.com/spreadsheets/d/${settings.spreadsheetId}/edit`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <span>Open Google Sheet</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-mani-200 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'orders' ? 'border-amber-500 text-amber-900' : 'border-transparent text-mani-500 hover:text-mani-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('summary')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'summary' ? 'border-amber-500 text-amber-900' : 'border-transparent text-mani-500 hover:text-mani-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Daily Summary</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'products' ? 'border-amber-500 text-amber-900' : 'border-transparent text-mani-500 hover:text-mani-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Flavors & Pricing</span>
        </button>

        <button
          onClick={() => setActiveTab('qrs')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'qrs' ? 'border-amber-500 text-amber-900' : 'border-transparent text-mani-500 hover:text-mani-800'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Payment QRs</span>
        </button>

        <button
          onClick={() => setActiveTab('sheets')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'sheets' ? 'border-amber-500 text-amber-900' : 'border-transparent text-mani-500 hover:text-mani-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Google Sheet Setup</span>
        </button>
      </div>

      {/* 1. ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-mani-200/90 shadow-warm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-mani-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by order ID, name, phone, or address..."
                className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl border border-mani-200 focus:border-amber-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border border-mani-200 text-mani-800 focus:border-amber-500 outline-none"
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border border-mani-200 text-mani-800 focus:border-amber-500 outline-none"
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

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span className="text-xs text-mani-500 font-medium">Status:</span>
                        <select
                          value={ord.status}
                          disabled={updatingOrderId === ord.orderId}
                          onChange={(e) => handleUpdateStatus(ord.orderId, e.target.value)}
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

                      {/* Delivery Address & Payment */}
                      <div className="space-y-1">
                        <span className="font-bold text-mani-500 uppercase tracking-wider text-[10px]">
                          Delivery Address
                        </span>
                        <div className="text-mani-800 leading-relaxed font-medium">
                          {ord.deliveryAddress || <span className="text-mani-400 italic">No address provided</span>}
                        </div>
                        <div className="text-[11px] font-bold text-mani-600 pt-1 flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-amber-600" />
                          <span>Paid via: <strong className="text-mani-900">{ord.paymentMethod || 'Cash on Delivery'}</strong></span>
                        </div>
                      </div>

                      {/* Items & Amount */}
                      <div className="space-y-1 bg-cream p-3 rounded-xl border border-mani-100">
                        <div className="flex justify-between font-bold text-mani-500 uppercase tracking-wider text-[10px]">
                          <span>Items ({ord.totalPacks} packs)</span>
                          <span className="text-amber-800 font-extrabold text-xs">
                            {formatPHP(ord.subtotal)}
                          </span>
                        </div>
                        <div className="space-y-1 max-h-24 overflow-y-auto pt-1">
                          {(ord.items || [])
                            .filter((it) => (it.quantity || 0) > 0)
                            .map((it, idx) => (
                              <div key={idx} className="flex justify-between text-mani-800">
                                <span>
                                  {it.name} <span className="font-bold">× {it.quantity}</span>
                                </span>
                                <span>{formatPHP(it.price * it.quantity)}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. DAILY SUMMARY TAB */}
      {activeTab === 'summary' && dailySummary && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-mani-200/90 shadow-warm space-y-4">
            <div className="flex items-center justify-between border-b border-mani-100 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-mani-900">
                  Daily Order Summary — {dailySummary.date}
                </h3>
                <p className="text-xs text-mani-600">
                  Live metrics matching Google Sheet daily dashboard.
                </p>
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-xl border border-mani-200 text-mani-800 focus:border-amber-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Total Orders</span>
                <div className="text-3xl font-black text-amber-950 mt-1">{dailySummary.totalOrders}</div>
              </div>

              <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200">
                <span className="text-xs font-bold text-orange-800 uppercase tracking-wider">Total Packs</span>
                <div className="text-3xl font-black text-orange-950 mt-1">{dailySummary.totalPacks}</div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Total Sales</span>
                <div className="text-3xl font-black text-emerald-950 mt-1">{formatPHP(dailySummary.totalSales)}</div>
              </div>
            </div>

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
                    <span className="text-sm font-black text-mani-900">{fl.qty}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. PRODUCTS TAB */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-mani-200/90 shadow-warm space-y-4">
            <div className="border-b border-mani-100 pb-3">
              <h3 className="text-base sm:text-lg font-extrabold text-mani-900">
                Flavors & Pricing Manager
              </h3>
              <p className="text-xs text-mani-600">
                Adjust prices and toggle availability in real-time.
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
                          className="p-1 rounded bg-amber-500 text-white"
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
                          className="p-1 text-mani-400 hover:text-mani-800"
                          title="Edit price"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleToggleProduct(p.id)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-xl transition-colors ${
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
                Add Future Flavor (e.g. Cheese, Garlic Butter)
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
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all"
                >
                  + Add Flavor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. PAYMENT QRS TAB */}
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
                  <p className="text-[11px] text-mani-500 mt-2 font-medium">
                    Display preview shown to customers selecting Maribank.
                  </p>
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

                {/* Edit GCash Number */}
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
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
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
                  <p className="text-[11px] text-mani-500 mt-2 font-medium">
                    Display preview shown to customers selecting GCash.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. SHEETS SETUP TAB */}
      {activeTab === 'sheets' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-mani-200/90 shadow-warm space-y-5">
            <div className="border-b border-mani-100 pb-3">
              <h3 className="text-base sm:text-lg font-extrabold text-mani-900">
                Google Sheets Integration Settings
              </h3>
              <p className="text-xs text-mani-600">
                Configure your Google Apps Script Web App URL to record submissions automatically.
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
                  Google Spreadsheet ID
                </label>
                <input
                  type="text"
                  value={settings.spreadsheetId}
                  onChange={(e) => setSettings({ ...settings, spreadsheetId: e.target.value })}
                  className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-mani-200 bg-mani-50 text-mani-700 outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-mani-800 mb-1">
                  Google Apps Script Web App URL
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
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-colors"
                >
                  Save Settings
                </button>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTestingSheet}
                  className="px-4 py-2.5 rounded-xl bg-cream-warm hover:bg-mani-100 border border-mani-200 text-mani-800 font-bold text-xs transition-colors"
                >
                  {isTestingSheet ? 'Testing...' : 'Test Web App Connection'}
                </button>
                <button
                  type="button"
                  onClick={handleSyncPendingOrders}
                  disabled={isSyncing}
                  className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : `Sync Pending Orders (${orders.filter(o => !o.syncedToGoogleSheets).length})`}</span>
                </button>
              </div>
            </form>

            {/* Quick 3-Step Setup Guide */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-mani-800 space-y-2.5">
              <h4 className="font-extrabold text-amber-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <span>📋</span> Quick 3-Step Setup for Google Sheets
              </h4>
              <ol className="list-decimal list-inside space-y-1.5 font-medium leading-relaxed">
                <li>
                  Open your <a href={`https://docs.google.com/spreadsheets/d/${settings.spreadsheetId}/edit`} target="_blank" rel="noopener noreferrer" className="text-amber-800 font-bold underline">Google Sheet</a> and click <strong>Extensions &gt; Apps Script</strong>.
                </li>
                <li>
                  Paste the script code from <code>google-apps-script/Code.gs</code> and click <strong>Deploy &gt; New deployment</strong>.
                </li>
                <li>
                  Select type: <strong>Web app</strong>, Execute as: <strong>Me</strong>, Who has access: <strong>Anyone</strong>, click <strong>Deploy</strong>, and paste the URL above!
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
