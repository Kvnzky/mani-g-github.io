import React from 'react';
import { ShoppingBag, ShieldCheck, Sparkles } from 'lucide-react';

export default function Header({ currentView, setCurrentView, totalItems, onOpenCart }) {
  return (
    <header className="sticky top-0 z-30 bg-cream/95 backdrop-blur-md border-b border-mani-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between">
          {/* Logo & Branding */}
          <div 
            onClick={() => setCurrentView('order')}
            className="cursor-pointer flex items-center gap-3 group"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-2xl shadow-md shadow-amber-900/10 group-hover:scale-105 transition-transform duration-200 border border-amber-200">
              🥜
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-mani-900 flex items-center gap-1.5">
                  MANI G?
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300/60">
                  <Sparkles className="w-3 h-3 text-amber-700" />
                  Freshly Roasted
                </span>
              </div>
              <p className="text-xs sm:text-sm text-mani-600 font-extrabold italic">
                “G ka ba sa crunch?”
              </p>
            </div>
          </div>

          {/* Navigation & Actions */}
          <div className="flex items-center gap-2">
            {/* Admin Switcher */}
            <button
              onClick={() => setCurrentView(currentView === 'admin' ? 'order' : 'admin')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                currentView === 'admin'
                  ? 'bg-mani-800 text-amber-100 border-mani-900 shadow-inner'
                  : 'bg-cream-warm text-mani-700 border-mani-200 hover:bg-mani-100'
              }`}
              title="Admin Portal"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{currentView === 'admin' ? 'Back to Shop' : 'Admin'}</span>
            </button>

            {/* Cart Button */}
            {currentView === 'order' && (
              <button
                onClick={onOpenCart}
                className="relative px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold text-xs sm:text-sm shadow-sm hover:shadow transition-all flex items-center gap-1.5 active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden xs:inline">Order</span>
                {totalItems > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-mani-900 text-amber-200 text-xs font-bold">
                    {totalItems}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
