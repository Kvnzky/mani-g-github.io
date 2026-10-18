import React from 'react';

/**
 * Festive Pine Corner Garland with Red Ribbon & Golden Bell
 * Replaces Halloween spiderwebs in corner anchors when Christmas theme is active.
 */
export function ChristmasCornerGarland({ position = 'right', className = '' }) {
  const isRight = position === 'right';
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none absolute top-0 ${isRight ? 'right-0' : 'left-0'} z-10 overflow-hidden ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        className={`w-20 sm:w-28 h-20 sm:h-28 drop-shadow-md ${isRight ? '' : '-scale-x-100'}`}
        fill="none"
      >
        {/* Pine needles / Evergreen boughs */}
        <path d="M100 0 L75 12 L90 22 L65 32 L82 42 L55 52 L70 60 L45 68 L60 74 L30 82 L42 90 L10 100 L0 100 L0 0 Z" fill="#0D2418" opacity="0.4" />
        <path d="M100 0 L82 10 L94 18 L72 26 L88 34 L62 44 L78 52 L50 62 L64 68 L36 76 L48 84 L18 94 L0 100 L0 0 Z" fill="#15803D" />
        <path d="M100 0 L88 8 L96 15 L78 22 L90 28 L68 38 L82 45 L58 54 L70 60 L44 68 L54 74 L25 84 L0 100 L0 0 Z" fill="#16A34A" />

        {/* Holly red berries */}
        <circle cx="68" cy="28" r="4.5" fill="#DC2626" />
        <circle cx="76" cy="33" r="4" fill="#B91C1C" />
        <circle cx="72" cy="38" r="3.5" fill="#EF4444" />
        <circle cx="67" cy="27" r="1.2" fill="#FFFFFF" opacity="0.8" />

        {/* Golden Christmas Bell */}
        <g transform="translate(62, 50) rotate(15)">
          <path d="M10 2 C10 0 16 0 16 2 C16 6 22 14 24 18 L2 18 C4 14 10 6 10 2 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
          <ellipse cx="13" cy="18" rx="11" ry="3.5" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
          <circle cx="13" cy="20" r="2.5" fill="#B45309" />
          {/* Bell shine */}
          <path d="M8 8 C10 5 12 5 13 8" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
        </g>

        {/* Red ribbon bow */}
        <g transform="translate(60, 42)">
          {/* Loops */}
          <path d="M8 4 C2 -2 0 8 8 6 Z" fill="#DC2626" />
          <path d="M10 4 C16 -2 18 8 10 6 Z" fill="#DC2626" />
          {/* Knot */}
          <circle cx="9" cy="5" r="2.5" fill="#991B1B" />
          {/* Tails */}
          <path d="M8 6 L4 14 L7 13 L8 15 Z" fill="#DC2626" />
          <path d="M10 6 L14 14 L11 13 L10 15 Z" fill="#DC2626" />
        </g>
      </svg>
    </div>
  );
}

/**
 * Hanging Christmas Star Ornament
 */
export function ChristmasStarOrnament({ className = 'w-10 h-10' }) {
  return (
    <svg viewBox="0 0 40 50" fill="none" aria-hidden="true" className={className}>
      {/* String */}
      <line x1="20" y1="0" x2="20" y2="16" stroke="#FBBF24" strokeWidth="1.5" strokeDasharray="2,2" />
      {/* Star */}
      <polygon
        points="20,16 23,24 32,25 25,31 27,40 20,35 13,40 15,31 8,25 17,24"
        fill="#FBBF24"
        stroke="#D97706"
        strokeWidth="1.5"
      />
      <circle cx="20" cy="27" r="2.5" fill="#FFFFFF" opacity="0.75" />
    </svg>
  );
}

/**
 * Festive Peanut Character with Santa Hat
 * Replaces Skeleton character in headers and section titles when Christmas theme is active.
 */
export function SantaPeanutSvg({ className = 'w-16 h-20' }) {
  return (
    <svg viewBox="0 0 80 100" fill="none" aria-hidden="true" className={className}>
      {/* Peanut body */}
      <g transform="translate(10, 16)">
        {/* Top lobe */}
        <ellipse cx="30" cy="30" rx="20" ry="22" fill="#D97706" stroke="#38200D" strokeWidth="2.5" />
        {/* Bottom lobe */}
        <ellipse cx="30" cy="56" rx="23" ry="24" fill="#D97706" stroke="#38200D" strokeWidth="2.5" />
        {/* Shell waist blend */}
        <path d="M11 36 Q30 42 49 36 Q49 50 49 52 Q30 46 11 52 Z" fill="#D97706" />

        {/* Textured shell lines */}
        <path d="M22 20 Q26 28 20 34" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M38 20 Q34 28 40 34" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M20 48 Q26 58 18 66" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M40 48 Q34 58 42 66" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" />

        {/* Cheerful Christmas Face */}
        {/* Eyes with sparkle */}
        <ellipse cx="23" cy="28" rx="3.5" ry="4" fill="#241306" />
        <circle cx="22" cy="26.5" r="1.3" fill="#FFFFFF" />
        <ellipse cx="37" cy="28" rx="3.5" ry="4" fill="#241306" />
        <circle cx="36" cy="26.5" r="1.3" fill="#FFFFFF" />

        {/* Rosy cheeks */}
        <circle cx="17" cy="33" r="3.5" fill="#EF4444" opacity="0.6" />
        <circle cx="43" cy="33" r="3.5" fill="#EF4444" opacity="0.6" />

        {/* Happy smile */}
        <path d="M25 34 Q30 40 35 34" stroke="#241306" strokeWidth="2" strokeLinecap="round" fill="#991B1B" />

        {/* Crisp Golden Garlic Chip in hand */}
        <g transform="translate(44, 46) rotate(15)">
          <path d="M0 8 Q6 0 12 4 Q14 12 6 14 Z" fill="#FDE68A" stroke="#B45309" strokeWidth="1.2" />
        </g>
      </g>

      {/* Santa Hat atop Peanut head */}
      <g transform="translate(14, 2) rotate(-6)">
        <path d="M8 24 C14 8 36 -2 46 8 C42 16 38 22 40 24 Z" fill="#DC2626" />
        <circle cx="48" cy="8" r="4.5" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="0.8" />
        <rect x="4" y="22" width="38" height="7.5" rx="3.75" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="0.8" />
        {/* Holly sprig on brim */}
        <circle cx="10" cy="24" r="1.8" fill="#15803D" />
        <circle cx="14" cy="23" r="1.8" fill="#15803D" />
        <circle cx="12" cy="25" r="1.5" fill="#DC2626" />
      </g>
    </svg>
  );
}
