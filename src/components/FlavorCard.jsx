import React, { useState } from 'react';
import { Plus, Minus, Check } from 'lucide-react';
import { formatPHP, getFlavorPersonality } from '../config/products';

export default function FlavorCard({ 
  product, 
  quantity, 
  onQuantityChange,
  onAddToCart 
}) {
  const [stagedQty, setStagedQty] = useState(1);
  const [burstKey, setBurstKey] = useState(0);
  const isAvailable = product.available !== false;
  const isSelected = quantity > 0;
  const personality = getFlavorPersonality(product);

  const triggerParticleBurst = () => {
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
    triggerParticleBurst();
    if (onAddToCart) {
      onAddToCart(product, qtyToAdd);
    }
    setStagedQty(1);
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
    triggerParticleBurst();
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
    <article
      className={`relative rounded-3xl p-4 sm:p-4.5 transition-all duration-200 flex flex-col justify-between overflow-hidden group bg-gradient-to-b ${personality.cardBg} ${
        isSelected
          ? 'border-2 border-mani-900 shadow-snack ring-4 ring-amber-300/60 -translate-y-0.5'
          : `border-2 border-mani-900/15 shadow-snack-card hover:border-mani-900/80 hover:shadow-snack-card-hover hover:-translate-y-1 ${personality.tiltClass}`
      } ${!isAvailable ? 'opacity-65 grayscale-[35%] hover:translate-y-0 hover:rotate-0' : ''}`}
    >
      {/* Product Tub Image Showcase */}
      {product.image && (
        <div className={`relative w-full aspect-[4/3] mb-3.5 rounded-2xl overflow-hidden border-2 ${personality.frameBg} shadow-inner`}>
          <img
            src={product.image}
            alt={`${product.name} Mani Tub`}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
            loading="lazy"
          />
          {/* Subtle warm vignette at bottom of photo for badge legibility */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 via-black/15 to-transparent pointer-events-none" />

          {/* Top-Left Sticker Badge */}
          {!isAvailable ? (
            <span className="absolute top-2.5 left-2.5 text-[10px] uppercase font-black tracking-wider px-2.5 py-1 rounded-full shadow-md bg-red-600 text-white border border-white/40 flex items-center gap-1 z-10">
              🔴 Sold Out
            </span>
          ) : (
            <span className={`absolute top-2.5 left-2.5 text-[10px] uppercase font-black tracking-wider px-2.5 py-1 rounded-full border shadow-sm -rotate-2 z-10 ${personality.badgeClass}`}>
              {personality.sticker}
            </span>
          )}

          {/* Top-Right In-Cart Counter Pill */}
          {isSelected && (
            <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 text-[11px] font-black bg-emerald-500 text-white px-2.5 py-1 rounded-full border-2 border-mani-950 shadow-snack-sm z-10 animate-pop">
              <Check className="w-3 h-3 stroke-[3]" />
              <span>{quantity} in cart</span>
            </span>
          )}

          {/* Bottom-Right Obvious Price Tag */}
          <div className={`absolute bottom-2.5 right-2.5 px-3 py-1 rounded-xl font-display font-bold text-sm sm:text-base border border-white/25 shadow-md flex items-baseline gap-1 z-10 ${personality.priceBg}`}>
            <span>{formatPHP(product.price || 50)}</span>
            <span className="text-[10px] font-sans font-bold opacity-85">/ tub</span>
          </div>
        </div>
      )}

      {/* Flavor Title, Vibe Tag & Description */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xl sm:text-2xl select-none shrink-0 group-hover:scale-110 transition-transform duration-200" aria-hidden="true">
                  {personality.displayIcon}
                </span>
                <h3 className="font-display font-bold text-lg sm:text-xl text-mani-950 leading-tight tracking-tight">
                  {product.name}
                </h3>
              </div>

              {/* Flavor Personality Vibe Pill */}
              <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                <span className={`inline-flex items-center text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${personality.vibeClass}`}>
                  {personality.vibe}
                </span>
                {!product.image && (
                  <span className="font-display font-bold text-sm text-amber-900">
                    {formatPHP(product.price || 50)}/tub
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Appetizing Description */}
          <p className="text-xs sm:text-[13px] text-mani-700 font-medium leading-relaxed mt-2.5 mb-4">
            {product.description}
          </p>
        </div>

        {/* Bottom Ordering Action Bar */}
        <div className="relative pt-3 border-t border-mani-200/70 mt-auto w-full">
          {/* Playful Peanut Particle Burst on Add */}
          {burstKey > 0 && (
            <div
              key={burstKey}
              aria-hidden="true"
              className="pointer-events-none absolute -top-2 right-8 z-20 flex items-center justify-center select-none"
            >
              <span className="animate-particle-left text-base">🥜</span>
              <span className="animate-particle-center text-sm font-display font-bold text-amber-950 bg-amber-300 px-1.5 py-0.5 rounded-full border border-mani-900 shadow-2xs">
                +1 {personality.displayIcon}
              </span>
              <span className="animate-particle-right text-base">✨</span>
            </div>
          )}

          {!isAvailable ? (
            <div className="w-full py-2.5 rounded-2xl bg-mani-100/80 text-mani-400 font-extrabold text-xs text-center border border-mani-200">
              Temporarily Out of Stock
            </div>
          ) : !isSelected ? (
            /* Unselected State: Tactile Stepper + Prominent Add Button */
            <div className="flex items-center gap-1.5 w-full">
              {/* Staged Quantity Stepper */}
              <div className="flex items-center bg-mani-100/90 rounded-xl border-2 border-mani-900/15 p-0.5 shrink-0">
                <button
                  type="button"
                  onClick={handleMinusStaged}
                  disabled={stagedQty <= 1}
                  aria-label={`Decrease ${product.name} quantity to add`}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold transition-all ${
                    stagedQty <= 1 
                      ? 'text-mani-300 cursor-not-allowed' 
                      : 'bg-white text-mani-900 hover:bg-amber-100 shadow-2xs active:scale-90 cursor-pointer'
                  }`}
                >
                  <Minus className="w-3 h-3 stroke-[2.5]" />
                </button>

                <span 
                  aria-label={`Quantity to add: ${stagedQty}`}
                  className="w-6 text-center font-display text-xs font-bold text-mani-950 select-none"
                >
                  {stagedQty}
                </span>

                <button
                  type="button"
                  onClick={handlePlusStaged}
                  aria-label={`Increase ${product.name} quantity to add`}
                  className="w-7 h-7 rounded-lg bg-white text-mani-900 hover:bg-amber-100 active:scale-90 flex items-center justify-center shadow-2xs font-bold transition-all cursor-pointer"
                >
                  <Plus className="w-3 h-3 stroke-[2.5]" />
                </button>
              </div>

              {/* Primary Add to Order Button */}
              <button
                type="button"
                onClick={handleAddClick}
                className="flex-1 min-w-0 min-h-[38px] py-2 px-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-mani-950 font-display font-bold text-xs border-2 border-mani-900 shadow-snack-sm active:translate-y-0.5 flex items-center justify-center gap-1 whitespace-nowrap transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3] shrink-0" />
                <span className="truncate">Add to Order</span>
              </button>
            </div>
          ) : (
            /* Selected / In-Cart Live Controller */
            <div className="flex items-center justify-between gap-1.5 bg-amber-100/90 p-1.5 rounded-xl border-2 border-mani-900 shadow-snack-sm w-full">
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleMinusInCart}
                  aria-label={`Decrease ${product.name} quantity`}
                  className="w-7 h-7 rounded-lg bg-white text-mani-950 hover:bg-red-50 hover:text-red-600 active:scale-90 flex items-center justify-center border border-mani-900/20 shadow-2xs font-bold transition-all cursor-pointer"
                >
                  <Minus className="w-3 h-3 stroke-[2.5]" />
                </button>

                <input
                  type="number"
                  min="0"
                  max="999"
                  value={quantity}
                  onChange={handleDirectInput}
                  aria-label={`${product.name} quantity in order`}
                  className="w-7 text-center font-display text-xs sm:text-sm font-bold bg-transparent text-mani-950 focus:outline-none rounded p-0"
                />

                <button
                  type="button"
                  onClick={handlePlusInCart}
                  aria-label={`Increase ${product.name} quantity`}
                  className="w-7 h-7 rounded-lg bg-mani-900 text-amber-300 hover:bg-mani-800 active:scale-90 flex items-center justify-center shadow-xs font-bold transition-all cursor-pointer"
                >
                  <Plus className="w-3 h-3 stroke-[2.5]" />
                </button>
              </div>

              <div className="pr-1.5 text-right min-w-0">
                <div className="font-display text-xs sm:text-sm font-bold text-mani-950 truncate leading-tight">
                  {formatPHP(quantity * (product.price || 50))}
                </div>
                <div className="text-[9px] font-extrabold text-mani-700 uppercase tracking-wider truncate">
                  {quantity} tub{quantity > 1 ? 's' : ''} added
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
