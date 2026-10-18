import React from 'react';

/**
 * Festive Autumn Harvest Corner Garland with Oak Leaves, Maple, Acorn & Mini Pumpkin
 * Anchors hero corners when the Thanksgiving theme is active.
 */
export function ThanksgivingCornerGarland({ position = 'right', className = '' }) {
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
        {/* Autumn Oak & Maple foliage clusters in harvest burnt-orange, amber & burgundy */}
        {/* Background dark warm leaves */}
        <path d="M110 0 L80 14 L95 24 L70 34 L88 44 L60 55 L75 64 L48 72 L62 78 L32 86 L44 94 L12 104 L0 110 L0 0 Z" fill="#2A170B" opacity="0.35" />
        <path d="M110 0 L85 10 L98 18 L76 28 L92 36 L66 46 L82 54 L54 64 L68 70 L38 78 L50 86 L20 96 L0 110 L0 0 Z" fill="#881337" opacity="0.85" />
        <path d="M110 0 L90 8 L99 15 L82 23 L94 30 L72 40 L86 47 L62 56 L74 62 L48 70 L58 76 L28 86 L0 110 L0 0 Z" fill="#C2410C" />
        <path d="M110 0 L94 6 L102 12 L86 18 L96 24 L78 32 L90 38 L68 47 L78 52 L54 61 L62 66 L34 76 L0 110 L0 0 Z" fill="#EA580C" />

        {/* Golden Wheat Stalk sprig */}
        <g transform="translate(68, 12) rotate(22)">
          {/* Stem */}
          <path d="M2 30 Q12 15 22 0" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
          {/* Grains */}
          <ellipse cx="6" cy="22" rx="2.5" ry="5" fill="#FDE047" stroke="#D97706" strokeWidth="0.8" transform="rotate(-20 6 22)" />
          <ellipse cx="12" cy="18" rx="2.5" ry="5" fill="#FDE047" stroke="#D97706" strokeWidth="0.8" transform="rotate(25 12 18)" />
          <ellipse cx="11" cy="11" rx="2.5" ry="5" fill="#FDE047" stroke="#D97706" strokeWidth="0.8" transform="rotate(-20 11 11)" />
          <ellipse cx="17" cy="8" rx="2.5" ry="5" fill="#FDE047" stroke="#D97706" strokeWidth="0.8" transform="rotate(25 17 8)" />
          <ellipse cx="19" cy="2" rx="2" ry="4.5" fill="#FDE047" stroke="#D97706" strokeWidth="0.8" transform="rotate(5 19 2)" />
        </g>

        {/* Warm Harvest Acorn */}
        <g transform="translate(48, 54) rotate(-15)">
          {/* Nut body */}
          <path d="M6 8 C6 18 16 22 16 22 C16 22 26 18 26 8 Z" fill="#D97706" stroke="#78350F" strokeWidth="1.2" />
          <path d="M10 10 Q16 18 14 20" stroke="#FBBF24" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
          {/* Cap */}
          <ellipse cx="16" cy="8" rx="11" ry="5" fill="#78350F" stroke="#451A03" strokeWidth="1.2" />
          {/* Stem */}
          <path d="M16 3 Q15 0 17 -1" stroke="#451A03" strokeWidth="1.5" strokeLinecap="round" />
          {/* Crosshatch texture on cap */}
          <path d="M9 7 L23 7 M11 5 L21 5" stroke="#9A3412" strokeWidth="0.8" opacity="0.6" />
        </g>

        {/* Mini Autumn Pumpkin Accent */}
        <g transform="translate(68, 52) rotate(10)">
          {/* Back lobes */}
          <ellipse cx="15" cy="14" rx="14" ry="11" fill="#C2410C" />
          {/* Outer lobes */}
          <ellipse cx="7" cy="14" rx="7" ry="10" fill="#EA580C" />
          <ellipse cx="23" cy="14" rx="7" ry="10" fill="#EA580C" />
          {/* Center lobe */}
          <ellipse cx="15" cy="14" rx="7.5" ry="11" fill="#F97316" stroke="#9A3412" strokeWidth="0.8" />
          {/* Stem */}
          <path d="M15 3 C14 -1 18 -2 18 3" stroke="#4D7C0F" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Vine curl */}
          <path d="M17 1 Q21 0 20 4 Q19 7 23 6" stroke="#65A30D" strokeWidth="1" fill="none" strokeLinecap="round" />
        </g>

        {/* Deep Burgundy & Gold Ribbon Bow */}
        <g transform="translate(62, 42)">
          {/* Ribbon Loops */}
          <path d="M8 4 C1 -3 0 7 7 6 Z" fill="#881337" />
          <path d="M11 4 C18 -3 19 7 12 6 Z" fill="#881337" />
          {/* Gold loop rim */}
          <path d="M2 1 Q8 4 6 5" stroke="#FDE047" strokeWidth="0.8" fill="none" />
          <path d="M17 1 Q11 4 13 5" stroke="#FDE047" strokeWidth="0.8" fill="none" />
          {/* Knot */}
          <circle cx="9.5" cy="5" r="2.5" fill="#4C0519" stroke="#FDE047" strokeWidth="0.6" />
          {/* Tails */}
          <path d="M8 6 L3 15 L7 14 L8 16 Z" fill="#881337" />
          <path d="M11 6 L16 15 L12 14 L11 16 Z" fill="#881337" />
        </g>
      </svg>
    </div>
  );
}

