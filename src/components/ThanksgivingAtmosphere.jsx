import React from 'react';
import { ThanksgivingCornerGarland } from './ThanksgivingDecorations';

/**
 * Majestic Wild Autumn Goose SVG with Wing Flapping animation
 */
export function WildGooseSvg({ className = 'w-10 h-6' }) {
  return (
    <svg viewBox="0 0 72 40" fill="none" aria-hidden="true" className={className}>
      {/* Goose Silhouette in warm autumnal silhouette tone with feather highlights */}
      <path
        d="M2 18 C10 14 18 10 26 12 C32 8 46 2 54 4 C60 5 68 8 70 12 C64 12 56 14 50 16 C46 20 40 24 34 26 C28 28 20 28 14 24 C8 24 4 22 2 18 Z"
        fill="#3D1C06"
      />
      {/* Extended neck & sleek beak */}
      <path d="M54 4 L64 6 L70 8 L66 11 L56 9 Z" fill="#D97706" />
      {/* White cheek patch (classic wild Canada goose hallmark) */}
      <ellipse cx="58" cy="8" rx="3.5" ry="2" fill="#FFFBEB" transform="rotate(-15 58 8)" />
      {/* Slender flapping wings */}
      <path
        d="M28 13 C34 4 44 -2 50 1 C46 7 40 14 36 20 Z"
        fill="#5A290A"
      />
      <path
        d="M24 16 C18 6 10 2 4 4 C8 10 14 16 18 20 Z"
        fill="#2A1204"
        opacity="0.8"
      />
    </svg>
  );
}

/**
 * Golden Harvest Monarch Butterfly SVG with Fluttering Wings
 */
export function HarvestButterflySvg({ className = 'w-8 h-8' }) {
  return (
    <svg viewBox="0 0 54 50" fill="none" aria-hidden="true" className={className}>
      {/* Left upper wing */}
      <path
        d="M27 25 C24 14 12 4 4 8 C-2 12 2 24 14 27 C20 28 24 26 27 25 Z"
        fill="#EA580C"
        stroke="#1F0E05"
        strokeWidth="1.2"
      />
      <path d="M12 12 C18 16 22 22 24 24" stroke="#FDE047" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="8" cy="11" r="1.5" fill="#FFFBEB" />
      <circle cx="6" cy="17" r="1.2" fill="#FFFBEB" />

      {/* Right upper wing */}
      <path
        d="M27 25 C30 14 42 4 50 8 C56 12 52 24 40 27 C34 28 30 26 27 25 Z"
        fill="#EA580C"
        stroke="#1F0E05"
        strokeWidth="1.2"
      />
      <path d="M42 12 C36 16 32 22 30 24" stroke="#FDE047" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="46" cy="11" r="1.5" fill="#FFFBEB" />
      <circle cx="48" cy="17" r="1.2" fill="#FFFBEB" />

      {/* Left lower wing */}
      <path
        d="M27 27 C22 28 10 32 12 42 C14 48 24 46 27 36 Z"
        fill="#D97706"
        stroke="#1F0E05"
        strokeWidth="1.2"
      />
      <circle cx="16" cy="40" r="1.2" fill="#FFFBEB" />

      {/* Right lower wing */}
      <path
        d="M27 27 C32 28 44 32 42 42 C40 48 30 46 27 36 Z"
        fill="#D97706"
        stroke="#1F0E05"
        strokeWidth="1.2"
      />
      <circle cx="38" cy="40" r="1.2" fill="#FFFBEB" />

      {/* Slender Body & Antennae */}
      <ellipse cx="27" cy="27" rx="2" ry="9" fill="#1F0E05" />
      <path d="M26 18 Q23 11 20 10" stroke="#1F0E05" strokeWidth="1" strokeLinecap="round" />
      <path d="M28 18 Q31 11 34 10" stroke="#1F0E05" strokeWidth="1" strokeLinecap="round" />
      <circle cx="20" cy="10" r="0.8" fill="#F59E0B" />
      <circle cx="34" cy="10" r="0.8" fill="#F59E0B" />
    </svg>
  );
}

