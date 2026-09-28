import React, { useState, useEffect } from 'react';
import { Clock, Lock, CheckCircle2, Calendar, Truck } from 'lucide-react';
import {
  getManilaCutoffTimestampMs,
  formatManilaDateNice,
  formatManilaTime12
} from '../utils/phtTime';

export default function OrderCutoffBanner({ cutoffInfo, onRefreshCutoff }) {
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

    const updateRemaining = () => {
      const diff = Math.floor((targetTimestamp - Date.now()) / 1000);
      const remaining = Math.max(0, diff);
      setRemainingSec(remaining);

      // If reached 0 while page was open and cutoff timer is enabled, notify parent to refresh cutoff state
      if (cutoffInfo.enabled && remaining === 0 && cutoffInfo.isOpen && onRefreshCutoff) {
        onRefreshCutoff();
      }
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  }, [cutoffInfo?.cutoffDate, cutoffInfo?.cutoffTime, cutoffInfo?.enabled, cutoffInfo?.isOpen]);

  // Format military time (e.g. 23:59, 17:00) to normal 12-hour format in PHT
  const formatNormalTime = (timeStr) => formatManilaTime12(timeStr);

  // Format date nicely in Asia/Manila timezone
  const formatDateNice = (dateStr) => formatManilaDateNice(dateStr);

  // Extract hours, minutes, seconds for digital display cards
  const hours = Math.floor(remainingSec / 3600);
  const minutes = Math.floor((remainingSec % 3600) / 60);
  const seconds = remainingSec % 60;
  const pad = (n) => String(n).padStart(2, '0');

  const isManuallyClosed = cutoffInfo?.manualFormOpen === false;
  const isTimerClosed = Boolean(cutoffInfo?.enabled && remainingSec <= 0);
  const isClosed = isManuallyClosed || cutoffInfo?.isOpen === false || isTimerClosed;

  // 1. If orders are closed (either manually via Admin toggle or via Cutoff Timer)
  if (isClosed) {
    return (
      <div 
        id="order-cutoff-section"
        data-testid="orders-closed-banner"
        className="w-full rounded-3xl p-5 sm:p-6 bg-white border-2 border-red-300 shadow-snack-card text-mani-950 animate-fade-in"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 border-2 border-red-300">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1 flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-extrabold bg-red-100 text-red-800 border border-red-300">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Orders Closed for Current Batch
            </div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-mani-950">
              Orders are currently closed. Please check back soon.
            </h3>
            <p className="text-xs sm:text-sm text-mani-600 font-medium">
              {isManuallyClosed
                ? 'Our kitchen is currently prepping batches and temporarily closed for new submissions. Check back soon!'
                : `Order cutoff has ended for the current roast batch. We are packing active orders for delivery on ${cutoffInfo?.deliveryDay || 'Wednesday'}.`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. If cutoff timer is disabled and manual form status is Open (continuous orders open)
  if (cutoffInfo && !cutoffInfo.enabled) {
    return (
      <div 
        id="order-cutoff-section"
        className="w-full rounded-3xl p-4 sm:p-5 bg-gradient-to-r from-emerald-50/90 via-white to-amber-50/70 border-2 border-mani-900/15 shadow-snack-card text-mani-950 animate-fade-in"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 border-2 border-mani-900 shadow-snack-sm">
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Kitchen Open • Fresh Batch Roasting
              </div>
              <h3 className="font-display text-base sm:text-lg font-bold text-mani-950">
                Accepting Fresh Tub Orders Now! 🥜
              </h3>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-100/90 border border-amber-300 text-xs font-extrabold text-mani-900">
            <Truck className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Next Delivery: <strong className="text-mani-950 underline decoration-amber-500">{cutoffInfo?.deliveryDay || 'Wednesday'}</strong></span>
          </div>
        </div>
      </div>
    );
  }

  // Active Cutoff Timer with Snack-Brand Visual Hierarchy
  return (
    <div 
      id="order-cutoff-section"
      className="w-full rounded-3xl bg-white border-2 border-mani-900/20 shadow-snack-card overflow-hidden animate-fade-in transition-all"
    >
      {/* 1. TOP: Status Indicator & Header */}
      <div className="px-5 sm:px-6 py-3 bg-gradient-to-r from-amber-100/90 via-cream-warm to-amber-50 border-b-2 border-mani-900/10 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500 text-white border border-mani-900/20 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Accepting Orders Now
          </span>
          <span className="text-xs font-extrabold text-mani-800 hidden sm:inline">
            🥜 Fresh Small-Batch Roast
          </span>
        </div>

        <span className="text-[11px] text-mani-600 font-bold tracking-wide bg-white/80 px-2.5 py-0.5 rounded-full border border-mani-200">
          🇵🇭 PH Time (Asia/Manila)
        </span>
      </div>

      {/* Main Card Body */}
      <div className="p-5 sm:p-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5 lg:gap-8">
        
        {/* 2. MIDDLE: Streamlined Timeline */}
        <div className="flex-1 space-y-3.5">
          <div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-mani-950 tracking-tight">
              Batch Cutoff & Delivery Schedule
            </h3>
            <p className="text-xs sm:text-sm text-mani-600 font-medium mt-0.5">
              Lock in your tubs before the timer hits zero so we can roast your mani fresh & crunchy!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
            {/* Cutoff Deadline */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-cream-warm/80 border border-mani-200">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-mani-950 flex items-center justify-center shrink-0 border-2 border-mani-900 shadow-snack-sm">
                <Clock className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-mani-600 block">
                  Order Cutoff
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-mani-950 block truncate">
                  {formatDateNice(cutoffInfo?.cutoffDate)}, {formatNormalTime(cutoffInfo?.cutoffTime)}
                </span>
              </div>
            </div>

            {/* Delivery Day */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-cream-warm/80 border border-mani-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-400 text-mani-950 flex items-center justify-center shrink-0 border-2 border-mani-900 shadow-snack-sm">
                <Truck className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-mani-600 block">
                  Scheduled Delivery
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-mani-950 block truncate">
                  {cutoffInfo?.deliveryDay || 'Wednesday'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. BOTTOM / RIGHT: Primary Urgency Countdown Timer */}
        <div className="lg:border-l-2 lg:border-dashed lg:border-mani-200 lg:pl-7 flex flex-col items-center lg:items-end justify-center shrink-0 pt-4 lg:pt-0 border-t border-mani-100 lg:border-t-0">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-mani-700 mb-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            Time Left to Order
          </span>

          {/* High-Contrast Focal Point Digits */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Hours */}
            <div className="flex flex-col items-center">
              <div className="w-13 sm:w-15 h-13 sm:h-15 px-3 rounded-2xl bg-mani-900 text-amber-300 font-display font-bold text-2xl sm:text-3xl flex items-center justify-center border-2 border-mani-950 shadow-snack-sm">
                {pad(hours)}
              </div>
              <span className="text-[10px] font-extrabold text-mani-600 uppercase tracking-widest mt-1">
                Hrs
              </span>
            </div>

            <span className="text-xl font-black text-mani-400 pb-4">:</span>

            {/* Minutes */}
            <div className="flex flex-col items-center">
              <div className="w-13 sm:w-15 h-13 sm:h-15 px-3 rounded-2xl bg-mani-900 text-amber-300 font-display font-bold text-2xl sm:text-3xl flex items-center justify-center border-2 border-mani-950 shadow-snack-sm">
                {pad(minutes)}
              </div>
              <span className="text-[10px] font-extrabold text-mani-600 uppercase tracking-widest mt-1">
                Mins
              </span>
            </div>

            <span className="text-xl font-black text-mani-400 pb-4">:</span>

            {/* Seconds */}
            <div className="flex flex-col items-center">
              <div className="w-13 sm:w-15 h-13 sm:h-15 px-3 rounded-2xl bg-amber-400 text-mani-950 font-display font-bold text-2xl sm:text-3xl flex items-center justify-center border-2 border-mani-900 shadow-snack-sm">
                {pad(seconds)}
              </div>
              <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-widest mt-1">
                Secs
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