/**
 * Hanging Autumn Leaf or Acorn Ornament
 */
export function ThanksgivingLeafOrnament({ variant = 'maple', className = 'w-10 h-10' }) {
  if (variant === 'acorn') {
    return (
      <svg viewBox="0 0 40 55" fill="none" aria-hidden="true" className={className}>
        {/* String */}
        <line x1="20" y1="0" x2="20" y2="18" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="2,2" />
        {/* Acorn cap */}
        <ellipse cx="20" cy="22" rx="9" ry="4.5" fill="#78350F" stroke="#451A03" strokeWidth="1.2" />
        {/* Cap stem */}
        <path d="M20 18 L20 15" stroke="#451A03" strokeWidth="1.5" strokeLinecap="round" />
        {/* Acorn nut */}
        <path d="M12 22 C12 32 20 37 20 37 C20 37 28 32 28 22 Z" fill="#D97706" stroke="#78350F" strokeWidth="1.2" />
        <path d="M15 24 Q20 31 18 34" stroke="#FDE047" strokeWidth="1" strokeLinecap="round" opacity="0.75" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 44 55" fill="none" aria-hidden="true" className={className}>
      {/* String */}
      <line x1="22" y1="0" x2="22" y2="15" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="2,2" />
      {/* Maple Leaf */}
      <g transform="translate(4, 14)">
        <path
          d="M18 0 L21 7 L27 4 L26 11 L33 11 L28 17 L34 23 L26 23 L26 28 L18 24 L10 28 L10 23 L2 23 L8 17 L3 11 L10 11 L9 4 L15 7 Z"
          fill="#EA580C"
          stroke="#9A3412"
          strokeWidth="1.2"
        />
        {/* Leaf veins */}
        <path d="M18 3 L18 24 M18 14 L27 8 M18 14 L9 8 M18 18 L28 19 M18 18 L8 19" stroke="#FDE047" strokeWidth="0.8" opacity="0.8" />
        {/* Inner glow highlight */}
        <circle cx="18" cy="14" r="3" fill="#FDE047" opacity="0.5" />
      </g>
    </svg>
  );
}

/**
 * Festive Harvest Peanut Mascot Character
 * Handcrafted Filipino Peanut with Autumn Harvest Hat, holding a golden wheat stalk & garlic chip!
 */
export function HarvestPeanutSvg({ className = 'w-16 h-20' }) {
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

        {/* Harvest Neckerchief / Bandana around waist */}
        <path d="M13 41 Q30 46 47 41 L35 52 L30 55 L25 52 Z" fill="#881337" stroke="#4C0519" strokeWidth="1.2" />
        <circle cx="30" cy="46" r="2.5" fill="#FDE047" stroke="#D97706" strokeWidth="0.8" />

        {/* Cheerful Harvest Face */}
        {/* Eyes with warm sparkle */}
        <ellipse cx="23" cy="28" rx="3.5" ry="4" fill="#241306" />
        <circle cx="22" cy="26.5" r="1.3" fill="#FFFFFF" />
        <ellipse cx="37" cy="28" rx="3.5" ry="4" fill="#241306" />
        <circle cx="36" cy="26.5" r="1.3" fill="#FFFFFF" />

        {/* Warm autumn rosy cheeks */}
        <circle cx="17" cy="33" r="3.5" fill="#EA580C" opacity="0.65" />
        <circle cx="43" cy="33" r="3.5" fill="#EA580C" opacity="0.65" />

        {/* Hearty smile */}
        <path d="M25 34 Q30 40 35 34" stroke="#241306" strokeWidth="2" strokeLinecap="round" fill="#78350F" />

        {/* Left Hand holding Crispy Golden Garlic Chip */}
        <g transform="translate(6, 48) rotate(-15)">
          <ellipse cx="3" cy="3" rx="3.5" ry="3" fill="#D97706" />
          <path d="M-2 6 Q4 -1 10 3 Q12 11 4 13 Z" fill="#FDE68A" stroke="#B45309" strokeWidth="1.2" />
        </g>

        {/* Right Hand holding Golden Wheat Sheaf */}
        <g transform="translate(46, 42) rotate(18)">
          <ellipse cx="3" cy="6" rx="3.5" ry="3" fill="#D97706" />
          <path d="M2 14 Q8 -2 14 -12" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" />
          <ellipse cx="9" cy="-3" rx="2" ry="4.5" fill="#FDE047" stroke="#D97706" strokeWidth="0.8" transform="rotate(-25 9 -3)" />
          <ellipse cx="14" cy="-7" rx="2" ry="4.5" fill="#FDE047" stroke="#D97706" strokeWidth="0.8" transform="rotate(25 14 -7)" />
          <ellipse cx="15" cy="-13" rx="1.8" ry="4" fill="#FDE047" stroke="#D97706" strokeWidth="0.8" />
        </g>
      </g>

      {/* Autumn Harvest Feather Cap / Hat atop peanut */}
      <g transform="translate(14, 2) rotate(-4)">
        {/* Hat Crown (Burnt Orange / Burgundy) */}
        <path d="M12 24 C14 12 36 6 46 12 C44 20 40 24 40 24 Z" fill="#EA580C" stroke="#78350F" strokeWidth="1.2" />
        {/* Hat Band in Deep Burgundy */}
        <path d="M10 21 Q28 26 42 22 L41 25 Q28 29 9 24 Z" fill="#881337" stroke="#4C0519" strokeWidth="0.8" />
        {/* Gold Buckle on Band */}
        <rect x="24" y="21" width="8" height="6" rx="1.5" fill="#FDE047" stroke="#D97706" strokeWidth="1" />
        <rect x="26" y="23" width="4" height="2" fill="#881337" />
        {/* Brim */}
        <ellipse cx="26" cy="24" rx="22" ry="4.5" fill="#C2410C" stroke="#78350F" strokeWidth="1.2" />
        {/* Autumn Oak Leaf tucked in brim */}
        <path d="M38 18 Q46 8 44 2 Q40 8 36 14 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="0.8" />
        <circle cx="36" cy="18" r="2" fill="#4D7C0F" />
      </g>
    </svg>
  );
}

