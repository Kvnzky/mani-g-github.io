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
      {/* 3. Customer & Shipping Information */}
      <div 
        id="customer-info-section"
        className="bg-white rounded-3xl border-2 border-mani-950 shadow-snack overflow-hidden transition-all"
      >
        <div className="bg-gradient-to-r from-[#FDF9F0] via-amber-50/70 to-[#FDF9F0] px-5 sm:px-6 py-4 border-b-2 border-mani-950/10">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="font-display text-base sm:text-lg font-extrabold text-mani-950 flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-amber-300 border-2 border-mani-950 flex items-center justify-center text-sm shadow-2xs">
                🚚
              </span>
              <span>Customer & Shipping Information</span>
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-mani-950 text-amber-300 font-extrabold uppercase tracking-wider">
              Step 2
            </span>
          </div>
          <p className="text-xs text-mani-600 font-medium mt-1">
            Where should we send your freshly roasted Mani tubs?
          </p>
        </div>

        <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Customer Name */}
          <div>
            <label htmlFor="customer-name" className="block text-xs font-extrabold text-mani-900 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-600" />
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              id="customer-name"
              name="customerName"
              type="text"
              autoComplete="name"
              value={formData.customerName || ''}
              onChange={(e) => handleInputChange('customerName', e.target.value)}
              placeholder="e.g. Juan Dela Cruz"
              className={`w-full text-sm px-4 py-2.5 rounded-xl border-2 font-medium ${
                errors.customerName ? 'border-red-500 bg-red-50/50' : 'border-mani-200 focus:border-mani-950 bg-[#FDFBF7] focus:bg-white'
              } focus:ring-2 focus:ring-amber-300 outline-none transition-all`}
            />
            {errors.customerName && (
              <p className="text-xs text-red-600 font-bold mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.customerName}
              </p>
            )}
          </div>

          {/* Mobile Number */}
          <div>
            <label htmlFor="customer-mobile" className="block text-xs font-extrabold text-mani-900 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-600" />
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              id="customer-mobile"
              name="mobileNumber"
              type="tel"
              autoComplete="tel"
              value={formData.mobileNumber || ''}
              onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
              placeholder="0917 123 4567 or +639171234567"
              className={`w-full text-sm px-4 py-2.5 rounded-xl border-2 font-medium ${
                errors.mobileNumber ? 'border-red-500 bg-red-50/50' : 'border-mani-200 focus:border-mani-950 bg-[#FDFBF7] focus:bg-white'
              } focus:ring-2 focus:ring-amber-300 outline-none transition-all`}
            />
            {errors.mobileNumber ? (
              <p className="text-xs text-red-600 font-bold mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.mobileNumber}
              </p>
            ) : (
              <p className="text-[11px] text-mani-500 font-medium mt-1">
                Used by our rider to coordinate delivery upon arrival.
              </p>
            )}
          </div>

          {/* Address / To Be Delivered To */}
          <div id="shipping-info-section" className="sm:col-span-2">
            <label htmlFor="customer-address" className="block text-xs font-extrabold text-mani-900 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              Address / To Be Delivered To <span className="text-red-500">*</span>
            </label>
            <textarea
              id="customer-address"
              name="deliveryAddress"
              rows="2"
              autoComplete="street-address"
              value={formData.deliveryAddress || ''}
              onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
              placeholder="House/Unit No., Street Name, Barangay, City, Landmark (e.g. Near St. Jude Church)"
              className={`w-full text-sm px-4 py-2.5 rounded-xl border-2 font-medium ${
                errors.deliveryAddress ? 'border-red-500 bg-red-50/50' : 'border-mani-200 focus:border-mani-950 bg-[#FDFBF7] focus:bg-white'
              } focus:ring-2 focus:ring-amber-300 outline-none transition-all resize-none`}
            />
            {errors.deliveryAddress && (
              <p className="text-xs text-red-600 font-bold mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.deliveryAddress}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 5. Payment / Checkout */}
      <div 
        id="payment-checkout-section"
        className="bg-white rounded-3xl border-2 border-mani-950 shadow-snack overflow-hidden transition-all"
      >
        <div className="bg-gradient-to-r from-[#FDF9F0] via-amber-50/70 to-[#FDF9F0] px-5 sm:px-6 py-4 border-b-2 border-mani-950/10">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="font-display text-base sm:text-lg font-extrabold text-mani-950 flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-amber-300 border-2 border-mani-950 flex items-center justify-center text-sm shadow-2xs">
                💳
              </span>
              <span>Payment & Checkout</span>
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-mani-950 text-amber-300 font-extrabold uppercase tracking-wider">
              Step 3
            </span>
          </div>
          <p className="text-xs text-mani-600 font-medium mt-1">
            Choose your preferred payment method and lock in your batch order.
          </p>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {errors.paymentMethod && (
            <p className="text-xs text-red-600 font-bold flex items-center gap-1 bg-red-50 p-2.5 rounded-xl border border-red-200">
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
                  aria-pressed={formData.paymentMethod === 'Cash on Delivery'}
                  onClick={() => handleInputChange('paymentMethod', 'Cash on Delivery')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                    formData.paymentMethod === 'Cash on Delivery'
                      ? 'bg-amber-400 text-mani-950 border-mani-950 shadow-snack-sm -translate-y-0.5'
                      : 'bg-[#FDFBF7] text-mani-900 border-mani-200 hover:border-mani-400 hover:bg-amber-50/40'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className={`p-2 rounded-xl text-xl ${formData.paymentMethod === 'Cash on Delivery' ? 'bg-white/70 border border-mani-950/20' : 'bg-mani-200/50'}`}>💵</span>
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      formData.paymentMethod === 'Cash on Delivery' ? 'border-mani-950 bg-mani-950' : 'border-mani-300'
                    }`}>
                      {formData.paymentMethod === 'Cash on Delivery' && <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />}
                    </span>
                  </div>
                  <div>
                    <div className="font-display font-extrabold text-sm sm:text-base">Cash on Delivery</div>
                    <div className={`text-xs font-semibold mt-0.5 ${formData.paymentMethod === 'Cash on Delivery' ? 'text-mani-900' : 'text-mani-500'}`}>
                      Pay when delivered
                    </div>
                  </div>
                </button>
              )}

              {/* Option 2: Maribank */}
              {isMaribankEnabled && (
                <button
                  type="button"
                  aria-pressed={formData.paymentMethod === 'Maribank'}
                  onClick={() => handleInputChange('paymentMethod', 'Maribank')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                    formData.paymentMethod === 'Maribank'
                      ? 'bg-orange-500 text-white border-mani-950 shadow-snack-sm -translate-y-0.5'
                      : 'bg-[#FDFBF7] text-mani-900 border-mani-200 hover:border-mani-400 hover:bg-orange-50/40'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className={`p-2 rounded-xl text-xl ${formData.paymentMethod === 'Maribank' ? 'bg-white/20' : 'bg-mani-200/50'}`}>🏦</span>
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      formData.paymentMethod === 'Maribank' ? 'border-white bg-white' : 'border-mani-300'
                    }`}>
                      {formData.paymentMethod === 'Maribank' && <span className="w-2 h-2 rounded-full bg-orange-600" />}
                    </span>
                  </div>
                  <div>
                    <div className="font-display font-extrabold text-sm sm:text-base">Maribank</div>
                    <div className={`text-xs font-semibold mt-0.5 ${formData.paymentMethod === 'Maribank' ? 'text-orange-100' : 'text-mani-500'}`}>
                      Scan to pay via QR
                    </div>
                  </div>
                </button>
              )}

              {/* Option 3: GCash */}
              {isGcashEnabled && (
                <button
                  type="button"
                  aria-pressed={formData.paymentMethod === 'GCash'}
                  onClick={() => handleInputChange('paymentMethod', 'GCash')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                    formData.paymentMethod === 'GCash'
                      ? 'bg-blue-600 text-white border-mani-950 shadow-snack-sm -translate-y-0.5'
                      : 'bg-[#FDFBF7] text-mani-900 border-mani-200 hover:border-mani-400 hover:bg-blue-50/40'
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
                    <div className="font-display font-extrabold text-sm sm:text-base">GCash</div>
                    <div className={`text-xs font-semibold mt-0.5 ${formData.paymentMethod === 'GCash' ? 'text-blue-100' : 'text-mani-500'}`}>
                      QR Code & Number
                    </div>
                  </div>
                </button>
              )}
            </div>
          )}

          {/* Dynamic Payment Details Display with ENLARGED QR CODES */}
          <div className="pt-1">
            {/* 1. Cash on Delivery Selected */}
            {formData.paymentMethod === 'Cash on Delivery' && isCodEnabled && (
              <div className="p-4 rounded-2xl bg-amber-50/90 border-2 border-amber-200 text-mani-800 animate-fade-in flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-200/80 border border-amber-300 text-amber-900 flex items-center justify-center text-xl shrink-0">
                  💵
                </div>
                <div>
                  <h4 className="font-display text-sm font-extrabold text-mani-950">Cash on Delivery</h4>
                  <p className="text-xs text-mani-700 font-medium mt-0.5">
                    Prepare exact amount if possible — payment will be collected upon delivery!
                  </p>
                </div>
              </div>
            )}

            {/* 2. Maribank Selected (BIG QR) */}
            {formData.paymentMethod === 'Maribank' && isMaribankEnabled && (
              <div className="p-5 sm:p-7 rounded-3xl bg-orange-50/80 border-2 border-orange-300 space-y-4 animate-fade-in text-center">
                <div className="flex items-center justify-center gap-2 text-orange-950">
                  <span className="text-2xl">🏦</span>
                  <h4 className="font-display text-base sm:text-lg font-black">Maribank Payment</h4>
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
              <div className="p-5 sm:p-7 rounded-3xl bg-blue-50/80 border-2 border-blue-300 space-y-4 animate-fade-in text-center">
                <div className="flex items-center justify-center gap-2 text-blue-950">
                  <span className="text-2xl">📱</span>
                  <h4 className="font-display text-base sm:text-lg font-black">GCash Payment</h4>
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
                <div className="space-y-2.5" data-testid="customer-form-closed-notice">
                  <div className="p-3.5 rounded-2xl bg-red-50 border border-red-300 text-red-800 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 text-center">
                    <Lock className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Orders are currently closed. Please check back soon.</span>
                  </div>
                  <button
                    type="button"
                    disabled={true}
                    className="w-full py-4 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 bg-red-100 border-2 border-red-300 text-red-800 cursor-not-allowed shadow-none"
                  >
                    <Lock className="w-5 h-5 text-red-600" />
                    <span>Orders Closed</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting || totalPacks === 0}
                  onClick={onSubmitOrder}
                  className={`w-full py-4 rounded-2xl font-display font-black text-base sm:text-lg flex items-center justify-center gap-2.5 transition-all ${
                    totalPacks === 0 || isSubmitting
                      ? 'bg-mani-100 text-mani-400 border-2 border-mani-200 cursor-not-allowed shadow-none'
                      : 'bg-amber-400 hover:bg-amber-500 text-mani-950 border-2 border-mani-950 shadow-snack active:translate-y-0.5 cursor-pointer'
                  }`}
                >
                  {isSubmitting ? (
                    <span>Submitting Your Mani Order...</span>
                  ) : (
                    <>
                      <span>Place Order Now 🥜</span>
                      {totalPacks > 0 && subtotal > 0 && (
                        <span className="bg-mani-950 text-amber-300 px-3 py-0.5 rounded-xl text-xs sm:text-sm font-extrabold ml-1">
                          {formatPHP(subtotal)}
                        </span>
                      )}
                      <ArrowRight className="w-5 h-5 stroke-[2.5] ml-0.5" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
