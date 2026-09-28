import React from 'react';
import { Sparkles, Flame, Users, HeartHandshake, Plus, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { formatPHP } from '../config/products';

const SUKI_COMBOS = [
  {
    id: 'suki-duo',
    badge: 'MOST REORDERED',
    badgeClass: 'bg-amber-400 text-mani-950',
    title: 'The "Bitin ang Isa" Duo',
    subtitle: '1 Salted + 1 Spicy Tub',
    description: 'Our #1 repeat suki order! Classic rock-salt & bawang crunch paired with our bestselling fiery chili-garlic mani.',
    items: [
      { id: 'salted', qty: 1, label: '🧂 Salted × 1' },
      { id: 'spicy', qty: 1, label: '🌶️ Spicy × 1' }
    ],
    cardBg: 'from-amber-50 via-white to-orange-50/40'
  },
  {
    id: 'garlic-overload',
    badge: 'GARLIC LOVERS PICK',
    badgeClass: 'bg-rose-600 text-white',
    title: 'Bawang & Spice Overload',
    subtitle: '1 Spicy + 1 BBQ + 1 Bawang Only',
    description: 'Made for serious garlic fans. Papak straight from the tub or sprinkle the extra crispy golden bawang over rice & pancit!',
    items: [
      { id: 'spicy', qty: 1, label: '🌶️ Spicy × 1' },
      { id: 'bbq', qty: 1, label: '🍖 BBQ × 1' },
      { id: 'bawang-only', qty: 1, label: '🧄 Bawang Only × 1' }
    ],
    cardBg: 'from-rose-50/60 via-white to-amber-50/40'
  },
  {
    id: 'barkada-stash',
    badge: 'BARKADA TAMBAY',
    badgeClass: 'bg-emerald-600 text-white',
    title: 'Barkada Movie Night Stash',
    subtitle: 'Salted • Cheese • Sour Cream • BBQ',
    description: 'Four crowd-pleasing flavors so nobody fights over the last handful. Built for Netflix marathons and kwentuhan.',
    items: [
      { id: 'salted', qty: 1, label: '🧂 Salted × 1' },
      { id: 'cheese', qty: 1, label: '🧀 Cheese × 1' },
      { id: 'sour-cream', qty: 1, label: '🥛 Sour Cream × 1' },
      { id: 'bbq', qty: 1, label: '🍖 BBQ × 1' }
    ],
    cardBg: 'from-emerald-50/60 via-white to-yellow-50/40'
  }
];

const CRAVING_MOMENTS = [
  {
    emoji: '🎬',
    tag: 'Merienda & Movie Nights',
    title: 'Pop the Lid, Start the Show',
    description: 'No messy plastic bags spilling on the couch. Resealable tubs keep every peanut crunchy from episode one to the season finale.',
    bgClass: 'bg-amber-100/70 border-amber-300'
  },
  {
    emoji: '💻',
    tag: 'Work & Study Fuel',
    title: 'Your Desk’s Best Companion',
    description: 'Beat the 3PM antok at the office or power through late-night study sessions with protein-packed roasted mani and real garlic.',
    bgClass: 'bg-orange-100/60 border-orange-300'
  },
  {
    emoji: '🚗',
    tag: 'Road Trips & Barkada',
    title: 'Made to Wander With You',
    description: 'Cup-holder friendly tubs that travel from expressway road trips to spontaneous barkada tambay nights.',
    bgClass: 'bg-emerald-100/60 border-emerald-300'
  }
];

const CRAVING_OCCASIONS = [
  { emoji: '☕', label: 'Merienda' },
  { emoji: '🎬', label: 'Movie Nights' },
  { emoji: '💻', label: 'Office Snacks' },
  { emoji: '🎒', label: 'School Snacks' },
  { emoji: '🚗', label: 'Road Trips' },
  { emoji: '🤝', label: 'Sharing with Friends' },
  { emoji: '🌙', label: 'Random Cravings' }
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-300 text-mani-950 border border-mani-900/20 -rotate-1 mb-2">
              <Flame className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
              <span>Mga Suki Crowd Favorites</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-mani-950 tracking-tight">
              Not Sure Which Tub to Pick? Try a Suki Combo! 🥜
            </h2>
            <p className="text-xs sm:text-sm text-mani-600 font-medium mt-1 max-w-2xl">
              Popular flavor combinations inspired by how our mga suki pair their tubs. Add a bundle to your basket in one tap!
            </p>
          </div>
          <a
            href="#flavors-menu"
            className="inline-flex items-center gap-1 text-xs font-extrabold text-mani-800 hover:text-mani-950 bg-white px-3.5 py-2 rounded-xl border-2 border-mani-900/15 hover:border-mani-900 transition-all self-start sm:self-auto"
          >
            <span>Browse Individual Tubs</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* 3 Combo Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {SUKI_COMBOS.map((combo) => {
            const comboPrice = computeComboPrice(combo.items);
            const available = isComboAvailable(combo.items);
            const totalTubs = combo.items.reduce((s, i) => s + i.qty, 0);

            return (
              <div
                key={combo.id}
                className={`rounded-3xl p-5 sm:p-6 bg-gradient-to-br ${combo.cardBg} border-2 border-mani-900/20 hover:border-mani-900 shadow-snack-card hover:shadow-snack-card-hover hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-mani-900/20 -rotate-1 ${combo.badgeClass}`}>
                      {combo.badge}
                    </span>
                    <span className="font-display text-lg font-bold text-mani-950 bg-white px-3 py-0.5 rounded-xl border border-mani-200 shadow-2xs">
                      {formatPHP(comboPrice)}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display text-xl font-bold text-mani-950 leading-snug">
                      {combo.title}
                    </h3>
                    <p className="text-xs font-extrabold text-amber-800 mt-0.5">
                      {combo.subtitle} ({totalTubs} tubs)
                    </p>
                  </div>

                  <p className="text-xs sm:text-[13px] text-mani-700 font-medium leading-relaxed">
                    {combo.description}
                  </p>

                  {/* Flavor Pills inside Combo */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {combo.items.map((item) => (
                      <span
                        key={item.id}
                        className="text-[11px] font-extrabold px-2.5 py-1 rounded-xl bg-white text-mani-900 border border-mani-200 shadow-2xs"
                      >
                        {item.label}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-mani-200/70">
                  <button
                    type="button"
                    disabled={!available || isOrdersClosed}
                    onClick={() => onAddCombo && onAddCombo(combo)}
                    className={`w-full py-2.5 px-4 rounded-2xl font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
                      !available || isOrdersClosed
                        ? 'bg-mani-100 text-mani-400 border border-mani-200 cursor-not-allowed'
                        : 'bg-mani-900 hover:bg-mani-800 text-amber-300 border-2 border-mani-950 shadow-snack-sm active:translate-y-0.5 cursor-pointer'
                    }`}
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
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
            );
          })}
        </div>

        {/* Mga Suki Quality Pillars + Authentic Suki Leaderboard & Feedback Slot */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">
          {/* Left 8 cols: 4 Snack Quality Pillars */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-white border-2 border-mani-900/15 flex items-start gap-3 shadow-warm">
              <span className="text-2xl shrink-0">🧄</span>
              <div>
                <h4 className="font-display font-bold text-sm text-mani-950">Tunay na Bawang Chips</h4>
                <p className="text-[11px] text-mani-600 font-medium mt-0.5">
                  Generously topped with crispy golden garlic slices in every tub.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border-2 border-mani-900/15 flex items-start gap-3 shadow-warm">
              <span className="text-2xl shrink-0">🔥</span>
              <div>
                <h4 className="font-display font-bold text-sm text-mani-950">Small-Batch Lutong</h4>
                <p className="text-[11px] text-mani-600 font-medium mt-0.5">
                  Cooked in small batches so you never get stale or soggy peanuts.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border-2 border-mani-900/15 flex items-start gap-3 shadow-warm">
              <span className="text-2xl shrink-0">🫙</span>
              <div>
                <h4 className="font-display font-bold text-sm text-mani-950">Crunch-Lock Tubs</h4>
                <p className="text-[11px] text-mani-600 font-medium mt-0.5">
                  Packed in reusable, resealable tubs that keep the crunch alive for days.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border-2 border-mani-900/15 flex items-start gap-3 shadow-warm">
              <span className="text-2xl shrink-0">🇵🇭</span>
              <div>
                <h4 className="font-display font-bold text-sm text-mani-950">Sulit Presyong Suki</h4>
                <p className="text-[11px] text-mani-600 font-medium mt-0.5">
                  Premium snack experience at street-friendly prices (₱50–₱60/tub).
                </p>
              </div>
            </div>
          </div>

          {/* Right 4 cols: Authentic Suki Feedback / Best-Seller Spotlight (Zero Fake Testimonials) */}
          <div className="lg:col-span-4 rounded-2xl bg-amber-100/80 border-2 border-mani-900/20 p-4 sm:p-5 flex flex-col justify-between shadow-warm">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-mani-900 text-amber-300">
                  <Users className="w-3 h-3" /> Mga Suki Corner
                </span>
                <span className="font-display text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-lg border border-rose-300 rotate-2">
                  CRUNCH! 🥜
                </span>
              </div>
              <h3 className="font-display text-base sm:text-lg font-bold text-mani-950">
                Top Picks & Suki Feedback
              </h3>
              {VERIFIED_SUKI_REVIEWS.length > 0 ? (
                <div className="space-y-2">
                  {VERIFIED_SUKI_REVIEWS.map((rev, idx) => (
                    <blockquote key={idx} className="p-2.5 rounded-xl bg-white border border-mani-200 text-xs text-mani-800">
                      “{rev.comment}” — <strong className="text-mani-950">{rev.name}</strong>
                    </blockquote>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5 text-[11px] font-extrabold">
                    <span className="px-2.5 py-1 rounded-xl bg-white text-mani-950 border border-mani-300">
                      🥇 #1 Best Seller: 🌶️ Spicy
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-white text-mani-950 border border-mani-300">
                      🥈 Classic Pick: 🧂 Salted
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-white text-mani-950 border border-mani-300">
                      🧄 Cult Fave: Bawang Only
                    </span>
                  </div>
                  <p className="text-[11px] text-mani-700 font-medium leading-relaxed">
                    Already tried a tub? Send us your honest feedback or tag <strong className="text-mani-950">Mani Wandering</strong> on Messenger/Facebook to be featured on our Suki Wall!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: BRAND STORY ("KWENTO NG MANI WANDERING") */}
      <section
        id="brand-story"
        className="rounded-3xl bg-gradient-to-br from-mani-900 via-mani-900 to-mani-950 text-cream p-6 sm:p-8 lg:p-10 border-2 border-mani-950 shadow-snack-card relative overflow-hidden scroll-mt-24"
      >
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-7">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-400 text-mani-950">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Our Snack Story • Kwento ng Mani Wandering</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
                Street Snack Culture Meets Your Everyday Cravings. 🥜✨
              </h2>
              <p className="text-xs sm:text-sm text-amber-100/90 font-medium leading-relaxed">
                Every Filipino grew up loving the warm, garlicky aroma of freshly cooked kanto mani. We started <strong className="text-amber-300">Mani Wandering</strong> with one simple mission: take that nostalgic, ultra-crunchy Pinoy peanut experience, toss it in bold flavors, load it with golden crispy bawang, and seal it in handy tubs ready to wander wherever life takes you.
              </p>
            </div>

            {/* Mascot Badge Card */}
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xs p-4 rounded-3xl border border-white/15 shrink-0 self-start lg:self-center">
              <img
                src="./images/logo.png"
                alt="Mani Wandering Mascot"
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md animate-float-slow"
              />
              <div>
                <div className="font-display text-base sm:text-lg font-bold text-amber-300">
                  “Crispy na, Crunchy pa!”
                </div>
                <p className="text-xs text-amber-100/80 font-medium max-w-[200px] mt-0.5">
                  7 signature flavors crafted for merienda, pulutan, study breaks & road trips.
                </p>
              </div>
            </div>
          </div>

          {/* 7 Relatable Filipino Craving Occasions Pills */}
          <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-wider text-amber-300/90">
              Made for Every Pinoy Craving Moment:
            </p>
            <div className="flex flex-wrap gap-2">
              {CRAVING_OCCASIONS.map((occ) => (
                <span
                  key={occ.label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/15 text-xs font-display font-bold transition-colors select-none"
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
                className="rounded-2xl bg-white/95 text-mani-950 p-5 border-2 border-amber-300/40 shadow-md flex flex-col justify-between space-y-3"
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
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/15 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-amber-200 font-bold text-center sm:text-left">
              <HeartHandshake className="w-5 h-5 text-amber-400 shrink-0" />
              <span>Ready to taste why our mga suki can’t stop at just one tub?</span>
            </div>
            <a
              href="#flavors-menu"
              className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-mani-950 font-display font-bold text-xs sm:text-sm border-2 border-mani-950 shadow-snack-sm active:translate-y-0.5 transition-all shrink-0"
            >
              Build Your Tub Order Now 🥜
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
