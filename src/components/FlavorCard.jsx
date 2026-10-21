import React, { useState } from 'react';
import { Plus, Minus, Check, Lock } from 'lucide-react';
import { formatPHP, getFlavorPersonality } from '../config/products';
import { getTheme } from '../config/themes';

export default function FlavorCard({ 
  product, 
  quantity, 
  onQuantityChange,
  onAddToCart,
  index,
  themeId = 'halloween',
  isOrdersClosed = false
}) {
  const [burstKey, setBurstKey] = useState(0);
  const isAvailable = product.available !== false;
  const isSelected = quantity > 0;
  const personality = getFlavorPersonality(product);
  const currentTheme = getTheme(themeId);
  const seasonalSubLabelInfo = currentTheme?.flavorSubLabels?.[product.id] || {
    icon: personality.halloweenIcon || '🎃',
    label: personality.halloweenSubLabel || 'Spooky Crunch'
  };

  const priceBadgeClass = currentTheme?.priceBadgeClass
    || (typeof index === 'number'
        ? (index % 2 === 0
            ? 'bg-[#FF6A00] text-white border-[#211225]/50'
            : 'bg-[#211225] text-[#FFD43B] border-[#FFD43B]/60')
        : (personality.priceBg || 'bg-[#FF6A00] text-white border-[#211225]/50'));

  const triggerParticleBurst = () => {
    setBurstKey((prev) => prev + 1);
  };

  const handleAddClick = () => {
    const newTotal = (quantity || 0) + 1;
    onQuantityChange(product.id, newTotal);
    triggerParticleBurst();
    if (onAddToCart) {
      onAddToCart(product, 1);
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
      className={`card product-card relative rounded-3xl p-3.5 sm:p-4 transition-all duration-200 flex flex-col justify-between overflow-hidden group bg-gradient-to-b ${personality.cardBg} ${
        isSelected
          ? `border-2 ${currentTheme.cardBorderActive || 'border-[#DC2626]'} shadow-warm-lg ring-4 ring-amber-400/60 -translate-y-0.5`
          : `border-2 ${currentTheme.cardBorder || 'border-[#15803D]/60'} ${currentTheme.cardShadow || 'shadow-warm-md hover:shadow-warm-xl'} hover:border-amber-400 hover:-translate-y-1 ${personality.tiltClass}`
      } ${!isAvailable ? 'opacity-65 grayscale-[35%] hover:translate-y-0 hover:rotate-0' : ''}`}
    >
      {/* Product Tub Image Showcase with Theme Box-Shadow */}
      {product.image && (
        <div className={`relative w-full aspect-[4/3] mb-3 rounded-2xl overflow-hidden border-2 ${themeId === 'halloween' ? personality.frameBg : (currentTheme.cardBorder || 'border-amber-300')} shadow-pumpkin-tub transition-shadow duration-300`}>
          <img
            src={product.image}
            alt={`${product.name} Mani Tub`}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
            loading="lazy"
          />
          {/* Ambient glow at bottom of tub photo */}
          <div className={`absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t ${currentTheme.cardGlow || 'from-[#0A1D13]/70 via-[#DC2626]/15 to-transparent'} pointer-events-none`} />

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
          <div className={`price absolute bottom-2.5 right-2.5 px-3 py-1 rounded-xl font-display font-bold text-sm sm:text-base border shadow-md flex items-baseline gap-1 z-10 ${priceBadgeClass}`}>
            <span>{formatPHP(product.price || 50)}</span>
            <span className="text-[10px] font-sans font-bold opacity-85">/ tub</span>
          </div>
        </div>
      )}

      {/* Flavor Title, Seasonal Sub-Label, Vibe Tag & Description */}
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

              {/* Seasonal Sub-Label + Flavor Personality Vibe Pill */}
              <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                <span
                  data-testid={`halloween-sublabel-${product.id}`}
                  className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-2xs ${currentTheme.stepPillBg || 'bg-[#0D2418] text-amber-300 border border-[#DC2626]'}`}
                >
                  <span aria-hidden="true">{seasonalSubLabelInfo.icon}</span>
                  <span>{seasonalSubLabelInfo.label}</span>
                </span>
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
          <p className="text-xs sm:text-[13px] text-mani-700 font-medium leading-relaxed mt-2 mb-3.5">
            {product.description}
          </p>
        </div>

        {/* Bottom Ordering Action Bar */}
        <div className="relative pt-3 border-t border-amber-300/60 mt-auto w-full">
          {/* Playful Particle Burst on Add */}
          {burstKey > 0 && (
            <div
              key={burstKey}
              aria-hidden="true"
              className="pointer-events-none absolute -top-2 right-8 z-20 flex items-center justify-center select-none"
            >
              <span className="animate-particle-left text-base">
                {currentTheme?.particleBurst?.[0] || '🎃'}
              </span>
              <span 
                style={{ backgroundColor: currentTheme?.accentColor || '#FF6B00' }}
                className="animate-particle-center text-sm font-display font-bold text-white px-1.5 py-0.5 rounded-full border border-amber-300 shadow-2xs"
              >
                +1 {personality.displayIcon}
              </span>
              <span className="animate-particle-right text-base">
                {currentTheme?.particleBurst?.[2] || '✨'}
              </span>
            </div>
          )}

          {!isAvailable ? (
            <div className="w-full py-2.5 rounded-2xl bg-mani-100/80 text-mani-400 font-extrabold text-xs text-center border border-mani-200">
              Temporarily Out of Stock
            </div>
          ) : isOrdersClosed ? (
            <div className="w-full py-2.5 px-3 rounded-2xl bg-amber-50/80 text-mani-800 font-extrabold text-xs text-center border border-amber-300/60 flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-mani-700 shrink-0" />
              <span>Batch Orders Closed</span>
            </div>
          ) : !isSelected ? (
            /* Unselected State: Direct 1-Tap Add to Order Button with Generous Hit Area */
            <button
              type="button"
              onClick={handleAddClick}
              className={`w-full min-h-[42px] py-2.5 px-4 rounded-2xl ${currentTheme?.primaryBtn || 'bg-[#FF6B00] hover:bg-amber-400 text-white border-2 border-amber-300 shadow-snack-sm'} font-display font-bold text-xs sm:text-sm active:translate-y-0.5 flex items-center justify-center gap-2 transition-all cursor-pointer`}
            >
              <Plus className="w-4 h-4 stroke-[3] shrink-0" />
              <span>Add to Order</span>
            </button>
          ) : (
            /* Selected / In-Cart Live Controller with Accessible Touch Targets (32-36px) */
            <div className={`flex items-center justify-between gap-2 bg-amber-100/95 p-1.5 rounded-2xl border-2 ${currentTheme?.cardBorderActive || 'border-[#FF6B00]'} shadow-snack-sm w-full`}>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleMinusInCart}
                  aria-label={`Decrease ${product.name} quantity`}
                  className="stepper-btn w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white text-mani-950 hover:bg-red-50 hover:text-red-600 active:scale-90 flex items-center justify-center border border-mani-900/20 shadow-2xs font-bold transition-all cursor-pointer"
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
                  className="w-8 sm:w-9 text-center font-display text-sm sm:text-base font-bold bg-transparent text-mani-950 focus:outline-none rounded p-0"
                />

                <button
                  type="button"
                  onClick={handlePlusInCart}
                  aria-label={`Increase ${product.name} quantity`}
                  className={`stepper-btn w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${currentTheme?.stepPillActive || 'bg-[#FF6B00] text-white border border-amber-300'} active:scale-90 flex items-center justify-center shadow-xs font-bold transition-all cursor-pointer`}
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>

              <div className="pr-2 text-right min-w-0">
                <div className="font-display text-sm sm:text-base font-bold text-mani-950 truncate leading-tight">
                  {formatPHP(quantity * (product.price || 50))}
                </div>
                <div className={`text-[10px] font-extrabold ${currentTheme?.cutoffHighlightText || 'text-[#FF6B00]'} uppercase tracking-wider truncate`}>
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
