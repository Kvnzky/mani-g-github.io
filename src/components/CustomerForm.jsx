import React, { useState, useEffect, useRef } from 'react';
import { User, Phone, MapPin, Copy, Check, AlertCircle, ScanLine, ArrowRight, Lock, Navigation, PenLine, Loader2, RefreshCw, CheckCircle2 } from 'lucide-react';
import { DEFAULT_GCASH_QR, DEFAULT_MARIBANK_QR, GCASH_NUMBER } from '../config/qrConfig';
import { formatPHP } from '../config/products';

// Convert GPS coordinates (latitude, longitude) into a readable delivery address
async function reverseGeocodeCoordinates(latitude, longitude) {
  // 1. Primary: OpenStreetMap Nominatim Reverse Geocoding API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&addressdetails=1&accept-language=en`,
      {
        headers: { Accept: 'application/json' },
        signal: controller.signal
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.display_name === 'string' && data.display_name.trim()) {
        return data.display_name.trim();
      }
      if (data && data.address && typeof data.address === 'object') {
        const addr = data.address;
        const parts = [
          addr.house_number,
          addr.road || addr.pedestrian || addr.street,
          addr.neighbourhood || addr.suburb || addr.village || addr.quarter || addr.hamlet,
          addr.city || addr.town || addr.municipality,
          addr.state || addr.province || addr.region,
          addr.postcode
        ].filter(Boolean);
        if (parts.length > 0) {
          return parts.join(', ');
        }
      }
    }
  } catch (err) {
    // Proceed to fallback reverse geocoder
  }

  // 2. Fallback: BigDataCloud Client Reverse Geocoding API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&localityLanguage=en`,
      {
        headers: { Accept: 'application/json' },
        signal: controller.signal
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        const rawParts = [
          data.locality,
          data.city,
          data.principalSubdivision,
          data.postcode,
          data.countryName
        ].filter((part) => typeof part === 'string' && part.trim());
        const uniqueParts = [...new Set(rawParts.map((p) => p.trim()))];
        if (uniqueParts.length > 0) {
          return uniqueParts.join(', ');
        }
      }
    }
  } catch (err) {
    // Both reverse-geocoding providers failed
  }

  throw new Error('REVERSE_GEOCODE_FAILED');
}

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
  const [addressMode, setAddressMode] = useState('manual'); // 'manual' | 'location'
  const [locationState, setLocationState] = useState({
    status: 'idle', // 'idle' | 'loading' | 'success' | 'error'
    message: ''
  });
  const addressInputRef = useRef(null);

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

  const handleSelectManualMode = () => {
    setAddressMode('manual');
    setLocationState({ status: 'idle', message: '' });
    setTimeout(() => {
      if (addressInputRef.current) {
        addressInputRef.current.focus();
      }
    }, 50);
  };

  const handleUseMyLocation = () => {
    setAddressMode('location');

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationState({
        status: 'error',
        message: 'Location services are not supported on this browser. Please enter your delivery address manually below.'
      });
      return;
    }

    setLocationState({
      status: 'loading',
      message: 'Detecting your location and converting to a delivery address...'
    });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords || {};
        if (typeof latitude !== 'number' || typeof longitude !== 'number') {
          setLocationState({
            status: 'error',
            message: 'Unable to read your GPS coordinates. Please enter your delivery address manually below.'
          });
          return;
        }

        try {
          const readableAddress = await reverseGeocodeCoordinates(latitude, longitude);
          handleInputChange('deliveryAddress', readableAddress);
          setLocationState({
            status: 'success',
            message: 'Location detected! Feel free to review or edit your address and add landmarks below.'
          });
        } catch (geocodeErr) {
          setLocationState({
            status: 'error',
            message: 'We detected your location, but could not convert it into a street address right now. Please enter your delivery address manually below.'
          });
          setTimeout(() => {
            if (addressInputRef.current) {
              addressInputRef.current.focus();
            }
          }, 50);
        }
      },
      (geoError) => {
        let friendlyError = 'Could not detect your location. Please enter your delivery address manually below.';
        if (geoError) {
          if (geoError.code === 1) {
            friendlyError = 'Location permission was denied. No worries — you can enter your delivery address manually below, or enable location permission in your browser and try again.';
          } else if (geoError.code === 2) {
            friendlyError = 'Your current location is unavailable right now. Please check your device GPS/location settings or enter your address manually below.';
          } else if (geoError.code === 3) {
            friendlyError = 'Location detection timed out. Please try again or enter your delivery address manually below.';
          }
        }
        setLocationState({
          status: 'error',
          message: friendlyError
        });
        setTimeout(() => {
          if (addressInputRef.current) {
            addressInputRef.current.focus();
          }
        }, 50);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0
      }
    );
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
        className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-mani-900/20 shadow-snack-card space-y-4 transition-all"
      >
        <div className="border-b-2 border-dashed border-mani-100 pb-3.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-300 text-mani-950 border border-mani-900/20">
              Step 3
            </span>
            <h3 className="font-display text-lg sm:text-xl font-bold text-mani-950 flex items-center gap-1.5">
              <span>📍</span> Where Should Your Mani Wander?
            </h3>
          </div>
          <p className="text-xs text-mani-600 font-medium mt-1">
            Enter your name, mobile number, and delivery address so your fresh tubs arrive right on time.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              className={`w-full text-sm font-medium px-4 py-2.5 rounded-xl border-2 ${
                errors.customerName ? 'border-red-400 bg-red-50/50' : 'border-mani-200 bg-cream/60 focus:bg-white focus:border-mani-900'
              } outline-none transition-all`}
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
              placeholder="0917 123 4567"
              className={`w-full text-sm font-medium px-4 py-2.5 rounded-xl border-2 ${
                errors.mobileNumber ? 'border-red-400 bg-red-50/50' : 'border-mani-200 bg-cream/60 focus:bg-white focus:border-mani-900'
              } outline-none transition-all`}
            />
            {errors.mobileNumber ? (
              <p className="text-xs text-red-600 font-bold mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.mobileNumber}
              </p>
            ) : (
              <p className="text-[11px] text-mani-500 font-medium mt-1">
                For rider coordination upon delivery.
              </p>
            )}
          </div>

          {/* Delivery Address with Two Options: Use My Location | Enter Manually */}
          <div id="shipping-info-section" className="sm:col-span-2 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label htmlFor="customer-address" className="text-xs font-extrabold text-mani-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                <span>Delivery Address</span>
              </label>

              {/* Segmented Option Selector: 📍 Use My Location | ✍️ Enter Manually */}
              <div
                role="group"
                aria-label="Delivery address entry options"
                className="grid grid-cols-2 gap-1.5 bg-cream-warm p-1 rounded-2xl border-2 border-mani-900/15"
              >
                <button
                  type="button"
                  data-testid="use-my-location-btn"
                  aria-pressed={addressMode === 'location'}
                  disabled={locationState.status === 'loading'}
                  onClick={handleUseMyLocation}
                  className={`px-3 py-2 rounded-xl font-display font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    addressMode === 'location'
                      ? 'bg-amber-400 text-mani-950 border-2 border-mani-900 shadow-snack-sm'
                      : 'bg-white/80 text-mani-800 border-2 border-transparent hover:bg-white hover:text-mani-950'
                  } ${locationState.status === 'loading' ? 'opacity-80 cursor-wait' : ''}`}
                >
                  {locationState.status === 'loading' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-mani-950 shrink-0" />
                  ) : (
                    <span aria-hidden="true">📍</span>
                  )}
                  <span>{locationState.status === 'loading' ? 'Locating...' : 'Use My Location'}</span>
                </button>

                <button
                  type="button"
                  data-testid="enter-address-manually-btn"
                  aria-pressed={addressMode === 'manual'}
                  onClick={handleSelectManualMode}
                  className={`px-3 py-2 rounded-xl font-display font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    addressMode === 'manual'
                      ? 'bg-amber-400 text-mani-950 border-2 border-mani-900 shadow-snack-sm'
                      : 'bg-white/80 text-mani-800 border-2 border-transparent hover:bg-white hover:text-mani-950'
                  }`}
                >
                  <span aria-hidden="true">✍️</span>
                  <span>Enter Manually</span>
                </button>
              </div>
            </div>

            {/* Location Status Banner (Loading / Success / Error) */}
            {locationState.status === 'loading' && (
              <div
                role="status"
                data-testid="location-status-loading"
                className="p-3 rounded-2xl bg-amber-50 border-2 border-amber-300 text-mani-900 text-xs font-bold flex items-center gap-2.5 animate-fade-in"
              >
                <Loader2 className="w-4 h-4 text-amber-700 animate-spin shrink-0" />
                <span>{locationState.message}</span>
              </div>
            )}

            {locationState.status === 'success' && (
              <div
                role="status"
                data-testid="location-status-success"
                className="p-3 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 text-xs font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-fade-in"
              >
                <div className="flex items-start sm:items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
                  <span>{locationState.message}</span>
                </div>
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  className="self-start sm:self-auto px-2.5 py-1 rounded-xl bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-extrabold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Ping Location Again</span>
                </button>
              </div>
            )}

            {locationState.status === 'error' && (
              <div
                role="alert"
                data-testid="location-status-error"
                className="p-3.5 rounded-2xl bg-amber-50/95 border-2 border-amber-400 text-mani-950 text-xs space-y-2 animate-fade-in"
              >
                <div className="flex items-start gap-2 font-bold text-amber-950">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>{locationState.message}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 pl-6">
                  <button
                    type="button"
                    onClick={handleUseMyLocation}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100 text-mani-900 border border-mani-300 font-extrabold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Try Location Again</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectManualMode}
                    className="px-3 py-1.5 rounded-xl bg-mani-900 hover:bg-mani-800 text-amber-300 font-extrabold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <PenLine className="w-3 h-3" />
                    <span>Type Address Manually</span>
                  </button>
                </div>
              </div>
            )}

            {/* Editable Delivery Address Input (Always available for manual typing or editing detected address) */}
            <textarea
              ref={addressInputRef}
              id="customer-address"
              name="deliveryAddress"
              rows="3"
              autoComplete="street-address"
              value={formData.deliveryAddress || ''}
              onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
              placeholder="House/Unit No., Street, Barangay, City/Municipality, Province"
              className="w-full text-sm font-medium px-4 py-2.5 rounded-xl border-2 border-mani-200 bg-cream/60 focus:bg-white focus:border-mani-900 outline-none transition-all resize-y"
            />
            <p className="text-[11px] text-mani-500 font-medium">
              {addressMode === 'location'
                ? 'You can review and edit the detected address above, or add landmarks & delivery notes.'
                : 'Enter your address or delivery instructions above, or tap "📍 Use My Location" to auto-fill.'}
            </p>
          </div>
        </div>
      </div>

      {/* 5. Payment / Checkout */}
      <div 
        id="payment-checkout-section"
        className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-mani-900/20 shadow-snack-card space-y-5 transition-all"
      >
        <div className="border-b-2 border-dashed border-mani-100 pb-3.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-400 text-mani-950 border border-mani-900/20">
              Step 4
            </span>
            <h3 className="font-display text-lg sm:text-xl font-bold text-mani-950 flex items-center gap-1.5">
              <span>💳</span> Payment & Checkout
            </h3>
          </div>
          <p className="text-xs text-mani-600 font-medium mt-1">
            Choose how you'd like to pay and lock in your order!
          </p>
        </div>

        {errors.paymentMethod && (
          <p className="text-xs text-red-600 font-bold flex items-center gap-1 bg-red-50 p-2.5 rounded-xl border border-red-200">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.paymentMethod}
          </p>
        )}

        {errors.items && (
          <p className="text-xs text-red-600 font-bold flex items-center gap-1 bg-red-50 p-2.5 rounded-xl border border-red-200">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.items}
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
                className={`p-3.5 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                  formData.paymentMethod === 'Cash on Delivery'
                    ? 'bg-amber-400 text-mani-950 border-mani-900 shadow-snack-sm -translate-y-0.5'
                    : 'bg-cream-warm/60 text-mani-900 border-mani-200 hover:border-mani-400 hover:bg-cream-warm'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className={`p-2 rounded-xl text-xl ${formData.paymentMethod === 'Cash on Delivery' ? 'bg-white/70 border border-mani-900/20' : 'bg-white border border-mani-200'}`}>💵</span>
                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    formData.paymentMethod === 'Cash on Delivery' ? 'border-mani-950 bg-mani-950' : 'border-mani-300 bg-white'
                  }`}>
                    {formData.paymentMethod === 'Cash on Delivery' && <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />}
                  </span>
                </div>
                <div>
                  <div className="font-display font-bold text-sm sm:text-base leading-tight">Cash on Delivery</div>
                  <div className={`text-[11px] font-bold mt-0.5 ${formData.paymentMethod === 'Cash on Delivery' ? 'text-mani-800' : 'text-mani-500'}`}>
                    Pay upon delivery
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
                className={`p-3.5 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                  formData.paymentMethod === 'Maribank'
                    ? 'bg-orange-500 text-white border-mani-900 shadow-snack-sm -translate-y-0.5'
                    : 'bg-cream-warm/60 text-mani-900 border-mani-200 hover:border-mani-400 hover:bg-cream-warm'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className={`p-2 rounded-xl text-xl ${formData.paymentMethod === 'Maribank' ? 'bg-white/20' : 'bg-white border border-mani-200'}`}>🏦</span>
                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    formData.paymentMethod === 'Maribank' ? 'border-white bg-white' : 'border-mani-300 bg-white'
                  }`}>
                    {formData.paymentMethod === 'Maribank' && <span className="w-2 h-2 rounded-full bg-orange-600" />}
                  </span>
                </div>
                <div>
                  <div className="font-display font-bold text-sm sm:text-base leading-tight">Maribank</div>
                  <div className={`text-[11px] font-bold mt-0.5 ${formData.paymentMethod === 'Maribank' ? 'text-orange-100' : 'text-mani-500'}`}>
                    Scan InstaPay QR
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
                className={`p-3.5 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                  formData.paymentMethod === 'GCash'
                    ? 'bg-blue-600 text-white border-mani-900 shadow-snack-sm -translate-y-0.5'
                    : 'bg-cream-warm/60 text-mani-900 border-mani-200 hover:border-mani-400 hover:bg-cream-warm'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className={`p-2 rounded-xl text-xl ${formData.paymentMethod === 'GCash' ? 'bg-white/20' : 'bg-white border border-mani-200'}`}>📱</span>
                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    formData.paymentMethod === 'GCash' ? 'border-white bg-white' : 'border-mani-300 bg-white'
                  }`}>
                    {formData.paymentMethod === 'GCash' && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                  </span>
                </div>
                <div>
                  <div className="font-display font-bold text-sm sm:text-base leading-tight">GCash</div>
                  <div className={`text-[11px] font-bold mt-0.5 ${formData.paymentMethod === 'GCash' ? 'text-blue-100' : 'text-mani-500'}`}>
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
              <div className="w-10 h-10 rounded-xl bg-amber-200/80 text-mani-950 flex items-center justify-center text-xl shrink-0 border border-amber-300">
                💵
              </div>
              <div>
                <h4 className="font-display text-sm font-bold text-mani-950">Cash on Delivery (COD)</h4>
                <p className="text-xs text-mani-700 font-medium mt-0.5">
                  Prepare exact amount if possible — payment is collected upon tub delivery!
                </p>
              </div>
            </div>
          )}

          {/* 2. Maribank Selected (BIG QR) */}
          {formData.paymentMethod === 'Maribank' && isMaribankEnabled && (
            <div className="p-5 sm:p-6 rounded-3xl bg-orange-50/80 border-2 border-orange-300 space-y-4 animate-fade-in text-center">
              <div className="flex items-center justify-center gap-2 text-orange-950">
                <span className="text-2xl">🏦</span>
                <h4 className="font-display text-base sm:text-lg font-bold">Maribank Payment</h4>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-900 text-xs font-bold border border-orange-300/80">
                <ScanLine className="w-3.5 h-3.5" />
                <span>Scan the QR code to send your payment.</span>
              </div>

              {/* ENLARGED MARIBANK QR CODE */}
              <div className="bg-white p-4 sm:p-6 rounded-3xl border-2 border-orange-300 max-w-sm sm:max-w-md mx-auto shadow-lg shadow-orange-900/10">
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
            <div className="p-5 sm:p-6 rounded-3xl bg-blue-50/80 border-2 border-blue-300 space-y-4 animate-fade-in text-center">
              <div className="flex items-center justify-center gap-2 text-blue-950">
                <span className="text-2xl">📱</span>
                <h4 className="font-display text-base sm:text-lg font-bold">GCash Payment</h4>
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
              <div className="bg-white p-4 sm:p-6 rounded-3xl border-2 border-blue-300 max-w-sm sm:max-w-md mx-auto shadow-lg shadow-blue-900/10">
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
          <div className="pt-4 border-t-2 border-dashed border-mani-100">
            {isOrdersClosed ? (
              <div className="space-y-2.5" data-testid="customer-form-closed-notice">
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-300 text-red-800 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 text-center">
                  <Lock className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Orders are currently closed. Please check back soon.</span>
                </div>
                <button
                  type="button"
                  disabled={true}
                  className="w-full py-4 rounded-2xl font-display font-bold text-sm sm:text-base flex items-center justify-center gap-2 bg-red-100 border-2 border-red-300 text-red-800 cursor-not-allowed shadow-none"
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
                className={`w-full py-4 px-5 rounded-2xl font-display font-bold text-base sm:text-lg flex items-center justify-center gap-2 transition-all ${
                  totalPacks === 0 || isSubmitting
                    ? 'bg-mani-100 text-mani-400 border-2 border-mani-200 cursor-not-allowed shadow-none'
                    : 'bg-amber-400 hover:bg-amber-300 text-mani-950 border-2 border-mani-900 shadow-snack active:translate-y-0.5 cursor-pointer'
                }`}
              >
                {isSubmitting ? (
                  <span>Submitting Order...</span>
                ) : totalPacks === 0 ? (
                  <span>Select Tubs Above to Order 🥜</span>
                ) : (
                  <>
                    <span>Place Order Now 🥜</span>
                    {totalPacks > 0 && subtotal > 0 && (
                      <span className="bg-mani-950 text-amber-300 px-3 py-0.5 rounded-xl text-sm font-bold ml-1">
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
  );
}
