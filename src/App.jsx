import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FlavorCard from './components/FlavorCard';
import CustomerForm from './components/CustomerForm';
import OrderSummaryDrawer from './components/OrderSummaryDrawer';
import OrderConfirmationModal from './components/OrderConfirmationModal';
import AdminPortal from './components/AdminPortal';
import { DEFAULT_PRODUCTS, formatPHP } from './config/products';
import { DEFAULT_GCASH_QR, DEFAULT_MARIBANK_QR, GCASH_NUMBER } from './config/qrConfig';
import { DEFAULT_SPREADSHEET_ID, DEFAULT_APPS_SCRIPT_URL } from './config/sheetsConfig';
import { ArrowRight, AlertCircle, ShoppingBag, ChevronRight } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('order'); // 'order' or 'admin'
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  
  // Flavors cart: { [productId]: quantity }
  const [quantities, setQuantities] = useState({
    salted: 0,
    unsalted: 0,
    spicy: 0,
    bbq: 0,
    'sour-cream': 0,
    'bawang-only': 0
  });

  // Customer Form Data (Customer Name, Mobile Number, Delivery Address, Payment Method)
  const [customerData, setCustomerData] = useState({
    customerName: '',
    mobileNumber: '',
    deliveryAddress: '',
    paymentMethod: 'Cash on Delivery' // 'Cash on Delivery', 'Maribank', 'GCash'
  });

  // Admin Configurable QR codes
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

  // Validation & UI State
  const [validationErrors, setValidationErrors] = useState({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Load custom products from backend if available
  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleUpdateProducts = (newProducts) => {
    setProducts(newProducts);
    fetch('/api/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProducts)
    }).catch(console.error);
  };

  const handleUpdateQrs = (newQrs) => {
    setCustomQrs(newQrs);
    localStorage.setItem('mani_qr_config', JSON.stringify(newQrs));
  };

  const handleQuantityChange = (productId, newQty) => {
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
      errors.mobileNumber = 'Please enter a valid Philippine mobile number (e.g. 09171234567 or +639171234567).';
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

  // Order Submission
  const handleSubmitOrder = async () => {
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

    const payload = {
      customerName: customerData.customerName.trim(),
      mobileNumber: customerData.mobileNumber.trim(),
      deliveryAddress: customerData.deliveryAddress.trim(),
      paymentMethod: customerData.paymentMethod,
      items: orderedItems
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Unable to submit your order via server.');
      }

      setConfirmedOrder(data.order);
      setIsDrawerOpen(false);
    } catch (err) {
      console.warn('Backend /api/orders not available (static/GitHub Pages mode). Processing client-side:', err.message);
      
      // Standalone/static mode fallback (works on GitHub Pages without a Node backend)
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
        paymentStatus: 'Unpaid',
        items: orderedItems,
        flavorQuantities: { ...quantities },
        totalPacks,
        subtotal,
        status: 'New',
        createdAt: now.toISOString(),
        syncedToGoogleSheets: false
      };

      // Direct submission to Google Sheet if Google Apps Script URL configured
      const appsScriptUrl = localStorage.getItem('mani_apps_script_url') || DEFAULT_APPS_SCRIPT_URL;
      const targetSpreadsheetId = localStorage.getItem('mani_spreadsheet_id') || DEFAULT_SPREADSHEET_ID;

      if (appsScriptUrl) {
        try {
          await fetch(appsScriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
              action: 'addOrder',
              spreadsheetId: targetSpreadsheetId,
              order: clientOrder
            })
          });
          clientOrder.syncedToGoogleSheets = true;
        } catch (sheetErr) {
          console.warn('Direct Google Sheet sync:', sheetErr);
        }
      }

      localStorage.setItem('mani_orders', JSON.stringify([clientOrder, ...savedOrders]));
      setConfirmedOrder(clientOrder);
      setIsDrawerOpen(false);
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
      />

      {/* Main Content */}
      <main className="flex-1 pb-24 sm:pb-12">
        {currentView === 'admin' ? (
          <AdminPortal
            products={products}
            onUpdateProducts={handleUpdateProducts}
            customQrs={customQrs}
            onUpdateQrs={handleUpdateQrs}
          />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Friendly Hero Banner */}
            <div className="text-center space-y-2 py-5 sm:py-7 bg-gradient-to-b from-amber-100/60 to-transparent rounded-3xl p-4 sm:p-8 border border-amber-200/50 shadow-xs">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500 text-white shadow-xs">
                <span>🇵🇭</span> Hot & Crispy Everyday
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-mani-950 tracking-tight">
                MANI G?
              </h2>
              <p className="text-base sm:text-lg text-amber-800 font-extrabold italic tracking-tight">
                “G ka ba sa crunch?”
              </p>
              <p className="text-xs sm:text-sm text-mani-600 max-w-md mx-auto font-medium leading-relaxed">
                Choose your favorite flavors, enter your delivery address, and pick your payment method!
              </p>
            </div>

            {/* Error Banner */}
            {submissionError && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-300 text-sm font-semibold text-red-700 flex items-center gap-2.5 shadow-xs">
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

                  {/* Flavors Grid: 1 col on mobile, 2 on tablet, 2 on desktop sidebar, 3 on wide desktop */}
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
                  <div className="flex items-center justify-between border-b border-mani-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🛒</span>
                      <h3 className="text-base sm:text-lg font-black text-mani-900">
                        Live Order Summary
                      </h3>
                    </div>
                    {totalPacks > 0 && (
                      <button
                        type="button"
                        onClick={handleClearOrder}
                        className="text-xs font-semibold text-mani-500 hover:text-red-600 transition-colors"
                      >
                        Clear All
                      </button>
                    )}
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

                        <button
                          type="button"
                          disabled={isSubmitting || totalPacks === 0}
                          onClick={handleSubmitOrder}
                          className={`w-full py-4 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all ${
                            totalPacks === 0 || isSubmitting
                              ? 'bg-mani-200 text-mani-400 cursor-not-allowed shadow-none'
                              : 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white shadow-amber-900/20 active:scale-98'
                          }`}
                        >
                          {isSubmitting ? 'Submitting Order...' : 'Place Order Now 🥜'}
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </section>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Sticky Quick-Action Bar (when items in cart, hidden on desktop) */}
      {currentView === 'order' && totalPacks > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-cream/95 backdrop-blur-md border-t border-amber-200 px-4 py-3 shadow-2xl lg:hidden animate-fade-in flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-mani-600">
              {totalPacks} pack{totalPacks > 1 ? 's' : ''} in cart
            </div>
            <div className="text-base font-black text-amber-900">
              {formatPHP(subtotal)}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('checkout-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-amber-900/20"
          >
            <span>Proceed to Checkout</span>
            <ChevronRight className="w-4 h-4" />
          </button>
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
      />

      {/* Confirmation Modal */}
      {confirmedOrder && (
        <OrderConfirmationModal
          order={confirmedOrder}
          onReset={handleResetForNewOrder}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-mani-200/80 bg-white py-6 text-center text-xs text-mani-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-1">
          <p className="font-bold text-mani-700">
            🥜 MANI G? — “G ka ba sa crunch?”
          </p>
          <p>
            Connected to Google Sheet: <a href="https://docs.google.com/spreadsheets/d/1CpPaE3QFmyAuptF4z52vGtpF_YFuuH-EmEHmQXpS8yI/edit" target="_blank" rel="noreferrer" className="text-amber-700 underline font-semibold">1CpPaE3QFmyAuptF4z52vGtpF_YFuuH-EmEHmQXpS8yI</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
