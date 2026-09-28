import React from 'react';
import { ShoppingBag, Plus, Minus, Sparkles, ArrowDown, Flame } from 'lucide-react';
import { formatPHP } from '../config/products';

export default function OrderSummaryCard({
  items = [],
  quantities = {},
  onQuantityChange,
  onClearOrder,
  recentlyAddedId = null,
  cartBounce = false,
  onProceedToDetails,
  onAddToCart
}) {
  const selectedItems = items.filter((p) => (quantities[p.id] || 0) > 0);
  const totalPacks = Object.values(quantities).reduce((a, b) => a + (Number(b) || 0), 0);
  const subtotal = items.reduce((sum, p) => sum + ((quantities[p.id] || 0) * (p.price || 50)), 0);

  // Quick-start crowd favorites for empty basket state
  const quickTryIds = ['salted', 'spicy', 'sour-cream'];
  const quickTryProducts = quickTryIds
    .map((id) => items.find((p) => p.id === id && p.available !== false))
    .filter(Boolean);

  return (
    <div 
      id="order-summary-section"
      className="bg-white rounded-3xl border-2 border-mani-950 shadow-snack overflow-hidden transition-all"
    >
      {/* Top Snack Box Header Band */}
      <div className="bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100/80 px-5 sm:px-6 py-4 border-b-2 border-mani-950/10 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl bg-amber-400 text-mani-950 border-2 border-mani-950 flex items-center justify-center font-black text-lg shadow-snack-sm transition-transform duration-200 ${
            cartBounce ? 'scale-125 rotate-6' : ''
          }`}>
            <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-display text-base sm:text-lg font-extrabold text-mani-950 tracking-tight">
                Order Summary
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-mani-950 text-amber-300 font-extrabold uppercase tracking-wider">
                Step 1
              </span>
            </div>
            <p className="text-[11px] text-mani-700 font-semibold">
              {totalPacks > 0 
                ? `${totalPacks} fresh ${totalPacks === 1 ? 'tub' : 'tubs'} ready to roast & pack` 
                : 'Build your custom Mani tub box'}
            </p>
          </div>
        </div>

        {totalPacks > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-mani-950 bg-amber-300 px-2.5 py-1 rounded-full border-2 border-mani-950 shadow-2xs">
              {totalPacks} {totalPacks === 1 ? 'tub' : 'tubs'}
            </span>
            <button
              type="button"
              onClick={onClearOrder}
              className="text-xs font-extrabold text-mani-600 hover:text-red-700 px-2.5 py-1 rounded-xl hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
              title="Clear all flavors"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      <div className="p-5 sm:p-6 space-y-4">
        {/* Content: Empty vs. Active Items */}
        {totalPacks === 0 ? (
          /* Appetizing & Playful Empty State */
          <div className="py-5 px-4 rounded-2xl bg-gradient-to-b from-[#FDF9F0] to-amber-50/50 border-2 border-dashed border-amber-300 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-300/30 border-2 border-amber-400 mx-auto flex items-center justify-center text-3xl select-none animate-float-slow shadow-xs">
              🥜
            </div>
            <div>
              <h4 className="font-display text-base font-extrabold text-mani-950">
                Your Mani Box is Empty!
              </h4>
              <p className="text-xs text-mani-600 max-w-xs mx-auto mt-1 leading-relaxed font-medium">
                Tap any flavor on the menu or try one of our <span className="font-bold text-mani-900">Mga Suki</span> crowd-favorites below:
              </p>
            </div>

            {/* Quick-Add Suki Favorites */}
            {quickTryProducts.length > 0 && (
              <div className="pt-1 flex flex-wrap items-center justify-center gap-1.5">
                {quickTryProducts.map((prod) => (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => {
                      onQuantityChange(prod.id, (quantities[prod.id] || 0) + 1);
                      if (onAddToCart) onAddToCart(prod, 1);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100 text-mani-950 font-extrabold text-[11px] border-2 border-mani-950 shadow-snack-sm active:translate-y-0.5 transition-all cursor-pointer"
                  >
                    <span>{prod.icon || '🥜'}</span>
                    <span>+1 {prod.name.replace(/^Mani\s+/i, '')}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-amber-950 bg-amber-100/90 px-3 py-1 rounded-full border border-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Starts at ₱50 / tub • Bagong luto every batch</span>
              </span>
            </div>
          </div>
        ) : (
          /* Active Selected Items List */
          <div className="space-y-3.5">
            <div className="divide-y divide-mani-100 max-h-72 overflow-y-auto pr-1 -mx-1 px-1">
              {selectedItems.map((p) => {
                const qty = quantities[p.id] || 0;
                const isRecentlyAdded = recentlyAddedId === p.id;

                return (
                  <div
                    key={p.id}
                    className={`py-3 flex items-center justify-between gap-2.5 text-xs sm:text-sm rounded-2xl px-2.5 transition-all duration-300 ${
                      isRecentlyAdded
                        ? 'bg-amber-100/90 ring-2 ring-mani-950 shadow-xs'
                        : 'hover:bg-amber-50/50'
                    }`}
                  >
                    {/* Left: Mini Tub Thumbnail + Product Info */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200/90 flex items-center justify-center shrink-0 overflow-hidden p-1 relative">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-lg select-none">{p.icon || '🥜'}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-display font-extrabold text-mani-950 truncate flex items-center gap-1">
                          <span>{p.icon || '🥜'}</span>
                          <span className="truncate">{p.name}</span>
                        </div>
                        <div className="text-[11px] text-mani-600 font-bold">
                          {formatPHP(p.price || 50)} / tub
                        </div>
                      </div>
                    </div>

                    {/* Center: Tactile In-Summary Quantity Stepper */}
                    <div className="flex items-center gap-1 bg-[#FDF9F0] rounded-xl border-2 border-mani-950 p-0.5 shrink-0 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => onQuantityChange(p.id, qty - 1)}
                        aria-label={`Decrease ${p.name}`}
                        className="w-6 h-6 rounded-lg bg-white hover:bg-red-50 hover:text-red-600 active:scale-90 text-mani-950 flex items-center justify-center font-black transition-all cursor-pointer"
                      >
                        <Minus className="w-3 h-3 stroke-[2.5]" />
                      </button>
                      <span className="w-6 text-center text-xs font-black text-mani-950 select-none">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onQuantityChange(p.id, qty + 1);
                          if (onAddToCart) onAddToCart(p, 1);
                        }}
                        aria-label={`Increase ${p.name}`}
                        className="w-6 h-6 rounded-lg bg-amber-400 hover:bg-amber-500 active:scale-90 text-mani-950 flex items-center justify-center font-black transition-all cursor-pointer"
                      >
                        <Plus className="w-3 h-3 stroke-[2.5]" />
                      </button>
                    </div>

                    {/* Right: Line Subtotal & Remove */}
                    <div className="text-right shrink-0 min-w-16">
                      <div className="font-display font-black text-mani-950 text-sm">
                        {formatPHP(qty * (p.price || 50))}
                      </div>
                      <button
                        type="button"
                        onClick={() => onQuantityChange(p.id, 0)}
                        className="text-[10px] text-mani-500 hover:text-red-600 font-extrabold cursor-pointer transition-colors"
                        title="Remove item"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Running Totals Breakdown Receipt Ticket */}
            <div className="pt-3 border-t-2 border-dashed border-amber-300 space-y-2 bg-gradient-to-b from-amber-50/70 to-amber-100/40 p-4 rounded-2xl border border-amber-200">
              <div className="flex items-center justify-between text-xs text-mani-700 font-bold">
                <span>Total Tubs in Box</span>
                <span className="font-black text-mani-950">{totalPacks} tub{totalPacks > 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-mani-700 font-bold">
                <span>Roast Quality</span>
                <span className="inline-flex items-center gap-1 font-extrabold text-amber-900">
                  <Flame className="w-3.5 h-3.5 text-orange-600" /> Fresh Small-Batch
                </span>
              </div>
              <div className="pt-2.5 border-t border-amber-300/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-mani-950 block">
                    Running Subtotal
                  </span>
                  <span className="text-[11px] text-mani-600 font-medium">
                    Excluding delivery fee
                  </span>
                </div>
                <div className="font-display text-2xl sm:text-3xl font-black text-mani-950">
                  {formatPHP(subtotal)}
                </div>
              </div>

              {/* Quick Continue Prompt on Mobile */}
              {onProceedToDetails && (
                <button
                  type="button"
                  onClick={onProceedToDetails}
                  className="w-full mt-2 py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-500 active:translate-y-0.5 text-mani-950 font-extrabold text-xs border-2 border-mani-950 shadow-snack-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer lg:hidden"
                >
                  <span>Continue to Delivery Details</span>
                  <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
