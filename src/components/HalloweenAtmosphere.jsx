import React from 'react';

/**
 * Sharp, angular, webbed-wing Bat SVG Silhouette (strictly no rounded butterfly shapes)
 */
export function SharpBatSvg({ className = 'w-12 h-7' }) {
  return (
    <svg
      viewBox="0 0 120 64"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      {/* Sharp pointed bat ears, head, angular wing tips, and scalloped webbed bottom edge */}
      <path d="M60 22 L55 8 L51 20 L46 18 L24 4 L2 16 L17 25 L6 38 L25 32 L36 44 L48 35 L55 46 L60 40 L65 46 L72 35 L84 44 L95 32 L114 38 L103 25 L118 16 L96 4 L74 18 L69 20 L65 8 Z" />
      {/* Glowing tiny eyes */}
      <circle cx="56" cy="23" r="1.6" fill="#FF6B00" />
      <circle cx="64" cy="23" r="1.6" fill="#FF6B00" />
    </svg>
  );
}

/**
 * Autumn Maple / Oak Leaf SVG
 */
export function AutumnLeafSvg({ className = 'w-6 h-6', color = '#FF6B00' }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M24 3 L28 13 L39 9 L34 19 L44 23 L33 28 L36 37 L26 34 L24 45 L22 34 L12 37 L15 28 L4 23 L14 19 L9 9 L20 13 Z"
        fill={color}
        stroke="#1F1025"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M24 12 L24 44 M24 24 L15 17 M24 28 L33 20"
        stroke="#1F1025"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Playful Friendly Skeleton Character Illustration
 */
export function PlayfulSkeletonSvg({ className = 'w-16 h-20' }) {
  return (
    <svg
      viewBox="0 0 96 120"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Warm Pumpkin Aura */}
      <circle cx="48" cy="58" r="40" fill="#FF6B00" fillOpacity="0.14" />
      {/* Skull cranium */}
      <path
        d="M26 34 C26 17 70 17 70 34 C70 43 65 48 61 51 L61 59 C61 62 58 64 55 64 L41 64 C38 64 35 62 35 59 L35 51 C31 48 26 43 26 34 Z"
        fill="#FFFDF7"
        stroke="#1F1025"
        strokeWidth="3"
      />
      {/* Spooky-cute eye sockets */}
      <circle cx="39" cy="36" r="6" fill="#1F1025" />
      <circle cx="57" cy="36" r="6" fill="#1F1025" />
      <circle cx="40.5" cy="34.5" r="2" fill="#FF6B00" />
      <circle cx="58.5" cy="34.5" r="2" fill="#FF6B00" />
      {/* Nose cavity */}
      <path d="M48 42 L45 48 L51 48 Z" fill="#1F1025" />
      {/* Friendly stitched grin */}
      <path d="M39 55 L57 55" stroke="#1F1025" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M43 52 L43 58 M48 52 L48 58 M53 52 L53 58" stroke="#1F1025" strokeWidth="2" strokeLinecap="round" />
      {/* Spine & Ribcage */}
      <path d="M48 64 L48 98" stroke="#FFFDF7" strokeWidth="4" strokeLinecap="round" />
      <path d="M34 72 Q48 77 62 72" stroke="#FFFDF7" strokeWidth="4" strokeLinecap="round" />
      <path d="M36 81 Q48 86 60 81" stroke="#FFFDF7" strokeWidth="4" strokeLinecap="round" />
      <path d="M39 90 Q48 94 57 90" stroke="#FFFDF7" strokeWidth="3.5" strokeLinecap="round" />
      {/* Waving Bony Arms */}
      <path d="M34 72 L20 60 L15 48" stroke="#FFFDF7" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M62 72 L76 62 L82 50" stroke="#FFFDF7" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Mini glowing peanut held by skeleton */}
      <ellipse cx="14" cy="44" rx="5" ry="7" transform="rotate(-20 14 44)" fill="#F59E0B" stroke="#1F1025" strokeWidth="2" />
      {/* Pelvis */}
      <path d="M38 99 C38 95 58 95 58 99 C58 104 52 106 48 106 C44 106 38 104 38 99 Z" fill="#FFFDF7" stroke="#1F1025" strokeWidth="2.5" />
    </svg>
  );
}

