import React, { useState, useEffect } from 'react';
import { Clock, Lock, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function OrderCutoffBanner({ cutoffInfo, onRefreshCutoff }) {
  const [remainingSec, setRemainingSec] = useState(cutoffInfo?.remainingSeconds || 0);

  useEffect(() => {
    if (!cutoffInfo || !cutoffInfo.enabled) return;

    // Calculate current seconds remaining relative to client time & server offset
    const targetTimestamp = cutoffInfo.cutoffIso ? new Date(cutoffInfo.cutoffIso).getTime() : null;
    if (!targetTimestamp) return;

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

  if (!cutoffInfo || !cutoffInfo.enabled) {
    return null;
  }

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

  // Format seconds into HH:MM:SS
  const formatCountdown = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const isClosed = !cutoffInfo.isOpen || remainingSec <= 0;

  if (isClosed) {
    return (
      <div className="w-full rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-red-500/10 via-red-500/15 to-red-600/10 border-2 border-red-500/30 text-red-950 shadow-sm animate-fade-in">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-900/20">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-red-600 text-white shadow-2xs">
              <span>🔒</span> ORDERS CLOSED
            </div>
            <h3 className="text-lg sm:text-xl font-black text-red-950 tracking-tight">
              The order cutoff has ended. We are no longer accepting orders at this time.
            </h3>
            <p className="text-xs sm:text-sm text-red-800 font-medium">
              Orders are now closed. Please check back next batch or reach out to our team for inquiries.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-amber-500/15 via-amber-400/20 to-orange-500/15 border-2 border-amber-400/50 text-mani-950 shadow-sm animate-fade-in">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-900/20">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="text-xs font-black uppercase tracking-wider bg-amber-600 text-white px-2.5 py-0.5 rounded-full">
                ⏰ ORDER CUTOFF
              </span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Orders Open
              </span>
            </div>
            <p className="text-xs sm:text-sm text-mani-700 font-semibold mt-1">
              Cutoff schedule: <span className="font-bold text-mani-900">{cutoffInfo.cutoffDate}</span> at <span className="font-bold text-mani-900">{formatNormalTime(cutoffInfo.cutoffTime)}</span>
            </p>
          </div>
        </div>

        {/* Live Countdown Display */}
        <div className="flex flex-col items-center sm:items-end">
          <span className="text-[11px] uppercase tracking-widest text-mani-600 font-bold">
            Orders close in
          </span>
          <div className="text-2xl sm:text-3xl font-mono font-black text-amber-950 tracking-tight bg-white/80 backdrop-blur-xs px-4 py-1.5 rounded-2xl border border-amber-300/80 shadow-xs">
            {formatCountdown(remainingSec)}
          </div>
        </div>
      </div>
    </div>
  );
}
