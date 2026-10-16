import React from 'react';
import { ShoppingBag, MapPin, Truck, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { getTheme } from '../config/themes';

export default function HowToOrderSection({ themeId = 'halloween', cutoffInfo }) {
  const currentTheme = getTheme(themeId);
  const deliveryDay = cutoffInfo?.deliveryDay || 'Wednesday';

  const steps = [
    {
      num: '1',
      title: 'Pick Your Flavors',
      icon: ShoppingBag,
      desc: 'Browse our 9 signature flavors. Adjust quantities with simple (+) and (-) buttons or grab our Suki Combos.'
    },
    {
      num: '2',
      title: 'Review Your Tubs',
      icon: Sparkles,
      desc: 'See your real-time total, tub count, and flavor subtotals. Update or change quantities anytime before checkout.'
    },
    {
      num: '3',
      title: 'Enter Delivery Address',
      icon: MapPin,
      desc: 'Fill in your name and delivery address. Choose Cash on Delivery (COD), GCash, or Maribank payment.'
    },
    {
      num: '4',
      title: 'Fresh Weekly Delivery',
      icon: Truck,
      desc: `Orders are roasted fresh and dispatched every ${deliveryDay}. Sealed in reusable crunch-lock tubs.`
    }
  ];

  return (
    <section id="how-to-order" className="scroll-mt-24 space-y-4">
      <div className={`p-5 sm:p-6 rounded-3xl border-2 transition-all ${
        themeId === 'default'
          ? 'bg-white border-[#D97706]/70 shadow-warm-md text-mani-950'
          : `${currentTheme.cardBg} ${currentTheme.cardBorder} shadow-warm-lg`
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-dashed border-amber-300/40 pb-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${currentTheme.badgeClass}`}>
                Ordering Guide
              </span>
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Fast, Simple & Direct
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
              Paano Mag-Order sa Mani Wandering?
            </h2>
            <p className="text-xs sm:text-sm opacity-85 mt-0.5">
              4 easy steps para sa iyong bagong lutong mani craving!
            </p>
          </div>

          <a
            href="#flavors-menu"
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all self-start sm:self-center cursor-pointer ${currentTheme.primaryBtn}`}
          >
            <span>Start Your Order</span>
            <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.num}
                className="rounded-2xl p-4 bg-black/20 border border-amber-300/30 flex flex-col justify-between space-y-2 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-full bg-amber-400 text-stone-950 font-black text-sm flex items-center justify-center shadow-xs">
                    {s.num}
                  </span>
                  <Icon className="w-5 h-5 text-amber-300 opacity-80" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-amber-200">
                    {s.title}
                  </h3>
                  <p className="text-xs opacity-80 mt-1 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
