import React, { useState } from 'react';
import { Plus, Minus, Check, ShoppingBag } from 'lucide-react';
import { formatPHP } from '../config/products';

export default function FlavorCard({ 
  product, 
  quantity, 
  onQuantityChange,
  onAddToCart 
}) {
  const [stagedQty, setStagedQty] = useState(1);
  const isAvailable = product.available !== false;
  const isSelected = quantity > 0;

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
      className={`relative rounded-3xl p-4 sm:p-5 transition-all duration-200 border flex flex-col justify-between overflow-hidden group ${
        isSelected
          ? 'bg-gradient-to-b from-white via-amber-50/20 to-amber-100/30 border-amber-400/90 shadow-warm-md ring-2 ring-amber-400/40'
          : 'bg-white border-mani-200/90 shadow-warm hover:border-amber-300 hover:shadow-warm-lg'
      } ${!isAvailable ? 'opacity-60 grayscale-[35%]' : ''}`}
    >
      {/* Product Image Preview */}
      {product.image && (
        <div className="relative w-full h-44 sm:h-48 mb-3.5 rounded-2xl overflow-hidden bg-amber-100/30 border border-amber-200/60 shadow-xs">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {!isAvailable ? (
            <span className="absolute top-2.5 left-2.5 text-[10px] uppercase font-black tracking-wider px-2.5 py-1 rounded-full shadow-md bg-red-600 text-white flex items-center gap-1 z-10">
              🔴 Unavailable
            </span>
          ) : product.badge ? (
            <span className={`absolute top-2.5 right-2.5 text-[10px] uppercase font-black tracking-wider px-2.5 py-1 rounded-full shadow-sm backdrop-blur-xs ${product.accentColor || 'bg-amber-100 text-amber-900 border border-amber-300/50'}`}>
              {product.badge}
            </span>
          ) : null}
        </div>
      )}

      {/* Header Info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2 min-w-0">
              {!product.image && (
                <span className="text-3xl sm:text-4xl filter drop-shadow-xs select-none shrink-0">
                  {product.icon || '🥜'}
                </span>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-extrabold text-base sm:text-lg text-mani-950 leading-tight">
                    {product.name}
                  </h3>
                  {!product.image && product.badge && (
                    <span className={`text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md shrink-0 ${product.accentColor || 'bg-amber-100 text-amber-900'}`}>
                      {product.badge}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex items-baseline gap-1">
                  <span className="text-sm font-black text-amber-900">
                    {formatPHP(product.price || 50)}
                  </span>
                  <span className="text-xs font-medium text-mani-500">/ tub</span>
                </div>
              </div>
            </div>

            {/* In-cart count badge */}
            {isSelected && (
              <span className="inline-flex items-center gap-1 text-[11px] font-black bg-amber-500 text-white px-2.5 py-0.5 rounded-full shadow-xs shrink-0 animate-fade-in">
                <Check className="w-3 h-3 stroke-[3]" />
                {quantity} in cart
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-mani-600 leading-relaxed mt-2 mb-4">
            {product.description}
          </p>
        </div>

        {/* Bottom Actions: Intuitive Quantity Control */}
        <div className="pt-3 border-t border-mani-100 mt-auto">
          {!isAvailable ? (
            <div className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-400 font-bold text-xs text-center border border-gray-200">
              Temporarily Unavailable
            </div>
          ) : !isSelected ? (
            /* Direct Stepper + Add to Order */
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-mani-50/80 rounded-xl border border-mani-200/90 p-1 shrink-0">
                <button
                  type="button"
                  onClick={handleMinusStaged}
                  disabled={stagedQty <= 1}
                  aria-label={`Decrease ${product.name} quantity to add`}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold transition-all ${
                    stagedQty <= 1 
                      ? 'text-mani-300 cursor-not-allowed bg-transparent' 
                      : 'bg-white text-mani-800 hover:bg-amber-50 hover:text-amber-800 shadow-2xs border border-mani-200/70 active:scale-90 cursor-pointer'
                  }`}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <span 
                  aria-label={`Quantity to add: ${stagedQty}`}
                  className="w-7 sm:w-8 text-center text-xs sm:text-sm font-black text-mani-900 select-none"
                >
                  {stagedQty}
                </span>

                <button
                  type="button"
                  onClick={handlePlusStaged}
                  aria-label={`Increase ${product.name} quantity to add`}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white text-mani-800 hover:bg-amber-50 hover:text-amber-800 active:scale-90 flex items-center justify-center border border-mani-200/70 shadow-2xs font-bold transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddClick}
                className="flex-1 py-2 sm:py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm shadow-sm hover:shadow-md shadow-amber-900/15 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add to Order</span>
              </button>
            </div>
          ) : (
            /* In-Cart Live Controller */
            <div className="flex items-center justify-between gap-2 bg-amber-50/80 p-1.5 rounded-2xl border border-amber-300/80 ring-1 ring-amber-400/30">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleMinusInCart}
                  aria-label={`Decrease ${product.name} quantity`}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white text-mani-800 hover:bg-red-50 hover:text-red-600 active:scale-90 flex items-center justify-center border border-mani-200/80 shadow-2xs font-bold transition-all cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <input
                  type="number"
                  min="0"
                  max="999"
                  value={quantity}
                  onChange={handleDirectInput}
                  aria-label={`${product.name} quantity in order`}
                  className="w-8 sm:w-10 text-center text-xs sm:text-sm font-black bg-transparent text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />

                <button
                  type="button"
                  onClick={handlePlusInCart}
                  aria-label={`Increase ${product.name} quantity`}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500 text-white hover:bg-amber-600 active:scale-90 flex items-center justify-center shadow-xs font-bold transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>

              <div className="pr-1.5 text-right">
                <div className="text-xs sm:text-sm font-black text-amber-950">
                  {formatPHP(quantity * (product.price || 50))}
                </div>
                <div className="text-[10px] font-bold text-amber-800 flex items-center gap-0.5 justify-end">
                  <span>{quantity} tub{quantity > 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
