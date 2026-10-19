import React from 'react';
import { Sparkles, Flame, HeartHandshake, Plus, ArrowUpRight } from 'lucide-react';
import { formatPHP } from '../config/products';
import { PlayfulSkeletonSvg, PlayfulMummySvg, CornerWebWithSpider } from './HalloweenAtmosphere';
import { SantaPeanutSvg, ChristmasCornerGarland } from './ChristmasDecorations';
import { HarvestPeanutSvg, ThanksgivingCornerGarland } from './ThanksgivingDecorations';
import { NewYearPeanutSvg, NewYearCornerGarland } from './NewYearDecorations';
import { ChineseNewYearPeanutSvg, ChineseNewYearCornerGarland } from './ChineseNewYearDecorations';
import { getTheme } from '../config/themes';

const SUKI_COMBOS = [
  {
    id: 'suki-duo',
    badge: 'MOST REORDERED',
    badgeClass: 'bg-[#FF6B00] text-white border border-amber-300',
    title: 'The "Bitin ang Isa" Duo',
    subtitle: '1 Salted + 1 Spicy',
    description: 'Our #1 repeat suki order! Classic rock-salt & bawang crunch paired with our bestselling fiery chili-garlic mani.',
    items: [
      { id: 'salted', qty: 1, label: '🧂 Salted × 1' },
      { id: 'spicy', qty: 1, label: '🌶️ Spicy × 1' }
    ]
  },
  {
    id: 'sawa-sa-sarap',
    badge: 'SAFE PICK',
    badgeClass: 'bg-[#FF6B00] text-white border border-amber-300',
    title: 'Sawa sa Sarap Duo',
    subtitle: '1 Salted + 1 Bawang Only',
    description: 'Crunchy salted mani with extra crispy golden garlic. Simple, savory and hard to stop. Sawa sa sarap talaga!',
    items: [
      { id: 'salted', qty: 1, label: '🧂 Salted × 1' },
      { id: 'bawang-only', qty: 1, label: '🧄 Bawang Only × 1' }
    ]
  },
  {
    id: 'anghang-usok',
    badge: 'MAANGHANG',
    badgeClass: 'bg-[#FF6B00] text-white border border-amber-300',
    title: 'Anghang-Usok Duo',
    subtitle: '1 Spicy + 1 BBQ',
    description: 'Fiery chili-garlic meets smoky-sweet barbecue. Best with malamig na softdrinks or beer!',
    items: [
      { id: 'spicy', qty: 1, label: '🌶️ Spicy × 1' },
      { id: 'bbq', qty: 1, label: '🍖 BBQ × 1' }
    ]
  },
  {
    id: 'garlic-overload',
    badge: 'GARLIC LOVERS PICK',
    badgeClass: 'bg-rose-600 text-white border border-amber-300',
    title: 'Bawang & Spice Overload',
    subtitle: '1 Spicy + 1 BBQ + 1 Bawang Only',
    description: 'Made for serious garlic fans. Papak straight from the tub or sprinkle the extra crispy golden bawang over rice & pancit!',
    items: [
      { id: 'spicy', qty: 1, label: '🌶️ Spicy × 1' },
      { id: 'bbq', qty: 1, label: '🍖 BBQ × 1' },
      { id: 'bawang-only', qty: 1, label: '🧄 Bawang Only × 1' }
    ]
  },
  {
    id: 'golden-egg-duo',
    badge: 'NEW CRAVING',
    badgeClass: 'bg-amber-600 text-white border border-amber-300',
    title: 'Golden Salted Egg Cravers Duo',
    subtitle: '1 Salted Egg + 1 Spicy Salted Egg',
    description: 'Rich, savory golden yolk coating with toasted garlic crunch. Enjoy both the velvety umami classic and the fiery spicy twist!',
    items: [
      { id: 'salted-egg', qty: 1, label: '🥚 Salted Egg × 1' },
      { id: 'spicy-salted-egg', qty: 1, label: '🔥 Spicy Salted Egg × 1' }
    ]
  },
  {
    id: 'barkada-stash',
    badge: 'BARKADA TAMBAY',
    badgeClass: 'bg-emerald-600 text-white border border-amber-300',
    title: 'Barkada Movie Night Stash',
    subtitle: '1 Salted + 1 Cheese + 1 Sour Cream + 1 BBQ',
    description: 'Four crowd-pleasing flavors so nobody fights over the last handful. Built for Netflix marathons and kwentuhan.',
    items: [
      { id: 'salted', qty: 1, label: '🧂 Salted × 1' },
      { id: 'cheese', qty: 1, label: '🧀 Cheese × 1' },
      { id: 'sour-cream', qty: 1, label: '🥛 Sour Cream × 1' },
      { id: 'bbq', qty: 1, label: '🍖 BBQ × 1' }
    ]
  },
  {
    id: 'walang-iwanan',
    badge: 'BUONG BARKADA',
    badgeClass: 'bg-purple-700 text-amber-200 border border-[#FF6B00]',
    title: 'Walang Iwanan All-Stars Pack',
    subtitle: '1 of Every Flavor (9 Tubs Total)',
    description: 'Every single flavor in one complete bundle. Mula classic asin hanggang sa spicy salted egg at purong bawang — walang maiiwan sa salo-salo!',
    items: [
      { id: 'salted', qty: 1, label: '🧂 Salted × 1' },
      { id: 'unsalted', qty: 1, label: '🥜 Unsalted × 1' },
      { id: 'spicy', qty: 1, label: '🌶️ Spicy × 1' },
      { id: 'bbq', qty: 1, label: '🍖 BBQ × 1' },
      { id: 'sour-cream', qty: 1, label: '🥛 Sour Cream × 1' },
      { id: 'cheese', qty: 1, label: '🧀 Cheese × 1' },
      { id: 'salted-egg', qty: 1, label: '🥚 Salted Egg × 1' },
      { id: 'spicy-salted-egg', qty: 1, label: '🔥 Spicy Salted Egg × 1' },
      { id: 'bawang-only', qty: 1, label: '🧄 Bawang Only × 1' }
    ]
  }
];

