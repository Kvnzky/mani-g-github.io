import React from 'react';
import { ShoppingBag, ShieldCheck, Sparkles, Lock, LogIn, LogOut, User } from 'lucide-react';

export default function Header({ 
  currentView, 
  setCurrentView, 
  totalItems, 
  onOpenCart,
  isAdminAuthenticated,
  adminUser,
  onOpenLoginModal,
  onLogout
}) {
  return (
    <header className="sticky top-0 z-30 bg-cream/95 backdrop-blur-md border-b border-mani-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Logo & Branding */}
          <div 
            onClick={() => setCurrentView('order')}
            className="cursor-pointer flex items-center gap-2.5 sm:gap-3 group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-50/90 flex items-center justify-center p-0.5 shadow-md shadow-amber-900/10 group-hover:scale-105 transition-transform duration-200 border border-amber-200 overflow-hidden shrink-0">
              <img src="./images/logo.png" alt="MANI WONDERING Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-2xl font-black tracking-tight text-mani-900 flex items-center gap-1.5">
                  MANI WONDERING
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-300/60">
                  <Sparkles className="w-3 h-3 text-amber-700" />
                  Freshly Roasted
                </span>
              </div>
              <p className="text-xs sm:text-sm text-mani-600 font-extrabold italic leading-tight">
                “Wondering where your money went? We know.” 👀🥜
              </p>
            </div>
          </div>

          {/* Navigation & Actions */}
          <div className="flex items-center gap-2">
            {/* If Admin Authenticated: Show Portal Toggle and Logout */}
            {isAdminAuthenticated ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentView(currentView === 'admin' ? 'order' : 'admin')}
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
                  onClick={onLogout}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-all flex items-center gap-1 cursor-pointer"
                  title="Log out of Admin"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            ) : (
              /* If Not Authenticated: Show Login Button */
              <button
                onClick={onOpenLoginModal}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-mani-700 bg-cream-warm hover:bg-mani-100 border border-mani-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Login"
              >
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Login</span>
              </button>
            )}

            {/* Customer Cart Button (only visible in ordering view) */}
            {currentView === 'order' && (
              <button
                onClick={onOpenCart}
                className="relative px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
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
