import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Copy, Check, AlertCircle, ScanLine, ArrowRight, Lock } from 'lucide-react';
import { DEFAULT_GCASH_QR, DEFAULT_MARIBANK_QR, GCASH_NUMBER } from '../config/qrConfig';
import { formatPHP } from '../config/products';

export default function CustomerForm({ 
  formData, 
  onChange, 
  errors = {}, 
  customQrs, 
  paymentMethods = { cod: true, maribank: true, gcash: true },
  onSubmitOrder,
  isSubmitting = false,
  isOrdersClosed = false,
  totalPacks = 0,
  subtotal = 0
}) {
  const [copiedGcash, setCopiedGcash] = useState(false);

  const maribankQr = customQrs?.maribank || DEFAULT_MARIBANK_QR;
  const gcashQr = customQrs?.gcash || DEFAULT_GCASH_QR;
  const gcashNumber = customQrs?.gcashNumber || GCASH_NUMBER;

  const handleInputChange = (field, value) => {
    onChange({
      ...formData,
      [field]: value
    });
  };

  const handleCopyGcash = () => {
    navigator.clipboard.writeText(gcashNumber);
    setCopiedGcash(true);
    setTimeout(() => setCopiedGcash(false), 2000);
  };

  const isCodEnabled = paymentMethods?.cod !== false;
  const isMaribankEnabled = paymentMethods?.maribank !== false;
  const isGcashEnabled = paymentMethods?.gcash !== false;
  const hasAnyPaymentMethod = isCodEnabled || isMaribankEnabled || isGcashEnabled;
  const enabledCount = [isCodEnabled, isMaribankEnabled, isGcashEnabled].filter(Boolean).length;
  const gridColsClass = enabledCount === 1 ? 'grid-cols-1' : enabledCount === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-3';

  // Auto-switch customer paymentMethod if the currently selected method is disabled
  useEffect(() => {
    let isValid = false;
    if (formData.paymentMethod === 'Cash on Delivery' && isCodEnabled) isValid = true;
    if (formData.paymentMethod === 'Maribank' && isMaribankEnabled) isValid = true;
    if (formData.paymentMethod === 'GCash' && isGcashEnabled) isValid = true;

    if (!isValid && hasAnyPaymentMethod) {
      if (isCodEnabled) handleInputChange('paymentMethod', 'Cash on Delivery');
      else if (isMaribankEnabled) handleInputChange('paymentMethod', 'Maribank');
      else if (isGcashEnabled) handleInputChange('paymentMethod', 'GCash');
    }
  }, [paymentMethods, formData.paymentMethod, isCodEnabled, isMaribankEnabled, isGcashEnabled, hasAnyPaymentMethod]);

  return (
    <div className="space-y-6">
      {/* 3. Customer Information */}
      <div 
        id="customer-info-section"
        className="bg-white rounded-3xl p-5 sm:p-7 border border-mani-200/90 shadow-warm space-y-4 transition-all"
      >
        <div className="border-b border-mani-100 pb-3">
          <h3 className="text-base sm:text-lg font-extrabold text-mani-900 flex items-center gap-2">
            <span>👤</span> Customer Information
          </h3>
          <p className="text-xs sm:text-sm text-mani-600">
            Please provide your name and contact number for order updates.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Customer Name */}
          <div>
            <label className="block text-xs font-bold text-mani-800 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-600" />
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.customerName || ''}
              onChange={(e) => handleInputChange('customerName', e.target.value)}
              placeholder="e.g. Juan Dela Cruz"
              className={`w-full text-sm px-4 py-2.5 rounded-xl border ${
                errors.customerName ? 'border-red-400 bg-red-50/50' : 'border-mani-200 focus:border-amber-500'
              } focus:ring-2 focus:ring-amber-200 outline-none transition-all`}
            />
            {errors.customerName && (
              <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.customerName}
              </p>
            )}
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-bold text-mani-800 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-600" />
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.mobileNumber || ''}
              onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
              placeholder="0917 123 4567 or +639171234567"
              className={`w-full text-sm px-4 py-2.5 rounded-xl border ${
                errors.mobileNumber ? 'border-red-400 bg-red-50/50' : 'border-mani-200 focus:border-amber-500'
              } focus:ring-2 focus:ring-amber-200 outline-none transition-all`}
            />
            {errors.mobileNumber ? (
              <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.mobileNumber}
              </p>
            ) : (
              <p className="text-[11px] text-mani-500 mt-1">
                Used to coordinate delivery upon arrival.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 4. Shipping Information */}
      <div 
        id="shipping-info-section"
        className="bg-white rounded-3xl p-5 sm:p-7 border border-mani-200/90 shadow-warm space-y-4 transition-all"
      >
        <div className="border-b border-mani-100 pb-3">
          <h3 className="text-base sm:text-lg font-extrabold text-mani-900 flex items-center gap-2">
            <span>📍</span> Shipping Information
          </h3>
          <p className="text-xs sm:text-sm text-mani-600">
            Specify where your freshly prepared Mani tubs will be delivered.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-mani-800 mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
            Address / To Be Delivered To <span className="text-red-500">*</span>
          </label>
          <textarea
            rows="2"
            value={formData.deliveryAddress || ''}
            onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
            placeholder="House/Unit No., Street Name, Barangay, City, Landmark (e.g. Near St. Jude Church)"
            className={`w-full text-sm px-4 py-2.5 rounded-xl border ${
              errors.deliveryAddress ? 'border-red-400 bg-red-50/50' : 'border-mani-200 focus:border-amber-500'
            } focus:ring-2 focus:ring-amber-200 outline-none transition-all resize-none`}
          />
          {errors.deliveryAddress && (
            <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.deliveryAddress}
            </p>
          )}
        </div>
      </div>

      {/* 5. Payment / Checkout */}
      <div 
        id="payment-checkout-section"
        className="bg-white rounded-3xl p-5 sm:p-7 border border-mani-200/90 shadow-warm space-y-5 transition-all"
      >
        <div className="border-b border-mani-100 pb-3">
          <h3 className="text-base sm:text-lg font-extrabold text-mani-900 flex items-center gap-2">
            <span>💳</span> Payment & Checkout
          </h3>
          <p className="text-xs sm:text-sm text-mani-600">
            Choose your payment method and submit your order.
          </p>
        </div>

        {errors.paymentMethod && (
          <p className="text-xs text-red-600 font-medium flex items-center gap-1 bg-red-50 p-2.5 rounded-xl border border-red-200">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.paymentMethod}
          </p>
        )}

        {!hasAnyPaymentMethod && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-xs">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-700" />
            <span>All online payment methods are temporarily disabled by the administrator. Please contact us directly to place your order.</span>
          </div>
        )}

        {/* Payment Options Grid */}
        {hasAnyPaymentMethod && (
          <div className={`grid ${gridColsClass} gap-3`}>
            {/* Option 1: Cash on Delivery */}
            {isCodEnabled && (
              <button
                type="button"
                onClick={() => handleInputChange('paymentMethod', 'Cash on Delivery')}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                  formData.paymentMethod === 'Cash on Delivery'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-300'
                    : 'bg-mani-50/70 text-mani-900 border-mani-200 hover:bg-mani-100/70'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className={`p-2 rounded-xl text-xl ${formData.paymentMethod === 'Cash on Delivery' ? 'bg-white/20' : 'bg-mani-200/50'}`}>💵</span>
                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    formData.paymentMethod === 'Cash on Delivery' ? 'border-white bg-white' : 'border-mani-300'
                  }`}>
                    {formData.paymentMethod === 'Cash on Delivery' && <span className="w-2 h-2 rounded-full bg-amber-600" />}
                  </span>
                </div>
                <div>
                  <div className="font-extrabold text-sm sm:text-base">Cash on Delivery</div>
                  <div className={`text-xs mt-0.5 ${formData.paymentMethod === 'Cash on Delivery' ? 'text-amber-100' : 'text-mani-500'}`}>
                    Pay when delivered
                  </div>
                </div>
              </button>
            )}

            {/* Option 2: Maribank */}
            {isMaribankEnabled && (
              <button
                type="button"
                onClick={() => handleInputChange('paymentMethod', 'Maribank')}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                  formData.paymentMethod === 'Maribank'
                    ? 'bg-orange-600 text-white border-orange-700 shadow-md ring-2 ring-orange-300'
                    : 'bg-mani-50/70 text-mani-900 border-mani-200 hover:bg-mani-100/70'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className={`p-2 rounded-xl text-xl ${formData.paymentMethod === 'Maribank' ? 'bg-white/20' : 'bg-mani-200/50'}`}>🏦</span>
                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    formData.paymentMethod === 'Maribank' ? 'border-white bg-white' : 'border-mani-300'
                  }`}>
                    {formData.paymentMethod === 'Maribank' && <span className="w-2 h-2 rounded-full bg-orange-700" />}
                  </span>
                </div>
                <div>
                  <div className="font-extrabold text-sm sm:text-base">Maribank</div>
                  <div className={`text-xs mt-0.5 ${formData.paymentMethod === 'Maribank' ? 'text-orange-100' : 'text-mani-500'}`}>
                    Scan to pay via QR
                  </div>
                </div>
              </button>
            )}

            {/* Option 3: GCash */}
            {isGcashEnabled && (
              <button
                type="button"
                onClick={() => handleInputChange('paymentMethod', 'GCash')}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                  formData.paymentMethod === 'GCash'
                    ? 'bg-blue-600 text-white border-blue-700 shadow-md ring-2 ring-blue-300'
                    : 'bg-mani-50/70 text-mani-900 border-mani-200 hover:bg-mani-100/70'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className={`p-2 rounded-xl text-xl ${formData.paymentMethod === 'GCash' ? 'bg-white/20' : 'bg-mani-200/50'}`}>📱</span>
                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    formData.paymentMethod === 'GCash' ? 'border-white bg-white' : 'border-mani-300'
                  }`}>
                    {formData.paymentMethod === 'GCash' && <span className="w-2 h-2 rounded-full bg-blue-700" />}
                  </span>
                </div>
                <div>
                  <div className="font-extrabold text-sm sm:text-base">GCash</div>
                  <div className={`text-xs mt-0.5 ${formData.paymentMethod === 'GCash' ? 'text-blue-100' : 'text-mani-500'}`}>
                    QR Code & Number
                  </div>
                </div>
              </button>
            )}
          </div>
        )}

        {/* Dynamic Payment Details Display with ENLARGED QR CODES */}
        <div className="pt-2">
          {/* 1. Cash on Delivery Selected */}
          {formData.paymentMethod === 'Cash on Delivery' && isCodEnabled && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-mani-800 animate-fade-in flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl shrink-0">
                💵
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-950">Cash on Delivery</h4>
                <p className="text-xs text-amber-800 font-medium mt-0.5">
                  Payment will be collected by the courier upon delivery.
                </p>
              </div>
            </div>
          )}

          {/* 2. Maribank Selected (BIG QR) */}
          {formData.paymentMethod === 'Maribank' && isMaribankEnabled && (
            <div className="p-5 sm:p-7 rounded-3xl bg-orange-50/80 border-2 border-orange-200 space-y-4 animate-fade-in text-center">
              <div className="flex items-center justify-center gap-2 text-orange-950">
                <span className="text-2xl">🏦</span>
                <h4 className="text-base sm:text-lg font-black">Maribank Payment</h4>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-900 text-xs font-bold border border-orange-300/80">
                <ScanLine className="w-3.5 h-3.5" />
                <span>Scan the QR code to send your payment.</span>
              </div>

              {/* ENLARGED MARIBANK QR CODE */}
              <div className="bg-white p-5 sm:p-7 rounded-3xl border-2 border-orange-300 max-w-sm sm:max-w-md mx-auto shadow-lg shadow-orange-900/10">
                <div className="relative group overflow-hidden rounded-2xl bg-white p-2">
                  <img
                    src={maribankQr}
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

          {/* 3. GCash Selected (BIG QR) */}
          {formData.paymentMethod === 'GCash' && isGcashEnabled && (
            <div className="p-5 sm:p-7 rounded-3xl bg-blue-50/80 border-2 border-blue-200 space-y-4 animate-fade-in text-center">
              <div className="flex items-center justify-center gap-2 text-blue-950">
                <span className="text-2xl">📱</span>
                <h4 className="text-base sm:text-lg font-black">GCash Payment</h4>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold border border-blue-300/80">
                <ScanLine className="w-3.5 h-3.5" />
                <span>Scan the QR code or send payment to the GCash number below.</span>
              </div>

              {/* GCash Number Box with Big Copy Button */}
              <div className="bg-white p-4 rounded-2xl border-2 border-blue-300 max-w-sm sm:max-w-md mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                <div className="text-center sm:text-left">
                  <span className="text-xs font-bold text-blue-800 uppercase tracking-wider block">
                    GCash Number:
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-mani-900 font-mono tracking-wider">
                    {gcashNumber}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyGcash}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  {copiedGcash ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedGcash ? 'Copied Number!' : 'Copy Number'}</span>
                </button>
              </div>

              {/* ENLARGED GCASH QR CODE */}
              <div className="bg-white p-5 sm:p-7 rounded-3xl border-2 border-blue-300 max-w-sm sm:max-w-md mx-auto shadow-lg shadow-blue-900/10">
                <div className="relative group overflow-hidden rounded-2xl bg-white p-2">
                  <img
                    src={gcashQr}
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

        {/* Final Order Placement Button */}
        {onSubmitOrder && (
          <div className="pt-4 border-t border-mani-100">
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
                onClick={onSubmitOrder}
                className={`w-full py-4 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all ${
                  totalPacks === 0 || isSubmitting
                    ? 'bg-mani-200 text-mani-400 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white shadow-amber-900/20 active:scale-98 cursor-pointer'
                }`}
              >
                {isSubmitting ? (
                  <span>Submitting Order...</span>
                ) : (
                  <>
                    <span>Place Order Now 🥜</span>
                    {totalPacks > 0 && subtotal > 0 && (
                      <span className="bg-black/20 px-2.5 py-0.5 rounded-lg text-xs font-extrabold ml-1">
                        {formatPHP(subtotal)}
                      </span>
                    )}
                    <ArrowRight className="w-5 h-5 ml-1" />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