const CRAVING_MOMENTS = [
  {
    emoji: '🎬',
    tag: 'Merienda & Horror Movie Nights',
    title: 'Pop the Lid, Start the Show',
    description: 'No messy plastic bags spilling on the couch. Resealable tubs keep every peanut crunchy from the opening scare to the credits.',
    bgClass: 'bg-amber-100/80 border-[#FF6B00]/60'
  },
  {
    emoji: '💻',
    tag: 'Work & Study Fuel',
    title: 'Pampagising sa Desk',
    description: 'Beat the 3PM antok at work or power through late-night review sessions with real roasted garlic and crunchy mani.',
    bgClass: 'bg-orange-100/75 border-[#FF6B00]/60'
  },
  {
    emoji: '🚗',
    tag: 'Road Trips & Barkada',
    title: 'Made to Wander With You',
    description: 'Cup-holder friendly tubs that travel from expressway road trips to spontaneous barkada tambay nights.',
    bgClass: 'bg-emerald-100/75 border-emerald-400'
  }
];

const CRAVING_OCCASIONS = [
  { emoji: '🎃', label: 'Trick or Treat' },
  { emoji: '🎬', label: 'Horror Movie Nights' },
  { emoji: '☕', label: 'Merienda' },
  { emoji: '💻', label: 'Office Snacks' },
  { emoji: '🎒', label: 'School Snacks' },
  { emoji: '🚗', label: 'Road Trips' },
  { emoji: '🤝', label: 'Sharing with Friends' },
  { emoji: '🌙', label: 'Midnight Cravings' }
];

// Ready-to-populate array for verified customer reviews (kept authentic — no fake testimonials)
export const VERIFIED_SUKI_REVIEWS = [];

