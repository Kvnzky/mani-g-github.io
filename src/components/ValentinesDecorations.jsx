import React from 'react';

/**
 * Romantic Valentine's Day Corner Garland with Rose Drapery, Hanging Heart Bauble & Satin Ribbon Bow
 * Anchors hero and brand story corners when the Valentine's Day theme is active.
 */
export function ValentinesCornerGarland({ position = 'right', className = '' }) {
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
        {/* Deep Rose & Soft Pink Scalloped Silk Swag */}
        <path d="M110 0 L82 12 L96 22 L72 32 L90 42 L62 52 L76 60 L48 70 L62 76 L32 84 L44 92 L14 102 L0 110 L0 0 Z" fill="#240815" opacity="0.45" />
        <path d="M110 0 L86 10 L98 18 L76 26 L92 34 L66 44 L82 50 L54 60 L68 66 L38 74 L50 82 L20 92 L0 110 L0 0 Z" fill="#881337" opacity="0.85" />
        <path d="M110 0 L90 8 L100 14 L82 22 L94 28 L72 36 L86 42 L62 50 L74 56 L48 64 L58 70 L28 80 L0 110 L0 0 Z" fill="#E11D48" />
        <path d="M110 0 L94 6 L102 11 L86 16 L96 22 L78 28 L90 34 L68 42 L78 47 L54 54 L62 59 L34 68 L0 110 L0 0 Z" fill="#FB7185" />

        {/* Hanging Glossy Rose Heart Ornament */}
        <g transform="translate(62, 10)">
          {/* Top Hanging Satin Cord */}
          <line x1="16" y1="0" x2="16" y2="10" stroke="#FDA4AF" strokeWidth="1.5" strokeDasharray="1.5,1.5" />
          {/* Golden Ribbon Bow */}
          <ellipse cx="12" cy="11" rx="4" ry="2.5" fill="#FDE047" stroke="#D97706" strokeWidth="0.6" transform="rotate(-20 12 11)" />
          <ellipse cx="20" cy="11" rx="4" ry="2.5" fill="#FDE047" stroke="#D97706" strokeWidth="0.6" transform="rotate(20 20 11)" />
          <circle cx="16" cy="11" r="1.8" fill="#F59E0B" />
          {/* 3D Glossy Heart */}
          <g transform="translate(4, 13)">
            <path
              d="M12 21.35 L10.55 20.03 C5.4 15.36 2 12.28 2 8.5 C2 5.42 4.42 3 7.5 3 C9.24 3 10.91 3.81 12 5.09 C13.09 3.81 14.76 3 16.5 3 C19.58 3 22 5.42 22 8.5 C22 12.28 18.6 15.36 13.45 20.04 L12 21.35 Z"
              fill="#E11D48"
              stroke="#BE123C"
              strokeWidth="1.2"
            />
            {/* Heart Highlight */}
            <path
              d="M6 7 C5.5 8 5.5 10 7 12"
              stroke="#FFF1F2"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.8"
            />
          </g>
        </g>

        {/* Little Golden Sparkle Star */}
        <g transform="translate(46, 56) rotate(15)">
          <path d="M6 0 L7.5 4.5 L12 6 L7.5 7.5 L6 12 L4.5 7.5 L0 6 L4.5 4.5 Z" fill="#FDE047" />
        </g>

        {/* Sweet Little Rosebud */}
        <g transform="translate(72, 54)">
          <circle cx="6" cy="6" r="5" fill="#BE123C" />
          <circle cx="6" cy="6" r="3.5" fill="#FB7185" />
          <path d="M5 4 Q7 5 6 8" stroke="#FFF1F2" strokeWidth="0.8" fill="none" />
        </g>
      </svg>
    </div>
  );
}

/**
 * Hanging Valentine's Day Heart Ornament
 */
