import React from 'react';

/**
 * Traditional Chinese New Year Corner Garland with Red Lantern, Gold Ingot, Auspicious Cloud & Jade Tassel
 * Anchors hero and brand story corners when the Chinese New Year theme is active.
 */
export function ChineseNewYearCornerGarland({ position = 'right', className = '' }) {
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
        {/* Auspicious Imperial Red & Rich Gold Silk Swag */}
        <path d="M110 0 L82 12 L96 22 L72 32 L90 42 L62 52 L76 60 L48 70 L62 76 L32 84 L44 92 L14 102 L0 110 L0 0 Z" fill="#1F0606" opacity="0.45" />
        <path d="M110 0 L86 10 L98 18 L76 26 L92 34 L66 44 L82 50 L54 60 L68 66 L38 74 L50 82 L20 92 L0 110 L0 0 Z" fill="#7F1D1D" opacity="0.85" />
        <path d="M110 0 L90 8 L100 14 L82 22 L94 28 L72 36 L86 42 L62 50 L74 56 L48 64 L58 70 L28 80 L0 110 L0 0 Z" fill="#DC2626" />
        <path d="M110 0 L94 6 L102 11 L86 16 L96 22 L78 28 L90 34 L68 42 L78 47 L54 54 L62 59 L34 68 L0 110 L0 0 Z" fill="#F59E0B" />

        {/* Traditional Hanging Red Lantern */}
        <g transform="translate(64, 8)">
          {/* Top hanging golden cord */}
          <line x1="16" y1="0" x2="16" y2="8" stroke="#F59E0B" strokeWidth="1.5" />
          {/* Lantern Top Cap in Gold */}
          <rect x="10" y="8" width="12" height="3" rx="1.5" fill="#F59E0B" stroke="#B45309" strokeWidth="0.8" />
          {/* Lantern Ribbed Body */}
          <ellipse cx="16" cy="22" rx="13" ry="12" fill="#DC2626" stroke="#F59E0B" strokeWidth="1.2" />
          <line x1="16" y1="10" x2="16" y2="34" stroke="#F59E0B" strokeWidth="1" />
          <path d="M10 13 Q6 22 10 31" stroke="#F59E0B" strokeWidth="0.8" strokeDasharray="1.5,1.5" />
          <path d="M22 13 Q26 22 22 31" stroke="#F59E0B" strokeWidth="0.8" strokeDasharray="1.5,1.5" />
          {/* Gold character or diamond emblem on lantern */}
          <polygon points="16,18 19,22 16,26 13,22" fill="#FDE047" stroke="#D97706" strokeWidth="0.6" />
          {/* Lantern Bottom Cap */}
          <rect x="11" y="34" width="10" height="2.5" rx="1" fill="#F59E0B" stroke="#B45309" strokeWidth="0.8" />
          {/* Red Silk Tassel */}
          <line x1="16" y1="36.5" x2="16" y2="48" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="16" cy="38" r="1.5" fill="#F59E0B" />
        </g>

        {/* Prosperity Gold Coin with Square Cutout */}
        <g transform="translate(48, 52) rotate(12)">
          <circle cx="12" cy="12" r="10" fill="#F59E0B" stroke="#B45309" strokeWidth="1.2" />
          <circle cx="12" cy="12" r="8" fill="#FDE047" stroke="#D97706" strokeWidth="0.6" />
          {/* Square hole */}
          <rect x="9.5" y="9.5" width="5" height="5" fill="#7F1D1D" stroke="#B45309" strokeWidth="0.8" />
        </g>

        {/* Auspicious Cloud Flourish */}
        <g transform="translate(68, 54)">
          <path
            d="M4 12 C1 12 0 8 3 6 C4 2 10 1 12 5 C15 3 20 4 20 8 C23 8 24 12 21 13 Z"
            fill="#FDE047"
            stroke="#D97706"
            strokeWidth="0.8"
            opacity="0.9"
          />
        </g>
      </svg>
    </div>
  );
}

