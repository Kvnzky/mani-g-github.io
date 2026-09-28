import React, { useState } from 'react';
import { Plus, Minus, Check, Sparkles } from 'lucide-react';
import { formatPHP } from '../config/products';

const FLAVOR_PERSONALITY = {
  salted: {
    vibe: '🧂 Classic Sea Salt',
    crunchCallout: 'CRUNCH!',
    notes: ['Crispy Bawang', 'Rock Salt'],
    cardHover: 'hover:border-amber-500',
    headerTint: 'from-amber-100/70 via-amber-50/20 to-white',
    badgeStyle: 'bg-amber-300 text-mani-950 border-mani-900',
    vibePill: 'bg-amber-100/90 text-amber-950 border-amber-300',
    tilt: 'hover:-rotate-[0.5deg]'
  },
  unsalted: {
    vibe: '🌱 Pure Natural Roast',
    crunchCallout: 'PURE!',
    notes: ['Zero Added Salt', 'Wholesome'],
    cardHover: 'hover:border-emerald-600',
    headerTint: 'from-emerald-100/60 via-stone-50/20 to-white',
    badgeStyle: 'bg-emerald-300 text-mani-950 border-mani-900',
    vibePill: 'bg-emerald-50 text-emerald-900 border-emerald-300',
    tilt: 'hover:rotate-[0.5deg]'
  },
  spicy: {
    vibe: '🌶️ Sili Labuyo Kick',
    crunchCallout: 'ANGHANG-SARAP!',
    notes: ['Hot Chili Flakes', 'Crispy Garlic'],
    cardHover: 'hover:border-red-500',
    headerTint: 'from-red-100/70 via-orange-50/20 to-white',
    badgeStyle: 'bg-red-500 text-white border-mani-900',
    vibePill: 'bg-red-50 text-red-900 border-red-300',
    tilt: 'hover:-rotate-[0.5deg]'
  },
  bbq: {
    vibe: '🍖 Smoky Pinoy BBQ',
    crunchCallout: 'MALinamnam!',
    notes: ['Sweet & Smoky', 'Savory Glaze'],
    cardHover: 'hover:border-orange-500',
    headerTint: 'from-orange-100/75 via-amber-50/20 to-white',
    badgeStyle: 'bg-orange-500 text-white border-mani-900',
    vibePill: 'bg-orange-50 text-orange-950 border-orange-300',
    tilt: 'hover:rotate-[0.5deg]'
  },
  'sour-cream': {
    vibe: '🥛 Tangy Cream & Chives',
    crunchCallout: 'YUM!',
    notes: ['Zesty Cream', 'Spring Onion'],
    cardHover: 'hover:border-teal-500',
    headerTint: 'from-teal-100/70 via-emerald-50/20 to-white',
    badgeStyle: 'bg-teal-300 text-mani-950 border-mani-900',
    vibePill: 'bg-teal-50 text-teal-950 border-teal-300',
    tilt: 'hover:-rotate-[0.5deg]'
  },
  cheese: {
    vibe: '🧀 Rich Golden Cheddar',
    crunchCallout: 'CHEESY!',
    notes: ['Savory Cheese', 'Crowd Pick'],
    cardHover: 'hover:border-yellow-500',
    headerTint: 'from-yellow-100/80 via-amber-50/20 to-white',
    badgeStyle: 'bg-yellow-300 text-mani-950 border-mani-900',
    vibePill: 'bg-yellow-100/90 text-amber-950 border-yellow-400',
    tilt: 'hover:rotate-[0.5deg]'
  },
  'bawang-only': {
    vibe: '🧄 100% Crispy Bawang',
    crunchCallout: 'BAWANG OVERLOAD!',
    notes: ['Garlic Chips', 'Whole Cloves'],
    cardHover: 'hover:border-amber-600',
    headerTint: 'from-amber-200/75 via-yellow-50/30 to-white',
    badgeStyle: 'bg-amber-400 text-mani-950 border-mani-900',
    vibePill: 'bg-amber-100 text-amber-950 border-amber-400',
    tilt: 'hover:-rotate-[0.5deg]'
  }
};