export function ValentinesHeartOrnament({ className = 'w-10 h-10' }) {
  return (
    <svg viewBox="0 0 44 60" fill="none" aria-hidden="true" className={className}>
      {/* Hanging Satin Ribbon */}
      <line x1="22" y1="0" x2="22" y2="14" stroke="#FB7185" strokeWidth="1.5" strokeDasharray="2,2" />
      {/* Golden Bow Knot */}
      <ellipse cx="18" cy="14" rx="4.5" ry="2.8" fill="#FDE047" stroke="#D97706" strokeWidth="0.6" transform="rotate(-25 18 14)" />
      <ellipse cx="26" cy="14" rx="4.5" ry="2.8" fill="#FDE047" stroke="#D97706" strokeWidth="0.6" transform="rotate(25 26 14)" />
      <circle cx="22" cy="14" r="2" fill="#F59E0B" />

      {/* Glossy Rose Heart Bauble */}
      <g transform="translate(10, 18)">
        <path
          d="M12 21.35 L10.55 20.03 C5.4 15.36 2 12.28 2 8.5 C2 5.42 4.42 3 7.5 3 C9.24 3 10.91 3.81 12 5.09 C13.09 3.81 14.76 3 16.5 3 C19.58 3 22 5.42 22 8.5 C22 12.28 18.6 15.36 13.45 20.04 L12 21.35 Z"
          fill="#E11D48"
          stroke="#BE123C"
          strokeWidth="1.2"
        />
        {/* Soft gradient shine */}
        <ellipse cx="8" cy="8" rx="3.5" ry="2" fill="#FDA4AF" opacity="0.6" transform="rotate(-20 8 8)" />
      </g>

      {/* Dangling Sparkle Crystal */}
      <g transform="translate(19, 44)">
        <line x1="3" y1="0" x2="3" y2="5" stroke="#FDE047" strokeWidth="1" />
        <path d="M3 5 L4.5 8 L6 9.5 L4.5 11 L3 14 L1.5 11 L0 9.5 L1.5 8 Z" fill="#FDE047" />
      </g>
    </svg>
  );
}

/**
 * Romantic Valentine Peanut Mascot Character
 * Handcrafted Filipino Peanut with blushing pink cheeks, sweet red bowtie,
 * holding a heart-shaped Mani gift box & golden crispy garlic chip!
 */
export function ValentinesPeanutSvg({ className = 'w-16 h-20' }) {
  return (
    <svg viewBox="0 0 85 105" fill="none" aria-hidden="true" className={className}>
      {/* Floating Little Heart */}
      <g transform="translate(35, 2) scale(0.65)">
        <path
          d="M12 21.35 L10.55 20.03 C5.4 15.36 2 12.28 2 8.5 C2 5.42 4.42 3 7.5 3 C9.24 3 10.91 3.81 12 5.09 C13.09 3.81 14.76 3 16.5 3 C19.58 3 22 5.42 22 8.5 C22 12.28 18.6 15.36 13.45 20.04 L12 21.35 Z"
          fill="#FB7185"
        />
      </g>

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

        {/* Charming Dapper Bowtie */}
        <g transform="translate(20, 37)">
          {/* Left Wing */}
          <polygon points="10,6 2,1 2,11" fill="#E11D48" stroke="#881337" strokeWidth="1" />
          {/* Right Wing */}
          <polygon points="10,6 18,1 18,11" fill="#E11D48" stroke="#881337" strokeWidth="1" />
          {/* Center Knot (Gold Heart) */}
          <circle cx="10" cy="6" r="2.8" fill="#FDE047" stroke="#D97706" strokeWidth="0.8" />
        </g>

        {/* Cheerful Friendly Eyes */}
        <ellipse cx="23" cy="27" rx="3.5" ry="4" fill="#241306" />
        <circle cx="22" cy="25.5" r="1.3" fill="#FFFFFF" />
        <ellipse cx="37" cy="27" rx="3.5" ry="4" fill="#241306" />
        <circle cx="36" cy="25.5" r="1.3" fill="#FFFFFF" />

        {/* Romantic Blushing Pink Cheeks */}
        <ellipse cx="17" cy="33" rx="4" ry="2.5" fill="#FB7185" opacity="0.85" />
        <ellipse cx="43" cy="33" rx="4" ry="2.5" fill="#FB7185" opacity="0.85" />

        {/* Sweet Smile */}
        <path d="M25 33 Q30 39 35 33" stroke="#241306" strokeWidth="2" strokeLinecap="round" fill="#E11D48" />

        {/* Left Hand holding Golden Crispy Garlic Chip */}
        <g transform="translate(6, 48) rotate(-15)">
          <ellipse cx="3" cy="3" rx="3.5" ry="3" fill="#D97706" />
          <path d="M-2 6 Q4 -1 10 3 Q12 11 4 13 Z" fill="#FDE68A" stroke="#B45309" strokeWidth="1.2" />
        </g>

        {/* Right Hand holding Heart Gift Box */}
        <g transform="translate(42, 42) rotate(6)">
          <ellipse cx="4" cy="6" rx="3.5" ry="3" fill="#D97706" />
          {/* Heart Gift Box */}
          <g transform="translate(2, -6) scale(0.7)">
            <path
              d="M12 21.35 L10.55 20.03 C5.4 15.36 2 12.28 2 8.5 C2 5.42 4.42 3 7.5 3 C9.24 3 10.91 3.81 12 5.09 C13.09 3.81 14.76 3 16.5 3 C19.58 3 22 5.42 22 8.5 C22 12.28 18.6 15.36 13.45 20.04 L12 21.35 Z"
              fill="#E11D48"
              stroke="#881337"
              strokeWidth="1.5"
            />
            {/* Satin ribbon crossed on heart */}
            <line x1="12" y1="5" x2="12" y2="21" stroke="#FDE047" strokeWidth="1.5" />
            <line x1="3" y1="12" x2="21" y2="12" stroke="#FDE047" strokeWidth="1.5" />
            {/* Tiny bow on box */}
            <circle cx="12" cy="12" r="2" fill="#F59E0B" />
          </g>
        </g>
      </g>
    </svg>
  );
}

