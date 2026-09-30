import React from 'react';
import { Sparkles, Flame, HeartHandshake, Plus, ArrowUpRight } from 'lucide-react';
import { formatPHP } from '../config/products';
import { PlayfulSkeletonSvg, PlayfulMummySvg } from './HalloweenAtmosphere';

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
    title: 'Walang Iwanan Six-Pack',
    subtitle: '1 Salted + 1 Spicy + 1 BBQ + 1 Sour Cream + 1 Cheese + 1 Bawang Only',
    description: 'All six flavors, zero arguments. Walang maiiwan at walang mag-aaway sa last handful. The full suki lineup for handaan, reunion, or one very long weekend.',
    items: [
      { id: 'salted', qty: 1, label: '🧂 Salted × 1' },
      { id: 'spicy', qty: 1, label: '🌶️ Spicy × 1' },
      { id: 'bbq', qty: 1, label: '🍖 BBQ × 1' },
      { id: 'sour-cream', qty: 1, label: '🥛 Sour Cream × 1' },
      { id: 'cheese', qty: 1, label: '🧀 Cheese × 1' },
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
    title: 'Your Desk’s Best Companion',
    description: 'Beat the 3PM antok at the office or power through late-night study sessions with protein-packed roasted mani and real garlic.',
    bgClass: 'bg-orange-100/75 border-[#FF6B00]/60'
  },
  {
    emoji: '🚗',
    tag: 'Road Trips & Barkada',
    title: 'Made to Wander With You',
    description: 'Cup-holder friendly tubs that travel from expressway road trips to spontaneous barkada Halloween tambay nights.',
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

export default function BrandStoryAndSuki({ products = [], onAddCombo, isOrdersClosed }) {
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
      const price = prod ? (prod.price || 50) : (item.id === 'bawang-only' ? 60 : 50);
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
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#FF6B00] text-white border border-amber-300 -rotate-1 mb-2 shadow-2xs">
              <Flame className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
              <span>🎃 Mga Suki Crowd Favorites</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight drop-shadow-xs">
              Not Sure Which Tub to Pick? Try a Suki Combo! 🥜
            </h2>
            <p className="text-xs sm:text-sm text-amber-100/90 font-medium mt-1 max-w-2xl">
              Popular flavor combinations inspired by how our mga suki pair their tubs. Add a bundle to your basket in one tap!
            </p>
          </div>
          <a
            href="#flavors-menu"
            className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-300 hover:text-white bg-[#2B1B30] hover:bg-[#FF6B00] px-3.5 py-2 rounded-xl border-2 border-[#FF6B00] transition-all self-start sm:self-auto"
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
                className="rounded-3xl p-5 sm:p-6 bg-gradient-to-b from-amber-50/95 via-white to-orange-50/60 border-2 border-[#FF6B00]/60 hover:border-amber-400 shadow-pumpkin-card hover:shadow-pumpkin-card-hover hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${combo.badgeClass}`}>
                      {combo.badge}
                    </span>
                    <span className="font-display text-lg font-bold text-amber-300 bg-[#1F1025] px-3.5 py-0.5 rounded-xl border border-[#FF6B00] shadow-2xs">
                      {formatPHP(comboPrice)}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display text-xl font-bold text-mani-950 leading-snug">
                      {combo.title}
                    </h3>
                    <p className="text-xs font-extrabold text-[#FF6B00] mt-0.5">
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
                        className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100/80 text-mani-950 border border-[#FF6B00]/40 shadow-2xs"
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
                          : 'bg-[#FF6B00] hover:bg-amber-400 text-white hover:text-[#1F1025] border-2 border-amber-300 shadow-snack-sm active:translate-y-0.5 cursor-pointer'
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

      {/* SECTION 2: BRAND STORY ("KWENTO NG MANI WANDERING") */}
      <section
        id="brand-story"
        className="rounded-3xl bg-gradient-to-br from-[#2B1B30] via-[#1F1025] to-[#2B1B30] text-cream p-6 sm:p-8 lg:p-10 border-2 border-[#FF6B00] shadow-pumpkin-card relative overflow-hidden scroll-mt-24"
      >
        {/* Subtle decorative pumpkin & golden glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#FF6B00]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-7">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-[#FF6B00] text-white border border-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>Our Snack Story • Kwento ng Mani Wandering</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
                Street Snack Culture Meets Spooky Season Cravings. 🎃🥜
              </h2>
              <p className="text-xs sm:text-sm text-amber-100/90 font-medium leading-relaxed">
                Every Filipino grew up loving the warm, garlicky aroma of freshly cooked kanto mani. We started <strong className="text-amber-300">Mani Wandering</strong> with one simple mission: take that nostalgic, ultra-crunchy Pinoy peanut experience, toss it in bold flavors, load it with golden crispy bawang, and seal it in handy tubs ready to wander wherever life takes you.
              </p>
            </div>

            {/* Mascot + Skeleton & Mummy Badge Card */}
            <div className="flex items-center gap-3.5 bg-[#1F1025]/90 backdrop-blur-xs p-4 rounded-3xl border-2 border-[#FF6B00]/70 shadow-pumpkin-tub shrink-0 self-start lg:self-center">
              <PlayfulSkeletonSvg className="w-10 h-14 hidden sm:block shrink-0 animate-float-slow" />
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-[#FF6B00] overflow-hidden shrink-0 shadow-md">
                <video
                  src="./images/mani-halloween-video.mp4"
                  poster="./images/logo.png"
                  autoPlay
                  loop
                  muted
                  playsInline
                  aria-label="Mani Wandering Mascot"
                  className="w-full h-full object-cover scale-105 pointer-events-none"
                />
              </div>
              <div>
                <div className="font-display text-base sm:text-lg font-bold text-amber-300">
                  “Trick or Treat Crunch!”
                </div>
                <p className="text-xs text-amber-100/85 font-medium max-w-[200px] mt-0.5">
                  7 signature flavors crafted for horror movie nights, merienda, pulutan &amp; road trips.
                </p>
              </div>
              <PlayfulMummySvg className="w-10 h-14 hidden sm:block shrink-0 animate-float-reverse" />
            </div>
          </div>

          {/* Relatable Filipino Craving Occasions Pills */}
          <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-wider text-amber-300">
              Made for Every Spooky &amp; Everyday Pinoy Craving Moment:
            </p>
            <div className="flex flex-wrap gap-2">
              {CRAVING_OCCASIONS.map((occ) => (
                <span
                  key={occ.label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#1F1025]/85 hover:bg-[#FF6B00]/30 text-amber-100 border border-[#FF6B00]/50 text-xs font-display font-bold transition-colors select-none"
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
                className="rounded-2xl bg-white/95 text-mani-950 p-5 border-2 border-[#FF6B00]/60 shadow-pumpkin-card flex flex-col justify-between space-y-3"
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
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#FF6B00]/40 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-amber-200 font-bold text-center sm:text-left">
              <HeartHandshake className="w-5 h-5 text-[#FF6B00] shrink-0" />
              <span>Ready to taste why our mga suki can’t stop at just one tub?</span>
            </div>
            <a
              href="#flavors-menu"
              className="px-5 py-2.5 rounded-2xl bg-[#FF6B00] hover:bg-amber-400 text-white hover:text-[#1F1025] font-display font-bold text-xs sm:text-sm border-2 border-amber-300 shadow-pumpkin-tub active:translate-y-0.5 transition-all shrink-0"
            >
              Build Your Tub Order Now 🎃🥜
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