/**
 * Spinning Maple Whirlybird (Helicopter Seed) SVG
 */
export function MapleSeedSvg({ className = 'w-6 h-6', color = '#D97706' }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" className={className}>
      {/* Seed Pod */}
      <ellipse cx="12" cy="12" rx="4.5" ry="3.5" fill="#78350F" stroke="#451A03" strokeWidth="1" />
      {/* Wing membrane with delicate ribs */}
      <path
        d="M14 10 C22 4 34 6 38 12 C38 18 28 22 15 14 Z"
        fill={color}
        fillOpacity="0.85"
        stroke="#78350F"
        strokeWidth="0.8"
      />
      <path d="M16 11 Q26 10 34 12" stroke="#FEF3C7" strokeWidth="0.7" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

/**
 * Multi-Variant Autumn Leaf SVG
 */
export function ThanksgivingLeafSvg({
  className = 'w-6 h-6',
  color = '#EA580C',
  variant = 'maple'
}) {
  if (variant === 'oak') {
    return (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={className}>
        <path
          d="M24 3 C28 3 30 7 28 10 C33 9 37 12 34 17 C39 17 42 21 37 25 C40 28 38 33 33 33 C31 36 27 37 25 39 L24 45 L23 39 C21 37 17 36 15 33 C10 33 8 28 11 25 C6 21 9 17 14 17 C11 12 15 9 20 10 C18 7 20 3 24 3 Z"
          fill={color}
          stroke="#451A03"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M24 9 L24 43 M24 18 L17 14 M24 23 L31 19 M24 29 L16 25 M24 32 L31 28" stroke="#FEF3C7" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      </svg>
    );
  }

  if (variant === 'ginkgo') {
    return (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={className}>
        <path
          d="M24 36 L24 45 M24 36 C12 34 6 24 9 14 C12 9 18 8 22 13 L24 17 L26 13 C30 8 36 9 39 14 C42 24 36 34 24 36 Z"
          fill={color}
          stroke="#451A03"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M24 35 L16 17 M24 35 L24 19 M24 35 L32 17" stroke="#FEF3C7" strokeWidth="0.9" opacity="0.65" strokeLinecap="round" />
      </svg>
    );
  }

  if (variant === 'acorn') {
    return (
      <svg viewBox="0 0 40 46" fill="none" aria-hidden="true" className={className}>
        <path d="M20 2 L20 8" stroke="#451A03" strokeWidth="2" strokeLinecap="round" />
        <ellipse cx="20" cy="12" rx="12" ry="5.5" fill="#78350F" stroke="#451A03" strokeWidth="1.4" />
        <path d="M12 11 L28 11 M14 9 L26 9" stroke="#9A3412" strokeWidth="0.8" />
        <path d="M10 12 C10 24 20 34 20 34 C20 34 30 24 30 12 Z" fill={color} stroke="#451A03" strokeWidth="1.4" />
        <ellipse cx="16" cy="18" rx="2" ry="4" fill="#FEF3C7" opacity="0.5" transform="rotate(-15 16 18)" />
      </svg>
    );
  }

  if (variant === 'whirlybird') {
    return <MapleSeedSvg className={className} color={color} />;
  }

  // Default: Sugar Maple
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={className}>
      <path
        d="M24 3 L28 13 L39 9 L34 19 L44 23 L33 28 L36 37 L26 34 L24 45 L22 34 L12 37 L15 28 L4 23 L14 19 L9 9 L20 13 Z"
        fill={color}
        stroke="#451A03"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M24 12 L24 44 M24 24 L15 17 M24 28 L33 20" stroke="#FEF3C7" strokeWidth="1" strokeLinecap="round" opacity="0.75" />
    </svg>
  );
}

/**
 * "Gobble" - The Adorable Wandering Harvest Turkey-Peanut Mascot Character!
 * Roams smoothly across the screen on a sine wave, holding a Mani Tub & speech bubble!
 */
