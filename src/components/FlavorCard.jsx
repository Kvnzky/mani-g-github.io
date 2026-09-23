import React from 'react';
import { Plus, Minus, Check } from 'lucide-react';
import { formatPHP } from '../config/products';

export default function FlavorCard({ product, quantity, onQuantityChange }) {
  const isAvailable = product.available !== false;
  const isSelected = quantity > 0;

  const handleMinus = () => {
    if (quantity > 0) {
      onQuantityChange(product.id, quantity - 1);
    }
  };

  const handlePlus = () => {
    onQuantityChange(product.id, quantity + 1);
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
      className={`relative rounded-2xl p-3.5 sm:p-4 transition-all duration-200 border flex flex-col justify-between overflow-hidden ${
        isSelected
          ? 'bg-gradient-to-b from-white to-amber-50/40 border-amber-400 shadow-warm-lg ring-1 ring-amber-400/50'
          : 'bg-white border-mani-200/90 shadow-warm hover:border-amber-300/80 hover:shadow-warm-lg'
      } ${!isAvailable ? 'opacity-60 grayscale-[40%]' : ''}`}
    >
      {/* Product Image Preview */}
      {product.image && (
        <div className="relative w-full h-44 sm:h-48 mb-3 rounded-2xl overflow-hidden bg-amber-100/40 border border-amber-200/60 group shadow-xs">
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
            <span className={`absolute top-2.5 right-2.5 text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full shadow-sm backdrop-blur-xs ${product.accentColor || 'bg-amber-100 text-amber-900'}`}>
              {product.badge}
            </span>
          ) : null}
        </div>
      )}

      {/* Top Header Row */}
      <div>
        <div className="flex items-start justify-between gap-1.5 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            {!product.image && (
              <span className="text-3xl sm:text-4xl filter drop-shadow-sm select-none shrink-0">
                {product.icon || '🥜'}
              </span>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-extrabold text-base sm:text-lg text-mani-900 leading-tight">
                  {product.name}
                </h3>
                {!product.image && product.badge && (
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md shrink-0 ${product.accentColor || 'bg-amber-100 text-amber-900'}`}>
                    {product.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold text-amber-800">
                {formatPHP(product.price || 50)} <span className="font-normal text-mani-500">/ tub</span>
              </span>
            </div>
          </div>

          {/* Active selection badge */}
          {isSelected && (
            <span className="flex items-center gap-1 text-[11px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full shadow-xs shrink-0 whitespace-nowrap">
              <Check className="w-3 h-3" />
              {quantity} in cart
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-mani-600 leading-relaxed mb-3 sm:mb-4">
          {product.description}
        </p>
      </div>

      {/* Bottom Actions: Stepper */}
      <div className="pt-2.5 border-t border-mani-100 flex items-center justify-between gap-1.5">
        <span className="text-xs font-semibold text-mani-600 shrink-0">Quantity</span>

        {!isAvailable ? (
          <button
            type="button"
            disabled
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gray-100 text-gray-400 font-bold text-xs sm:text-sm cursor-not-allowed border border-gray-200 shrink-0"
          >
            Unavailable
          </button>
        ) : quantity === 0 ? (
          <button
            type="button"
            onClick={handlePlus}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-mani-100 hover:bg-amber-500 hover:text-white text-mani-800 font-bold text-xs sm:text-sm transition-all duration-150 flex items-center justify-center gap-1.5 active:scale-95 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add to Order</span>
          </button>
        ) : (
          <div className="flex items-center gap-1 sm:gap-1.5 bg-mani-50 p-1 rounded-xl border border-mani-200 shrink-0">
            <button
              type="button"
              onClick={handleMinus}
              aria-label={`Decrease ${product.name} quantity`}
              className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg bg-white text-mani-800 hover:bg-red-50 hover:text-red-600 flex items-center justify-center border border-mani-200 shadow-2xs font-bold transition-all active:scale-90 shrink-0 cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <input
              type="number"
              min="0"
              max="999"
              value={quantity}
              onChange={handleDirectInput}
              aria-label={`${product.name} quantity`}
              className="w-7 sm:w-8 text-center text-xs sm:text-sm font-extrabold bg-transparent text-mani-900 focus:outline-none focus:ring-1 focus:ring-amber-500 rounded p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />

            <button
              type="button"
              onClick={handlePlus}
              aria-label={`Increase ${product.name} quantity`}
              className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 flex items-center justify-center shadow-2xs font-bold transition-all active:scale-90 shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
