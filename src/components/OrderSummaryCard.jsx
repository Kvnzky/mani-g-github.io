import React from 'react';
import { ShoppingBag, Plus, Minus, Sparkles, ArrowDown } from 'lucide-react';
import { formatPHP, getFlavorPersonality } from '../config/products';

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
      className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-mani-900 shadow-snack space-y-4 transition-all"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-dashed border-mani-200 pb-3.5 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className={`w-10 h-10 rounded-2xl bg-amber-400 text-mani-950 border-2 border-mani-900 flex items-center justify-center font-bold text-lg shadow-snack-sm transition-transform duration-200 ${
            cartBounce ? 'scale-125 rotate-6' : ''
          }`}>
            <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-mani-900 text-amber-300">
                Step 2
              </span>
              <h3 className="font-display text-lg sm:text-xl font-bold text-mani-950 tracking-tight">
                Your Tub Basket
              </h3>
            </div>
            <p className="text-xs text-mani-600 font-medium mt-0.5">
              {totalPacks > 0 
                ? `${totalPacks} crunchy ${totalPacks === 1 ? 'tub' : 'tubs'} ready for checkout!` 
                : 'Pick your favorite flavors from the menu'}
            </p>
          </div>
        </div>

        {totalPacks > 0 && (
          <div className="flex items-center gap-2">
            <span className="font-display text-xs font-bold text-mani-950 bg-amber-200 px-2.5 py-1 rounded-full border border-mani-900/30">
              {totalPacks} {totalPacks === 1 ? 'tub' : 'tubs'}
            </span>
            <button
              type="button"
              onClick={onClearOrder}
              className="text-xs font-extrabold text-mani-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
              title="Clear all flavors"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Content: Empty vs. Active Items */}
      {totalPacks === 0 ? (
        /* Playful & Inviting Empty State */
        <div className="py-7 px-4 rounded-2xl bg-gradient-to-b from-amber-50/80 to-cream-warm/60 border-2 border-dashed border-amber-300 text-center space-y-2.5">
          <div className="w-14 h-14 rounded-2xl bg-white shadow-snack-sm border-2 border-mani-900 mx-auto flex items-center justify-center text-3xl select-none animate-float-slow">
            🥜
          </div>
          <div>
            <h4 className="font-display text-base font-bold text-mani-950">Wala pang laman ang basket mo!</h4>
            <p className="text-xs text-mani-600 max-w-xs mx-auto mt-1 font-medium leading-relaxed">
              Tap <strong>+ Add to Order</strong> on any flavor card to start building your Mani Wandering stash.
            </p>
          </div>
          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-mani-950 bg-amber-200/90 px-3 py-1 rounded-full border border-mani-900/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-800" />
              <span>₱50–₱60 / tub • Bagong Luto Weekly</span>
            </span>
          </div>
        </div>
      ) : (
        /* Active Selected Items List */
        <div className="space-y-3">
          <div className="divide-y divide-mani-100 max-h-68 overflow-y-auto pr-1">
            {selectedItems.map((p) => {
              const qty = quantities[p.id] || 0;
              const isRecentlyAdded = recentlyAddedId === p.id;
              const personality = getFlavorPersonality(p);

              return (
                <div
                  key={p.id}
                  className={`py-2.5 flex items-center justify-between gap-2.5 text-xs sm:text-sm rounded-2xl px-2.5 transition-all duration-300 ${
                    isRecentlyAdded
                      ? 'bg-amber-100 ring-2 ring-mani-900 shadow-xs'
                      : 'hover:bg-cream-warm/70'
                  }`}
                >
                  {/* Left: Product Thumbnail / Icon & Info */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-10 h-10 rounded-xl object-cover border border-mani-300 shrink-0"
                      />
                    ) : (
                      <span className="text-xl select-none shrink-0">{personality.displayIcon}</span>
                    )}
                    <div className="min-w-0">
                      <div className="font-display font-bold text-mani-950 truncate text-sm">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-mani-600 font-bold">
                        {formatPHP(p.price || 50)} / tub
                      </div>
                    </div>
                  </div>

                  {/* Center: In-Summary Quantity Stepper */}
                  <div className="flex items-center gap-1 bg-cream-warm rounded-xl border border-mani-300 p-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onQuantityChange(p.id, qty - 1)}
                      aria-label={`Decrease ${p.name}`}
                      className="w-7 h-7 rounded-lg bg-white hover:bg-red-50 hover:text-red-600 active:scale-90 text-mani-800 flex items-center justify-center font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      <Minus className="w-3 h-3 stroke-[2.5]" />
                    </button>
                    <span className="w-6 text-center font-display text-xs sm:text-sm font-bold text-mani-950 select-none">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => onQuantityChange(p.id, qty + 1)}
                      aria-label={`Increase ${p.name}`}
                      className="w-7 h-7 rounded-lg bg-mani-900 hover:bg-mani-800 active:scale-90 text-amber-300 flex items-center justify-center font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  </div>

                  {/* Right: Line Subtotal & Delete */}
                  <div className="text-right shrink-0 min-w-15">
                    <div className="font-display font-bold text-sm text-mani-950">
                      {formatPHP(qty * (p.price || 50))}
                    </div>
                    <button
                      type="button"
                      onClick={() => onQuantityChange(p.id, 0)}
                      className="text-[10px] text-mani-500 hover:text-red-600 font-bold cursor-pointer transition-colors"
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
          <div className="pt-3 border-t-2 border-dashed border-mani-200 space-y-2 bg-gradient-to-br from-amber-100/70 via-cream-warm to-amber-50 p-4 rounded-2xl border-2 border-mani-900/15">
            <div className="flex items-center justify-between text-xs text-mani-700 font-bold">
              <span>Total Tubs Selected</span>
              <span className="font-display text-sm font-bold text-mani-950">{totalPacks} tub{totalPacks > 1 ? 's' : ''}</span>
            </div>
            <div className="pt-2 border-t border-mani-900/10 flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-mani-900 block">
                  Running Subtotal
                </span>
                <span className="text-[11px] text-mani-600 font-medium">
                  Excluding delivery fee
                </span>
              </div>
              <div className="font-display text-2xl sm:text-3xl font-bold text-mani-950">
                {formatPHP(subtotal)}
              </div>
            </div>

            {/* Quick Continue Prompt on Mobile */}
            {onProceedToDetails && (
              <button
                type="button"
                onClick={onProceedToDetails}
                className="w-full mt-2 py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-mani-950 font-display font-bold text-xs sm:text-sm border-2 border-mani-900 shadow-snack-sm active:translate-y-0.5 flex items-center justify-center gap-1.5 transition-all cursor-pointer lg:hidden"
              >
                <span>Continue to Delivery Details</span>
                <ArrowDown className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