export function CuteRoamingTurkey({ variant = 'primary' }) {
  const isSecondary = variant === 'secondary';

  return (
    <div
      aria-hidden="true"
      data-testid={isSecondary ? 'roaming-turkey-secondary' : 'roaming-turkey-primary'}
      className={`pointer-events-none select-none fixed z-40 ${
        isSecondary
          ? 'animate-turkey-roam-secondary opacity-80 hidden md:block'
          : 'animate-turkey-roam opacity-95'
      }`}
    >
      <div className="relative animate-turkey-waddle">
        {/* Floating Festive Speech Bubble */}
        {!isSecondary ? (
          <div className="absolute -top-7 left-12 whitespace-nowrap bg-gradient-to-r from-[#241306]/95 via-[#3A1C0C]/95 to-[#241306]/95 text-amber-200 border-2 border-amber-400 px-3 py-1 rounded-full text-[11px] font-display font-bold shadow-warm-lg flex items-center gap-1.5 backdrop-blur-md">
            <span>Gobble gobble! Give thanks for the crunch! 🦃🥜</span>
          </div>
        ) : (
          <div className="absolute -top-6 left-8 whitespace-nowrap bg-gradient-to-r from-[#241306]/95 to-[#3A1C0C]/95 text-amber-300 border border-amber-400 px-2.5 py-0.5 rounded-full text-[10px] font-display font-bold shadow-md">
            <span>Salo-Salo Season! 🍂✨</span>
          </div>
        )}

        <svg
          viewBox="0 0 130 130"
          fill="none"
          className={isSecondary ? 'w-16 h-16 drop-shadow-[0_0_18px_rgba(234,88,12,0.45)]' : 'w-22 h-22 sm:w-28 sm:h-28 drop-shadow-[0_0_24px_rgba(245,158,11,0.55)]'}
        >
          {/* Ambient Warm Golden Harvest Aura */}
          <ellipse cx="65" cy="65" rx="55" ry="50" fill="#F59E0B" fillOpacity="0.18" />

          {/* Fanned-Out Turkey Tail Feathers (Autumn Leaves plumage) */}
          <g transform="translate(10, 8)">
            {/* Rear outer feathers */}
            <path d="M55 70 L20 18 Q32 10 44 26 Z" fill="#881337" stroke="#451A03" strokeWidth="1.5" />
            <path d="M55 70 L34 8 Q48 4 56 22 Z" fill="#C2410C" stroke="#451A03" strokeWidth="1.5" />
            <path d="M55 70 L52 2 Q65 0 68 20 Z" fill="#D97706" stroke="#451A03" strokeWidth="1.5" />
            <path d="M55 70 L72 4 Q84 8 78 24 Z" fill="#F59E0B" stroke="#451A03" strokeWidth="1.5" />
            <path d="M55 70 L88 16 Q98 26 84 34 Z" fill="#EA580C" stroke="#451A03" strokeWidth="1.5" />
            <path d="M55 70 L96 34 Q100 48 86 48 Z" fill="#881337" stroke="#451A03" strokeWidth="1.5" />

            {/* Inner feather golden eye-dots */}
            <circle cx="34" cy="22" r="3.5" fill="#FDE047" stroke="#9A3412" strokeWidth="0.8" />
            <circle cx="48" cy="15" r="3.5" fill="#FDE047" stroke="#9A3412" strokeWidth="0.8" />
            <circle cx="62" cy="13" r="3.5" fill="#FDE047" stroke="#9A3412" strokeWidth="0.8" />
            <circle cx="76" cy="18" r="3.5" fill="#FDE047" stroke="#9A3412" strokeWidth="0.8" />
            <circle cx="85" cy="30" r="3.5" fill="#FDE047" stroke="#9A3412" strokeWidth="0.8" />
          </g>

          {/* Golden Roasted Peanut Body */}
          <g transform="translate(36, 32)">
            {/* Lower peanut belly */}
            <ellipse cx="28" cy="54" rx="22" ry="24" fill="#D97706" stroke="#241306" strokeWidth="2.5" />
            {/* Upper peanut head */}
            <ellipse cx="28" cy="30" rx="18" ry="19" fill="#D97706" stroke="#241306" strokeWidth="2.5" />
            {/* Peanut waist blend */}
            <path d="M12 36 Q28 42 44 36 L44 48 Q28 44 12 48 Z" fill="#D97706" />

            {/* Peanut shell roasted texture lines */}
            <path d="M20 22 Q24 28 18 34" stroke="#9A3412" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M36 22 Q32 28 38 34" stroke="#9A3412" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M18 48 Q24 56 16 64" stroke="#9A3412" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M38 48 Q32 56 40 64" stroke="#9A3412" strokeWidth="1.2" strokeLinecap="round" />

            {/* Turkey Red Wattle & Snood */}
            <path d="M28 34 C25 34 22 38 23 44 C24 49 28 49 27 43 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="1" />

            {/* Golden Turkey Beak */}
            <polygon points="26,30 32,30 29,36" fill="#F59E0B" stroke="#241306" strokeWidth="1.4" />

            {/* Friendly Cartoon Eyes with Sparkle */}
            <ellipse cx="21" cy="25" rx="3.5" ry="4.5" fill="#241306" />
            <ellipse cx="35" cy="25" rx="3.5" ry="4.5" fill="#241306" />
            <circle cx="20" cy="23.5" r="1.4" fill="#FFFFFF" />
            <circle cx="34" cy="23.5" r="1.4" fill="#FFFFFF" />

            {/* Rosy Autumn Cheeks */}
            <ellipse cx="14" cy="30" rx="3" ry="1.8" fill="#EA580C" opacity="0.7" />
            <ellipse cx="42" cy="30" rx="3" ry="1.8" fill="#EA580C" opacity="0.7" />

            {/* Pilgrim Hat atop Turkey-Peanut */}
            <g transform="translate(6, -20) rotate(-4)">
              {/* Crown */}
              <path d="M14 26 C15 12 30 8 36 12 L38 26 Z" fill="#241306" stroke="#451A03" strokeWidth="1.2" />
              {/* Hat band in warm burgundy */}
              <rect x="14" y="21" width="24" height="5" fill="#881337" />
              {/* Gold buckle */}
              <rect x="22" y="20.5" width="8" height="6" rx="1.5" fill="#FDE047" stroke="#D97706" strokeWidth="1" />
              <rect x="24" y="22" width="4" height="3" fill="#241306" />
              {/* Brim */}
              <ellipse cx="26" cy="26" rx="20" ry="3.5" fill="#1C0E05" stroke="#451A03" strokeWidth="1.2" />
              {/* Little autumn leaf tucked in hat brim */}
              <path d="M34 20 Q40 12 38 6 Q34 12 32 18 Z" fill="#F59E0B" />
            </g>

            {/* Left Wing holding a Mani Tub! */}
            <g transform="translate(-10, 42) rotate(12)">
              {/* Wing */}
              <path d="M16 4 Q4 8 2 18 Q14 20 20 12 Z" fill="#B45309" stroke="#241306" strokeWidth="1.5" />
              {/* Miniature Tub held proudly */}
              <g transform="translate(-4, 6) rotate(-15) scale(0.65)">
                {/* Tub body */}
                <rect x="4" y="8" width="22" height="18" rx="3" fill="#FEF3C7" stroke="#241306" strokeWidth="2" />
                {/* Tub lid */}
                <rect x="2" y="5" width="26" height="4" rx="2" fill="#EA580C" stroke="#241306" strokeWidth="1.8" />
                {/* Mini logo stamp */}
                <ellipse cx="15" cy="17" rx="5" ry="4" fill="#D97706" />
                <circle cx="15" cy="17" r="1.5" fill="#FEF3C7" />
              </g>
            </g>

            {/* Right Wing Waving cheerfully */}
            <g transform="translate(38, 38) rotate(-16)">
              <path d="M6 6 Q16 2 22 10 Q16 18 6 14 Z" fill="#B45309" stroke="#241306" strokeWidth="1.5" />
            </g>

            {/* Cute Little Turkey Feet */}
            <path d="M18 76 L14 84 M18 76 L18 85 M18 76 L22 84" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M38 76 L34 84 M38 76 L38 85 M38 76 L42 84" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" />
          </g>
        </svg>
      </div>
    </div>
  );
}

