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
 * Multi-Shape Autumn Leaf SVG (Maple, Oak, Birch, Ginkgo)
 */
export function AutumnLeafSvg({
  className = 'w-6 h-6',
  color = '#FF6B00',
  accent = '#FBBF24',
  variant = 'maple'
}) {
  if (variant === 'oak') {
    return (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={className}>
        <path
          d="M24 3 C28 3 30 7 28 10 C33 9 37 12 34 17 C39 17 42 21 37 25 C40 28 38 33 33 33 C31 36 27 37 25 39 L24 45 L23 39 C21 37 17 36 15 33 C10 33 8 28 11 25 C6 21 9 17 14 17 C11 12 15 9 20 10 C18 7 20 3 24 3 Z"
          fill={color}
          stroke="#1F1025"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M24 9 L24 43 M24 18 L17 14 M24 23 L31 19 M24 29 L16 25 M24 32 L31 28"
          stroke="#1F1025"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (variant === 'birch') {
    return (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={className}>
        <path
          d="M24 4 C33 11 39 20 37 29 C35 36 29 39 25 40 L24 45 L23 40 C19 39 13 36 11 29 C9 20 15 11 24 4 Z"
          fill={color}
          stroke="#1F1025"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M24 9 C29 15 32 22 31 29"
          stroke={accent}
          strokeOpacity="0.55"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M24 10 L24 44 M24 20 L16 15 M24 25 L32 20 M24 31 L17 27"
          stroke="#1F1025"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (variant === 'ginkgo') {
    return (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={className}>
        <path
          d="M24 36 L24 45 M24 36 C12 34 6 24 9 14 C12 9 18 8 22 13 L24 17 L26 13 C30 8 36 9 39 14 C42 24 36 34 24 36 Z"
          fill={color}
          stroke="#1F1025"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M24 35 L16 17 M24 35 L24 19 M24 35 L32 17"
          stroke="#1F1025"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // Default: Classic Multi-Pointed Maple Leaf
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={className}>
      <path
        d="M24 3 L28 13 L39 9 L34 19 L44 23 L33 28 L36 37 L26 34 L24 45 L22 34 L12 37 L15 28 L4 23 L14 19 L9 9 L20 13 Z"
        fill={color}
        stroke="#1F1025"
        strokeWidth="1.6"
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
 * Redesigned Polished Cartoon Skeleton Character Illustration
 * Matches the Mani Wandering mascot aesthetic: bold #1F1025 outlines, dimensional bone shading,
 * expressive glowing eyes, dapper trick-or-treat bowtie, waving hand, and holding a golden roasted peanut.
 */
export function PlayfulSkeletonSvg({ className = 'w-24 h-28' }) {
  return (
    <svg
      viewBox="0 0 180 200"
      fill="none"
      aria-hidden="true"
      className={`animate-float-slow ${className}`}
    >
      {/* Warm Pumpkin Backlight Aura */}
      <ellipse cx="92" cy="102" rx="68" ry="74" fill="#FF6B00" fillOpacity="0.14" />
      <ellipse cx="92" cy="178" rx="44" ry="8" fill="#120717" fillOpacity="0.45" />

      {/* Waving Left Arm (Viewer's Left) with smooth wave animation */}
      <g className="animate-skeleton-wave">
        {/* Upper Humerus Bone */}
        <path
          d="M60 116 L36 96 L26 70"
          stroke="#1F1025"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M60 116 L36 96 L26 70"
          stroke="#FFFDF7"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Cute Cartoon Bony Hand Waving */}
        <circle cx="25" cy="66" r="8" fill="#FFFDF7" stroke="#1F1025" strokeWidth="3" />
        <path
          d="M19 61 L14 50 M24 58 L22 46 M30 60 L31 48 M33 65 L39 58"
          stroke="#1F1025"
          strokeWidth="5.5"
          strokeLinecap="round"
        />
        <path
          d="M19 61 L14 50 M24 58 L22 46 M30 60 L31 48 M33 65 L39 58"
          stroke="#FFFDF7"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
      </g>

      {/* Spine Column */}
      <path d="M90 102 L90 156" stroke="#1F1025" strokeWidth="13" strokeLinecap="round" />
      <path d="M90 102 L90 156" stroke="#E5DDF5" strokeWidth="7" strokeLinecap="round" />

      {/* Sculpted Cartoon Ribcage */}
      <g>
        {/* Top Rib */}
        <path
          d="M64 115 C74 123 106 123 116 115"
          stroke="#1F1025"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M64 115 C74 123 106 123 116 115"
          stroke="#FFFDF7"
          strokeWidth="6.5"
          strokeLinecap="round"
        />
        {/* Middle Rib */}
        <path
          d="M68 129 C77 136 103 136 112 129"
          stroke="#1F1025"
          strokeWidth="11.5"
          strokeLinecap="round"
        />
        <path
          d="M68 129 C77 136 103 136 112 129"
          stroke="#FFFDF7"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Lower Rib */}
        <path
          d="M73 142 C81 147 99 147 107 142"
          stroke="#1F1025"
          strokeWidth="10.5"
          strokeLinecap="round"
        />
        <path
          d="M73 142 C81 147 99 147 107 142"
          stroke="#FFFDF7"
          strokeWidth="5.5"
          strokeLinecap="round"
        />
        {/* Sternum Center Highlight */}
        <path d="M90 112 L90 140" stroke="#FFFDF7" strokeWidth="5" strokeLinecap="round" />
      </g>

      {/* Pelvis & Cute Legs */}
      <path
        d="M71 154 C71 148 109 148 109 154 C111 163 101 167 90 165 C79 167 69 163 71 154 Z"
        fill="#FFFDF7"
        stroke="#1F1025"
        strokeWidth="3.2"
      />
      <circle cx="79" cy="157" r="3" fill="#1F1025" />
      <circle cx="101" cy="157" r="3" fill="#1F1025" />
      {/* Bony Legs */}
      <path d="M80 164 L77 176 M100 164 L103 176" stroke="#1F1025" strokeWidth="10" strokeLinecap="round" />
      <path d="M80 164 L77 176 M100 164 L103 176" stroke="#FFFDF7" strokeWidth="5" strokeLinecap="round" />

      {/* Right Arm (Viewer's Right) Holding a Golden Roasted Peanut */}
      <g>
        <path
          d="M118 116 L140 106 L148 88"
          stroke="#1F1025"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M118 116 L140 106 L148 88"
          stroke="#FFFDF7"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Golden Roasted Mani Peanut Held Up */}
        <g transform="translate(136, 56) rotate(14)">
          <path
            d="M14 4 C21 4 24 10 21 16 C20 18 20 20 22 23 C25 29 20 36 13 36 C6 36 3 29 6 23 C8 20 8 18 7 16 C4 10 7 4 14 4 Z"
            fill="#F59E0B"
            stroke="#1F1025"
            strokeWidth="3"
          />
          <path
            d="M11 9 C14 14 14 25 11 31 M17 9 C15 15 15 25 17 31"
            stroke="#B45309"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="11" cy="11" r="2" fill="#FEF08A" />
        </g>
        <circle cx="149" cy="86" r="6.5" fill="#FFFDF7" stroke="#1F1025" strokeWidth="3" />
      </g>

      {/* Festive Spooky Bowtie at Neck */}
      <g transform="translate(90, 104)">
        <path
          d="M-18 -8 L-2 -2 L-18 8 C-21 4 -21 -4 -18 -8 Z M18 -8 L2 -2 L18 8 C21 4 21 -4 18 -8 Z"
          fill="#FF6B00"
          stroke="#1F1025"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
        <circle cx="0" cy="0" r="5" fill="#FBBF24" stroke="#1F1025" strokeWidth="2.6" />
      </g>

      {/* Sculpted Cartoon Skull Head with Subtle Tilt */}
      <g className="animate-head-tilt">
        {/* Skull Base Shadow & Ivory Cranium */}
        <path
          d="M46 56 C46 24 134 24 134 56 C134 69 127 78 117 83 L115 94 C115 99 109 102 102 102 L78 102 C71 102 65 99 65 94 L63 83 C53 78 46 69 46 56 Z"
          fill="#FFFDF7"
          stroke="#1F1025"
          strokeWidth="3.8"
          strokeLinejoin="round"
        />
        {/* Subtle Lavender-Bone Inner Shading along Left/Bottom */}
        <path
          d="M52 58 C52 70 59 76 67 80 L69 93 C74 96 82 97 90 97"
          stroke="#E5DDF5"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* Forehead Crown Highlight */}
        <path
          d="M66 37 C78 31 102 31 114 37"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Friendly Arched Brow Ridges */}
        <path d="M62 47 Q73 42 82 47" stroke="#1F1025" strokeWidth="2.8" strokeLinecap="round" />
        <path d="M98 47 Q107 42 118 47" stroke="#1F1025" strokeWidth="2.8" strokeLinecap="round" />

        {/* Expressive Eye Sockets with Warm Glowing Pupils & Catchlights */}
        <ellipse cx="73" cy="60" rx="11.5" ry="12.5" fill="#1F1025" />
        <ellipse cx="107" cy="60" rx="11.5" ry="12.5" fill="#1F1025" />
        <circle cx="74" cy="60" r="5.5" fill="#FF6B00" />
        <circle cx="108" cy="60" r="5.5" fill="#FF6B00" />
        <circle cx="71" cy="56.5" r="2.6" fill="#FFFFFF" />
        <circle cx="105" cy="56.5" r="2.6" fill="#FFFFFF" />
        <circle cx="77" cy="63" r="1.3" fill="#FEF08A" />
        <circle cx="111" cy="63" r="1.3" fill="#FEF08A" />

        {/* Cute Rosy Pumpkin Cheeks */}
        <ellipse cx="57" cy="70" rx="5.5" ry="3.2" fill="#FF6B00" fillOpacity="0.48" />
        <ellipse cx="123" cy="70" rx="5.5" ry="3.2" fill="#FF6B00" fillOpacity="0.48" />

        {/* Cute Upside-Down Heart Nose Cavity */}
        <path
          d="M90 67 L85 75 C85 77 88 78 90 76 C92 78 95 77 95 75 Z"
          fill="#1F1025"
        />

        {/* Cheerful Stitched Cartoon Grin */}
        <path
          d="M72 85 Q90 94 108 85"
          stroke="#1F1025"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M79 84 L79 91 M86 86 L86 93 M94 86 L94 93 M101 84 L101 91"
          stroke="#1F1025"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

/**
 * Redesigned Polished Wrapped Mummy Character Illustration
 * Cute, friendly Halloween mummy with layered linen bandage wraps, glowing expressive eyes,
 * fluttering bandage ribbon, and hugging a glowing Mani Wandering peanut tub.
 */
export function PlayfulMummySvg({ className = 'w-24 h-28' }) {
  return (
    <svg
      viewBox="0 0 180 200"
      fill="none"
      aria-hidden="true"
      className={`animate-mummy-sway ${className}`}
    >
      {/* Soft Golden Moonlight Aura & Ground Shadow */}
      <ellipse cx="90" cy="102" rx="68" ry="74" fill="#F59E0B" fillOpacity="0.15" />
      <ellipse cx="90" cy="180" rx="46" ry="8" fill="#120717" fillOpacity="0.45" />

      {/* Cute Fluttering Loose Bandage Tail on Right */}
      <path
        d="M126 118 C144 114 156 124 149 138 C144 148 154 156 164 152"
        stroke="#1F1025"
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M126 118 C144 114 156 124 149 138 C144 148 154 156 164 152"
        stroke="#FAF3E3"
        strokeWidth="6.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Mummy Wrapped Legs */}
      <rect x="68" y="150" width="18" height="26" rx="9" fill="#EFE2C6" stroke="#1F1025" strokeWidth="3.4" />
      <rect x="94" y="150" width="18" height="26" rx="9" fill="#EFE2C6" stroke="#1F1025" strokeWidth="3.4" />
      <path d="M70 161 L84 164 M96 163 L110 160" stroke="#C8B28B" strokeWidth="2.4" strokeLinecap="round" />

      {/* Mummy Wrapped Chibi Torso */}
      <rect x="56" y="96" width="68" height="62" rx="26" fill="#FAF3E3" stroke="#1F1025" strokeWidth="3.6" />
      {/* Bandage Layer Stripes Across Torso */}
      <path
        d="M58 110 L122 117 M57 124 L123 118 M58 136 L122 143 M62 149 L118 142"
        stroke="#D5C09A"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Left Wrapped Arm Waving Cheerfully */}
      <path
        d="M58 110 C40 104 30 92 34 78"
        stroke="#1F1025"
        strokeWidth="16"
        strokeLinecap="round"
      />
      <path
        d="M58 110 C40 104 30 92 34 78"
        stroke="#FAF3E3"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path d="M35 88 L43 91 M42 99 L49 103" stroke="#D5C09A" strokeWidth="2.4" strokeLinecap="round" />

      {/* Glowing Mani Wandering Peanut Tub Held by Mummy */}
      <g transform="translate(62, 112)">
        {/* Overflowing Golden Peanuts at Top of Tub */}
        <ellipse cx="18" cy="10" rx="7" ry="5" fill="#F59E0B" stroke="#1F1025" strokeWidth="2.2" />
        <ellipse cx="29" cy="8" rx="7.5" ry="5.5" fill="#FBBF24" stroke="#1F1025" strokeWidth="2.2" />
        <ellipse cx="40" cy="10" rx="7" ry="5" fill="#D97706" stroke="#1F1025" strokeWidth="2.2" />
        {/* Snack Tub Body */}
        <path
          d="M8 12 L48 12 L44 40 C43 43 40 45 36 45 L20 45 C16 45 13 43 12 40 Z"
          fill="#FF6B00"
          stroke="#1F1025"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Tub Lid Rim */}
        <rect x="5" y="9" width="46" height="6" rx="3" fill="#FBBF24" stroke="#1F1025" strokeWidth="2.5" />
        {/* Cute Label on Tub */}
        <rect x="15" y="21" width="26" height="15" rx="4" fill="#1F1025" stroke="#FEF08A" strokeWidth="1.5" />
        <text x="28" y="31" textAnchor="middle" fill="#FBBF24" fontSize="7.5" fontWeight="900" fontFamily="sans-serif">
          MANI
        </text>
      </g>

      {/* Right Wrapped Arm Hugging the Peanut Tub */}
      <path
        d="M122 112 C136 120 130 136 112 136"
        stroke="#1F1025"
        strokeWidth="15"
        strokeLinecap="round"
      />
      <path
        d="M122 112 C136 120 130 136 112 136"
        stroke="#FAF3E3"
        strokeWidth="9.5"
        strokeLinecap="round"
      />

      {/* Mummy Head with Subtle Head Tilt */}
      <g className="animate-head-tilt">
        {/* Head Base */}
        <rect x="44" y="26" width="92" height="74" rx="36" fill="#FAF3E3" stroke="#1F1025" strokeWidth="3.8" />
        {/* Warm Inner Shading on Head */}
        <path
          d="M49 52 C49 36 65 30 90 30 C115 30 131 36 131 52"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Dark Cozy Face Peek-Slot */}
        <rect x="55" y="49" width="70" height="28" rx="14" fill="#1F1025" stroke="#D5C09A" strokeWidth="2" />

        {/* Big Expressive Glowing Amber-Gold Eyes */}
        <circle cx="75" cy="63" r="8.5" fill="#FF6B00" />
        <circle cx="105" cy="63" r="8.5" fill="#FF6B00" />
        <circle cx="75" cy="63" r="5" fill="#FEF08A" />
        <circle cx="105" cy="63" r="5" fill="#FEF08A" />
        {/* Starry White Eye Catchlights */}
        <circle cx="72" cy="59.5" r="2.6" fill="#FFFFFF" />
        <circle cx="102" cy="59.5" r="2.6" fill="#FFFFFF" />
        <circle cx="78" cy="66" r="1.3" fill="#FFFFFF" />
        <circle cx="108" cy="66" r="1.3" fill="#FFFFFF" />

        {/* Rosy Cheeks Inside Peek-Slot */}
        <ellipse cx="62" cy="69" rx="4.5" ry="2.5" fill="#FF6B00" fillOpacity="0.6" />
        <ellipse cx="118" cy="69" rx="4.5" ry="2.5" fill="#FF6B00" fillOpacity="0.6" />

        {/* Cute Happy Smile with Single Tiny Fang */}
        <path d="M85 68 Q90 73 95 68" stroke="#FEF08A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <polygon points="91,70 93,74 95,70" fill="#FFFFFF" />

        {/* Crisscrossing Bandage Wraps Across Forehead & Chin */}
        <path
          d="M48 44 L132 36 M46 37 L128 49 M48 80 L132 86 M54 90 L126 78"
          stroke="#D5C09A"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M48 44 L132 36 M48 80 L132 86"
          stroke="#1F1025"
          strokeWidth="1.4"
          strokeOpacity="0.35"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

/**
 * Realistic, Cleanly Anchored Corner Cobweb + Hanging Spider SVG
 * Uses `position: absolute` (never floating `fixed` on scroll) so it stays naturally
 * anchored to the top corners of the page or section.
 */
export function CornerWebWithSpider({ position = 'left', size = 'lg', showSpider = true }) {
  const isRight = position === 'right';
  const sizeClasses =
    size === 'sm'
      ? 'w-24 h-24 sm:w-32 sm:h-32'
      : 'w-32 h-32 sm:w-44 sm:h-44 lg:w-52 lg:h-52';

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none absolute top-0 ${
        isRight ? 'right-0 scale-x-[-1]' : 'left-0'
      } z-20 ${sizeClasses} opacity-75`}
    >
      <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
        {/* Anchor threads flush along top (y=0) and left (x=0) edges plus 6 radial spokes */}
        <path
          d="M0 0 L196 0 M0 0 L192 38 M0 0 L178 82 M0 0 L152 124 M0 0 L118 158 M0 0 L76 182 M0 0 L34 194 M0 0 L0 196"
          stroke="#FBBF24"
          strokeOpacity="0.48"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Ring 1 (Inner catenary silk ring anchored from y=0 to x=0) */}
        <path
          d="M36 0 Q32 5 35 7 Q30 12 32 15 Q26 20 27 22 Q20 26 21 29 Q13 31 14 33 Q6 34 6 35 Q3 35 0 36"
          stroke="#F59E0B"
          strokeOpacity="0.45"
          strokeWidth="1.2"
          fill="none"
        />

        {/* Ring 2 */}
        <path
          d="M74 0 Q66 10 71 14 Q61 24 66 30 Q52 39 56 46 Q41 53 44 59 Q26 63 28 67 Q12 69 13 72 Q5 72 0 74"
          stroke="#F59E0B"
          strokeOpacity="0.42"
          strokeWidth="1.25"
          fill="none"
        />

        {/* Ring 3 */}
        <path
          d="M114 0 Q102 15 110 22 Q94 37 102 47 Q81 60 87 71 Q64 81 68 90 Q41 96 44 104 Q19 107 20 111 Q8 112 0 114"
          stroke="#FF6B00"
          strokeOpacity="0.38"
          strokeWidth="1.3"
          fill="none"
        />

        {/* Ring 4 */}
        <path
          d="M156 0 Q140 20 151 30 Q128 50 140 64 Q110 82 119 97 Q86 111 93 124 Q56 132 60 143 Q26 146 27 152 Q11 153 0 156"
          stroke="#FBBF24"
          strokeOpacity="0.34"
          strokeWidth="1.3"
          fill="none"
        />

        {/* Subtle golden dewdrop highlights at web nodes */}
        <circle cx="71" cy="14" r="1.6" fill="#FEF08A" fillOpacity="0.7" />
        <circle cx="102" cy="47" r="1.8" fill="#FF6B00" fillOpacity="0.7" />
        <circle cx="68" cy="90" r="1.6" fill="#FEF08A" fillOpacity="0.7" />
      </svg>

      {/* Dangling Spider Anchored to Radial Spoke */}
      {showSpider && (
        <div
          className={`absolute ${
            isRight ? 'left-[58px] top-[34px]' : 'left-[64px] top-[28px]'
          } animate-spider-bob`}
        >
          <svg viewBox="0 0 44 86" fill="none" className="w-8 h-16 sm:w-9 sm:h-18 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
            {/* Silk suspension line anchored to top */}
            <line x1="22" y1="0" x2="22" y2="50" stroke="#FEF08A" strokeOpacity="0.65" strokeWidth="1.3" />
            {/* Spider abdomen & cephalothorax */}
            <circle cx="22" cy="58" r="7" fill="#1F1025" stroke="#FF6B00" strokeWidth="1.6" />
            <circle cx="22" cy="49" r="4.5" fill="#1F1025" stroke="#FF6B00" strokeWidth="1.4" />
            {/* Tiny golden hourglass/chevron mark on spider back */}
            <polygon points="22,55 19.5,59 24.5,59" fill="#FF6B00" fillOpacity="0.85" />
            {/* 8 articulated angular legs */}
            <path
              d="M16 52 L7 46 L3 52 M15 56 L5 54 L2 60 M15 60 L6 63 L4 69 M17 63 L10 69 L8 75"
              stroke="#FF6B00"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M28 52 L37 46 L41 52 M29 56 L39 54 L42 60 M29 60 L38 63 L40 69 M27 63 L34 69 L36 75"
              stroke="#FF6B00"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Glowing eyes */}
            <circle cx="20.2" cy="48.5" r="1.1" fill="#FEF08A" />
            <circle cx="23.8" cy="48.5" r="1.1" fill="#FEF08A" />
          </svg>
        </div>
      )}
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

/**
 * 18 Multi-Depth Falling Autumn Leaves with Varied Shapes, Sizes, Speeds, and Staggered Timing
 * (Negative delays ensure leaves are naturally distributed across the page immediately on load)
 */
const FALLING_LEAVES = [
  // Foreground-depth larger leaves
  { id: 1, left: '3%', delay: '-2.5s', duration: '15s', swayDuration: '4.8s', color: '#FF6B00', variant: 'maple', size: 'w-6 h-6 sm:w-7 sm:h-7', opacity: 'opacity-70', altSway: false, mobileHidden: false },
  { id: 2, left: '14%', delay: '-9.2s', duration: '17s', swayDuration: '5.5s', color: '#F59E0B', variant: 'oak', size: 'w-6 h-6', opacity: 'opacity-65', altSway: true, mobileHidden: false },
  { id: 3, left: '28%', delay: '-14.0s', duration: '16s', swayDuration: '4.6s', color: '#DC2626', variant: 'maple', size: 'w-6 h-6 sm:w-7 sm:h-7', opacity: 'opacity-65', altSway: false, mobileHidden: true },
  { id: 4, left: '74%', delay: '-5.8s', duration: '15.5s', swayDuration: '5.1s', color: '#EA580C', variant: 'ginkgo', size: 'w-6 h-6', opacity: 'opacity-70', altSway: true, mobileHidden: false },
  { id: 5, left: '91%', delay: '-11.4s', duration: '16.5s', swayDuration: '4.9s', color: '#FBBF24', variant: 'maple', size: 'w-6 h-6 sm:w-7 sm:h-7', opacity: 'opacity-65', altSway: false, mobileHidden: false },

  // Mid-ground medium leaves
  { id: 6, left: '8%', delay: '-6.4s', duration: '19s', swayDuration: '5.8s', color: '#EA580C', variant: 'birch', size: 'w-5 h-5', opacity: 'opacity-55', altSway: true, mobileHidden: true },
  { id: 7, left: '21%', delay: '-1.2s', duration: '18.5s', swayDuration: '5.2s', color: '#FBBF24', variant: 'ginkgo', size: 'w-5 h-5', opacity: 'opacity-55', altSway: false, mobileHidden: false },
  { id: 8, left: '37%', delay: '-12.6s', duration: '20s', swayDuration: '6.0s', color: '#FF6B00', variant: 'oak', size: 'w-5 h-5', opacity: 'opacity-55', altSway: true, mobileHidden: false },
  { id: 9, left: '49%', delay: '-4.1s', duration: '19.5s', swayDuration: '5.4s', color: '#DC2626', variant: 'birch', size: 'w-5 h-5', opacity: 'opacity-50', altSway: false, mobileHidden: true },
  { id: 10, left: '61%', delay: '-15.3s', duration: '18s', swayDuration: '4.9s', color: '#F59E0B', variant: 'maple', size: 'w-5 h-5', opacity: 'opacity-55', altSway: true, mobileHidden: false },
  { id: 11, left: '82%', delay: '-7.7s', duration: '20.5s', swayDuration: '6.2s', color: '#FF6B00', variant: 'oak', size: 'w-5 h-5', opacity: 'opacity-55', altSway: false, mobileHidden: true },
  { id: 12, left: '96%', delay: '-3.3s', duration: '19s', swayDuration: '5.6s', color: '#DC2626', variant: 'birch', size: 'w-5 h-5', opacity: 'opacity-55', altSway: true, mobileHidden: false },

  // Distant background smaller, fainter leaves for depth
  { id: 13, left: '11%', delay: '-16.8s', duration: '24s', swayDuration: '6.8s', color: '#F59E0B', variant: 'maple', size: 'w-3.5 h-3.5', opacity: 'opacity-35', altSway: false, mobileHidden: true },
  { id: 14, left: '32%', delay: '-8.0s', duration: '23s', swayDuration: '6.4s', color: '#FF6B00', variant: 'ginkgo', size: 'w-4 h-4', opacity: 'opacity-40', altSway: true, mobileHidden: false },
  { id: 15, left: '44%', delay: '-18.5s', duration: '25s', swayDuration: '7.0s', color: '#FBBF24', variant: 'oak', size: 'w-3.5 h-3.5', opacity: 'opacity-35', altSway: false, mobileHidden: true },
  { id: 16, left: '56%', delay: '-10.5s', duration: '22.5s', swayDuration: '6.3s', color: '#EA580C', variant: 'birch', size: 'w-4 h-4', opacity: 'opacity-40', altSway: true, mobileHidden: false },
  { id: 17, left: '68%', delay: '-1.9s', duration: '24.5s', swayDuration: '6.9s', color: '#F59E0B', variant: 'ginkgo', size: 'w-3.5 h-3.5', opacity: 'opacity-35', altSway: false, mobileHidden: true },
  { id: 18, left: '87%', delay: '-13.7s', duration: '23.5s', swayDuration: '6.5s', color: '#FF6B00', variant: 'maple', size: 'w-4 h-4', opacity: 'opacity-40', altSway: true, mobileHidden: true }
];

const FLYING_BATS = [
  { id: 'bat-1', top: '8%', delay: '0s', duration: '22s', size: 'w-12 h-7 sm:w-14 sm:h-8', direction: 'ltr' },
  { id: 'bat-2', top: '16%', delay: '6s', duration: '26s', size: 'w-9 h-5 sm:w-11 sm:h-6', direction: 'rtl' },
  { id: 'bat-3', top: '24%', delay: '12s', duration: '24s', size: 'w-10 h-6 sm:w-12 sm:h-7', direction: 'ltr' }
];

export default function HalloweenAtmosphere() {
  return (
    <>
      {/* 1. Top-of-Page Anchored Corner Cobwebs & Spiders (scroll naturally with page, never float over content) */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute top-14 sm:top-16 inset-x-0 h-64 overflow-hidden z-[5]"
      >
        <CornerWebWithSpider position="left" size="lg" showSpider={true} />
        <CornerWebWithSpider position="right" size="lg" showSpider={true} />
      </div>

      {/* 2. Atmospheric Background Layer (z-[1], behind main UI z-10 so leaves/bats never block cards or text) */}
      <div
        aria-hidden="true"
        data-testid="halloween-atmosphere"
        className="pointer-events-none select-none fixed inset-0 overflow-hidden z-[1]"
      >
        {/* Sharp, Webbed-Wing Flying Bats across Upper Background */}
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
            } text-[#120717] drop-shadow-[0_0_8px_rgba(255,107,0,0.45)] opacity-80`}
          >
            <div className="animate-bat-flap">
              <SharpBatSvg className={bat.size} />
            </div>
          </div>
        ))}

        {/* Multi-Depth Drifting Autumn Leaves */}
        {FALLING_LEAVES.map((leaf) => (
          <div
            key={leaf.id}
            style={{
              left: leaf.left,
              animationDelay: leaf.delay,
              animationDuration: leaf.duration
            }}
            className={`fixed -top-12 animate-leaf-fall ${leaf.opacity} ${
              leaf.mobileHidden ? 'hidden sm:block' : ''
            }`}
          >
            <div
              style={{ animationDuration: leaf.swayDuration }}
              className={leaf.altSway ? 'animate-leaf-sway-alt' : 'animate-leaf-sway'}
            >
              <AutumnLeafSvg
                className={leaf.size}
                color={leaf.color}
                variant={leaf.variant}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Roaming Ghost Layer */}
      <CuteRoamingGhost variant="primary" />
      <CuteRoamingGhost variant="secondary" />
    </>
  );
}