/**
 * Woven Harvest Cornucopia Basket overflowing with garlic peanuts & autumn produce
 */
export function HarvestCornucopiaSvg({ className = 'w-16 h-16' }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" aria-hidden="true" className={className}>
      {/* Wicker Horn Body */}
      <path
        d="M20 60 C12 50 8 30 18 18 C28 8 50 12 62 26 C68 34 72 48 70 56 Z"
        fill="#9A3412"
        stroke="#451A03"
        strokeWidth="2"
      />
      {/* Wicker Rims */}
      <path d="M16 26 Q36 24 64 36" stroke="#D97706" strokeWidth="2" strokeDasharray="3,3" />
      <path d="M16 38 Q36 34 68 46" stroke="#D97706" strokeWidth="2" strokeDasharray="3,3" />
      <path d="M18 50 Q36 46 68 56" stroke="#D97706" strokeWidth="2" strokeDasharray="3,3" />

      {/* Overflowing Golden Peanuts & Bawang */}
      <ellipse cx="28" cy="52" rx="9" ry="6" fill="#D97706" stroke="#78350F" strokeWidth="1.2" transform="rotate(-15 28 52)" />
      <ellipse cx="40" cy="54" rx="9" ry="6" fill="#F59E0B" stroke="#78350F" strokeWidth="1.2" transform="rotate(20 40 54)" />
      <ellipse cx="32" cy="42" rx="8" ry="5.5" fill="#FBBF24" stroke="#78350F" strokeWidth="1.2" transform="rotate(30 32 42)" />
      <ellipse cx="48" cy="46" rx="8" ry="5.5" fill="#D97706" stroke="#78350F" strokeWidth="1.2" transform="rotate(-25 48 46)" />

      {/* Garlic chip in bounty */}
      <path d="M22 42 Q28 36 34 40 Q35 46 28 48 Z" fill="#FEF3C7" stroke="#D97706" strokeWidth="1" />

      {/* Mini Pumpkin nestled in cornucopia */}
      <ellipse cx="48" cy="56" rx="8" ry="6.5" fill="#EA580C" stroke="#9A3412" strokeWidth="1" />
      <path d="M48 50 C47 47 49 46 50 49" stroke="#4D7C0F" strokeWidth="1.5" fill="none" />
    </svg>
  );
}
