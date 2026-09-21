import React, { useState, useEffect } from 'react';
import { Clock, Lock, CheckCircle2, Calendar, Truck } from 'lucide-react';

export default function OrderCutoffBanner({ cutoffInfo, onRefreshCutoff }) {
  const [remainingSec, setRemainingSec] = useState(() => {
    if (!cutoffInfo || !cutoffInfo.cutoffIso) return 0;
    const diff = Math.floor((new Date(cutoffInfo.cutoffIso).getTime() - Date.now()) / 1000);
    return Math.max(0, diff);
  });

  useEffect(() => {
    if (!cutoffInfo || !cutoffInfo.enabled || !cutoffInfo.cutoffIso) return;

    const targetTimestamp = new Date(cutoffInfo.cutoffIso).getTime();

    const updateRemaining = () => {
      const diff = Math.floor((targetTimestamp - Date.now()) / 1000);
      const remaining = Math.max(0, diff);
      setRemainingSec(remaining);

      // If reached 0 while page was open, notify parent to refresh cutoff state
      if (remaining === 0 && cutoffInfo.isOpen && onRefreshCutoff) {
        onRefreshCutoff();
      }
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  }, [cutoffInfo?.cutoffIso, cutoffInfo?.enabled, cutoffInfo?.isOpen]);

  // Format military time (e.g. 23:59, 17:00) to normal 12-hour format (e.g. 11:59 PM, 5:00 PM)
  const formatNormalTime = (timeStr) => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    if (isNaN(hours)) return timeStr;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  // Format date nicely (e.g. "Thursday, Sep 24")
  const formatDateNice = (dateStr) => {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(dt);
    } catch (e) {
      return dateStr;
    }
  };

  // Extract hours, minutes, seconds for digital display cards
  const hours = Math.floor(remainingSec / 3600);
  const minutes = Math.floor((remainingSec % 3600) / 60);
  const seconds = remainingSec % 60;
  const pad = (n) => String(n).padStart(2, '0');

  const isClosed = !cutoffInfo?.isOpen || (cutoffInfo?.enabled && remainingSec <= 0);

  // If cutoff timer is disabled (continuous orders open)
  if (cutoffInfo && !cutoffInfo.enabled) {
    return (
      <div 
        id="order-cutoff-section"
        className="w-full rounded-3xl p-5 sm:p-6 bg-white border border-stone-200/90 shadow-sm text-stone-900 animate-fade-in"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200/60 shadow-2xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Accepting Orders Now
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-stone-900">
              Orders Open Continuously
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 font-medium">
              Fresh artisanal batches prepared daily. Next delivery:{' '}
              <span className="font-bold text-stone-900">{cutoffInfo?.deliveryDay || 'Wednesday'}</span>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If orders are closed
  if (isClosed) {
    return (
      <div 
        id="order-cutoff-section"
        className="w-full rounded-3xl p-5 sm:p-6 bg-white border border-red-200/90 shadow-sm text-stone-900 animate-fade-in"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-200/60 shadow-2xs">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Orders Closed
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-stone-900">
              Order Cutoff Has Ended for Current Batch
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 font-medium">
              We are roasting and packing active orders for delivery on{' '}
              <span className="font-bold text-stone-900">{cutoffInfo?.deliveryDay || 'Wednesday'}</span>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Active Cutoff Timer with Clean Visual Hierarchy
  return (
    <div 
      id="order-cutoff-section"
      className="w-full rounded-3xl bg-white border border-stone-200/90 shadow-sm overflow-hidden animate-fade-in transition-all"
    >
      {/* 1. TOP: Status Indicator & Header */}
      <div className="px-6 py-4 bg-stone-50/70 border-b border-stone-100 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Accepting Orders Now
          </span>
          <span className="text-xs font-semibold text-stone-400 hidden sm:inline">
            • Current Batch
          </span>
        </div>

        <span className="text-xs text-stone-400 font-medium tracking-wide">
          Asia/Manila (PHT)
        </span>
      </div>

      {/* Main Card Body */}
      <div className="p-6 sm:p-7 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 lg:gap-8">
        
        {/* 2. MIDDLE: Streamlined Timeline (Cutoff & Delivery Exactly Once) */}
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight">
              Order Cutoff & Delivery Schedule
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              Place your order before the deadline for freshly roasted preparation and prompt dispatch.
            </p>
          </div>

          {/* Key-Value Timeline (No false affordances, clean typography) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Cutoff Deadline */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 border border-amber-200/60">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                  Orders Close
                </span>
                <span className="text-sm font-extrabold text-stone-900 block truncate">
                  {formatDateNice(cutoffInfo?.cutoffDate)}, {formatNormalTime(cutoffInfo?.cutoffTime)}
                </span>
              </div>
            </div>

            {/* Delivery Day */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 border border-blue-200/60">
                <Truck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                  Delivery Day
                </span>
                <span className="text-sm font-extrabold text-stone-900 block truncate">
                  {cutoffInfo?.deliveryDay || 'Wednesday'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. BOTTOM / RIGHT: Primary Urgency Countdown Timer */}
        <div className="lg:border-l lg:border-stone-100 lg:pl-8 flex flex-col items-center lg:items-end justify-center shrink-0 pt-4 lg:pt-0 border-t border-stone-100 lg:border-t-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            Time Remaining
          </span>

          {/* High-Contrast Focal Point Digits */}
          <div className="flex items-center gap-2">
            {/* Hours */}
            <div className="flex flex-col items-center">
              <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-stone-900 text-amber-300 font-mono font-black text-2xl sm:text-3xl flex items-center justify-center shadow-xs">
                {pad(hours)}
              </div>
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mt-1.5">
                Hours
              </span>
            </div>

            <span className="text-xl font-bold text-stone-300 pb-5">:</span>

            {/* Minutes */}
            <div className="flex flex-col items-center">
              <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-stone-900 text-amber-300 font-mono font-black text-2xl sm:text-3xl flex items-center justify-center shadow-xs">
                {pad(minutes)}
              </div>
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mt-1.5">
                Mins
              </span>
            </div>

            <span className="text-xl font-bold text-stone-300 pb-5">:</span>

            {/* Seconds */}
            <div className="flex flex-col items-center">
              <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-amber-600 text-white font-mono font-black text-2xl sm:text-3xl flex items-center justify-center shadow-xs">
                {pad(seconds)}
              </div>
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mt-1.5">
                Secs
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

