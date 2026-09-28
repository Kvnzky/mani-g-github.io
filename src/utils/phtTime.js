// Authoritative Philippine Time (PHT / Asia/Manila, UTC+8) Utilities
// All calculations use UTC+8 arithmetic and explicit timeZone: 'Asia/Manila'
// so the browser's local timezone can never override or shift cutoff timers.

export const PHT_TIMEZONE = 'Asia/Manila';
export const PHT_OFFSET_MS = 8 * 60 * 60 * 1000; // UTC+8 (no DST in the Philippines)

/**
 * Returns the current date string (YYYY-MM-DD) in Asia/Manila (UTC+8)
 */
export const getManilaDateStr = (date = new Date()) => {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: PHT_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  } catch (e) {
    const phtDate = new Date(date.getTime() + PHT_OFFSET_MS);
    return phtDate.toISOString().slice(0, 10);
  }
};

/**
 * Returns the current 12-hour time string (hh:mm:ss AM/PM) in Asia/Manila (UTC+8)
 */
export const getManilaTimeStr12 = (date = new Date()) => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: PHT_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(date);
  } catch (e) {
    const phtDate = new Date(date.getTime() + PHT_OFFSET_MS);
    return phtDate.toISOString().slice(11, 19);
  }
};

/**
 * Normalizes a time string to 24-hour HH:MM format
 */
export const normalizeCutoffTime = (timeStr = '23:59') => {
  if (!timeStr || typeof timeStr !== 'string') return '23:59';
  const trimmed = timeStr.trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) return '23:59';
  const hh = String(Math.min(23, Math.max(0, parseInt(match[1], 10)))).padStart(2, '0');
  const mm = String(Math.min(59, Math.max(0, parseInt(match[2], 10)))).padStart(2, '0');
  return `${hh}:${mm}`;
};

/**
 * Builds an explicit ISO 8601 string with +08:00 offset (Asia/Manila)
 */
export const buildManilaCutoffIso = (dateStr, timeStr = '23:59') => {
  if (!dateStr || typeof dateStr !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) {
    return null;
  }
  const cleanDate = dateStr.trim();
  const hhmm = normalizeCutoffTime(timeStr);
  return `${cleanDate}T${hhmm}:00+08:00`;
};

/**
 * Computes the exact UTC epoch timestamp (in ms) for a given YYYY-MM-DD and HH:MM in Asia/Manila (UTC+8).
 * Uses Date.UTC arithmetic directly so browser local timezone has zero effect.
 */
export const getManilaCutoffTimestampMs = (dateStr, timeStr = '23:59') => {
  if (!dateStr || typeof dateStr !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) {
    return null;
  }
  const [year, month, day] = dateStr.trim().split('-').map(Number);
  const hhmm = normalizeCutoffTime(timeStr);
  const [hour, minute] = hhmm.split(':').map(Number);
  if ([year, month, day, hour, minute].some((n) => Number.isNaN(n))) {
    return null;
  }
  // Convert Asia/Manila wall-clock time (UTC+8) to UTC epoch milliseconds
  return Date.UTC(year, month - 1, day, hour - 8, minute, 0, 0);
};

/**
 * Computes signed remaining seconds until the cutoff timestamp in Asia/Manila (UTC+8).
 */
export const getRawRemainingCutoffSeconds = (dateStr, timeStr = '23:59', nowMs = Date.now()) => {
  const targetMs = getManilaCutoffTimestampMs(dateStr, timeStr);
  if (targetMs === null) return null;
  return Math.floor((targetMs - nowMs) / 1000);
};

/**
 * Formats YYYY-MM-DD nicely in Asia/Manila timezone (e.g. "Thu, Sep 24") without browser timezone shift
 */
export const formatManilaDateNice = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const parts = dateStr.trim().split('-');
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts.map(Number);
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return dateStr;
  try {
    // 04:00 UTC is 12:00 PM (Noon) in Asia/Manila (UTC+8)
    const dt = new Date(Date.UTC(y, m - 1, d, 4, 0, 0));
    return new Intl.DateTimeFormat('en-US', {
      timeZone: PHT_TIMEZONE,
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(dt);
  } catch (e) {
    return dateStr;
  }
};

/**
 * Formats 24-hour HH:MM into 12-hour format (e.g. "11:59 PM")
 */
export const formatManilaTime12 = (timeStr) => {
  if (!timeStr) return '';
  const hhmm = normalizeCutoffTime(timeStr);
  const parts = hhmm.split(':');
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  if (Number.isNaN(hours)) return timeStr;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
};

/**
 * Evaluates full cutoff & manual form status in Asia/Manila (UTC+8)
 */
export const evaluateClientCutoff = (conf = {}, nowMs = Date.now()) => {
  const nowObj = new Date(nowMs);
  const currentPhilippineDate = getManilaDateStr(nowObj);
  const currentPhilippineTime = getManilaTimeStr12(nowObj);

  const manualFormOpen = conf?.manualFormOpen !== undefined
    ? Boolean(conf.manualFormOpen)
    : (conf?.formStatus ? String(conf.formStatus).toLowerCase() !== 'closed' : true);

  const enabled = Boolean(conf?.enabled);
  const cutoffDate = (conf?.date || conf?.cutoffDate || currentPhilippineDate).trim();
  const cutoffTime = normalizeCutoffTime(conf?.time || conf?.cutoffTime || '23:59');
  const deliveryDay = (conf?.deliveryDay || 'Wednesday').trim();

  const cutoffIso = buildManilaCutoffIso(cutoffDate, cutoffTime);
  const rawDiffSec = enabled && cutoffIso ? getRawRemainingCutoffSeconds(cutoffDate, cutoffTime, nowMs) : null;
  const isCutoffExpired = Boolean(enabled && rawDiffSec !== null && rawDiffSec <= 0);

  // Manual form toggle and cutoff timer work independently:
  // - If manualFormOpen is false, the form is CLOSED immediately.
  // - If manualFormOpen is true, the form is OPEN unless the enabled cutoff timer has expired.
  const isOpen = manualFormOpen && !isCutoffExpired;
  const closedReason = !manualFormOpen ? 'manual' : (isCutoffExpired ? 'cutoff' : null);
  const status = !isOpen ? 'CLOSED' : (enabled ? 'CUTOFF SCHEDULED' : 'OPEN');

  return {
    enabled,
    manualFormOpen,
    formStatus: manualFormOpen ? 'open' : 'closed',
    isOpen,
    closedReason,
    status,
    cutoffDate,
    cutoffTime,
    deliveryDay,
    flavorAvailability: conf?.flavorAvailability || null,
    paymentMethods: conf?.paymentMethods || null,
    timezone: PHT_TIMEZONE,
    serverTime: nowObj.toISOString(),
    currentPhilippineDate,
    currentPhilippineTime,
    remainingSeconds: rawDiffSec !== null ? Math.max(0, rawDiffSec) : null,
    cutoffIso: enabled ? cutoffIso : cutoffIso,
    updatedAt: Number(conf?.updatedAt || 0)
  };
};
