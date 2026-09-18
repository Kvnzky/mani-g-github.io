import React, { useState, useEffect } from 'react';
import { Clock, Lock, CheckCircle2, ChevronRight } from 'lucide-react';

export default function TopCutoffAlertBar({ cutoffInfo, onRefreshCutoff }) {
  const [remainingSec, setRemainingSec] = useState(() => {
    if (!cutoffInfo || !cutoffInfo.cutoffIso) return 0;
    const diff = Math.floor((new Date(cutoffInfo.cutoffIso).getTime() - Date.now()) / 1000);
    return Math.max(0, diff);
  });

  useEffect(() => {
    if (!cutoffInfo || !cutoffInfo.enabled || !cutoffInfo.cutoffIso) return;

    const targetTimestamp = new Date(cutoffInfo.cutoffIso).getTime();

    const updateTicker = () => {
      const diff = Math.floor((targetTimestamp - Date.now()) / 1000);
      const remaining = Math.max(0, diff);
      setRemainingSec(remaining);

      if (remaining === 0 && cutoffInfo.isOpen && onRefreshCutoff) {
        onRefreshCutoff();
      }
    };

    updateTicker();
    const timer = setInterval(updateTicker, 1000);
    return () => clearInterval(timer);
  }, [cutoffInfo?.cutoffIso, cutoffInfo?.enabled, cutoffInfo?.isOpen]);

  if (!cutoffInfo) return null;

  const isClosed = !cutoffInfo.isOpen || (cutoffInfo.enabled && remainingSec <= 0);

  // Format 12-hour time
  const format12Hour = (timeStr) => {
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

  // Format countdown string
  const formatCountdown = (totalSec) => {
    if (totalSec <= 0) return '00:00:00';
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    const pad = (n) => String(n).padStart(2, '0');

    if (days > 0) {
      return `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
    }
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const scrollToSection = () => {
    const el = document.getElementById('order-cutoff-section') || document.getElementById('checkout-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  if (isClosed) {
    return (
      <div 
        onClick={scrollToSection}
        className="w-full bg-gradient-to-r from-red-700 via-red-800 to-red-900 text-white py-2 px-3 sm:px-6 text-xs font-bold shadow-md cursor-pointer border-b border-red-600/50"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center shrink-0">
              <Lock className="w-3 h-3 text-white" />
            </span>
            <span className="font-extrabold tracking-wide uppercase text-red-200">Orders Closed:</span>
            <span className="text-white/95 font-medium">
              The order cutoff has ended. We are currently preparing active orders.
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-black uppercase tracking-wider text-red-100 shrink-0">
            Closed for this batch
          </span>
        </div>
      </div>
    );
  }

  if (cutoffInfo.enabled && remainingSec > 0) {
    return (
      <div 
        onClick={scrollToSection}
        className="w-full bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white py-2 px-3 sm:px-6 text-xs shadow-md cursor-pointer border-b border-amber-400/40 hover:brightness-105 transition-all"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          {/* Left: Deadline message */}
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center shrink-0 animate-pulse">
              <Clock className="w-3 h-3 text-amber-950" />
            </span>
            <span className="font-black uppercase tracking-wider text-amber-200">
              ⏰ Order Cutoff:
            </span>
            <span className="text-white font-semibold">
              Orders close on <span className="underline decoration-amber-300 font-bold">{cutoffInfo.cutoffDate}</span> at <span className="underline decoration-amber-300 font-bold">{format12Hour(cutoffInfo.cutoffTime)}</span> (PST)
            </span>
          </div>

          {/* Right: Live ticking countdown */}
          <div className="flex items-center gap-2 ml-auto sm:ml-0">
            <span className="text-[11px] text-amber-100 font-semibold uppercase tracking-wider hidden xs:inline">
              Closes in:
            </span>
            <div className="font-mono font-black text-xs sm:text-sm bg-mani-950/40 px-3 py-0.5 rounded-xl border border-amber-300/40 text-amber-200 tracking-wider shadow-inner flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span>{formatCountdown(remainingSec)}</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-amber-200 shrink-0 hidden sm:inline" />
          </div>
        </div>
      </div>
    );
  }

  // Cutoff Disabled (Open 24/7)
  return (
    <div 
      onClick={scrollToSection}
      className="w-full bg-gradient-to-r from-emerald-700 to-emerald-800 text-white py-1.5 px-3 sm:px-6 text-xs shadow-xs cursor-pointer border-b border-emerald-600"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
          <span className="font-extrabold uppercase tracking-wider text-emerald-200">Orders Open:</span>
          <span className="text-emerald-50 font-medium">Fresh artisanal batches available. Place your order now!</span>
        </div>
        <span className="text-[11px] font-bold text-emerald-200 underline hidden sm:inline">Order Now &rarr;</span>
      </div>
    </div>
  );
}