export default function BrandStoryAndSuki({ products = [], onAddCombo, isOrdersClosed, themeId = 'halloween' }) {
  const currentTheme = getTheme(themeId);
  const isHalloween = themeId === 'halloween';
  const isChristmas = themeId === 'christmas';
  const isThanksgiving = themeId === 'thanksgiving';
  const isNewYear = themeId === 'new-year';
  const isChineseNewYear = themeId === 'chinese-new-year';

  const getProductMap = () => {
    const map = {};
    products.forEach((p) => {
      map[p.id] = p;
    });
    return map;
  };

  const productMap = getProductMap();

  const computeComboPrice = (comboItems) => {
    return comboItems.reduce((sum, item) => {
      const prod = productMap[item.id];
      const price = prod ? (prod.price || 50) : (item.id === 'bawang-only' ? 60 : ((item.id === 'salted-egg' || item.id === 'spicy-salted-egg') ? 65 : 50));
      return sum + price * item.qty;
    }, 0);
  };

  const isComboAvailable = (comboItems) => {
    return comboItems.every((item) => {
      const prod = productMap[item.id];
      return !prod || prod.available !== false;
    });
  };

  return (
    <div className="space-y-12 sm:space-y-16 pt-6">
      {/* SECTION 1: MGA SUKI FAVORITES & CURATED COMBOS */}
      <section id="suki-favorites" className="space-y-6 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`hidden sm:flex shrink-0 ${
              isChristmas ? 'bg-[#0D2418] border-2 border-[#DC2626]' 
              : isThanksgiving ? 'bg-[#2A170B] border-2 border-[#EA580C]'
              : isNewYear ? 'bg-[#0B1120] border-2 border-[#EAB308]'
              : isChineseNewYear ? 'bg-[#260707] border-2 border-[#DC2626]'
              : 'bg-[#2B1B30] border-2 border-[#FF6B00]'
            } p-2 rounded-3xl shadow-snack-sm`}>
              {isChristmas ? (
                <SantaPeanutSvg className="w-16 h-20 drop-shadow-[0_2px_10px_rgba(220,38,38,0.5)]" />
              ) : isThanksgiving ? (
                <HarvestPeanutSvg className="w-16 h-20 drop-shadow-[0_2px_10px_rgba(234,88,12,0.5)]" />
              ) : isNewYear ? (
                <NewYearPeanutSvg className="w-16 h-20 drop-shadow-[0_2px_10px_rgba(234,179,8,0.5)]" />
              ) : isChineseNewYear ? (
                <ChineseNewYearPeanutSvg className="w-16 h-20 drop-shadow-[0_2px_10px_rgba(220,38,38,0.5)]" />
              ) : isHalloween ? (
                <PlayfulSkeletonSvg className="w-16 h-20 drop-shadow-[0_2px_10px_rgba(255,107,0,0.4)]" />
              ) : (
                <div className="w-16 h-20 flex items-center justify-center text-3xl">🥜</div>
              )}
            </div>
            <div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${currentTheme?.badgeClass || 'bg-[#FF6B00] text-white border border-amber-300'} -rotate-1 mb-2 shadow-2xs`}>
                <Flame className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
                <span>{currentTheme?.sukiBadge || 'Mga Suki Crowd Favorites'}</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight drop-shadow-xs">
                Need Help Choosing? Try a Suki Combo! 🥜
              </h2>
              <p className="text-xs sm:text-sm text-amber-100/90 font-medium mt-1 max-w-2xl leading-relaxed">
                Our most-loved flavor pairings, put together based on how our mga suki actually reorder. One tap adds the whole set to your basket!
              </p>
            </div>
          </div>
          <a
            href="#flavors-menu"
            className={`inline-flex items-center gap-1 text-xs font-extrabold ${currentTheme?.secondaryBtn || 'text-amber-300 bg-[#2B1B30] border-2 border-[#FF6B00]'} px-3.5 py-2 rounded-xl transition-all self-start sm:self-auto shrink-0`}
          >
            <span>Browse Individual Tubs</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* 6 Combo Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {SUKI_COMBOS.map((combo) => {
            const comboPrice = computeComboPrice(combo.items);
            const available = isComboAvailable(combo.items);
            const totalTubs = combo.items.reduce((s, i) => s + i.qty, 0);

            return (
              <div
                key={combo.id}
                className={`rounded-3xl p-5 sm:p-6 bg-gradient-to-b from-amber-50/95 via-white to-orange-50/60 border-2 ${currentTheme?.cardBorder || 'border-[#FF6B00]/60'} hover:border-amber-400 shadow-snack-card hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${combo.badgeClass}`}>
                      {combo.badge}
                    </span>
                    <span className={`font-display text-lg font-bold ${currentTheme?.stepPillBg || 'text-amber-300 bg-[#1F1025] border border-[#FF6B00]'} px-3.5 py-0.5 rounded-xl shadow-2xs`}>
                      {formatPHP(comboPrice)}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display text-xl font-bold text-mani-950 leading-snug">
                      {combo.title}
                    </h3>
                    <p className={`text-xs font-extrabold ${currentTheme?.cutoffHighlightText || 'text-[#FF6B00]'} mt-0.5`}>
                      {combo.subtitle} ({totalTubs} tubs)
                    </p>
                  </div>

                  <p className="text-xs sm:text-[13px] text-mani-700 font-medium leading-relaxed">
                    {combo.description}
                  </p>
                </div>

                <div className="pt-4 mt-auto">
                  {/* Flavor Pills inside Combo */}
                  <div className="flex flex-wrap gap-1.5 pb-4">
                    {combo.items.map((item) => (
                      <span
                        key={item.id}
                        className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100/80 text-mani-950 border ${currentTheme?.cardBorder || 'border-[#FF6B00]/40'} shadow-2xs`}
                      >
                        {item.label}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-amber-300/60">
                    <button
                      type="button"
                      disabled={!available || isOrdersClosed}
                      onClick={() => onAddCombo && onAddCombo(combo)}
                      className={`w-full py-2.5 px-4 rounded-xl font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
                        !available || isOrdersClosed
                          ? 'bg-mani-100 text-mani-400 border border-mani-200 cursor-not-allowed'
                          : `${currentTheme?.primaryBtn || 'bg-[#FF6B00] hover:bg-amber-400 text-white border-2 border-amber-300 shadow-snack-sm'} cursor-pointer`
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>
                        {!available
                          ? 'Some Flavors Unavailable'
                          : isOrdersClosed
                          ? 'Orders Currently Closed'
                          : `Add ${totalTubs}-Tub Combo (${formatPHP(comboPrice)})`}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: BRAND STORY ("KWENTO NG MANI WANDERING") with Featured Focal Point */}
      <section
        id="brand-story"
        className={`rounded-3xl ${
          isChristmas
            ? 'bg-gradient-to-br from-[#123322] via-[#0E281B] to-[#1C422C] text-emerald-50 border-2 border-[#DC2626] shadow-warm-lg'
            : isThanksgiving
            ? 'bg-gradient-to-br from-[#381B09] via-[#2A170B] to-[#451F0A] text-amber-50 border-2 border-[#EA580C] shadow-warm-lg'
            : isNewYear
            ? 'bg-gradient-to-br from-[#10172A] via-[#0B1120] to-[#1E243B] text-slate-100 border-2 border-[#EAB308] shadow-warm-lg'
            : isChineseNewYear
            ? 'bg-gradient-to-br from-[#3B0C0C] via-[#260707] to-[#450F0F] text-amber-50 border-2 border-[#DC2626] shadow-warm-lg'
            : isHalloween
            ? 'bg-gradient-to-br from-[#2B1B30] via-[#1F1025] to-[#2B1B30] text-cream border-2 border-[#FF6B00] shadow-pumpkin-card'
            : 'bg-gradient-to-br from-[#38200D] via-[#2A170B] to-[#38200D] text-cream border-2 border-amber-500 shadow-snack-card'
        } p-6 sm:p-8 lg:p-10 relative overflow-hidden scroll-mt-24`}
      >
        {/* Anchored Corner Decorations */}
        {isHalloween && (
          <>
            <CornerWebWithSpider position="left" size="sm" showSpider={false} />
            <CornerWebWithSpider position="right" size="sm" showSpider={true} />
          </>
        )}
        {isChristmas && (
          <>
            <ChristmasCornerGarland position="left" />
            <ChristmasCornerGarland position="right" />
          </>
        )}
        {isThanksgiving && (
          <>
            <ThanksgivingCornerGarland position="left" />
            <ThanksgivingCornerGarland position="right" />
          </>
        )}
        {isNewYear && (
          <>
            <NewYearCornerGarland position="left" />
            <NewYearCornerGarland position="right" />
          </>
        )}
        {isChineseNewYear && (
          <>
            <ChineseNewYearCornerGarland position="left" />
            <ChineseNewYearCornerGarland position="right" />
          </>
        )}

        {/* Subtle decorative glow */}
        <div 
          style={{ backgroundColor: currentTheme?.accentColor || '#FF6B00' }}
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none" 
        />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-7">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${currentTheme?.badgeClass || 'bg-[#FF6B00] text-white border border-amber-300'}`}>
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>{currentTheme?.brandStoryPill || 'Our Snack Story • Kwento ng Mani Wandering'}</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
                {currentTheme?.brandStoryHeadline || 'Street Snack Nostalgia, Upgraded for Everyday Cravings 🎃🥜'}
              </h2>
              <p className="text-xs sm:text-sm text-amber-100/90 font-medium leading-relaxed">
                Every Filipino knows that irresistible smell of freshly cooked kanto mani—warm, savory, and loaded with toasted garlic. We started <strong className="text-amber-300">Mani Wandering</strong> to capture that honest, home-cooked street snack feeling in convenient, resealable tubs you can enjoy anywhere. Small-batch cooking, bold seasonings, and purong crispy bawang chips in every bite.
              </p>
            </div>

            {/* Featured Character Focal Point Card */}
            <div className={`flex items-center gap-4 ${
              isChristmas ? 'bg-[#0D2418]/95 border-2 border-[#DC2626]' 
              : isThanksgiving ? 'bg-[#2A170B]/95 border-2 border-[#EA580C]'
              : isNewYear ? 'bg-[#0B1120]/95 border-2 border-[#EAB308]'
              : isChineseNewYear ? 'bg-[#260707]/95 border-2 border-[#DC2626]'
              : 'bg-[#1F1025]/95 border-2 border-[#FF6B00]'
            } backdrop-blur-xs p-4 sm:p-5 rounded-3xl shadow-snack-sm shrink-0 self-start lg:self-center`}>
              {isChristmas ? (
                <SantaPeanutSvg className="w-20 h-24 sm:w-24 sm:h-28 shrink-0 drop-shadow-[0_4px_14px_rgba(220,38,38,0.5)]" />
              ) : isThanksgiving ? (
                <HarvestPeanutSvg className="w-20 h-24 sm:w-24 sm:h-28 shrink-0 drop-shadow-[0_4px_14px_rgba(234,88,12,0.5)]" />
              ) : isNewYear ? (
                <NewYearPeanutSvg className="w-20 h-24 sm:w-24 sm:h-28 shrink-0 drop-shadow-[0_4px_14px_rgba(234,179,8,0.5)]" />
              ) : isChineseNewYear ? (
                <ChineseNewYearPeanutSvg className="w-20 h-24 sm:w-24 sm:h-28 shrink-0 drop-shadow-[0_4px_14px_rgba(220,38,38,0.5)]" />
              ) : isHalloween ? (
                <PlayfulMummySvg className="w-20 h-24 sm:w-24 sm:h-28 shrink-0 drop-shadow-[0_4px_14px_rgba(245,158,11,0.45)]" />
              ) : (
                <div className="w-20 h-24 sm:w-24 sm:h-28 flex items-center justify-center text-5xl">🥜</div>
              )}
              <div className="space-y-1">
                <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${currentTheme?.badgeClass || 'bg-[#FF6B00] text-white border border-amber-300'}`}>
                  {currentTheme?.focalCardBadge || 'Mummy’s Favorite Stash'}
                </span>
                <div className="font-display text-base sm:text-lg font-bold text-amber-300">
                  {currentTheme?.focalCardTitle || '“Trick or Treat Crunch!”'}
                </div>
                <p className="text-xs text-amber-100/85 font-medium max-w-[210px] leading-snug">
                  {currentTheme?.focalCardText || '9 signature flavors cooked fresh for horror movie nights, merienda, pulutan, and road trips.'}
                </p>
              </div>
              <img
                src="./logo.png"
                alt="Mani Wandering Mascot"
                className="w-14 h-14 sm:w-16 sm:h-16 hidden sm:block object-contain drop-shadow-[0_2px_10px_rgba(255,107,0,0.45)] shrink-0 select-none"
              />
            </div>
          </div>

          {/* Relatable Filipino Craving Occasions Pills */}
          <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-wider text-amber-300">
              Made for Every Pinoy Craving Moment:
            </p>
            <div className="flex flex-wrap gap-2">
              {(currentTheme?.cravingOccasions || CRAVING_OCCASIONS).map((occ) => (
                <span
                  key={occ.label}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl ${
                    isChristmas 
                      ? 'bg-[#0D2418]/85 hover:bg-[#DC2626]/30 text-emerald-100 border border-emerald-600/50' 
                      : isThanksgiving
                      ? 'bg-[#2A170B]/85 hover:bg-[#EA580C]/30 text-amber-100 border border-[#EA580C]/50'
                      : isNewYear
                      ? 'bg-[#0B1120]/85 hover:bg-[#EAB308]/30 text-amber-200 border border-[#EAB308]/50'
                      : isChineseNewYear
                      ? 'bg-[#260707]/85 hover:bg-[#DC2626]/30 text-amber-200 border border-amber-500/50'
                      : 'bg-[#1F1025]/85 hover:bg-[#FF6B00]/30 text-amber-100 border border-[#FF6B00]/50'
                  } text-xs font-display font-bold transition-colors select-none`}
                >
                  <span>{occ.emoji}</span>
                  <span>{occ.label}</span>
                </span>
              ))}
            </div>
          </div>

          {/* 3 Visual Lifestyle Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CRAVING_MOMENTS.map((moment) => (
              <div
                key={moment.title}
                className={`rounded-2xl bg-white/95 text-mani-950 p-5 border-2 ${currentTheme?.cardBorder || 'border-[#FF6B00]/60'} shadow-snack-card flex flex-col justify-between space-y-3`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full border ${moment.bgClass}`}>
                    {moment.tag}
                  </span>
                  <span className="text-2xl select-none">{moment.emoji}</span>
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-mani-950">
                    {moment.title}
                  </h3>
                  <p className="text-xs text-mani-700 font-medium leading-relaxed mt-1">
                    {moment.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Callout Strip */}
          <div className={`pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t ${currentTheme?.cardBorder || 'border-[#FF6B00]/40'} text-xs sm:text-sm`}>
            <div className="flex items-center gap-2 text-amber-200 font-bold text-center sm:text-left">
              <HeartHandshake style={{ color: currentTheme?.accentColor || '#FF6B00' }} className="w-5 h-5 shrink-0" />
              <span>Ready to taste why our mga suki can’t stop at just one tub?</span>
            </div>
            <a
              href="#flavors-menu"
              className={`px-5 py-2.5 rounded-2xl ${currentTheme?.primaryBtn || 'bg-[#FF6B00] hover:bg-amber-400 text-white border-2 border-amber-300 shadow-snack-sm'} font-display font-bold text-xs sm:text-sm active:translate-y-0.5 transition-all shrink-0`}
            >
              {currentTheme?.heroOrderBtnText || 'Build Your Tub Order Now 🎃🥜'}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