/**
 * Playful Wrapped Mummy Character Illustration
 */
export function PlayfulMummySvg({ className = 'w-16 h-20' }) {
  return (
    <svg
      viewBox="0 0 96 120"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Soft Golden Glow */}
      <circle cx="48" cy="58" r="40" fill="#F59E0B" fillOpacity="0.14" />
      {/* Mummy Head */}
      <circle cx="48" cy="38" r="22" fill="#F5EBD6" stroke="#1F1025" strokeWidth="3" />
      {/* Dark peek-slot for glowing eyes */}
      <rect x="31" y="30" width="34" height="12" rx="6" fill="#1F1025" />
      {/* Glowing Golden Eyes */}
      <circle cx="41" cy="36" r="3.5" fill="#FF6B00" />
      <circle cx="55" cy="36" r="3.5" fill="#FF6B00" />
      <circle cx="42" cy="35" r="1.2" fill="#FEF08A" />
      <circle cx="56" cy="35" r="1.2" fill="#FEF08A" />
      {/* Bandage wrap lines across head */}
      <path d="M27 28 L68 22 M26 45 L69 49 M32 53 L65 43 M34 20 L62 28" stroke="#D6C5A3" strokeWidth="2.5" strokeLinecap="round" />
      {/* Mummy Torso wrapped in bandages */}
      <rect x="32" y="59" width="32" height="42" rx="12" fill="#F5EBD6" stroke="#1F1025" strokeWidth="3" />
      <path d="M33 68 L63 73 M33 79 L63 74 M33 88 L63 93" stroke="#D6C5A3" strokeWidth="2.5" strokeLinecap="round" />
      {/* Cute trailing bandage strip */}
      <path d="M64 74 Q78 78 75 92 Q73 100 82 103" stroke="#F5EBD6" strokeWidth="4" strokeLinecap="round" />
      {/* Friendly Arms */}
      <path d="M32 66 L18 76" stroke="#F5EBD6" strokeWidth="6" strokeLinecap="round" />
      <path d="M64 66 L78 56" stroke="#F5EBD6" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Corner Cobweb + Crawling/Dangling Spider SVG
 */
function CornerWebWithSpider({ position = 'left' }) {
  const isRight = position === 'right';
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none fixed top-14 ${
        isRight ? 'right-0 scale-x-[-1]' : 'left-0'
      } z-20 w-28 h-28 sm:w-40 sm:h-40 opacity-65`}
    >
      <svg viewBox="0 0 160 160" fill="none" className="w-full h-full">
        {/* Radial cobweb strands */}
        <path
          d="M0 0 L150 20 M0 0 L135 70 M0 0 L105 115 M0 0 L65 145 M0 0 L20 155"
          stroke="#F59E0B"
          strokeOpacity="0.45"
          strokeWidth="1.5"
        />
        {/* Curved concentric web rings */}
        <path
          d="M40 6 Q38 22 28 30 Q18 38 6 42"
          stroke="#F59E0B"
          strokeOpacity="0.4"
          strokeWidth="1.3"
          fill="none"
        />
        <path
          d="M78 11 Q72 38 55 58 Q36 76 10 82"
          stroke="#F59E0B"
          strokeOpacity="0.4"
          strokeWidth="1.3"
          fill="none"
        />
        <path
          d="M116 16 Q105 56 80 86 Q50 112 15 120"
          stroke="#F59E0B"
          strokeOpacity="0.35"
          strokeWidth="1.3"
          fill="none"
        />
      </svg>

      {/* Dangling Spider on Silk Thread */}
      <div
        className={`absolute ${
          isRight ? 'left-10 top-6' : 'left-8 top-8'
        } animate-spider-bob`}
      >
        <svg viewBox="0 0 40 80" fill="none" className="w-8 h-16">
          {/* Silk thread */}
          <line x1="20" y1="0" x2="20" y2="48" stroke="#FBBF24" strokeOpacity="0.55" strokeWidth="1.2" />
          {/* Spider body */}
          <circle cx="20" cy="54" r="6.5" fill="#1F1025" stroke="#FF6B00" strokeWidth="1.5" />
          <circle cx="20" cy="46" r="4" fill="#1F1025" stroke="#FF6B00" strokeWidth="1.2" />
          {/* 8 angular spider legs */}
          <path
            d="M14 50 L6 45 L3 50 M13 53 L5 52 L2 57 M14 56 L6 59 L4 64 M15 59 L9 64 L7 69"
            stroke="#FF6B00"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M26 50 L34 45 L37 50 M27 53 L35 52 L38 57 M26 56 L34 59 L36 64 M25 59 L31 64 L33 69"
            stroke="#FF6B00"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Tiny glowing spider eyes */}
          <circle cx="18.5" cy="45.5" r="1" fill="#FF6B00" />
          <circle cx="21.5" cy="45.5" r="1" fill="#FF6B00" />
        </svg>
      </div>
    </div>
  );
}

/**
 * Cute Animated Ghost Character that roams fluidly across the page
 */
function CuteRoamingGhost({ variant = 'primary' }) {
  const isSecondary = variant === 'secondary';
  return (
    <div
      aria-hidden="true"
      data-testid={isSecondary ? 'roaming-ghost-secondary' : 'roaming-ghost-primary'}
      className={`pointer-events-none select-none fixed z-40 ${
        isSecondary
          ? 'animate-ghost-roam-secondary opacity-75 hidden md:block'
          : 'animate-ghost-roam opacity-90'
      }`}
    >
      <div className="relative animate-float-slow">
        {/* Cute speech bubble on primary ghost */}
        {!isSecondary && (
          <div className="absolute -top-6 left-10 whitespace-nowrap bg-[#1F1025]/95 text-amber-300 border border-[#FF6B00] px-2.5 py-0.5 rounded-full text-[10px] font-display font-bold shadow-md">
            Boo! Trick or Crunch! 👻🥜
          </div>
        )}

        <svg
          viewBox="0 0 110 120"
          fill="none"
          className={isSecondary ? 'w-14 h-16 drop-shadow-[0_0_14px_rgba(255,107,0,0.45)]' : 'w-20 h-22 sm:w-24 sm:h-26 drop-shadow-[0_0_20px_rgba(255,107,0,0.55)]'}
        >
          {/* Outer spectral glow */}
          <ellipse cx="55" cy="58" rx="42" ry="46" fill="#FF6B00" fillOpacity="0.15" />

          {/* Ghost sheet body with wavy bottom */}
          <path
            d="M25 52 C25 26 85 26 85 52 L88 94 C88 98 83 100 79 96 C75 92 70 92 67 97 C63 102 57 102 53 97 C49 92 44 92 40 97 C36 102 30 100 26 95 L22 92 Z"
            fill="#FFFDF7"
            stroke="#1F1025"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Soft inner shading */}
          <path
            d="M32 86 C38 80 45 88 52 84 C60 80 68 88 78 83"
            stroke="#E2E8F0"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Cute Ghost Arms */}
          <path
            d="M26 58 C14 54 11 64 20 69"
            fill="#FFFDF7"
            stroke="#1F1025"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M84 58 C96 52 99 63 89 68"
            fill="#FFFDF7"
            stroke="#1F1025"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Expressive Cute Eyes */}
          <ellipse cx="45" cy="49" rx="4.5" ry="6" fill="#1F1025" />
          <ellipse cx="65" cy="49" rx="4.5" ry="6" fill="#1F1025" />
          <circle cx="43.5" cy="47" r="1.7" fill="#FFFFFF" />
          <circle cx="63.5" cy="47" r="1.7" fill="#FFFFFF" />

          {/* Rosy Pumpkin-Orange Cheeks */}
          <ellipse cx="36" cy="55" rx="4" ry="2.2" fill="#FF6B00" fillOpacity="0.55" />
          <ellipse cx="74" cy="55" rx="4" ry="2.2" fill="#FF6B00" fillOpacity="0.55" />

          {/* Happy Spooky Mouth */}
          <path
            d="M50 56 Q55 63 60 56"
            stroke="#1F1025"
            strokeWidth="2.8"
            strokeLinecap="round"
            fill="none"
          />

          {/* Mini Jack-o'-Lantern Peanut Tub held by Ghost */}
          <g transform="translate(72, 62)">
            <ellipse cx="14" cy="14" rx="11" ry="9" fill="#FF6B00" stroke="#1F1025" strokeWidth="2.2" />
            <path d="M6 7 Q14 -2 22 7" stroke="#FBBF24" strokeWidth="2" fill="none" />
            <polygon points="10,12 12,9 13,12" fill="#FEF08A" />
            <polygon points="16,12 18,9 19,12" fill="#FEF08A" />
            <path d="M10 16 Q14 19 18 16" stroke="#FEF08A" strokeWidth="1.6" strokeLinecap="round" />
          </g>
        </svg>
      </div>
    </div>
  );
}

const FALLING_LEAVES = [
  { id: 1, left: '6%', delay: '0s', duration: '15s', color: '#FF6B00', size: 'w-5 h-5' },
  { id: 2, left: '19%', delay: '3.5s', duration: '18s', color: '#F59E0B', size: 'w-6 h-6' },
  { id: 3, left: '34%', delay: '7s', duration: '16s', color: '#EA580C', size: 'w-4 h-4' },
  { id: 4, left: '52%', delay: '1.8s', duration: '19s', color: '#FBBF24', size: 'w-5 h-5' },
  { id: 5, left: '68%', delay: '5.2s', duration: '17s', color: '#DC2626', size: 'w-6 h-6' },
  { id: 6, left: '83%', delay: '2.4s', duration: '16s', color: '#FF6B00', size: 'w-5 h-5' },
  { id: 7, left: '93%', delay: '8.5s', duration: '20s', color: '#F59E0B', size: 'w-4 h-4' }
];

const FLYING_BATS = [
  { id: 'bat-1', top: '8%', delay: '0s', duration: '22s', size: 'w-12 h-7 sm:w-14 sm:h-8', direction: 'ltr' },
  { id: 'bat-2', top: '16%', delay: '6s', duration: '26s', size: 'w-9 h-5 sm:w-11 sm:h-6', direction: 'rtl' },
  { id: 'bat-3', top: '24%', delay: '12s', duration: '24s', size: 'w-10 h-6 sm:w-12 sm:h-7', direction: 'ltr' }
];

export default function HalloweenAtmosphere() {
  return (
    <div
      aria-hidden="true"
      data-testid="halloween-atmosphere"
      className="pointer-events-none select-none fixed inset-0 overflow-hidden z-30"
    >
      {/* 1. Corner Cobwebs & Crawling/Dangling Spiders */}
      <CornerWebWithSpider position="left" />
      <CornerWebWithSpider position="right" />

      {/* 2. Sharp, Webbed-Wing Flying Bats across Upper Background */}
      {FLYING_BATS.map((bat) => (
        <div
          key={bat.id}
          data-testid={bat.id}
          style={{
            top: bat.top,
            animationDelay: bat.delay,
            animationDuration: bat.duration
          }}
          className={`fixed ${
            bat.direction === 'rtl' ? 'animate-bat-fly-rtl' : 'animate-bat-fly-ltr'
          } text-[#120717] drop-shadow-[0_0_8px_rgba(255,107,0,0.45)] opacity-85`}
        >
          <div className="animate-bat-flap">
            <SharpBatSvg className={bat.size} />
          </div>
        </div>
      ))}

      {/* 3. Drifting Autumn Leaves */}
      {FALLING_LEAVES.map((leaf) => (
        <div
          key={leaf.id}
          style={{
            left: leaf.left,
            animationDelay: leaf.delay,
            animationDuration: leaf.duration
          }}
          className="fixed -top-10 animate-leaf-fall opacity-75"
        >
          <div className="animate-leaf-sway">
            <AutumnLeafSvg className={leaf.size} color={leaf.color} />
          </div>
        </div>
      ))}

      {/* 4. Ambient Side Skeleton & Mummy Peekers on Large Screens */}
      <div className="hidden xl:block fixed bottom-8 left-3 opacity-85 animate-float-slow">
        <PlayfulSkeletonSvg className="w-16 h-20 drop-shadow-[0_0_12px_rgba(255,107,0,0.35)]" />
      </div>
      <div className="hidden xl:block fixed bottom-8 right-3 opacity-85 animate-float-reverse">
        <PlayfulMummySvg className="w-16 h-20 drop-shadow-[0_0_12px_rgba(245,158,11,0.35)]" />
      </div>

      {/* 5. Prominent, Friendly Roaming Ghost Character */}
      <CuteRoamingGhost variant="primary" />
      <CuteRoamingGhost variant="secondary" />
    </div>
  );
}
