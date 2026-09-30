import React, { useState, useEffect } from 'react';
import { ShoppingBag, ShieldCheck, Sparkles, Lock, LogOut, Clock } from 'lucide-react';
import { getManilaCutoffTimestampMs } from '../utils/phtTime';
import { formatPHP } from '../config/products';
import HalloweenMascotVideo from './HalloweenMascotVideo';

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

  const scrollToSection = (id) => {
    if (currentView !== 'order') {
      onNavigate ? onNavigate('order') : setCurrentView('order');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header className="sticky top-0 z-30 bg-[#1F1025]/95 backdrop-blur-md border-b-2 border-[#FF6B00]/50 shadow-warm">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Logo & Branding */}
          <div 
            role="button"
            tabIndex={0}
            aria-label="Go to Mani Wandering shop home"
            onClick={() => {
              if (onNavigate) onNavigate('order');
              else setCurrentView('order');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (onNavigate) onNavigate('order');
                else setCurrentView('order');
              }
            }}
            className="cursor-pointer flex items-center gap-2.5 sm:gap-3 group rounded-2xl shrink-0"
          >
            <HalloweenMascotVideo
              variant="header"
              ariaLabel="Mani Wandering Logo"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#1F1025] border-2 border-[#FF6B00] shadow-pumpkin-tub group-hover:-rotate-6 group-hover:scale-105 transition-transform duration-200 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg sm:text-2xl font-bold tracking-tight text-white leading-none drop-shadow-xs">
                  Mani Wandering
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#FF6B00] text-white border border-amber-300 -rotate-2 shadow-2xs">
                  <Sparkles className="w-3 h-3 text-amber-200" />
                  🎃 Trick or Treat Crunch!
                </span>
              </div>
            </div>
          </div>

          {/* Quick Section Navigation (Desktop) */}
          {currentView === 'order' && (
            <nav aria-label="Store sections" className="hidden lg:flex items-center gap-1 bg-[#2B1B30]/90 p-1 rounded-2xl border border-[#FF6B00]/40">
              <button
                type="button"
                onClick={() => scrollToSection('flavors-menu')}
                className="px-3 py-1.5 rounded-xl text-xs font-extrabold text-amber-200 hover:bg-[#FF6B00] hover:text-white hover:shadow-2xs transition-all cursor-pointer"
              >
                🎃 Flavors
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('suki-favorites')}
                className="px-3 py-1.5 rounded-xl text-xs font-extrabold text-amber-200 hover:bg-[#FF6B00] hover:text-white hover:shadow-2xs transition-all cursor-pointer"
              >
                🔥 Mga Suki Combos
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('brand-story')}
                className="px-3 py-1.5 rounded-xl text-xs font-extrabold text-amber-200 hover:bg-[#FF6B00] hover:text-white hover:shadow-2xs transition-all cursor-pointer"
              >
                👻 Our Kwento
              </button>
            </nav>
          )}

          {/* Navigation & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Live Cutoff Timer Pill - Visible to EVERYONE */}
            {cutoffInfo && (
              <button
                type="button"
                onClick={() => scrollToSection('order-cutoff-section')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border cursor-pointer ${
                  cutoffInfo.manualFormOpen === false || !cutoffInfo.isOpen || (cutoffInfo.enabled && remainingSec <= 0)
                    ? 'bg-red-950/90 text-red-200 border-red-500/60 hover:bg-red-900'
                    : cutoffInfo.enabled
                    ? 'bg-[#2B1B30] text-amber-300 border-[#FF6B00] hover:bg-[#382240]'
                    : 'bg-emerald-950/90 text-emerald-300 border-emerald-500/60 hover:bg-emerald-900'
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
                    <Lock className="w-3.5 h-3.5 text-red-400" />
                    <span>Closed</span>
                  </>
                ) : cutoffInfo.enabled ? (
                  <>
                    <Clock className="w-3.5 h-3.5 text-[#FF6B00] animate-pulse" />
                    <span className="hidden md:inline font-bold text-amber-200">Cutoff:</span>
                    <span className="font-mono font-black text-white">{formatCountdown(remainingSec)}</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
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
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                    currentView === 'admin'
                      ? 'bg-[#FF6B00] text-white border-amber-300 shadow-inner'
                      : 'bg-[#2B1B30] text-amber-200 border-[#FF6B00]/50 hover:bg-[#382240]'
                  }`}
                  title="Toggle Admin Dashboard"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">{currentView === 'admin' ? 'Back to Shop' : 'Admin'}</span>
                </button>

                <button
                  type="button"
                  onClick={onLogout}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-red-200 bg-red-950/80 hover:bg-red-900 border border-red-500/40 transition-all flex items-center gap-1 cursor-pointer"
                  title="Log out of Admin"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            )}

            {/* Persistent Customer Cart / Running Order Button */}
            {currentView === 'order' && (
              <button
                type="button"
                onClick={onOpenCart}
                aria-label={`Open Order Summary${totalItems > 0 ? ` (${totalItems} tubs, ${formatPHP(subtotal)})` : ''}`}
                className={`relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[#FF6B00] hover:bg-amber-400 text-white hover:text-[#1F1025] font-extrabold text-xs sm:text-sm border-2 border-amber-300 shadow-snack-sm active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer ${
                  cartBounce ? 'scale-105 bg-amber-400 text-[#1F1025]' : ''
                }`}
              >
                <ShoppingBag className="w-4 h-4 stroke-[2.5] shrink-0" />
                <span className="hidden sm:inline font-display tracking-wide">
                  {totalItems > 0 ? formatPHP(subtotal) : 'My Tubs'}
                </span>
                <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-black leading-none transition-transform ${
                  totalItems > 0
                    ? 'bg-[#1F1025] text-amber-300 border border-amber-300/50'
                    : 'bg-[#1F1025]/40 text-white'
                }`}>
                  {totalItems}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