/**
 * "Nutty" - Secondary Roaming Harvest Chipmunk Character
 * Floats gently on an oak leaf holding a giant golden peanut with stuffed cheeks!
 */
export function CuteRoamingChipmunk() {
  return (
    <div
      aria-hidden="true"
      data-testid="roaming-chipmunk"
      className="pointer-events-none select-none fixed z-40 animate-chipmunk-roam opacity-85 hidden lg:block"
    >
      <div className="relative animate-float-slow">
        {/* Floating speech bubble */}
        <div className="absolute -top-6 left-6 whitespace-nowrap bg-[#241306]/95 text-amber-300 border border-[#F59E0B] px-2.5 py-0.5 rounded-full text-[10px] font-display font-bold shadow-md">
          <span>Papak time! 🐿️🥜</span>
        </div>

        <svg viewBox="0 0 90 90" fill="none" className="w-18 h-18 drop-shadow-[0_0_16px_rgba(217,119,6,0.5)]">
          {/* Floating Oak Leaf Base */}
          <g transform="translate(6, 42) rotate(10) scale(1.4)">
            <path
              d="M10 14 C16 10 28 8 38 14 C48 18 52 26 48 30 C40 34 26 32 14 26 Z"
              fill="#D97706"
              stroke="#451A03"
              strokeWidth="1.2"
            />
          </g>

          {/* Cute Chubby Chipmunk Body */}
          <g transform="translate(24, 18)">
            {/* Bushy tail curled up */}
            <path
              d="M10 46 C2 36 -2 18 8 10 C16 4 24 12 18 24 C14 32 18 42 22 46 Z"
              fill="#9A3412"
              stroke="#241306"
              strokeWidth="2"
            />
            {/* Tail white stripe */}
            <path d="M8 14 Q16 12 14 28" stroke="#FFFBEB" strokeWidth="1.5" strokeLinecap="round" />

            {/* Body */}
            <ellipse cx="26" cy="40" rx="16" ry="18" fill="#C2410C" stroke="#241306" strokeWidth="2" />
            {/* Head */}
            <ellipse cx="26" cy="22" rx="14" ry="13" fill="#C2410C" stroke="#241306" strokeWidth="2" />

            {/* Cute Ears */}
            <ellipse cx="16" cy="12" rx="4" ry="5" fill="#9A3412" stroke="#241306" strokeWidth="1.2" />
            <ellipse cx="16" cy="12" rx="2" ry="3" fill="#FDE68A" />
            <ellipse cx="36" cy="12" rx="4" ry="5" fill="#9A3412" stroke="#241306" strokeWidth="1.2" />
            <ellipse cx="36" cy="12" rx="2" ry="3" fill="#FDE68A" />

            {/* Stuffed Puffy Cheeks */}
            <circle cx="16" cy="26" r="6" fill="#FDE68A" stroke="#241306" strokeWidth="1.2" />
            <circle cx="36" cy="26" r="6" fill="#FDE68A" stroke="#241306" strokeWidth="1.2" />

            {/* Sparkly Eyes */}
            <circle cx="21" cy="20" r="2.5" fill="#241306" />
            <circle cx="20.5" cy="19.2" r="0.9" fill="#FFFFFF" />
            <circle cx="31" cy="20" r="2.5" fill="#241306" />
            <circle cx="30.5" cy="19.2" r="0.9" fill="#FFFFFF" />

            {/* Little Nose */}
            <polygon points="25,24 27,24 26,26" fill="#881337" />

            {/* Holding a Giant Golden Roasted Peanut */}
            <g transform="translate(18, 30)">
              <ellipse cx="8" cy="8" rx="6" ry="7" fill="#F59E0B" stroke="#451A03" strokeWidth="1.5" />
              <ellipse cx="8" cy="17" rx="6.5" ry="7.5" fill="#F59E0B" stroke="#451A03" strokeWidth="1.5" />
              <path d="M4 12 Q8 14 12 12" stroke="#451A03" strokeWidth="1.5" />
            </g>

            {/* Tiny Paws clasping peanut */}
            <circle cx="16" cy="38" r="2.5" fill="#FDE68A" stroke="#241306" strokeWidth="1" />
            <circle cx="36" cy="38" r="2.5" fill="#FDE68A" stroke="#241306" strokeWidth="1" />
          </g>
        </svg>
      </div>
    </div>
  );
}

