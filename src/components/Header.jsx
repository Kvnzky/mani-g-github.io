import React, { useState, useEffect } from 'react';
import { ShoppingBag, ShieldCheck, Sparkles, Lock, LogOut, Clock, Menu, X, ArrowDown } from 'lucide-react';
import { getManilaCutoffTimestampMs } from '../utils/phtTime';
import { formatPHP } from '../config/products';
import { getTheme } from '../config/themes';

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
  cutoffInfo,
  themeId = 'halloween'
}) {
  const currentTheme = getTheme(themeId);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    setMobileMenuOpen(false);
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
    <header className={`sticky top-0 z-30 backdrop-blur-md transition-colors ${currentTheme.headerBg}`}>
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
            <img
              src={currentTheme.logo || './logo.png'}
              alt="Mani Wandering Logo"
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-[0_2px_8px_rgba(255,107,0,0.45)] group-hover:-rotate-6 group-hover:scale-105 transition-transform duration-200 shrink-0 select-none"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg sm:text-2xl font-bold tracking-tight text-white leading-none drop-shadow-xs">
                  Mani Wandering
                </span>
                <span className={`hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold -rotate-1 shadow-2xs ${currentTheme.heroBadge || 'bg-[#FF6B00] text-white border border-amber-300'}`}>
                  <Sparkles className="w-3 h-3 text-amber-200" />
                  <span>{currentTheme.seasonalTag || '🎃 Trick or Treat Crunch!'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Section Navigation (Desktop): Home, Products, How to Order, Contact + Order Now CTA */}
          {currentView === 'order' && (
            <nav aria-label="Store navigation" className={`hidden lg:flex items-center gap-1 p-1 rounded-2xl ${currentTheme.headerNavBg || 'bg-[#2B1B30]/90 border border-[#FF6B00]/40'}`}>
              <button
                type="button"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${currentTheme.headerNavText || 'text-amber-200 hover:bg-[#FF6B00] hover:text-white'}`}
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('flavors-menu')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${currentTheme.headerNavText || 'text-amber-200 hover:bg-[#FF6B00] hover:text-white'}`}
              >
                Products
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('suki-favorites')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${currentTheme.headerNavText || 'text-amber-200 hover:bg-[#FF6B00] hover:text-white'}`}
              >
                Suki Combos
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('brand-story')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${currentTheme.headerNavText || 'text-amber-200 hover:bg-[#FF6B00] hover:text-white'}`}
              >
                Our Story
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('flavors-menu')}
                className={`ml-1 px-3.5 py-1.5 rounded-xl text-xs font-extrabold shadow-2xs transition-all cursor-pointer flex items-center gap-1 ${currentTheme.primaryBtn || 'bg-[#DC2626] text-white border border-amber-300'}`}
              >
                <span>Order Now</span>
                <ArrowDown className="w-3 h-3 stroke-[2.5]" />
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
                    ? `${currentTheme.stepPillBg || 'bg-[#0D2418] text-amber-300 border-[#DC2626]'} hover:brightness-110`
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
                    <Clock className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
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
                      ? `${currentTheme.primaryBtn || 'bg-[#DC2626] text-white border-amber-300'} shadow-inner`
                      : `${currentTheme.stepPillBg || 'bg-[#0D2418] text-amber-200 border-[#DC2626]/50'} hover:brightness-110`
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
                className={`relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-extrabold text-xs sm:text-sm border-2 shadow-snack-sm active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentTheme.cartPillBg || currentTheme.primaryBtn || 'bg-[#DC2626] text-white border-amber-300'
                } ${
                  cartBounce ? 'scale-105 brightness-110' : ''
                }`}
              >
                <ShoppingBag className="w-4 h-4 stroke-[2.5] shrink-0" />
                <span className="hidden sm:inline font-display tracking-wide">
                  {totalItems > 0 ? formatPHP(subtotal) : 'My Tubs'}
                </span>
                <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-black leading-none transition-transform ${
                  totalItems > 0
                    ? 'bg-black/40 text-amber-300 border border-amber-300/50'
                    : 'bg-black/30 text-white'
                }`}>
                  {totalItems}
                </span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            {currentView === 'order' && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/20"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Navigation Menu */}
        {mobileMenuOpen && currentView === 'order' && (
          <nav aria-label="Mobile navigation" className="lg:hidden mt-3 pt-3 border-t border-amber-300/30 flex flex-col gap-1.5 pb-2 animate-fade-in">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-left text-amber-200 hover:bg-white/10 flex items-center justify-between"
            >
              <span>🏠 Home</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('flavors-menu')}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-left text-amber-200 hover:bg-white/10 flex items-center justify-between"
            >
              <span>🥜 Products &amp; Flavors</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('suki-favorites')}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-left text-amber-200 hover:bg-white/10 flex items-center justify-between"
            >
              <span>🔥 Suki Combos</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('brand-story')}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-left text-amber-200 hover:bg-white/10 flex items-center justify-between"
            >
              <span>📖 Our Snack Story</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('flavors-menu')}
              className={`mt-1 px-4 py-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm text-center ${currentTheme.primaryBtn || 'bg-[#DC2626] text-white'}`}
            >
              <span>{currentTheme.heroOrderBtnText || 'Order Now 🥜'}</span>
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
