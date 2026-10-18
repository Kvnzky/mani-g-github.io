import React from 'react';
import { ShieldCheck, Lock, Mail, Heart, Sparkles, ExternalLink } from 'lucide-react';
import { getTheme } from '../config/themes';

export function FooterSection({ themeId = 'halloween', onOpenAdminLogin, isAdminAuthenticated, onNavigateToAdmin }) {
  const currentTheme = getTheme(themeId);

  return (
    <footer id="contact-footer" className={`mt-12 rounded-t-[2.5rem] p-6 sm:p-10 transition-colors ${currentTheme.footerBg}`}>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={currentTheme.logo || './logo.png'}
                alt="Mani Wandering Logo"
                className="w-12 h-12 object-contain drop-shadow-md select-none"
              />
              <div>
                <span className="font-display text-2xl font-bold tracking-tight text-white block">
                  Mani Wandering
                </span>
                <span className="text-xs font-bold text-amber-300">
                  Crispy na, Crunchy pa!
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-amber-100/80 max-w-sm leading-relaxed">
              Handcrafted Filipino garlic peanuts roasted in small batches with real garlic chips and rock salt. Packed fresh in sealed reusable tubs.
            </p>
            <div className="pt-1 flex items-center gap-2">
              <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-black/40 text-amber-300 border border-amber-300/40">
                {currentTheme.seasonalTag}
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-2.5">
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-amber-200">
              Quick Navigation
            </h4>
            <ul className="space-y-1.5 text-xs text-amber-100/85 font-medium">
              <li>
                <a href="#hero" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <span>🏠</span> Store Home
                </a>
              </li>
              <li>
                <a href="#flavors-menu" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <span>🥜</span> All 9 Flavors
                </a>
              </li>
              <li>
                <a href="#suki-favorites" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <span>🔥</span> Suki Combos
                </a>
              </li>
              <li>
                <a href="#brand-story" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <span>📖</span> Our Snack Story
                </a>
              </li>
              <li>
                <a href="#contact-footer" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <span>✉️</span> Contact &amp; Inquiries
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="md:col-span-4 space-y-2.5">
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-amber-200">
              Customer Support &amp; Inquiries
            </h4>
            <div className="space-y-2 text-xs text-amber-100/85">
              <p className="leading-relaxed">
                For corporate bulk orders, event giveaways, or order follow-ups, message us directly:
              </p>
              <a
                href="mailto:engrkevinramirez@gmail.com"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/30 hover:bg-black/50 text-amber-200 hover:text-white border border-amber-300/40 transition-all font-mono font-bold"
              >
                <Mail className="w-3.5 h-3.5 text-amber-300" />
                <span>engrkevinramirez@gmail.com</span>
              </a>
              <p className="text-[11px] opacity-75 pt-1">
                Cash on Delivery • GCash • Maribank QR Accepted
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar & Discreet Admin Portal Access */}
        <div className="pt-6 border-t border-amber-300/25 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-amber-200/70 font-medium">
          <div>
            © {new Date().getFullYear()} Mani Wandering. All rights reserved. Made with ❤️ for Filipino peanut lovers.
          </div>

          <div>
            {isAdminAuthenticated ? (
              <button
                type="button"
                onClick={onNavigateToAdmin}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-400 text-stone-950 font-bold hover:bg-amber-300 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Open Admin Portal</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAdminLogin}
                className="inline-flex items-center gap-1 hover:text-amber-300 transition-colors cursor-pointer opacity-75 hover:opacity-100 text-[11px]"
              >
                <Lock className="w-3 h-3" />
                <span>Admin Portal Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
