import React from 'react';
import HalloweenMascotVideo from './HalloweenMascotVideo';
import { Sparkles, Gift, Star, Award, Heart } from 'lucide-react';

export default function SeasonalHeroVisual({ themeId = 'halloween' }) {
  if (themeId === 'halloween') {
    return (
      <HalloweenMascotVideo
        variant="hero"
        ariaLabel="Mani Wandering Peanut Mascot"
        className="w-full aspect-video lg:scale-105 xl:scale-110 origin-center"
      />
    );
  }

  if (themeId === 'christmas') {
    return (
      <div className="relative w-full max-w-[620px] mx-auto flex items-center justify-center p-3 select-none">
        {/* Ambient Holiday Glow Backdrops */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#DC2626]/25 via-[#FBBF24]/15 to-[#15803D]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-6 -right-6 w-40 h-40 bg-[#FBBF24]/20 rounded-full blur-2xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-6 -left-6 w-44 h-44 bg-[#DC2626]/20 rounded-full blur-2xl pointer-events-none" />

        {/* Main Festive Composition Card */}
        <div className="relative z-10 w-full rounded-3xl bg-gradient-to-b from-[#133523]/90 via-[#0A1D13]/95 to-[#0D2418] border-2 border-[#DC2626] p-6 sm:p-8 shadow-warm-xl backdrop-blur-md overflow-hidden">
          {/* Decorative Corner Pine Garland Accent */}
          <div className="absolute -top-3 -right-3 text-2xl rotate-12 drop-shadow-md select-none pointer-events-none">
            🎄⭐
          </div>
          <div className="absolute -bottom-2 -left-2 text-2xl -rotate-12 drop-shadow-md select-none pointer-events-none">
            🎁🔔
          </div>

          {/* Central Logo & Santa Hat Feature */}
          <div className="text-center space-y-4">
            <div className="relative inline-block animate-float-slow">
              {/* Santa Hat SVG sitting atop the logo */}
              <div className="absolute -top-5 -right-3 z-20 pointer-events-none transform rotate-12 drop-shadow-md">
                <svg className="w-14 h-12" viewBox="0 0 64 54" fill="none">
                  {/* Red cone */}
                  <path d="M12 40 C18 20 38 6 50 14 C48 24 44 34 46 40 Z" fill="#DC2626" />
                  {/* Fold and shadow */}
                  <path d="M46 22 C40 26 36 32 34 40 C38 40 42 40 46 40 Z" fill="#B91C1C" opacity="0.6" />
                  {/* White pom-pom */}
                  <circle cx="52" cy="14" r="5" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1" />
                  {/* White fuzzy brim */}
                  <rect x="8" y="38" width="42" height="10" rx="5" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1" />
                </svg>
              </div>

              {/* Glowing Golden Ring Wreath behind logo */}
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-[#15803D] via-[#0D2418] to-[#123322] border-4 border-[#FBBF24] p-3 shadow-warm-lg flex items-center justify-center mx-auto">
                <img
                  src="./logo.png"
                  alt="Mani Wandering Christmas Logo"
                  className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(220,38,38,0.5)]"
                />
              </div>

              {/* Little Maligayang Pasko Ribbon Tag */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#DC2626] text-white text-[11px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full border border-amber-300 shadow-snack-sm flex items-center gap-1">
                <span>🎄 Maligayang Pasko</span>
              </div>
            </div>

            {/* Featured Holiday Tubs Mini Showcase */}
            <div className="pt-2">
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#FBBF24] mb-3">
                ⭐ Pinakamasarap na Pang-Noche Buena at Monito-Monita
              </p>

              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {/* Tub 1: Santa's Classic Salted */}
                <div className="rounded-2xl p-2 bg-[#0D2418]/90 border border-emerald-600/50 flex flex-col items-center text-center space-y-1.5 shadow-sm hover:border-[#DC2626] transition-all">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-emerald-500/40">
                    <img src="./images/products/salted.jpg" alt="Salted Mani" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-amber-300 block leading-tight">⭐ Classic</span>
                    <span className="text-[9px] text-emerald-200/90 font-medium">Santa’s Fave</span>
                  </div>
                </div>

                {/* Tub 2: Holiday Fire Crunch Spicy */}
                <div className="rounded-2xl p-2 bg-[#0D2418]/90 border border-[#DC2626]/70 flex flex-col items-center text-center space-y-1.5 shadow-sm hover:border-amber-300 transition-all scale-105 bg-gradient-to-b from-[#180808] to-[#0D2418]">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-[#DC2626]">
                    <img src="./images/products/spicy.jpg" alt="Spicy Mani" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-rose-300 block leading-tight">🔥 Holiday Fire</span>
                    <span className="text-[9px] text-amber-200/90 font-bold">#1 Pulutan</span>
                  </div>
                </div>

                {/* Tub 3: Golden Star Salted Egg */}
                <div className="rounded-2xl p-2 bg-[#0D2418]/90 border border-emerald-600/50 flex flex-col items-center text-center space-y-1.5 shadow-sm hover:border-[#DC2626] transition-all">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-amber-400/40">
                    <img src="./images/products/salted-egg.jpg" alt="Salted Egg Mani" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-amber-300 block leading-tight">🥚 Golden Star</span>
                    <span className="text-[9px] text-emerald-200/90 font-medium">Rich Umami</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Value Pillars */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-[10px] font-extrabold text-emerald-100">
              <span className="inline-flex items-center gap-1 bg-[#081810]/90 px-2.5 py-1 rounded-xl border border-emerald-600/40">
                <Gift className="w-3 h-3 text-[#DC2626]" /> Reusable Tubs
              </span>
              <span className="inline-flex items-center gap-1 bg-[#081810]/90 px-2.5 py-1 rounded-xl border border-emerald-600/40">
                <Star className="w-3 h-3 text-[#FBBF24]" /> Purong Crispy Bawang
              </span>
              <span className="inline-flex items-center gap-1 bg-[#081810]/90 px-2.5 py-1 rounded-xl border border-emerald-600/40">
                <Sparkles className="w-3 h-3 text-amber-300" /> Bagong Luto Weekly
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (themeId === 'thanksgiving') {
    return (
      <div className="relative w-full max-w-[620px] mx-auto flex items-center justify-center p-3 select-none">
        {/* Ambient Warm Harvest Glow Backdrops in Burnt Orange, Burgundy & Harvest Gold */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#EA580C]/25 via-[#881337]/20 to-[#F59E0B]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-6 -right-6 w-40 h-40 bg-[#F59E0B]/20 rounded-full blur-2xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-6 -left-6 w-44 h-44 bg-[#881337]/25 rounded-full blur-2xl pointer-events-none" />

        {/* Main Harvest Composition Card */}
        <div className="relative z-10 w-full rounded-3xl bg-gradient-to-b from-[#381B09]/95 via-[#2A170B]/95 to-[#231206] border-2 border-[#EA580C] p-6 sm:p-8 shadow-warm-xl backdrop-blur-md overflow-hidden">
          {/* Decorative Corner Foliage & Harvest Accents */}
          <div className="absolute -top-2 -right-2 text-2xl rotate-12 drop-shadow-md select-none pointer-events-none">
            🍂🌾
          </div>
          <div className="absolute -bottom-2 -left-2 text-2xl -rotate-12 drop-shadow-md select-none pointer-events-none">
            🥧🍁
          </div>

          {/* Central Logo & Autumn Harvest Wreath */}
          <div className="text-center space-y-4">
            <div className="relative inline-block animate-float-slow">
              {/* Autumn Maple & Wheat Leaf cluster above logo */}
              <div className="absolute -top-4 -right-2 z-20 pointer-events-none transform rotate-12 drop-shadow-md">
                <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                  <path d="M24 4 L27 14 L36 10 L34 20 L44 20 L36 28 L42 36 L32 36 L32 44 L24 38 L16 44 L16 36 L6 36 L12 28 L4 20 L14 20 L12 10 L21 14 Z" fill="#EA580C" stroke="#9A3412" strokeWidth="1" />
                  <ellipse cx="36" cy="12" rx="4" ry="2" fill="#FDE047" stroke="#D97706" strokeWidth="0.8" transform="rotate(30 36 12)" />
                </svg>
              </div>

              {/* Glowing Warm Harvest Ring Wreath behind logo */}
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-[#451F0A] via-[#2A170B] to-[#381B09] border-4 border-[#F59E0B] p-3 shadow-warm-lg flex items-center justify-center mx-auto">
                <img
                  src="./logo.png"
                  alt="Mani Wandering Thanksgiving Harvest Logo"
                  className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(234,88,12,0.5)]"
                />
              </div>

              {/* Autumn Harvest Ribbon Tag */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gradient-to-r from-[#881337] to-[#EA580C] text-white text-[11px] font-black uppercase tracking-wider px-3.5 py-0.5 rounded-full border border-amber-300 shadow-snack-sm flex items-center gap-1">
                <span>🌾 Season of Gratitude</span>
              </div>
            </div>

            {/* Featured Autumn Harvest Tubs Mini Showcase */}
            <div className="pt-2">
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#FDE047] mb-3">
                🍂 Pinakamasarap na Pang-Salo-Salo at Pasasalamat
              </p>

              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {/* Tub 1: Classic Harvest Salted */}
                <div className="rounded-2xl p-2 bg-[#231206]/90 border border-[#EA580C]/50 flex flex-col items-center text-center space-y-1.5 shadow-sm hover:border-[#F59E0B] transition-all">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-amber-500/40">
                    <img src="./images/products/salted.jpg" alt="Harvest Salted Mani" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-amber-300 block leading-tight">🍂 Salted</span>
                    <span className="text-[9px] text-amber-200/90 font-medium">Classic Crunch</span>
                  </div>
                </div>

                {/* Tub 2: Campfire Heat Spicy */}
                <div className="rounded-2xl p-2 bg-[#231206]/90 border border-[#881337]/70 flex flex-col items-center text-center space-y-1.5 shadow-sm hover:border-amber-300 transition-all scale-105 bg-gradient-to-b from-[#381B09] to-[#231206]">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-[#EA580C]">
                    <img src="./images/products/spicy.jpg" alt="Campfire Spicy Mani" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-rose-300 block leading-tight">🔥 Campfire</span>
                    <span className="text-[9px] text-amber-200/90 font-bold">Chili Garlic</span>
                  </div>
                </div>

                {/* Tub 3: Golden Yolk Feast Salted Egg */}
                <div className="rounded-2xl p-2 bg-[#231206]/90 border border-[#EA580C]/50 flex flex-col items-center text-center space-y-1.5 shadow-sm hover:border-[#F59E0B] transition-all">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-amber-400/40">
                    <img src="./images/products/salted-egg.jpg" alt="Golden Feast Salted Egg Mani" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-amber-300 block leading-tight">🌾 Golden Feast</span>
                    <span className="text-[9px] text-amber-200/90 font-medium">Rich Butter Yolk</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Value Pillars */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-[10px] font-extrabold text-amber-100">
              <span className="inline-flex items-center gap-1 bg-[#1C0E05]/90 px-2.5 py-1 rounded-xl border border-[#EA580C]/40">
                <Heart className="w-3 h-3 text-[#EA580C]" /> Salo-Salo Ready
              </span>
              <span className="inline-flex items-center gap-1 bg-[#1C0E05]/90 px-2.5 py-1 rounded-xl border border-[#EA580C]/40">
                <Award className="w-3 h-3 text-[#F59E0B]" /> Purong Crispy Bawang
              </span>
              <span className="inline-flex items-center gap-1 bg-[#1C0E05]/90 px-2.5 py-1 rounded-xl border border-[#EA580C]/40">
                <Sparkles className="w-3 h-3 text-amber-300" /> Fresh Small Batches
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (themeId === 'new-year') {
    return (
      <div className="relative w-full max-w-[620px] mx-auto flex items-center justify-center p-3 select-none">
        {/* Ambient Celebration Glow Backdrops in Midnight Navy, Champagne Gold & Celebration Crimson */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#EAB308]/25 via-[#E11D48]/15 to-[#0B1120]/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-6 -right-6 w-40 h-40 bg-[#FDE047]/20 rounded-full blur-2xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-6 -left-6 w-44 h-44 bg-[#E11D48]/20 rounded-full blur-2xl pointer-events-none" />

        {/* Main Celebration Composition Card */}
        <div className="relative z-10 w-full rounded-3xl bg-gradient-to-b from-[#10172A]/95 via-[#0B1120]/95 to-[#070A14] border-2 border-[#EAB308] p-6 sm:p-8 shadow-warm-xl backdrop-blur-md overflow-hidden">
          {/* Decorative Corner Fireworks & Confetti Accents */}
          <div className="absolute -top-2 -right-2 text-2xl rotate-12 drop-shadow-md select-none pointer-events-none">
            🎆✨
          </div>
          <div className="absolute -bottom-2 -left-2 text-2xl -rotate-12 drop-shadow-md select-none pointer-events-none">
            🥂⭐
          </div>

          {/* Central Logo & Champagne Gold Wreath */}
          <div className="text-center space-y-4">
            <div className="relative inline-block animate-float-slow">
              {/* Starburst cluster above logo */}
              <div className="absolute -top-4 -right-2 z-20 pointer-events-none transform rotate-12 drop-shadow-md">
                <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                  <line x1="24" y1="4" x2="24" y2="44" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
                  <line x1="4" y1="24" x2="44" y2="24" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
                  <line x1="10" y1="10" x2="38" y2="38" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="38" y1="10" x2="10" y2="38" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="24" cy="24" r="4" fill="#FFFFFF" />
                </svg>
              </div>

              {/* Glowing Midnight & Champagne Gold Ring Wreath behind logo */}
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-[#1E293B] via-[#0B1120] to-[#10172A] border-4 border-[#FDE047] p-3 shadow-warm-lg flex items-center justify-center mx-auto">
                <img
                  src="./logo.png"
                  alt="Mani Wandering New Year Logo"
                  className="w-full h-full object-contain drop-shadow-[0_4px_14px_rgba(234,179,8,0.55)]"
                />
              </div>

              {/* Celebration Ribbon Tag */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gradient-to-r from-[#BE123C] to-[#EAB308] text-white text-[11px] font-black uppercase tracking-wider px-3.5 py-0.5 rounded-full border border-amber-200 shadow-snack-sm flex items-center gap-1">
                <span>✨ Manigong Bagong Taon</span>
              </div>
            </div>

            {/* Featured New Year Celebration Tubs Mini Showcase */}
            <div className="pt-2">
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#FDE047] mb-3">
                ⭐ Pinakamasarap na Pang-Media Noche at Bagong Taon
              </p>

              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {/* Tub 1: Midnight Classic Salted */}
                <div className="rounded-2xl p-2 bg-[#070A14]/90 border border-slate-700/60 flex flex-col items-center text-center space-y-1.5 shadow-sm hover:border-[#EAB308] transition-all">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-amber-500/40">
                    <img src="./images/products/salted.jpg" alt="Midnight Classic Salted Mani" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-amber-300 block leading-tight">🎆 Midnight</span>
                    <span className="text-[9px] text-slate-300 font-medium">Media Noche Fave</span>
                  </div>
                </div>

                {/* Tub 2: Countdown Spark Spicy */}
                <div className="rounded-2xl p-2 bg-[#070A14]/90 border border-[#E11D48]/70 flex flex-col items-center text-center space-y-1.5 shadow-sm hover:border-amber-300 transition-all scale-105 bg-gradient-to-b from-[#1E1120] to-[#070A14]">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-[#E11D48]">
                    <img src="./images/products/spicy.jpg" alt="Countdown Spark Spicy Mani" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-rose-300 block leading-tight">💥 Countdown</span>
                    <span className="text-[9px] text-amber-200/90 font-bold">#1 Pulutan</span>
                  </div>
                </div>

                {/* Tub 3: Golden Fortune Egg Salted Egg */}
                <div className="rounded-2xl p-2 bg-[#070A14]/90 border border-slate-700/60 flex flex-col items-center text-center space-y-1.5 shadow-sm hover:border-[#EAB308] transition-all">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-amber-400/40">
                    <img src="./images/products/salted-egg.jpg" alt="Golden Fortune Egg Mani" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-amber-300 block leading-tight">🥚 Fortune Egg</span>
                    <span className="text-[9px] text-slate-300 font-medium">Lucky Umami</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Value Pillars */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-[10px] font-extrabold text-slate-200">
              <span className="inline-flex items-center gap-1 bg-[#05070D]/90 px-2.5 py-1 rounded-xl border border-[#EAB308]/40">
                <Gift className="w-3 h-3 text-[#E11D48]" /> Media Noche Ready
              </span>
              <span className="inline-flex items-center gap-1 bg-[#05070D]/90 px-2.5 py-1 rounded-xl border border-[#EAB308]/40">
                <Star className="w-3 h-3 text-[#FDE047]" /> Purong Crispy Bawang
              </span>
              <span className="inline-flex items-center gap-1 bg-[#05070D]/90 px-2.5 py-1 rounded-xl border border-[#EAB308]/40">
                <Sparkles className="w-3 h-3 text-amber-300" /> Bagong Luto Weekly
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (themeId === 'chinese-new-year') {
    return (
      <div className="relative w-full max-w-[620px] mx-auto flex items-center justify-center p-3 select-none">
        {/* Ambient Auspicious Glow Backdrops in Imperial Red, Rich Gold & Deep Burgundy */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#DC2626]/25 via-[#F59E0B]/20 to-[#7F1D1D]/35 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-6 -right-6 w-40 h-40 bg-[#F59E0B]/20 rounded-full blur-2xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-6 -left-6 w-44 h-44 bg-[#DC2626]/25 rounded-full blur-2xl pointer-events-none" />

        {/* Main Lunar New Year Composition Card */}
        <div className="relative z-10 w-full rounded-3xl bg-gradient-to-b from-[#3B0C0C]/95 via-[#260707]/95 to-[#1F0606] border-2 border-[#DC2626] p-6 sm:p-8 shadow-warm-xl backdrop-blur-md overflow-hidden">
          {/* Decorative Corner Lanterns & Gold Coins */}
          <div className="absolute -top-2 -right-2 text-2xl rotate-12 drop-shadow-md select-none pointer-events-none">
            🧧🏮
          </div>
          <div className="absolute -bottom-2 -left-2 text-2xl -rotate-12 drop-shadow-md select-none pointer-events-none">
            🪙✨
          </div>

          {/* Central Logo & Auspicious Gold Cloud Ring */}
          <div className="text-center space-y-4">
            <div className="relative inline-block animate-float-slow">
              {/* Auspicious Cloud flourish above logo */}
              <div className="absolute -top-4 -right-2 z-20 pointer-events-none transform rotate-12 drop-shadow-md">
                <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                  <path
                    d="M10 28 C4 28 2 20 8 16 C10 8 22 6 26 14 C32 10 42 12 42 20 C48 20 50 28 44 30 Z"
                    fill="#FDE047"
                    stroke="#D97706"
                    strokeWidth="1.2"
                  />
                  <circle cx="26" cy="22" r="3" fill="#DC2626" />
                </svg>
              </div>

              {/* Glowing Imperial Red & Gold Ring Wreath behind logo */}
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-[#450F0F] via-[#260707] to-[#3B0C0C] border-4 border-[#F59E0B] p-3 shadow-warm-lg flex items-center justify-center mx-auto">
                <img
                  src="./logo.png"
                  alt="Mani Wandering Chinese New Year Logo"
                  className="w-full h-full object-contain drop-shadow-[0_4px_14px_rgba(220,38,38,0.55)]"
                />
              </div>

              {/* Auspicious Ribbon Tag */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gradient-to-r from-[#B91C1C] via-[#DC2626] to-[#F59E0B] text-amber-100 text-[11px] font-black uppercase tracking-wider px-3.5 py-0.5 rounded-full border border-amber-300 shadow-snack-sm flex items-center gap-1">
                <span>🧧 Gong Xi Fa Cai</span>
              </div>
            </div>

            {/* Featured Lunar New Year Tubs Mini Showcase */}
            <div className="pt-2">
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#FDE047] mb-3">
                🏮 Pinakamasarap na Pang-Salo-Salo at Pampaswerte
              </p>

              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {/* Tub 1: Lucky Salted */}
                <div className="rounded-2xl p-2 bg-[#1F0606]/90 border border-amber-600/50 flex flex-col items-center text-center space-y-1.5 shadow-sm hover:border-[#F59E0B] transition-all">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-amber-500/40">
                    <img src="./images/products/salted.jpg" alt="Lucky Salted Mani" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-amber-300 block leading-tight">🧧 Lucky</span>
                    <span className="text-[9px] text-amber-200/90 font-medium">Prosperity Fave</span>
                  </div>
                </div>

                {/* Tub 2: Dragon Chili Kick Spicy */}
                <div className="rounded-2xl p-2 bg-[#1F0606]/90 border border-[#DC2626]/70 flex flex-col items-center text-center space-y-1.5 shadow-sm hover:border-amber-300 transition-all scale-105 bg-gradient-to-b from-[#3B0C0C] to-[#1F0606]">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-[#DC2626]">
                    <img src="./images/products/spicy.jpg" alt="Dragon Chili Spicy Mani" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-rose-300 block leading-tight">🐉 Dragon Kick</span>
                    <span className="text-[9px] text-amber-200/90 font-bold">#1 Pulutan</span>
                  </div>
                </div>

                {/* Tub 3: Golden Treasure Egg Salted Egg */}
                <div className="rounded-2xl p-2 bg-[#1F0606]/90 border border-amber-600/50 flex flex-col items-center text-center space-y-1.5 shadow-sm hover:border-[#F59E0B] transition-all">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-amber-400/40">
                    <img src="./images/products/salted-egg.jpg" alt="Golden Treasure Egg Mani" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-amber-300 block leading-tight">🪙 Treasure</span>
                    <span className="text-[9px] text-amber-200/90 font-medium">Fortune Umami</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Value Pillars */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-[10px] font-extrabold text-amber-100">
              <span className="inline-flex items-center gap-1 bg-[#1A0404]/90 px-2.5 py-1 rounded-xl border border-amber-600/40">
                <Gift className="w-3 h-3 text-[#DC2626]" /> Angpao &amp; Feasts Ready
              </span>
              <span className="inline-flex items-center gap-1 bg-[#1A0404]/90 px-2.5 py-1 rounded-xl border border-amber-600/40">
                <Star className="w-3 h-3 text-[#F59E0B]" /> Purong Crispy Bawang
              </span>
              <span className="inline-flex items-center gap-1 bg-[#1A0404]/90 px-2.5 py-1 rounded-xl border border-amber-600/40">
                <Sparkles className="w-3 h-3 text-amber-300" /> Bagong Luto for Good Luck
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default / Other Themes Fallback: Classic Brand Showcase
  return (
    <div className="relative w-full max-w-[580px] mx-auto flex items-center justify-center p-3 select-none">
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 via-orange-400/10 to-yellow-500/25 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 w-full rounded-3xl bg-white/95 border-2 border-amber-500 p-6 sm:p-8 shadow-warm-xl backdrop-blur-md text-center space-y-4">
        <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-amber-100 to-amber-50 border-4 border-amber-500 p-3 shadow-snack-sm flex items-center justify-center mx-auto animate-float-slow">
          <img
            src="./logo.png"
            alt="Mani Wandering Brand Logo"
            className="w-full h-full object-contain drop-shadow-md"
          />
        </div>
        <div>
          <span className="inline-block text-[11px] font-black uppercase tracking-wider bg-amber-400 text-mani-950 px-3 py-1 rounded-full border border-mani-900 shadow-2xs">
            🥜 Everyday Pinoy Crunch
          </span>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-mani-950 mt-2">
            Bagong Lutong Bawang Mani
          </h3>
          <p className="text-xs text-mani-700 font-medium max-w-sm mx-auto mt-1">
            Handcrafted garlic peanuts cooked in small batches with real crispy garlic chips and rock salt.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2.5 pt-2">
          <div className="rounded-xl p-2 bg-amber-50 border border-amber-200">
            <span className="text-xl block">🧂</span>
            <span className="text-[10px] font-bold text-mani-900">Classic Salted</span>
          </div>
          <div className="rounded-xl p-2 bg-orange-50 border border-orange-200">
            <span className="text-xl block">🌶️</span>
            <span className="text-[10px] font-bold text-mani-900">Chili Garlic</span>
          </div>
          <div className="rounded-xl p-2 bg-yellow-50 border border-yellow-200">
            <span className="text-xl block">🧄</span>
            <span className="text-[10px] font-bold text-mani-900">Crispy Bawang</span>
          </div>
        </div>
      </div>
    </div>
  );
}
