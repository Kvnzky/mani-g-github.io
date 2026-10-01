import React, { useEffect } from 'react';
import { X, Plus, Minus, ArrowRight, Loader2, MapPin, Phone, User, CreditCard, Lock, Clock } from 'lucide-react';
import { formatPHP } from '../config/products';

export default function OrderSummaryDrawer({
  isOpen,
  onClose,
  items = [],
  onQuantityChange,
  onClearOrder,
  customerData,
  totalPacks,
  subtotal,
  onSubmitOrder,
  isSubmitting,
  validationErrors,
  isOrdersClosed,
  cutoffInfo,
  paymentMethods = { cod: true, maribank: true, gcash: true }
}) {
  const hasItems = totalPacks > 0;
  const hasAnyPaymentMethod = Object.values(paymentMethods).some(Boolean);
  const isFormIncomplete = Boolean(
    !customerData.customerName?.trim() ||
    !customerData.paymentMethod?.trim() ||
    !hasItems ||
    !hasAnyPaymentMethod
  );

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          aria-hidden="true"
          className="fixed inset-0 z-50 bg-mani-950/60 backdrop-blur-xs transition-opacity duration-200"
        />
      )}

      {/* Drawer Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Order Summary"
        aria-hidden={!isOpen}
        className={`fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-cream border-l-2 border-mani-900 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b-2 border-mani-900/10 flex items-center justify-between bg-amber-100/70">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-mani-950 border-2 border-mani-900 flex items-center justify-center font-bold text-lg shadow-snack-sm">
              🥜
            </div>
            <div>
              <h3 className="font-display font-bold text-lg sm:text-xl text-mani-950 leading-tight">
                Your Mani Basket
              </h3>
              <p className="text-xs text-mani-700 font-bold">
                {totalPacks} {totalPacks === 1 ? 'tub' : 'tubs'} selected
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasItems && (
              <button
                type="button"
                onClick={onClearOrder}
                className="text-xs text-mani-600 hover:text-red-600 px-2.5 py-1 rounded-xl hover:bg-red-50 font-extrabold transition-colors cursor-pointer"
                title="Clear all items"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Order Summary"
              className="w-9 h-9 rounded-xl bg-white text-mani-900 border-2 border-mani-900/20 hover:border-mani-900 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Live Cutoff Notice */}
          {cutoffInfo && (
            <div className={`p-3 rounded-2xl border-2 text-xs flex items-center justify-between gap-2 ${
              isOrdersClosed
                ? 'bg-red-50 text-red-900 border-red-300'
                : cutoffInfo.enabled
                ? 'bg-amber-100/80 text-mani-950 border-amber-400'
                : 'bg-emerald-50 text-emerald-950 border-emerald-300'
            }`}>
              <div className="flex items-center gap-2">
                {isOrdersClosed ? (
                  <Lock className="w-4 h-4 text-red-600 shrink-0" />
                ) : cutoffInfo.enabled ? (
                  <Clock className="w-4 h-4 text-amber-700 shrink-0 animate-pulse" />
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
                <div>
                  <span className="font-extrabold block">
                    {isOrdersClosed ? 'Orders Closed' : cutoffInfo.enabled ? '⏰ Order Cutoff' : 'Kitchen Open'}
                  </span>
                  <span className="text-[11px] font-medium opacity-90">
                    {isOrdersClosed
                      ? 'Submissions closed for this batch.'
                      : cutoffInfo.enabled
                      ? `Deadline: ${cutoffInfo.cutoffDate} at ${cutoffInfo.cutoffTime} PHT`
                      : 'Fresh small-batch mani available today!'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Items List */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-mani-600 mb-2.5">
              Selected Flavors
            </h4>
            {hasItems ? (
              <div className="space-y-2.5">
                {items
                  .filter((item) => item.quantity > 0)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-white border-2 border-mani-900/15 shadow-2xs flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-11 h-11 rounded-xl object-cover border border-mani-200 shrink-0" />
                        ) : (
                          <span className="text-xl">{item.icon || '🥜'}</span>
                        )}
                        <div className="min-w-0">
                          <h5 className="font-display font-bold text-sm text-mani-950 truncate">
                            {item.name}
                          </h5>
                          <p className="text-xs text-mani-600 font-bold">
                            {formatPHP(item.price)} / tub
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 bg-cream-warm p-1 rounded-xl border border-mani-200">
                        <button
                          type="button"
                          onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="w-7 h-7 rounded-lg bg-white border border-mani-200 hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-mani-800 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                        <span className="w-6 text-center font-display font-bold text-sm text-mani-950">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                          aria-label={`Increase quantity of ${item.name}`}
                          className="w-7 h-7 rounded-lg bg-mani-900 text-amber-300 hover:bg-mani-800 flex items-center justify-center cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-white rounded-2xl border-2 border-dashed border-mani-200 text-mani-500 text-xs font-bold">
                Wala pang laman ang basket mo! Pick your tubs first 🥜
              </div>
            )}
          </div>

          {/* Delivery & Customer Info Summary */}
          <div className="p-4 rounded-2xl bg-white border-2 border-mani-900/15 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-mani-800 uppercase tracking-wider text-[11px]">
                Delivery Details
              </h4>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setTimeout(() => {
                    const el = document.getElementById('customer-info-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 150);
                }}
                className="text-[11px] font-extrabold text-amber-700 hover:text-amber-900 underline cursor-pointer"
              >
                Edit Details
              </button>
            </div>

            <div className="flex items-center gap-2 text-mani-700">
              <User className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span className="font-semibold">Customer:</span>
              <span className="text-mani-950 font-bold">
                {customerData.customerName || <span className="italic text-amber-700">Tap below to enter name</span>}
              </span>
            </div>

            <div className="flex items-center gap-2 text-mani-700">
              <Phone className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span className="font-semibold">Mobile:</span>
              <span className="text-mani-950 font-bold">
                {customerData.mobileNumber || <span className="italic text-mani-400 font-normal">Optional</span>}
              </span>
            </div>

            <div className="flex items-start gap-2 text-mani-700">
              <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
              <span className="font-semibold">Address:</span>
              <span className="text-mani-950 font-bold">
                {customerData.deliveryAddress || <span className="italic text-amber-700">Tap below to enter address</span>}
              </span>
            </div>

            <div className="flex items-center gap-2 text-mani-700">
              <CreditCard className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span className="font-semibold">Payment:</span>
              <span className="font-bold bg-amber-200/80 text-mani-950 px-2 py-0.5 rounded-md border border-mani-900/15">
                {customerData.paymentMethod || 'Cash on Delivery'}
              </span>
            </div>
          </div>
        </div>

        {/* Drawer Footer / Place Order */}
        <div className="p-4 sm:p-5 border-t-2 border-mani-900/10 bg-white space-y-3">
          {/* Totals */}
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-mani-600 text-xs font-bold">
              <span>Total Tubs:</span>
              <span className="font-extrabold text-mani-950">{totalPacks} tubs</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-mani-950 pt-1.5 border-t border-dashed border-mani-200">
              <span>Total Amount:</span>
              <span className="font-display text-mani-950 text-xl font-bold">{formatPHP(subtotal)}</span>
            </div>
          </div>

          {/* Cutoff Closed Alert */}
          {isOrdersClosed ? (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-bold flex items-center gap-2">
              <Lock className="w-4 h-4 text-red-600 shrink-0" />
              <span>Orders are currently closed. Please check back soon.</span>
            </div>
          ) : Object.keys(validationErrors || {}).length > 0 ? (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-bold">
              Please complete customer name, delivery address, and payment method.
            </div>
          ) : null}

          {/* Place Order or Scroll to Details Button */}
          {isOrdersClosed ? (
            <button
              type="button"
              disabled={true}
              className="w-full py-3.5 px-5 rounded-2xl font-display font-bold text-sm sm:text-base flex items-center justify-center gap-2 bg-red-100 border-2 border-red-300 text-red-700 cursor-not-allowed shadow-none"
            >
              <Lock className="w-5 h-5 text-red-600" />
              <span>Orders Closed</span>
            </button>
          ) : hasItems && isFormIncomplete ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                setTimeout(() => {
                  const el = document.getElementById('customer-info-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 150);
              }}
              className="w-full py-3.5 px-5 rounded-2xl font-display font-bold text-sm sm:text-base flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-mani-950 border-2 border-mani-900 shadow-snack active:translate-y-0.5 transition-all cursor-pointer"
            >
              <span>Proceed to Delivery Details</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isFormIncomplete || isSubmitting}
              onClick={onSubmitOrder}
              className={`w-full py-3.5 px-5 rounded-2xl font-display font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all duration-200 ${
                isFormIncomplete || isSubmitting
                  ? 'bg-mani-100 text-mani-400 border-2 border-mani-200 cursor-not-allowed shadow-none'
                  : 'bg-amber-400 hover:bg-amber-300 text-mani-950 border-2 border-mani-900 shadow-snack active:translate-y-0.5 cursor-pointer'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Submitting Order...</span>
                </>
              ) : (
                <>
                  <span>Place Order Now 🥜</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
