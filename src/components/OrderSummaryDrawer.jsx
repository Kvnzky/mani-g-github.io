import React from 'react';
import { ShoppingBag, X, Plus, Minus, ArrowRight, Loader2, MapPin, Phone, User, CreditCard, Lock, Clock } from 'lucide-react';
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
    !customerData.mobileNumber?.trim() ||
    !customerData.deliveryAddress?.trim() ||
    !customerData.paymentMethod?.trim() ||
    !hasItems ||
    !hasAnyPaymentMethod
  );

  return (
    <>
      {/* Sticky Bottom Bar on Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-mani-200 p-3 sm:hidden shadow-warm-xl">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-sm flex items-center justify-between shadow-md active:scale-98 transition-all"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span>{hasItems ? `${totalPacks} Tubs` : 'Your Cart'}</span>
            </div>
            <span className="bg-mani-900/20 px-2.5 py-0.5 rounded-lg text-amber-100 font-black">
              {formatPHP(subtotal)}
            </span>
          </button>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-50 bg-mani-950/60 backdrop-blur-xs transition-opacity duration-200"
        />
      )}

      {/* Drawer Panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-mani-100 flex items-center justify-between bg-cream">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-xs">
              🛒
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-mani-900">
                Your MANI G? Order
              </h3>
              <p className="text-xs text-mani-600 font-medium">
                {totalPacks} {totalPacks === 1 ? 'tub' : 'tubs'} selected
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasItems && (
              <button
                type="button"
                onClick={onClearOrder}
                className="text-xs text-mani-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 font-medium transition-colors"
                title="Clear all items"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-mani-100 text-mani-700 hover:bg-mani-200 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Live Cutoff Notice */}
          {cutoffInfo && (
            <div className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-2 shadow-2xs ${
              isOrdersClosed
                ? 'bg-red-50 text-red-900 border-red-200'
                : cutoffInfo.enabled
                ? 'bg-amber-50 text-amber-950 border-amber-300'
                : 'bg-emerald-50 text-emerald-950 border-emerald-200'
            }`}>
              <div className="flex items-center gap-2">
                {isOrdersClosed ? (
                  <Lock className="w-4 h-4 text-red-600 shrink-0" />
                ) : cutoffInfo.enabled ? (
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
                <div>
                  <span className="font-extrabold block">
                    {isOrdersClosed ? 'Orders Closed' : cutoffInfo.enabled ? '⏰ Order Cutoff' : 'Orders Open'}
                  </span>
                  <span className="text-[11px] opacity-85">
                    {isOrdersClosed
                      ? 'Submissions closed for this batch.'
                      : cutoffInfo.enabled
                      ? `Deadline: ${cutoffInfo.cutoffDate} at ${cutoffInfo.cutoffTime} PHT`
                      : 'Fresh batch available today'}
                  </span>
                </div>
              </div>
            </div>
          )}
          {/* Items List */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-mani-500 mb-2.5">
              Selected Flavors
            </h4>
            {hasItems ? (
              <div className="space-y-2.5">
                {items
                  .filter((item) => item.quantity > 0)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-cream border border-mani-200/80 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xl">{item.icon || '🥜'}</span>
                        <div className="min-w-0">
                          <h5 className="font-bold text-sm text-mani-900 truncate">
                            {item.name}
                          </h5>
                          <p className="text-xs text-mani-500">
                            {formatPHP(item.price)} each
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg bg-white border border-mani-200 hover:bg-mani-100 flex items-center justify-center text-mani-700"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center font-bold text-sm text-mani-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg bg-white border border-mani-200 hover:bg-mani-100 flex items-center justify-center text-mani-700"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-mani-500 text-xs">
                No items in cart yet.
              </div>
            )}
          </div>

          {/* Delivery & Customer Info Summary */}
          <div className="p-3.5 rounded-2xl bg-mani-50/70 border border-mani-200/60 space-y-2 text-xs">
            <h4 className="font-bold text-mani-800 uppercase tracking-wider text-[11px]">
              Delivery Details
            </h4>

            <div className="flex items-center gap-2 text-mani-700">
              <User className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span className="font-semibold">Customer:</span>
              <span className="text-mani-900 font-medium">
                {customerData.customerName || <span className="italic text-red-500">Required</span>}
              </span>
            </div>

            <div className="flex items-center gap-2 text-mani-700">
              <Phone className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span className="font-semibold">Mobile:</span>
              <span className="text-mani-900 font-medium">
                {customerData.mobileNumber || <span className="italic text-red-500">Required</span>}
              </span>
            </div>

            <div className="flex items-start gap-2 text-mani-700">
              <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
              <span className="font-semibold">Address:</span>
              <span className="text-mani-900 font-medium">
                {customerData.deliveryAddress || <span className="italic text-red-500">Required</span>}
              </span>
            </div>

            <div className="flex items-center gap-2 text-mani-700">
              <CreditCard className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span className="font-semibold">Payment:</span>
              <span className="text-mani-900 font-bold bg-amber-100/80 text-amber-900 px-2 py-0.5 rounded-md">
                {customerData.paymentMethod || 'Cash on Delivery'}
              </span>
            </div>
          </div>
        </div>

        {/* Drawer Footer / Place Order */}
        <div className="p-4 sm:p-5 border-t border-mani-100 bg-cream space-y-3">
          {/* Totals */}
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-mani-600 text-xs">
              <span>Total Tubs:</span>
              <span className="font-bold text-mani-900">{totalPacks} tubs</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-mani-900 pt-1 border-t border-mani-200">
              <span>Total Amount:</span>
              <span className="text-amber-700 text-lg font-black">{formatPHP(subtotal)}</span>
            </div>
          </div>

          {/* Cutoff Closed Alert */}
          {isOrdersClosed ? (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-bold flex items-center gap-2">
              <Lock className="w-4 h-4 text-red-600 shrink-0" />
              <span>Orders are now closed. The cutoff time for accepting orders has ended.</span>
            </div>
          ) : Object.keys(validationErrors || {}).length > 0 ? (
            <div className="p-2 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              Please complete customer name, mobile number, delivery address, and payment method.
            </div>
          ) : null}

          {/* Place Order Button */}
          {isOrdersClosed ? (
            <button
              type="button"
              disabled={true}
              className="w-full py-3.5 px-5 rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 bg-red-100 border border-red-300 text-red-700 cursor-not-allowed shadow-none"
            >
              <Lock className="w-5 h-5 text-red-600" />
              <span>Orders Closed (Cutoff Ended)</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={isFormIncomplete || isSubmitting}
              onClick={onSubmitOrder}
              className={`w-full py-3.5 px-5 rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all duration-200 ${
                isFormIncomplete || isSubmitting
                  ? 'bg-mani-200 text-mani-400 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white shadow-amber-900/20 active:scale-98 cursor-pointer'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Submitting Order...</span>
                </>
              ) : (
                <>
                  <span>Place Order</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
