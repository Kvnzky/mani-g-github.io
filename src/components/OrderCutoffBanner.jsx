import React, { useState, useEffect } from 'react';
import { Clock, Lock, CheckCircle2, Truck } from 'lucide-react';
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
        className="w-full rounded-3xl p-5 sm:p-6 bg-white border-2 border-red-600 shadow-snack-sm text-stone-900 animate-fade-in"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center shrink-0 border-2 border-red-600 shadow-2xs">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1 flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-red-100 text-red-800 border border-red-300">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              Orders Closed
            </div>
            <h3 className="font-display text-base sm:text-lg font-extrabold text-stone-900">
              Orders are currently closed. Please check back soon.
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 font-medium">
              {isManuallyClosed
                ? 'Our order form is temporarily closed for new submissions. Please check back soon!'
                : `Order cutoff has ended for the current batch. We are preparing active orders for delivery on ${cutoffInfo?.deliveryDay || 'Wednesday'}.`}
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
        className="w-full rounded-3xl p-5 sm:p-6 bg-white border-2 border-mani-950 shadow-snack-sm text-stone-900 animate-fade-in"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border-2 border-mani-950 shadow-2xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1 flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Accepting Orders Now
            </div>
            <h3 className="font-display text-base sm:text-lg font-extrabold text-mani-950">
              Orders Open Continuously
            </h3>
            <p className="text-xs sm:text-sm text-mani-700 font-medium">
              Fresh artisanal batches prepared daily. Next delivery:{' '}
              <span className="font-black text-mani-950">{cutoffInfo?.deliveryDay || 'Wednesday'}</span>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Active Cutoff Timer with Snack-Brand Visual Hierarchy
  return (
    <div 
      id="order-cutoff-section"
      className="w-full rounded-3xl bg-white border-2 border-mani-950 shadow-snack overflow-hidden animate-fade-in transition-all"
    >
      {/* 1. TOP: Status Indicator & Header */}
      <div className="px-5 sm:px-6 py-3.5 bg-gradient-to-r from-amber-100 via-[#FFF9EB] to-amber-100 border-b-2 border-mani-950/10 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-950 border-2 border-mani-950 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Accepting Orders Now
          </span>
          <span className="text-xs font-extrabold text-mani-800 hidden sm:inline">
            • Fresh Roast Batch Open
          </span>
        </div>

        <span className="text-[11px] text-mani-600 font-extrabold uppercase tracking-wider bg-white/80 px-2.5 py-0.5 rounded-full border border-amber-300">
          🇵🇭 Asia/Manila (PHT)
        </span>
      </div>

      {/* Main Card Body */}
      <div className="p-5 sm:p-7 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 lg:gap-8">
        
        {/* 2. MIDDLE: Streamlined Timeline (Cutoff & Delivery) */}
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="font-display text-lg sm:text-xl font-extrabold text-mani-950 tracking-tight">
              Order Cutoff &amp; Fresh Roast Schedule
            </h3>
            <p className="text-xs sm:text-sm text-mani-600 font-medium mt-0.5">
              Lock in your tubs before the timer hits zero so we can roast your batch fresh and crunchy!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {/* Cutoff Deadline */}
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#FDF9F0] border border-amber-200/90">
              <div className="w-10 h-10 rounded-xl bg-amber-300 text-mani-950 flex items-center justify-center shrink-0 border-2 border-mani-950 shadow-2xs">
                <Clock className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-mani-500 block">
                  Batch Cutoff
                </span>
                <span className="font-display text-sm font-black text-mani-950 block truncate">
                  {formatDateNice(cutoffInfo?.cutoffDate)}, {formatNormalTime(cutoffInfo?.cutoffTime)}
                </span>
              </div>
            </div>

            {/* Delivery Day */}
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#FDF9F0] border border-amber-200/90">
              <div className="w-10 h-10 rounded-xl bg-orange-200 text-mani-950 flex items-center justify-center shrink-0 border-2 border-mani-950 shadow-2xs">
                <Truck className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-mani-500 block">
                  Scheduled Delivery
                </span>
                <span className="font-display text-sm font-black text-mani-950 block truncate">
                  {cutoffInfo?.deliveryDay || 'Wednesday'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. BOTTOM / RIGHT: Primary Urgency Countdown Timer */}
        <div className="lg:border-l-2 lg:border-dashed lg:border-amber-300 lg:pl-8 flex flex-col items-center lg:items-end justify-center shrink-0 pt-4 lg:pt-0 border-t-2 border-dashed border-amber-200 lg:border-t-0">
          <span className="text-[11px] font-black uppercase tracking-wider text-mani-800 mb-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            Batch Closes In
          </span>

          {/* High-Contrast Focal Point Digits */}
          <div className="flex items-center gap-2">
            {/* Hours */}
            <div className="flex flex-col items-center">
              <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-mani-950 text-amber-300 border-2 border-mani-950 font-mono font-black text-2xl sm:text-3xl flex items-center justify-center shadow-snack-sm">
                {pad(hours)}
              </div>
              <span className="text-[10px] font-extrabold text-mani-600 uppercase tracking-widest mt-1.5">
                Hours
              </span>
            </div>

            <span className="text-xl font-black text-mani-400 pb-5">:</span>

            {/* Minutes */}
            <div className="flex flex-col items-center">
              <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-mani-950 text-amber-300 border-2 border-mani-950 font-mono font-black text-2xl sm:text-3xl flex items-center justify-center shadow-snack-sm">
                {pad(minutes)}
              </div>
              <span className="text-[10px] font-extrabold text-mani-600 uppercase tracking-widest mt-1.5">
                Mins
              </span>
            </div>

            <span className="text-xl font-black text-mani-400 pb-5">:</span>

            {/* Seconds */}
            <div className="flex flex-col items-center">
              <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-amber-400 text-mani-950 border-2 border-mani-950 font-mono font-black text-2xl sm:text-3xl flex items-center justify-center shadow-snack-sm">
                {pad(seconds)}
              </div>
              <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-widest mt-1.5">
                Secs
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
