import React, { useState, useEffect } from 'react';
import { Clock, Lock, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react';

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

  // Format date nicely (e.g. "Saturday, Sep 19, 2026")
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
        className="w-full rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-emerald-500/10 via-emerald-500/15 to-emerald-600/10 border-2 border-emerald-500/30 text-emerald-950 shadow-sm animate-fade-in"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-900/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-600 text-white shadow-2xs">
              <span>🟢</span> ORDERS CURRENTLY OPEN
            </div>
            <h3 className="text-lg sm:text-xl font-black text-emerald-950 tracking-tight">
              We are actively accepting orders!
            </h3>
            <p className="text-xs sm:text-sm text-emerald-800 font-medium">
              Fresh artisanal roasted peanuts are prepared daily. Select your flavors and submit your order anytime.
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
        className="w-full rounded-3xl p-5 sm:p-7 bg-gradient-to-r from-red-500/15 via-red-500/20 to-red-600/15 border-2 border-red-500/40 text-red-950 shadow-md animate-fade-in"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-900/30">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-600 text-white shadow-xs">
              <span>🔒</span> ORDERS CLOSED
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-red-950 tracking-tight">
              The order cutoff has ended. We are no longer accepting orders for this batch.
            </h3>
            <p className="text-xs sm:text-sm text-red-900/80 font-medium">
              Orders are closed so our team can roast and prepare everyone's packages. Please check back next batch!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Active Cutoff Timer with Live Digital Cards
  return (
    <div 
      id="order-cutoff-section"
      className="w-full rounded-3xl p-5 sm:p-7 bg-gradient-to-br from-amber-500/15 via-orange-500/15 to-amber-600/20 border-2 border-amber-400/60 text-mani-950 shadow-md animate-fade-in relative overflow-hidden"
    >
      {/* Decorative glow background */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-center justify-between gap-5 relative z-10">
        {/* Left: Schedule Information */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-900/25">
            <Clock className="w-7 h-7 animate-pulse" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider bg-amber-600 text-white px-3 py-0.5 rounded-full shadow-2xs">
                ⏰ ORDER CUTOFF SCHEDULE
              </span>
              <span className="text-xs font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Accepting Orders Now
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-mani-950 tracking-tight">
              Order before the cutoff time to get your freshly roasted batch!
            </h3>

            <div className="flex items-center gap-3 justify-center sm:justify-start text-xs sm:text-sm text-mani-700 font-semibold flex-wrap">
              <span className="flex items-center gap-1 bg-white/70 px-2.5 py-1 rounded-xl border border-amber-200/80">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <strong className="text-mani-900">{formatDateNice(cutoffInfo?.cutoffDate)} ({cutoffInfo?.cutoffDate})</strong>
              </span>
              <span className="flex items-center gap-1 bg-white/70 px-2.5 py-1 rounded-xl border border-amber-200/80">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <strong className="text-mani-900">{formatNormalTime(cutoffInfo?.cutoffTime)} PHT</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Large Digital Countdown Cards */}
        <div className="flex flex-col items-center lg:items-end gap-1.5 shrink-0">
          <span className="text-[11px] uppercase tracking-widest text-mani-700 font-extrabold">
            ⏳ Orders Close In:
          </span>

          <div className="flex items-center gap-2">
            {/* Hours */}
            <div className="flex flex-col items-center">
              <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-white/95 border border-amber-300 shadow-sm flex items-center justify-center">
                <span className="text-2xl sm:text-3xl font-mono font-black text-amber-950">
                  {pad(hours)}
                </span>
              </div>
              <span className="text-[10px] font-bold text-mani-600 uppercase tracking-wider mt-1">
                Hours
              </span>
            </div>

            <span className="text-2xl font-black text-amber-600 pb-4">:</span>

            {/* Minutes */}
            <div className="flex flex-col items-center">
              <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-white/95 border border-amber-300 shadow-sm flex items-center justify-center">
                <span className="text-2xl sm:text-3xl font-mono font-black text-amber-950">
                  {pad(minutes)}
                </span>
              </div>
              <span className="text-[10px] font-bold text-mani-600 uppercase tracking-wider mt-1">
                Mins
              </span>
            </div>

            <span className="text-2xl font-black text-amber-600 pb-4">:</span>

            {/* Seconds */}
            <div className="flex flex-col items-center">
              <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-amber-500 text-white border border-amber-400 shadow-sm flex items-center justify-center">
                <span className="text-2xl sm:text-3xl font-mono font-black text-white">
                  {pad(seconds)}
                </span>
              </div>
              <span className="text-[10px] font-bold text-mani-600 uppercase tracking-wider mt-1">
                Secs
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