/**
 * Sweet Valentine's Heart Box with Gold Ribbon
 */
export function ValentinesHeartBoxSvg({ className = 'w-16 h-16' }) {
  return (
    <svg viewBox="0 0 70 70" fill="none" aria-hidden="true" className={className}>
      <g transform="translate(10, 8)">
        {/* Heart Box Base */}
        <path
          d="M25 46 L21.5 43.1 C11.2 33.7 4.4 27.6 4.4 20 C4.4 13.8 9.2 9 15.4 9 C18.9 9 22.2 10.6 25 13.2 C27.8 10.6 31.1 9 34.6 9 C40.8 9 45.6 13.8 45.6 20 C45.6 27.6 38.8 33.7 28.5 43.1 L25 46 Z"
          fill="#E11D48"
          stroke="#881337"
          strokeWidth="2"
        />
        {/* Box Lid Edge Shadow */}
        <path
          d="M15.4 12 C10.8 12 7.4 15.5 7.4 20 C7.4 25.5 13.5 31.2 25 41 C36.5 31.2 42.6 25.5 42.6 20 C42.6 15.5 39.2 12 34.6 12 C31.5 12 28.5 13.5 25 16 C21.5 13.5 18.5 12 15.4 12 Z"
          fill="#FB7185"
          opacity="0.9"
        />
        {/* Gold Ribbon Cross */}
        <line x1="25" y1="11" x2="25" y2="44" stroke="#FDE047" strokeWidth="2.5" />
        <line x1="7" y1="24" x2="43" y2="24" stroke="#FDE047" strokeWidth="2.5" />
        {/* Ribbon Bow */}
        <ellipse cx="20" cy="24" rx="5" ry="3" fill="#FDE047" stroke="#D97706" strokeWidth="0.8" transform="rotate(-20 20 24)" />
        <ellipse cx="30" cy="24" rx="5" ry="3" fill="#FDE047" stroke="#D97706" strokeWidth="0.8" transform="rotate(20 30 24)" />
        <circle cx="25" cy="24" r="2.5" fill="#F59E0B" />
      </g>
    </svg>
  );
}


/**
 * Romantic Cupid Heart Icon with Arrow
 */
export function ValentinesCupidHeartSvg({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#FF4D6D" stroke="#C9184A" strokeWidth="1.2" />
      <line x1="2" y1="2" x2="22" y2="22" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" />
      <polygon points="22,22 18,22 22,18" fill="#FFD700" />
    </svg>
  );
}

/**
 * Delicate Rose Petal Icon
 */
export function ValentinesRosePetalSvg({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M12 2C8 6 6 10 7 14c1 4 5 7 5 7s4-3 5-7c1-4-1-8-5-12z" fill="#FF758F" stroke="#FF4D6D" strokeWidth="1" />
    </svg>
  );
}
