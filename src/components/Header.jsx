import React, { useState, useEffect } from 'react';
import { ShoppingBag, ShieldCheck, Sparkles, Lock, LogOut, Clock } from 'lucide-react';
import { getManilaCutoffTimestampMs } from '../utils/phtTime';
import { formatPHP } from '../config/products';

export default function Header({ 
  currentView, 
  setCurrentView, 
  onNavigate,
  totalItems, 
  subtotal = 0,
  cartBounce = false,
  onOpenCart,
  isAdminAuthenticated,
  adminUser,
  onLogout,
  cutoffInfo
}) {
  const [remainingSec, setRemainingSec] = useState(() => {
    if (!cutoffInfo || !cutoffInfo.cutoffDate) return 0;
    const targetMs = getManilaCutoffTimestampMs(cutoffInfo.cutoffDate, cutoffInfo.cutoffTime);
    if (targetMs === null) return 0;
    const diff = Math.floor((targetMs - Date.now()) / 1000);
    return Math.max(0, diff);
  });

  useEffect(() => {
    if (!cutoffInfo || !cutoffInfo.cutoffDate) return;
    const targetTimestamp = getManilaCutoffTimestampMs(cutoffInfo.cutoffDate, cutoffInfo.cutoffTime);
    if (targetTimestamp === null) return;
    const updateTicker = () => {
      const diff = Math.floor((targetTimestamp - Date.now()) / 1000);
      setRemainingSec(Math.max(0, diff));
    };
    updateTicker();
    const timer = setInterval(updateTicker, 1000);
    return () => clearInterval(timer);
  }, [cutoffInfo?.cutoffDate, cutoffInfo?.cutoffTime, cutoffInfo?.enabled]);

  const formatCountdown = (totalSec) => {
    if (totalSec <= 0) return '00:00:00';
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FDF9F0]/95 backdrop-blur-md border-b-2 border-mani-900/15 shadow-xs">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Logo & Branding */}
          <div 
            role="button"
            tabIndex={0}
            aria-label="Go to Mani Wandering shop home"
            onClick={() => onNavigate ? onNavigate('order') : setCurrentView('order')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onNavigate ? onNavigate('order') : setCurrentView('order');
              }
            }}
            className="cursor-pointer flex items-center gap-2.5 sm:gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-2xl min-w-0"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-100 flex items-center justify-center p-0.5 border-2 border-mani-950 shadow-snack-sm group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-200 overflow-hidden shrink-0">
              <img src="./images/logo.png" alt="Mani Wandering Logo" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-lg sm:text-2xl font-extrabold tracking-tight text-mani-950 truncate">
                  Mani Wandering
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-300 text-mani-950 border border-mani-900 -rotate-1">
                  <Sparkles className="w-3 h-3 text-mani-900" />
                  Crispy na, Crunchy pa!
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-bold text-mani-600 hidden xs:block truncate">
                🇵🇭 Artisanal Flavored Mani & Crispy Bawang in Tubs
              </p>
            </div>
          </div>

          {/* Quick Jump Links (Desktop Storefront) */}
          {currentView === 'order' && (
            <nav aria-label="Store sections" className="hidden xl:flex items-center gap-1 bg-white/80 px-2 py-1 rounded-2xl border border-mani-200">
              <button
                type="button"
                onClick={() => document.getElementById('flavors-menu-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-3 py-1 rounded-xl text-xs font-extrabold text-mani-800 hover:bg-amber-100 hover:text-mani-950 transition-colors cursor-pointer"
              >
                🥜 7 Flavors
              </button>
              <button
                type="button"
                onClick={() => document.getElementById('brand-story-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-3 py-1 rounded-xl text-xs font-extrabold text-mani-800 hover:bg-amber-100 hover:text-mani-950 transition-colors cursor-pointer"
              >
                ✨ Our Story
              </button>
              <button
                type="button"
                onClick={() => document.getElementById('suki-favorites-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-3 py-1 rounded-xl text-xs font-extrabold text-mani-800 hover:bg-amber-100 hover:text-mani-950 transition-colors cursor-pointer"
              >
                🔥 Mga Suki Picks
              </button>
            </nav>
          )}

          {/* Navigation & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Live Cutoff Timer Pill - Visible to EVERYONE */}
            {cutoffInfo && (
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('order-cutoff-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border shadow-2xs cursor-pointer ${
                  cutoffInfo.manualFormOpen === false || !cutoffInfo.isOpen || (cutoffInfo.enabled && remainingSec <= 0)
                    ? 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100'
                    : cutoffInfo.enabled
                    ? 'bg-amber-100 text-amber-950 border-amber-400 hover:bg-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                }`}
                title={
                  cutoffInfo.manualFormOpen === false
                    ? 'Orders are currently closed'
                    : cutoffInfo.enabled
                    ? `Order Cutoff: ${cutoffInfo.cutoffDate} at ${cutoffInfo.cutoffTime} PHT`
                    : cutoffInfo.isOpen ? 'Orders Open' : 'Orders Closed'
                }
              >
                {cutoffInfo.manualFormOpen === false || !cutoffInfo.isOpen || (cutoffInfo.enabled && remainingSec <= 0) ? (
                  <>
                    <Lock className="w-3.5 h-3.5 text-red-600" />
                    <span>Closed</span>
                  </>
                ) : cutoffInfo.enabled ? (
                  <>
                    <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                    <span className="hidden sm:inline font-bold text-amber-900">Cutoff:</span>
                    <span className="font-mono font-black text-mani-950">{formatCountdown(remainingSec)}</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold">Open</span>
                  </>
                )}
              </button>
            )}

            {/* If Admin Authenticated: Show Portal Toggle and Logout */}
            {isAdminAuthenticated && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onNavigate ? onNavigate(currentView === 'admin' ? 'order' : 'admin') : setCurrentView(currentView === 'admin' ? 'order' : 'admin')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                    currentView === 'admin'
                      ? 'bg-mani-900 text-amber-200 border-mani-900 shadow-inner'
                      : 'bg-cream-warm text-mani-800 border-mani-300 hover:bg-amber-100'
                  }`}
                  title="Toggle Admin Dashboard"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                  <span>{currentView === 'admin' ? 'Back to Shop' : 'Admin Dashboard'}</span>
                </button>

                <button
                  type="button"
                  onClick={onLogout}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-all flex items-center gap-1 cursor-pointer"
                  title="Log out of Admin"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            )}

            {/* Customer Cart Button (only visible in ordering view) */}
            {currentView === 'order' && (
              <button
                type="button"
                onClick={onOpenCart}
                aria-label={`Open Order Summary${totalItems > 0 ? ` (${totalItems} items)` : ''}`}
                className={`relative px-3 sm:px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-mani-950 font-display font-extrabold text-xs sm:text-sm border-2 border-mani-950 shadow-snack-sm transition-all flex items-center gap-1.5 active:translate-y-0.5 cursor-pointer ${
                  cartBounce ? 'animate-pop' : ''
                }`}
              >
                <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">Basket</span>
                {totalItems > 0 ? (
                  <span className="px-1.5 py-0.2 rounded-full bg-mani-950 text-amber-300 text-xs font-black flex items-center gap-1">
                    <span>{totalItems}</span>
                    {subtotal > 0 && <span className="hidden md:inline text-amber-200">• {formatPHP(subtotal)}</span>}
                  </span>
                ) : (
                  <span className="px-1.5 py-0.2 rounded-full bg-mani-950/10 text-mani-900 text-[11px] font-extrabold">
                    0
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

