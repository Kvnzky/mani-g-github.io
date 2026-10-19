import React from 'react';

/**
 * Elegant New Year Corner Garland with Champagne Gold Stars, Midnight Navy Streamers & Fireworks Bursts
 * Anchors hero and brand story corners when the New Year theme is active.
 */
export function NewYearCornerGarland({ position = 'right', className = '' }) {
  const isRight = position === 'right';
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none absolute top-0 ${isRight ? 'right-0' : 'left-0'} z-10 overflow-hidden ${className}`}
    >
      <svg
        viewBox="0 0 110 110"
        className={`w-20 sm:w-28 h-20 sm:h-28 drop-shadow-md ${isRight ? '' : '-scale-x-100'}`}
        fill="none"
      >
        {/* Midnight navy and champagne gold banner swag */}
        <path d="M110 0 L82 12 L96 22 L72 32 L90 42 L62 52 L76 60 L48 70 L62 76 L32 84 L44 92 L14 102 L0 110 L0 0 Z" fill="#070A14" opacity="0.45" />
        <path d="M110 0 L86 10 L98 18 L76 26 L92 34 L66 44 L82 50 L54 60 L68 66 L38 74 L50 82 L20 92 L0 110 L0 0 Z" fill="#1E293B" opacity="0.8" />
        <path d="M110 0 L90 8 L100 14 L82 22 L94 28 L72 36 L86 42 L62 50 L74 56 L48 64 L58 70 L28 80 L0 110 L0 0 Z" fill="#EAB308" />
        <path d="M110 0 L94 6 L102 11 L86 16 L96 22 L78 28 L90 34 L68 42 L78 47 L54 54 L62 59 L34 68 L0 110 L0 0 Z" fill="#FDE047" />

        {/* Silver & Golden Fireworks Starburst Sprig */}
        <g transform="translate(68, 12)">
          {/* Ray lines */}
          <line x1="12" y1="12" x2="12" y2="2" stroke="#FDE047" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="12" y1="12" x2="22" y2="12" stroke="#FDE047" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="12" y1="12" x2="12" y2="22" stroke="#FDE047" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="12" y1="12" x2="2" y2="12" stroke="#FDE047" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="12" y1="12" x2="19" y2="5" stroke="#E2E8F0" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="12" y1="12" x2="19" y2="19" stroke="#E2E8F0" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="12" y1="12" x2="5" y2="19" stroke="#E2E8F0" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="12" y1="12" x2="5" y2="5" stroke="#E2E8F0" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="12" cy="12" r="2.5" fill="#FFFFFF" />
        </g>

        {/* Midnight Clock Chime 12:00 Motif */}
        <g transform="translate(50, 48) rotate(-10)">
          {/* Clock circle */}
          <circle cx="16" cy="16" r="14" fill="#0B1120" stroke="#EAB308" strokeWidth="1.5" />
          <circle cx="16" cy="16" r="11" fill="#10172A" />
          {/* Roman numeral XII marker */}
          <line x1="16" y1="6" x2="16" y2="8.5" stroke="#FDE047" strokeWidth="1.5" />
          <line x1="26" y1="16" x2="23.5" y2="16" stroke="#FDE047" strokeWidth="1" />
          <line x1="16" y1="26" x2="16" y2="23.5" stroke="#FDE047" strokeWidth="1" />
          <line x1="6" y1="16" x2="8.5" y2="16" stroke="#FDE047" strokeWidth="1" />
          {/* Hands at 12:00 */}
          <line x1="16" y1="16" x2="16" y2="9" stroke="#E2E8F0" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="16" y1="16" x2="16" y2="7.5" stroke="#FDE047" strokeWidth="1" strokeLinecap="round" />
          <circle cx="16" cy="16" r="1.5" fill="#EAB308" />
        </g>

        {/* Celebration Red & Champagne Gold Ribbon Bow */}
        <g transform="translate(68, 52)">
          {/* Ribbon Loops in festive crimson red */}
          <path d="M8 4 C1 -3 0 7 7 6 Z" fill="#E11D48" />
          <path d="M11 4 C18 -3 19 7 12 6 Z" fill="#E11D48" />
          {/* Gold loop rim */}
          <path d="M2 1 Q8 4 6 5" stroke="#FDE047" strokeWidth="0.8" fill="none" />
          <path d="M17 1 Q11 4 13 5" stroke="#FDE047" strokeWidth="0.8" fill="none" />
          {/* Knot */}
          <circle cx="9.5" cy="5" r="2.5" fill="#BE123C" stroke="#FDE047" strokeWidth="0.8" />
          {/* Tails */}
          <path d="M8 6 L3 16 L7 14 L8 17 Z" fill="#E11D48" />
          <path d="M11 6 L16 16 L12 14 L11 17 Z" fill="#E11D48" />
        </g>
      </svg>
    </div>
  );
}

/**
 * Hanging Champagne Star or Fireworks Burst Ornament
 */
export function NewYearSparkleOrnament({ variant = 'star', className = 'w-10 h-10' }) {
  if (variant === 'burst') {
    return (
      <svg viewBox="0 0 44 55" fill="none" aria-hidden="true" className={className}>
        {/* Metallic hanging cord */}
        <line x1="22" y1="0" x2="22" y2="16" stroke="#E2E8F0" strokeWidth="1.2" strokeDasharray="2,2" />
        {/* Fireworks Starburst */}
        <g transform="translate(4, 16)">
          <line x1="18" y1="2" x2="18" y2="34" stroke="#FDE047" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="2" y1="18" x2="34" y2="18" stroke="#FDE047" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="7" y1="7" x2="29" y2="29" stroke="#E2E8F0" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="29" y1="7" x2="7" y2="29" stroke="#E2E8F0" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="18" cy="18" r="4" fill="#EAB308" stroke="#FFFFFF" strokeWidth="1" />
          <circle cx="18" cy="18" r="1.5" fill="#FFFFFF" />
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 44 55" fill="none" aria-hidden="true" className={className}>
      {/* Golden cord */}
      <line x1="22" y1="0" x2="22" y2="15" stroke="#EAB308" strokeWidth="1.5" strokeDasharray="2,2" />
      {/* Champagne Gold Star */}
      <g transform="translate(4, 14)">
        <polygon
          points="18,2 22,12 33,12 24,19 28,30 18,23 8,30 12,19 3,12 14,12"
          fill="#EAB308"
          stroke="#FDE047"
          strokeWidth="1.2"
        />
        {/* Star center facet highlights */}
        <polygon points="18,6 20,13 28,13 22,18 18,15" fill="#FEF08A" opacity="0.8" />
        <circle cx="18" cy="16" r="2.5" fill="#FFFFFF" />
      </g>
    </svg>
  );
}

/**
 * Festive New Year Peanut Mascot Character
 * Handcrafted Filipino Peanut with Celebration Top Hat, 12:00 midnight clock, golden noisemaker & crispy garlic chip!
 */
export function NewYearPeanutSvg({ className = 'w-16 h-20' }) {
  return (
    <svg viewBox="0 0 85 105" fill="none" aria-hidden="true" className={className}>
      {/* Peanut body */}
      <g transform="translate(12, 18)">
        {/* Top lobe */}
        <ellipse cx="30" cy="30" rx="20" ry="22" fill="#D97706" stroke="#451A03" strokeWidth="2.5" />
        {/* Bottom lobe */}
        <ellipse cx="30" cy="56" rx="23" ry="24" fill="#D97706" stroke="#451A03" strokeWidth="2.5" />
        {/* Shell waist blend */}
        <path d="M11 36 Q30 42 49 36 Q49 50 49 52 Q30 46 11 52 Z" fill="#D97706" />

        {/* Textured peanut shell indentations */}
        <path d="M22 20 Q26 28 20 34" stroke="#9A3412" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M38 20 Q34 28 40 34" stroke="#9A3412" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M20 48 Q26 58 18 66" stroke="#9A3412" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M40 48 Q34 58 42 66" stroke="#9A3412" strokeWidth="1.5" strokeLinecap="round" />

        {/* Celebration Bowtie in Midnight Navy & Champagne Gold */}
        <g transform="translate(20, 39)">
          <polygon points="0,0 9,5 0,10" fill="#0B1120" stroke="#EAB308" strokeWidth="1" />
          <polygon points="20,0 11,5 20,10" fill="#0B1120" stroke="#EAB308" strokeWidth="1" />
          <circle cx="10" cy="5" r="2.5" fill="#EAB308" stroke="#FDE047" strokeWidth="0.8" />
        </g>

        {/* Cheerful Celebration Face */}
        <ellipse cx="23" cy="28" rx="3.5" ry="4" fill="#241306" />
        <circle cx="22" cy="26.5" r="1.3" fill="#FFFFFF" />
        <ellipse cx="37" cy="28" rx="3.5" ry="4" fill="#241306" />
        <circle cx="36" cy="26.5" r="1.3" fill="#FFFFFF" />

        {/* Rosy celebration cheeks */}
        <circle cx="17" cy="33" r="3.5" fill="#F43F5E" opacity="0.6" />
        <circle cx="43" cy="33" r="3.5" fill="#F43F5E" opacity="0.6" />

        {/* Joyful open smile */}
        <path d="M24 33 Q30 42 36 33" stroke="#241306" strokeWidth="2" strokeLinecap="round" fill="#BE123C" />

        {/* Left Hand holding Crispy Garlic Chip */}
        <g transform="translate(6, 48) rotate(-15)">
          <ellipse cx="3" cy="3" rx="3.5" ry="3" fill="#D97706" />
          <path d="M-2 6 Q4 -1 10 3 Q12 11 4 13 Z" fill="#FDE68A" stroke="#B45309" strokeWidth="1.2" />
        </g>

        {/* Right Hand holding Golden Sparkler / Noisemaker */}
        <g transform="translate(46, 42) rotate(16)">
          <ellipse cx="3" cy="6" rx="3.5" ry="3" fill="#D97706" />
          {/* Wand handle */}
          <line x1="2" y1="14" x2="14" y2="-10" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
          {/* Sparkler tip flare */}
          <g transform="translate(14, -10)">
            <line x1="0" y1="-8" x2="0" y2="8" stroke="#FDE047" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="-8" y1="0" x2="8" y2="0" stroke="#FDE047" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="-5" y1="-5" x2="5" y2="5" stroke="#E2E8F0" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="5" y1="-5" x2="-5" y2="5" stroke="#E2E8F0" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="0" cy="0" r="2" fill="#FFFFFF" />
          </g>
        </g>
      </g>

      {/* Midnight Navy & Champagne Gold Top Hat */}
      <g transform="translate(15, 2) rotate(-5)">
        {/* Hat Crown */}
        <path d="M14 22 L16 8 L38 8 L40 22 Z" fill="#0B1120" stroke="#EAB308" strokeWidth="1.5" />
        {/* Hat top ellipse */}
        <ellipse cx="27" cy="8" rx="11" ry="3" fill="#1E293B" stroke="#EAB308" strokeWidth="1.2" />
        {/* Gold Band with Clock at 12:00 */}
        <rect x="14.5" y="17" width="25" height="5" fill="#EAB308" />
        <line x1="14.5" y1="17" x2="39.5" y2="17" stroke="#FDE047" strokeWidth="0.8" />
        {/* Mini clock buckle at 12:00 */}
        <circle cx="27" cy="19.5" r="3.5" fill="#FFFFFF" stroke="#0B1120" strokeWidth="0.8" />
        <line x1="27" y1="19.5" x2="27" y2="17" stroke="#0B1120" strokeWidth="0.8" />
        <line x1="27" y1="19.5" x2="29" y2="19.5" stroke="#E11D48" strokeWidth="0.6" />
        {/* Hat Brim */}
        <ellipse cx="27" cy="22" rx="22" ry="4" fill="#070A14" stroke="#EAB308" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

/**
 * Celebration Toast Clinking Flutes with Golden Bubbles
 */
export function NewYearToastSvg({ className = 'w-16 h-16' }) {
  return (
    <svg viewBox="0 0 70 70" fill="none" aria-hidden="true" className={className}>
      {/* Left Glass */}
      <g transform="translate(12, 10) rotate(-14)">
        {/* Flute bowl */}
        <path d="M6 2 L14 2 L12 24 C12 27 8 27 8 24 Z" fill="#FDE047" fillOpacity="0.4" stroke="#EAB308" strokeWidth="1.5" />
        {/* Champagne liquid */}
        <path d="M7 10 L13 10 L11.5 22 C11.5 24 8.5 24 8.5 22 Z" fill="#FACC15" />
        {/* Stem and base */}
        <line x1="10" y1="27" x2="10" y2="40" stroke="#CBD5E1" strokeWidth="1.5" />
        <ellipse cx="10" cy="41" rx="7" ry="2" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
      </g>

      {/* Right Glass */}
      <g transform="translate(36, 12) rotate(14)">
        {/* Flute bowl */}
        <path d="M6 2 L14 2 L12 24 C12 27 8 27 8 24 Z" fill="#FDE047" fillOpacity="0.4" stroke="#EAB308" strokeWidth="1.5" />
        {/* Champagne liquid */}
        <path d="M7 10 L13 10 L11.5 22 C11.5 24 8.5 24 8.5 22 Z" fill="#FACC15" />
        {/* Stem and base */}
        <line x1="10" y1="27" x2="10" y2="40" stroke="#CBD5E1" strokeWidth="1.5" />
        <ellipse cx="10" cy="41" rx="7" ry="2" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
      </g>

      {/* Toast Clink Sparkles */}
      <circle cx="35" cy="18" r="2" fill="#FFFFFF" />
      <line x1="35" y1="12" x2="35" y2="24" stroke="#FDE047" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="29" y1="18" x2="41" y2="18" stroke="#FDE047" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="31" cy="8" r="1.2" fill="#FDE047" />
      <circle cx="39" cy="6" r="1.5" fill="#E2E8F0" />
      <circle cx="36" cy="2" r="1" fill="#FDE047" />
    </svg>
  );
}