/**
 * 22 Multi-Depth Falling Autumn Leaves, Acorns & Spinning Whirlybirds
 * Featuring staggered negative delays so the screen is immediately immersed in motion on load!
 */
const THANKSGIVING_FALLING_FOLIAGE = [
  // Tier 1: Foreground prominent leaves (sharp, vibrant, rich sway)
  { id: 1, left: '4%', delay: '-2.2s', duration: '14s', swayDuration: '4.5s', color: '#EA580C', variant: 'maple', size: 'w-7 h-7 sm:w-8 sm:h-8', opacity: 'opacity-85', mobileHidden: false },
  { id: 2, left: '16%', delay: '-9.4s', duration: '16s', swayDuration: '5.2s', color: '#D97706', variant: 'oak', size: 'w-6 h-6 sm:w-7 sm:h-7', opacity: 'opacity-80', mobileHidden: false },
  { id: 3, left: '27%', delay: '-14.1s', duration: '15s', swayDuration: '4.8s', color: '#881337', variant: 'maple', size: 'w-7 h-7', opacity: 'opacity-85', mobileHidden: true },
  { id: 4, left: '48%', delay: '-4.6s', duration: '13.5s', swayDuration: '3.8s', color: '#D97706', variant: 'whirlybird', size: 'w-6 h-6', opacity: 'opacity-90', mobileHidden: false },
  { id: 5, left: '71%', delay: '-6.3s', duration: '16.5s', swayDuration: '5.5s', color: '#F59E0B', variant: 'ginkgo', size: 'w-6 h-6 sm:w-7 sm:h-7', opacity: 'opacity-85', mobileHidden: false },
  { id: 6, left: '88%', delay: '-11.8s', duration: '15s', swayDuration: '4.6s', color: '#C2410C', variant: 'maple', size: 'w-7 h-7 sm:w-8 sm:h-8', opacity: 'opacity-80', mobileHidden: false },

  // Tier 2: Mid-ground tumbling foliage & acorns
  { id: 7, left: '9%', delay: '-7.1s', duration: '18s', swayDuration: '5.6s', color: '#F59E0B', variant: 'acorn', size: 'w-5 h-5', opacity: 'opacity-75', mobileHidden: true },
  { id: 8, left: '22%', delay: '-1.5s', duration: '17.5s', swayDuration: '5.0s', color: '#FBBF24', variant: 'ginkgo', size: 'w-5 h-5', opacity: 'opacity-75', mobileHidden: false },
  { id: 9, left: '35%', delay: '-13.2s', duration: '19s', swayDuration: '5.8s', color: '#EA580C', variant: 'oak', size: 'w-5 h-5', opacity: 'opacity-70', mobileHidden: false },
  { id: 10, left: '42%', delay: '-5.7s', duration: '17s', swayDuration: '4.9s', color: '#881337', variant: 'maple', size: 'w-5 h-5 sm:w-6 sm:h-6', opacity: 'opacity-75', mobileHidden: true },
  { id: 11, left: '58%', delay: '-15.9s', duration: '18.5s', swayDuration: '5.3s', color: '#C2410C', variant: 'whirlybird', size: 'w-5 h-5', opacity: 'opacity-80', mobileHidden: false },
  { id: 12, left: '65%', delay: '-8.8s', duration: '18s', swayDuration: '5.1s', color: '#D97706', variant: 'acorn', size: 'w-5 h-5', opacity: 'opacity-70', mobileHidden: false },
  { id: 13, left: '79%', delay: '-3.7s', duration: '19.5s', swayDuration: '6.0s', color: '#EA580C', variant: 'oak', size: 'w-5 h-5', opacity: 'opacity-75', mobileHidden: true },
  { id: 14, left: '94%', delay: '-12.0s', duration: '17.5s', swayDuration: '4.7s', color: '#881337', variant: 'maple', size: 'w-5 h-5 sm:w-6 sm:h-6', opacity: 'opacity-75', mobileHidden: false },

  // Tier 3: Ambient background drifting particles (soft, atmospheric depth)
  { id: 15, left: '2%', delay: '-16.2s', duration: '22s', swayDuration: '6.5s', color: '#F59E0B', variant: 'maple', size: 'w-4 h-4', opacity: 'opacity-50', mobileHidden: true },
  { id: 16, left: '13%', delay: '-8.5s', duration: '21s', swayDuration: '6.2s', color: '#EA580C', variant: 'ginkgo', size: 'w-4 h-4', opacity: 'opacity-50', mobileHidden: false },
  { id: 17, left: '31%', delay: '-18.1s', duration: '23s', swayDuration: '6.8s', color: '#D97706', variant: 'oak', size: 'w-4 h-4', opacity: 'opacity-45', mobileHidden: true },
  { id: 18, left: '53%', delay: '-10.0s', duration: '20.5s', swayDuration: '6.0s', color: '#881337', variant: 'maple', size: 'w-4 h-4', opacity: 'opacity-50', mobileHidden: false },
  { id: 19, left: '62%', delay: '-2.8s', duration: '22.5s', swayDuration: '6.4s', color: '#FBBF24', variant: 'whirlybird', size: 'w-4 h-4', opacity: 'opacity-55', mobileHidden: true },
  { id: 20, left: '76%', delay: '-14.6s', duration: '21.5s', swayDuration: '6.3s', color: '#C2410C', variant: 'ginkgo', size: 'w-4 h-4', opacity: 'opacity-50', mobileHidden: false },
  { id: 21, left: '84%', delay: '-6.9s', duration: '23s', swayDuration: '6.6s', color: '#F59E0B', variant: 'oak', size: 'w-4 h-4', opacity: 'opacity-45', mobileHidden: true },
  { id: 22, left: '97%', delay: '-17.4s', duration: '20s', swayDuration: '5.9s', color: '#EA580C', variant: 'maple', size: 'w-4 h-4', opacity: 'opacity-50', mobileHidden: true }
];

