import React, { useState } from 'react';
import { Star, Plus, Trash2, Edit3, Sparkles } from 'lucide-react';
import { formatPHP, SPECIAL_ORDER_DEFAULT_PRICE } from '../config/products';

export default function SpecialOrderCard({ specialOrders = [], onAddSpecialOrder, onRemoveSpecialOrder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [flavor, setFlavor] = useState('');
  const [instructions, setInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

  const popularCustomizations = [
    'Extra spicy 🌶️🔥',
    'Garlic + spicy 🧄🌶️',
    'Less salt 🧂',
    'Mix BBQ & Sour Cream 🥣',
    'Extra crispy bawang 🧄'
  ];

  const handleApplyPreset = (preset) => {
    setFlavor(preset);
    if (!name) setName('Custom ' + preset.split(' ')[0]);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!flavor.trim()) {
      setError('Please tell us what flavor or combination you would like.');
      return;
    }

    if (quantity < 1) {
      setError('Please specify at least 1 pack.');
      return;
    }

    const newSpecial = {
      id: `sp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim() || flavor.trim(),
      flavor: flavor.trim(),
      instructions: instructions.trim(),
      quantity: Number(quantity),
      price: SPECIAL_ORDER_DEFAULT_PRICE
    };

    onAddSpecialOrder(newSpecial);

    // Reset form
    setName('');
    setFlavor('');
    setInstructions('');
    setQuantity(1);
    setError('');
    setIsOpen(false);
  };

  return (
    <div className="rounded-3xl bg-gradient-to-br from-amber-50 via-orange-50/40 to-yellow-50/60 border-2 border-dashed border-amber-300 p-4 sm:p-6 shadow-warm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 text-lg">
            ⭐
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-extrabold text-mani-900">
                Add a Special Order
              </h3>
              <span className="text-[10px] font-bold uppercase bg-amber-200/80 text-amber-950 px-2 py-0.5 rounded-full">
                Customized
              </span>
            </div>
            <p className="text-xs sm:text-sm text-mani-700">
              Want extra spicy, garlic + chili combo, or less salt? We'll make it fresh for you!
            </p>
          </div>
        </div>

        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Customize Mani</span>
          </button>
        )}
      </div>

      {/* List of already added special orders */}
      {specialOrders.length > 0 && (
        <div className="space-y-2 mb-4">
          <h4 className="text-xs font-bold text-mani-800 uppercase tracking-wider">
            Your Custom Items ({specialOrders.length}):
          </h4>
          <div className="grid gap-2">
            {specialOrders.map((sp) => (
              <div
                key={sp.id}
                className="bg-white rounded-xl p-3 border border-amber-200 shadow-xs flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-mani-900 truncate">
                      {sp.name}
                    </span>
                    <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                      × {sp.quantity} packs
                    </span>
                  </div>
                  <p className="text-xs text-mani-600 mt-0.5">
                    <span className="font-semibold text-mani-700">Flavor:</span> {sp.flavor}
                    {sp.instructions && ` • Note: ${sp.instructions}`}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-extrabold text-mani-900">
                    {formatPHP(sp.price * sp.quantity)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveSpecialOrder(sp.id)}
                    className="p-1.5 rounded-lg text-mani-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Remove custom item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Form */}
      {isOpen && (
        <form onSubmit={handleAdd} className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-300 shadow-warm-lg animate-fade-in space-y-4">
          <div className="flex items-center justify-between border-b border-mani-100 pb-2.5">
            <h4 className="text-sm font-bold text-mani-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Customize Your Flavor & Blend
            </h4>
            <span className="text-xs font-bold text-amber-800">
              {formatPHP(SPECIAL_ORDER_DEFAULT_PRICE)} / pack
            </span>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          {/* Quick presets */}
          <div>
            <label className="block text-xs font-bold text-mani-700 mb-1.5">
              Quick Suggestions:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {popularCustomizations.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-mani-800 font-medium transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Flavor/Combination description (Required) */}
          <div>
            <label className="block text-xs font-bold text-mani-800 mb-1">
              What flavor or combination would you like? <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={flavor}
              onChange={(e) => {
                setFlavor(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Extra spicy, Garlic + spicy, Less salt, Mix BBQ & Cheese..."
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-mani-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
              required
            />
          </div>

          {/* Name & Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-mani-800 mb-1">
                Custom Name (Optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Juan's Hot Garlic Mani"
                className="w-full text-sm px-3.5 py-2 rounded-xl border border-mani-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-mani-800 mb-1">
                Quantity (Packs) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2 bg-mani-50 p-1 rounded-xl border border-mani-200 max-w-[160px]">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg bg-white text-mani-800 hover:bg-red-50 hover:text-red-600 flex items-center justify-center border border-mani-200 font-bold"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-12 text-center text-sm font-bold bg-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-lg bg-amber-500 text-white hover:bg-amber-600 flex items-center justify-center font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Special instructions */}
          <div>
            <label className="block text-xs font-bold text-mani-800 mb-1">
              Special Instructions (Optional)
            </label>
            <textarea
              rows="2"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Separate garlic chips in a small pouch, crispier roast, no chili seeds..."
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-mani-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-mani-100">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setError('');
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-mani-600 hover:bg-mani-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Special Order</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