export default function FlavorCard({ 
  product, 
  quantity, 
  onQuantityChange,
  onAddToCart 
}) {
  const [stagedQty, setStagedQty] = useState(1);
  const [burstKey, setBurstKey] = useState(0);
  const [lastAddedCount, setLastAddedCount] = useState(1);

  const isAvailable = product.available !== false;
  const isSelected = quantity > 0;
  const theme = FLAVOR_PERSONALITY[product.id] || {
    vibe: `${product.icon || '🥜'} ${product.tagline || 'Freshly Roasted'}`,
    crunchCallout: 'SARAP!',
    notes: ['Small-Batch Roast', 'Crispy Crunch'],
    cardHover: 'hover:border-amber-500',
    headerTint: 'from-amber-100/60 via-amber-50/20 to-white',
    badgeStyle: 'bg-amber-300 text-mani-950 border-mani-900',
    vibePill: 'bg-amber-50 text-amber-900 border-amber-200',
    tilt: 'hover:-rotate-[0.5deg]'
  };

  const triggerBurst = (addedCount) => {
    setLastAddedCount(addedCount);
    setBurstKey((prev) => prev + 1);
  };

  const handleMinusStaged = (e) => {
    e.stopPropagation();
    setStagedQty((prev) => Math.max(1, prev - 1));
  };

  const handlePlusStaged = (e) => {
    e.stopPropagation();
    setStagedQty((prev) => Math.min(999, prev + 1));
  };

  const handleAddClick = () => {
    const qtyToAdd = stagedQty > 0 ? stagedQty : 1;
    const newTotal = (quantity || 0) + qtyToAdd;
    onQuantityChange(product.id, newTotal);
    triggerBurst(qtyToAdd);
    if (onAddToCart) {
      onAddToCart(product, qtyToAdd);
    }
  };

  const handleMinusInCart = (e) => {
    e.stopPropagation();
    if (quantity > 0) {
      onQuantityChange(product.id, quantity - 1);
    }
  };

  const handlePlusInCart = (e) => {
    e.stopPropagation();
    onQuantityChange(product.id, quantity + 1);
    triggerBurst(1);
    if (onAddToCart) {
      onAddToCart(product, 1);
    }
  };

  const handleDirectInput = (e) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 0) {
      onQuantityChange(product.id, 0);
    } else {
      onQuantityChange(product.id, Math.min(val, 999));
    }
  };

  return (
    <div
      className={`relative rounded-3xl p-4 sm:p-5 transition-all duration-200 border-2 flex flex-col justify-between overflow-hidden group bg-gradient-to-b ${theme.headerTint} ${
        isSelected
          ? 'border-amber-500 shadow-snack ring-2 ring-amber-400/50 -translate-y-0.5'
          : `border-mani-900/15 shadow-warm hover:shadow-snack ${theme.cardHover} hover:-translate-y-1 ${theme.tilt}`
      } ${!isAvailable ? 'opacity-60 grayscale-[35%] pointer-events-auto' : ''}`}
    >
      {/* Floating Peanut Particle Burst when adding to order */}
      {burstKey > 0 && (
        <div
          key={burstKey}
          aria-hidden="true"
          className="pointer-events-none absolute bottom-16 left-1/2 -translate-x-1/2 z-30 animate-peanut-burst"
        >
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-mani-950 text-amber-300 font-display font-extrabold text-xs border-2 border-amber-400 shadow-lg whitespace-nowrap">
            <span>{product.icon || '🥜'}</span>
            <span>+{lastAddedCount} {theme.crunchCallout}</span>
          </span>
        </div>
      )}

      {/* Product Image Showcase */}
      {product.image && (
        <div className="relative w-full h-48 sm:h-52 mb-3.5 rounded-2xl overflow-hidden bg-amber-100/40 border-2 border-mani-900/10 shadow-xs">
          <img
            src={product.image}
            alt={`${product.name} Mani Tub`}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
            loading="lazy"
          />
          {/* Subtle bottom gradient for badge legibility */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-mani-950/65 via-mani-950/20 to-transparent pointer-events-none" />

          {/* Top-Left / Top-Right Status & Personality Stickers */}
          {!isAvailable ? (
            <span className="absolute top-2.5 left-2.5 text-[10px] uppercase font-black tracking-wider px-3 py-1 rounded-full shadow-md bg-red-600 text-white border border-white/40 flex items-center gap-1 z-10">
              🔴 Sold Out Today
            </span>
          ) : product.badge ? (
            <span className={`absolute top-2.5 left-2.5 text-[10px] uppercase font-black tracking-wider px-2.5 py-1 rounded-full border shadow-sm -rotate-2 group-hover:rotate-0 transition-transform ${theme.badgeStyle}`}>
              ★ {product.badge}
            </span>
          ) : null}

          {/* Selected In-Cart Pill on Top-Right of Image */}
          {isSelected && (
            <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 text-[11px] font-black bg-emerald-500 text-white px-2.5 py-1 rounded-full border-2 border-mani-950 shadow-sm z-10 animate-pop">
              <Check className="w-3 h-3 stroke-[3]" />
              {quantity} in basket
            </span>
          )}

          {/* Bottom-Left Flavor Vibe Tag */}
          <span className="absolute bottom-2.5 left-2.5 text-[11px] font-bold text-white/95 bg-mani-950/75 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-white/20">
            {theme.vibe}
          </span>

          {/* Bottom-Right Prominent Price Sticker */}
          <div className="absolute bottom-2 right-2.5 bg-amber-400 text-mani-950 border-2 border-mani-950 px-2.5 py-0.5 rounded-xl shadow-xs flex items-baseline gap-0.5 rotate-1 group-hover:scale-105 transition-transform">
            <span className="font-display font-extrabold text-sm sm:text-base leading-none">
              {formatPHP(product.price || 50)}
            </span>
            <span className="text-[10px] font-extrabold text-mani-800">/tub</span>
          </div>
        </div>
      )}

      {/* Header Info & Flavor Notes */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {!product.image && (
                <span className="text-3xl sm:text-4xl filter drop-shadow-xs select-none shrink-0 group-hover:scale-110 transition-transform">
                  {product.icon || '🥜'}
                </span>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-lg select-none" aria-hidden="true">{product.icon || '🥜'}</span>
                  <h3 className="font-display font-extrabold text-lg sm:text-xl text-mani-950 leading-tight tracking-tight">
                    {product.name}
                  </h3>
                </div>
                {!product.image && (
                  <div className="mt-0.5 flex items-baseline gap-1">
                    <span className="text-sm font-black text-amber-900">
                      {formatPHP(product.price || 50)}
                    </span>
                    <span className="text-xs font-medium text-mani-500">/ tub</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price reminder next to title for rapid scanning */}
            <div className="text-right shrink-0">
              <span className="font-display font-extrabold text-base text-amber-900">
                {formatPHP(product.price || 50)}
              </span>
              <span className="text-[11px] font-semibold text-mani-500 block -mt-1">per tub</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-mani-700 leading-relaxed mt-2 mb-3 font-medium">
            {product.description}
          </p>

          {/* Flavor Tasting Notes Pills */}
          <div className="flex flex-wrap gap-1.5 mb-3.5">
            {theme.notes.map((note) => (
              <span
                key={note}
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${theme.vibePill}`}
              >
                {note}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Actions: Intuitive Quantity Control */}
        <div className="pt-3 border-t border-mani-200/70 mt-auto w-full">
          {!isAvailable ? (
            <div className="w-full py-2.5 rounded-xl bg-stone-100 text-stone-500 font-bold text-xs text-center border border-stone-200">
              Temporarily Sold Out
            </div>
          ) : !isSelected ? (
            /* Direct Stepper + Add to Order (Full-width contained layout) */
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center justify-between bg-white/90 rounded-xl border border-mani-200 px-3 py-1.5 w-full shadow-2xs">
                <span className="text-xs font-extrabold text-mani-700 select-none">How many tubs?</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleMinusStaged}
                    disabled={stagedQty <= 1}
                    aria-label={`Decrease ${product.name} quantity to add`}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold transition-all ${
                      stagedQty <= 1 
                        ? 'text-mani-300 cursor-not-allowed bg-transparent' 
                        : 'bg-mani-50 text-mani-900 hover:bg-amber-100 hover:text-amber-950 border border-mani-200 active:scale-90 cursor-pointer'
                    }`}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <span 
                    aria-label={`Quantity to add: ${stagedQty}`}
                    className="w-7 text-center text-xs sm:text-sm font-black text-mani-950 select-none"
                  >
                    {stagedQty}
                  </span>

                  <button
                    type="button"
                    onClick={handlePlusStaged}
                    aria-label={`Increase ${product.name} quantity to add`}
                    className="w-7 h-7 rounded-lg bg-mani-50 text-mani-900 hover:bg-amber-100 hover:text-amber-950 active:scale-90 flex items-center justify-center border border-mani-200 font-bold transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddClick}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 active:translate-y-0.5 text-mani-950 font-display font-extrabold text-xs sm:text-sm border-2 border-mani-950 shadow-snack-sm flex items-center justify-center gap-1.5 whitespace-nowrap transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.75] shrink-0" />
                <span>Add to Order • {formatPHP((product.price || 50) * stagedQty)}</span>
              </button>
            </div>
          ) : (
            /* In-Cart Live Controller */
            <div className="flex items-center justify-between gap-2 bg-amber-100/90 p-2 rounded-2xl border-2 border-mani-950 shadow-snack-sm w-full">
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleMinusInCart}
                  aria-label={`Decrease ${product.name} quantity`}
                  className="w-8 h-8 rounded-xl bg-white text-mani-900 hover:bg-red-50 hover:text-red-600 active:scale-90 flex items-center justify-center border-2 border-mani-950 font-bold transition-all cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>

                <input
                  type="number"
                  min="0"
                  max="999"
                  value={quantity}
                  onChange={handleDirectInput}
                  aria-label={`${product.name} quantity in order`}
                  className="w-8 sm:w-9 text-center text-sm font-black bg-transparent text-mani-950 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />

                <button
                  type="button"
                  onClick={handlePlusInCart}
                  aria-label={`Increase ${product.name} quantity`}
                  className="w-8 h-8 rounded-xl bg-amber-400 text-mani-950 hover:bg-amber-300 active:scale-90 flex items-center justify-center border-2 border-mani-950 font-bold transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.75]" />
                </button>
              </div>

              <div className="pr-1 text-right min-w-0">
                <div className="font-display text-sm sm:text-base font-extrabold text-mani-950 truncate leading-tight">
                  {formatPHP(quantity * (product.price || 50))}
                </div>
                <div className="text-[10px] font-extrabold text-amber-900 flex items-center gap-0.5 justify-end whitespace-nowrap">
                  <Sparkles className="w-2.5 h-2.5 text-amber-700" />
                  <span>{quantity} tub{quantity > 1 ? 's' : ''} in basket</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

