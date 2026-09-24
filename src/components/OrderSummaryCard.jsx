import React from 'react';
import { ShoppingBag, Trash2, Plus, Minus, Sparkles, ArrowDown } from 'lucide-react';
import { formatPHP } from '../config/products';

export default function OrderSummaryCard({
  items = [],
  quantities = {},
  onQuantityChange,
  onClearOrder,
  recentlyAddedId = null,
  cartBounce = false,
  onProceedToDetails
}) {
  const selectedItems = items.filter((p) => (quantities[p.id] || 0) > 0);
  const totalPacks = Object.values(quantities).reduce((a, b) => a + (Number(b) || 0), 0);
  const subtotal = items.reduce((sum, p) => sum + ((quantities[p.id] || 0) * (p.price || 50)), 0);

  return (
    <div 
      id="order-summary-section"
      className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-amber-300/80 shadow-warm-lg ring-1 ring-amber-400/20 space-y-4 transition-all"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-mani-100 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-xs transition-transform duration-200 ${
            cartBounce ? 'scale-125 rotate-6' : ''
          }`}>
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-mani-950 tracking-tight flex items-center gap-1.5">
              Order Summary
            </h3>
            <p className="text-[11px] text-mani-600 font-medium">
              {totalPacks > 0 
                ? `${totalPacks} ${totalPacks === 1 ? 'tub' : 'tubs'} in your basket` 
                : 'Review your selected Mani flavors'}
            </p>
          </div>
        </div>

        {totalPacks > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
              {totalPacks} {totalPacks === 1 ? 'tub' : 'tubs'}
            </span>
            <button
              type="button"
              onClick={onClearOrder}
              className="text-xs font-bold text-mani-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
              title="Clear all flavors"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Content: Empty vs. Active Items */}
      {totalPacks === 0 ? (
        /* Clean & Inviting Empty State */
        <div className="py-6 px-4 rounded-2xl bg-gradient-to-b from-amber-50/60 to-mani-50/40 border border-amber-200/70 text-center space-y-2.5">
          <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-amber-200 mx-auto flex items-center justify-center text-2xl select-none">
            🥜
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-mani-900">Your basket is waiting</h4>
            <p className="text-xs text-mani-600 max-w-xs mx-auto mt-0.5 leading-relaxed">
              Select flavors from the menu to start your fresh, crispy Mani collection.
            </p>
          </div>
          <div className="pt-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-white/90 px-3 py-1 rounded-full border border-amber-200 shadow-2xs">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>₱50 / tub • Freshly roasted weekly</span>
            </span>
          </div>
        </div>
      ) : (
        /* Active Selected Items List */
        <div className="space-y-3">
          <div className="divide-y divide-mani-100 max-h-64 overflow-y-auto pr-1">
            {selectedItems.map((p) => {
              const qty = quantities[p.id] || 0;
              const isRecentlyAdded = recentlyAddedId === p.id;

              return (
                <div
                  key={p.id}
                  className={`py-3 flex items-center justify-between gap-3 text-xs sm:text-sm rounded-xl px-2 transition-all duration-500 ${
                    isRecentlyAdded
                      ? 'bg-amber-100/80 ring-2 ring-amber-400 shadow-xs'
                      : 'hover:bg-mani-50/70'
                  }`}
                >
                  {/* Left: Product Info */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="text-xl select-none shrink-0">{p.icon || '🥜'}</span>
                    <div className="min-w-0">
                      <div className="font-extrabold text-mani-950 truncate">{p.name}</div>
                      <div className="text-[11px] text-mani-500 font-medium">
                        {formatPHP(p.price || 50)} each
                      </div>
                    </div>
                  </div>

                  {/* Center: In-Summary Quantity Stepper */}
                  <div className="flex items-center gap-1 bg-white rounded-xl border border-mani-200/90 p-0.5 shrink-0 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => onQuantityChange(p.id, qty - 1)}
                      aria-label={`Decrease ${p.name}`}
                      className="w-6 h-6 rounded-lg bg-mani-50 hover:bg-red-50 hover:text-red-600 active:scale-90 text-mani-700 flex items-center justify-center font-bold transition-all cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-black text-mani-950 select-none">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => onQuantityChange(p.id, qty + 1)}
                      aria-label={`Increase ${p.name}`}
                      className="w-6 h-6 rounded-lg bg-amber-500 hover:bg-amber-600 active:scale-90 text-white flex items-center justify-center font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Right: Line Subtotal & Delete */}
                  <div className="text-right shrink-0 min-w-16">
                    <div className="font-black text-amber-950">
                      {formatPHP(qty * (p.price || 50))}
                    </div>
                    <button
                      type="button"
                      onClick={() => onQuantityChange(p.id, 0)}
                      className="text-[10px] text-mani-400 hover:text-red-600 font-semibold cursor-pointer transition-colors"
                      title="Remove item"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Running Totals Breakdown */}
          <div className="pt-3 border-t border-mani-200 space-y-2 bg-amber-50/40 p-3.5 rounded-2xl border border-amber-200/70">
            <div className="flex items-center justify-between text-xs text-mani-700 font-medium">
              <span>Total Tubs Ordered</span>
              <span className="font-black text-mani-900">{totalPacks} tub{totalPacks > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-mani-700 font-medium">
              <span>Price per tub</span>
              <span className="font-bold text-mani-900">₱50.00</span>
            </div>
            <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 block">
                  Running Subtotal
                </span>
                <span className="text-[11px] text-mani-500 font-normal">
                  Excluding delivery fee
                </span>
              </div>
              <div className="text-2xl font-black text-amber-950">
                {formatPHP(subtotal)}
              </div>
            </div>

            {/* Quick Continue Prompt on Mobile */}
            {onProceedToDetails && (
              <button
                type="button"
                onClick={onProceedToDetails}
                className="w-full mt-2 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer lg:hidden"
              >
                <span>Continue to Customer Details</span>
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