/**
 * Hanging Traditional Chinese Red Lantern Ornament
 */
export function ChineseNewYearLanternOrnament({ className = 'w-10 h-10' }) {
  return (
    <svg viewBox="0 0 44 60" fill="none" aria-hidden="true" className={className}>
      {/* Hanging Golden String */}
      <line x1="22" y1="0" x2="22" y2="12" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="2,2" />
      {/* Top Cap */}
      <rect x="15" y="12" width="14" height="3" rx="1.5" fill="#F59E0B" stroke="#B45309" strokeWidth="0.8" />
      {/* Lantern Body */}
      <g transform="translate(4, 15)">
        <ellipse cx="18" cy="15" rx="15" ry="14" fill="#DC2626" stroke="#F59E0B" strokeWidth="1.5" />
        {/* Ribs */}
        <line x1="18" y1="1" x2="18" y2="29" stroke="#F59E0B" strokeWidth="1.2" />
        <path d="M10 5 Q5 15 10 25" stroke="#FDE047" strokeWidth="0.9" strokeDasharray="2,2" />
        <path d="M26 5 Q31 15 26 25" stroke="#FDE047" strokeWidth="0.9" strokeDasharray="2,2" />
        {/* Prosperity Diamond Badge */}
        <polygon points="18,10 23,15 18,20 13,15" fill="#FDE047" stroke="#D97706" strokeWidth="0.8" />
        <circle cx="18" cy="15" r="1.5" fill="#DC2626" />
      </g>
      {/* Bottom Cap */}
      <rect x="16" y="44" width="12" height="3" rx="1.5" fill="#F59E0B" stroke="#B45309" strokeWidth="0.8" />
      {/* Tassel with Jade Bead */}
      <circle cx="22" cy="48" r="2" fill="#059669" stroke="#047857" strokeWidth="0.8" />
      <line x1="22" y1="49" x2="22" y2="58" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Festive Chinese New Year Peanut Mascot Character
 * Handcrafted Filipino Peanut in Imperial Red Silk Tang Suit, traditional Gua Pi Mao cap with jade bead,
 * holding a Golden Yuanbao (Gold Ingot) & a golden crispy garlic chip!
 */
export function ChineseNewYearPeanutSvg({ className = 'w-16 h-20' }) {
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

        {/* Traditional Red Silk Tang Suit Vest / Collar */}
        <g transform="translate(12, 38)">
          <path d="M3 3 Q18 8 33 3 L31 16 Q18 20 5 16 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="1.2" />
          {/* Gold piping trim */}
          <path d="M4 3 Q18 8 32 3" stroke="#FDE047" strokeWidth="1" fill="none" />
          {/* Traditional Frog Knot Button */}
          <circle cx="18" cy="9" r="2" fill="#F59E0B" stroke="#B45309" strokeWidth="0.6" />
          <path d="M14 9 L17 9 M19 9 L22 9" stroke="#FDE047" strokeWidth="1" strokeLinecap="round" />
        </g>

        {/* Cheerful Lucky Face */}
        <ellipse cx="23" cy="27" rx="3.5" ry="4" fill="#241306" />
        <circle cx="22" cy="25.5" r="1.3" fill="#FFFFFF" />
        <ellipse cx="37" cy="27" rx="3.5" ry="4" fill="#241306" />
        <circle cx="36" cy="25.5" r="1.3" fill="#FFFFFF" />

        {/* Auspicious Rosy Cheeks */}
        <circle cx="17" cy="32" r="3.5" fill="#EF4444" opacity="0.65" />
        <circle cx="43" cy="32" r="3.5" fill="#EF4444" opacity="0.65" />

        {/* Happy smile */}
        <path d="M25 33 Q30 40 35 33" stroke="#241306" strokeWidth="2" strokeLinecap="round" fill="#991B1B" />

        {/* Left Hand holding Golden Crispy Garlic Chip */}
        <g transform="translate(6, 48) rotate(-15)">
          <ellipse cx="3" cy="3" rx="3.5" ry="3" fill="#D97706" />
          <path d="M-2 6 Q4 -1 10 3 Q12 11 4 13 Z" fill="#FDE68A" stroke="#B45309" strokeWidth="1.2" />
        </g>

        {/* Right Hand holding Golden Yuanbao (Gold Ingot) */}
        <g transform="translate(44, 40) rotate(8)">
          <ellipse cx="4" cy="6" rx="3.5" ry="3" fill="#D97706" />
          {/* Golden Yuanbao / Ingot */}
          <g transform="translate(2, -8)">
            <path d="M2 10 Q8 16 16 10 Q14 2 2 10 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
            <ellipse cx="9" cy="6" rx="6" ry="3" fill="#FDE047" stroke="#D97706" strokeWidth="0.8" />
            <circle cx="9" cy="5" r="2.5" fill="#FEF08A" />
          </g>
        </g>
      </g>

      {/* Traditional Chinese Red Prosperity Skullcap (Gua Pi Mao) */}
      <g transform="translate(15, 3) rotate(-3)">
        {/* Cap Dome */}
        <path d="M12 23 C14 11 36 8 46 11 C44 20 40 23 40 23 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="1.5" />
        {/* Gold melon panel lines */}
        <path d="M29 9 Q23 16 16 23" stroke="#FDE047" strokeWidth="0.8" fill="none" opacity="0.8" />
        <path d="M29 9 Q35 16 42 23" stroke="#FDE047" strokeWidth="0.8" fill="none" opacity="0.8" />
        <path d="M29 9 L29 23" stroke="#FDE047" strokeWidth="0.8" />
        {/* Cap Rim */}
        <ellipse cx="29" cy="23" rx="18" ry="4" fill="#7F1D1D" stroke="#F59E0B" strokeWidth="1.2" />
        {/* Jade Top Knot Bead */}
        <circle cx="29" cy="8.5" r="3" fill="#059669" stroke="#FDE047" strokeWidth="0.8" />
      </g>
    </svg>
  );
}

/**
 * Auspicious Red Envelope (Angpao) & Golden Coin Duo
 */
export function ChineseNewYearAngpaoCoinSvg({ className = 'w-16 h-16' }) {
  return (
    <svg viewBox="0 0 70 70" fill="none" aria-hidden="true" className={className}>
      {/* Red Envelope (Angpao) */}
      <g transform="translate(8, 10) rotate(-10)">
        <rect x="4" y="6" width="30" height="42" rx="3" fill="#DC2626" stroke="#991B1B" strokeWidth="1.5" />
        {/* Flap */}
        <path d="M4 6 Q19 22 34 6 Z" fill="#B91C1C" stroke="#991B1B" strokeWidth="1" />
        {/* Gold Seal / Character badge */}
        <circle cx="19" cy="24" r="7" fill="#F59E0B" stroke="#FDE047" strokeWidth="1" />
        <circle cx="19" cy="24" r="5" fill="#DC2626" />
        {/* Auspicious golden character lines */}
        <line x1="16" y1="24" x2="22" y2="24" stroke="#FDE047" strokeWidth="1" />
        <line x1="19" y1="21" x2="19" y2="27" stroke="#FDE047" strokeWidth="1" />
      </g>

      {/* Gold Coin Overlap */}
      <g transform="translate(32, 28) rotate(15)">
        <circle cx="14" cy="14" r="13" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
        <circle cx="14" cy="14" r="10.5" fill="#FDE047" stroke="#D97706" strokeWidth="0.8" />
        {/* Square hole */}
        <rect x="10.5" y="10.5" width="7" height="7" fill="#7F1D1D" stroke="#B45309" strokeWidth="1" />
      </g>
    </svg>
  );
}