/**
 * Migrating Wild Geese Formations in the Upper Sky
 */
const MIGRATING_GEESE_FLOCKS = [
  { id: 'geese-1', top: '7%', delay: '0s', duration: '26s', direction: 'ltr', count: 5 },
  { id: 'geese-2', top: '15%', delay: '12s', duration: '32s', direction: 'rtl', count: 4 },
  { id: 'geese-3', top: '22%', delay: '8s', duration: '28s', direction: 'ltr', count: 3 }
];

/**
 * Fluttering Golden Monarch Butterflies
 */
const HARVEST_BUTTERFLIES = [
  { id: 'bf-1', top: '28%', left: '8%', delay: '0s', duration: '18s', size: 'w-8 h-8' },
  { id: 'bf-2', top: '48%', left: '85%', delay: '5s', duration: '22s', size: 'w-7 h-7' },
  { id: 'bf-3', top: '68%', left: '18%', delay: '10s', duration: '20s', size: 'w-8 h-8' }
];

export default function ThanksgivingAtmosphere() {
  return (
    <>
      {/* 1. Anchored Top Corner Cornucopia Foliage Garlands */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute top-14 sm:top-16 inset-x-0 h-64 overflow-hidden z-[5]"
      >
        <ThanksgivingCornerGarland position="left" className="scale-110" />
        <ThanksgivingCornerGarland position="right" className="scale-110" />
      </div>

      {/* 2. Atmospheric Sky & Particle System (z-[1], non-interactive, fluid depth) */}
      <div
        id="thanksgiving-leaves-container"
        aria-hidden="true"
        data-testid="thanksgiving-atmosphere"
        className="pointer-events-none select-none fixed inset-0 overflow-hidden z-[1]"
      >
        {/* Migrating Wild Geese in V-Formation across Autumn Sky */}
        {MIGRATING_GEESE_FLOCKS.map((flock) => (
          <div
            key={flock.id}
            style={{
              top: flock.top,
              animationDelay: flock.delay,
              animationDuration: flock.duration
            }}
            className={`fixed ${
              flock.direction === 'rtl' ? 'animate-geese-fly-rtl' : 'animate-geese-fly-ltr'
            } opacity-75 drop-shadow-[0_2px_8px_rgba(234,88,12,0.35)]`}
          >
            {/* V-Formation Geese Cluster */}
            <div className="relative flex items-center">
              {/* Lead Goose */}
              <div className="animate-geese-flap">
                <WildGooseSvg className="w-10 h-6 sm:w-12 sm:h-7" />
              </div>
              {/* Wingman Top */}
              <div className="absolute -top-3 left-6 animate-geese-flap" style={{ animationDelay: '0.12s' }}>
                <WildGooseSvg className="w-8 h-5 sm:w-10 sm:h-6" />
              </div>
              {/* Wingman Bottom */}
              <div className="absolute -bottom-3 left-6 animate-geese-flap" style={{ animationDelay: '0.24s' }}>
                <WildGooseSvg className="w-8 h-5 sm:w-10 sm:h-6" />
              </div>
              {/* Trailing Goose 1 */}
              <div className="absolute -top-6 left-12 animate-geese-flap" style={{ animationDelay: '0.36s' }}>
                <WildGooseSvg className="w-7 h-4 sm:w-9 sm:h-5" />
              </div>
              {/* Trailing Goose 2 */}
              <div className="absolute -bottom-6 left-12 animate-geese-flap" style={{ animationDelay: '0.48s' }}>
                <WildGooseSvg className="w-7 h-4 sm:w-9 sm:h-5" />
              </div>
            </div>
          </div>
        ))}

        {/* Fluttering Golden Harvest Butterflies */}
        {HARVEST_BUTTERFLIES.map((bf) => (
          <div
            key={bf.id}
            style={{
              top: bf.top,
              left: bf.left,
              animationDelay: bf.delay,
              animationDuration: bf.duration
            }}
            className="fixed animate-float-slow drop-shadow-[0_2px_12px_rgba(245,158,11,0.5)]"
          >
            <div className="animate-butterfly-flutter">
              <HarvestButterflySvg className={bf.size} />
            </div>
          </div>
        ))}

        {/* 22 Multi-Depth Falling Leaves, Acorns & Whirlybirds */}
        {THANKSGIVING_FALLING_FOLIAGE.map((item) => (
          <div
            key={item.id}
            style={{
              left: item.left,
              animationDelay: item.delay,
              animationDuration: item.duration
            }}
            className={`fixed -top-14 animate-leaf-fall ${item.opacity} ${
              item.mobileHidden ? 'hidden sm:block' : ''
            }`}
          >
            <div
              style={{ animationDuration: item.swayDuration }}
              className={
                item.variant === 'whirlybird'
                  ? 'animate-whirlybird-spin'
                  : 'animate-leaf-sway'
              }
            >
              <ThanksgivingLeafSvg
                className={item.size}
                color={item.color}
                variant={item.variant}
              />
            </div>
          </div>
        ))}

        {/* Golden Harvest Sunlight Shimmer Specks */}
        {[
          { left: '12%', top: '22%', delay: '0s', size: 'w-2 h-2' },
          { left: '38%', top: '42%', delay: '1.5s', size: 'w-2.5 h-2.5' },
          { left: '68%', top: '28%', delay: '3.0s', size: 'w-2 h-2' },
          { left: '84%', top: '62%', delay: '2.0s', size: 'w-3 h-3' }
        ].map((spark, i) => (
          <div
            key={`harvest-spark-${i}`}
            style={{
              left: spark.left,
              top: spark.top,
              animationDelay: spark.delay,
              animationDuration: '4s'
            }}
            className="fixed animate-pulse pointer-events-none select-none"
          >
            <div className={`${spark.size} rounded-full bg-[#FDE047] blur-[1px] shadow-[0_0_8px_#F59E0B] opacity-70`} />
          </div>
        ))}
      </div>

      {/* 3. Theatrical Roaming Mascot Characters */}
      <CuteRoamingTurkey variant="primary" />
      <CuteRoamingTurkey variant="secondary" />
      <CuteRoamingChipmunk />
    </>
  );
}
