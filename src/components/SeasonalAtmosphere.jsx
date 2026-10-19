import React from 'react';
import HalloweenAtmosphere from './HalloweenAtmosphere';
import ThanksgivingAtmosphere from './ThanksgivingAtmosphere';

// Ambient Decorative Particle Systems for Each Season
// All atmospheres are strictly non-interactive (pointer-events-none), lightweight SVGs,
// and automatically respect prefers-reduced-motion.

function ThanksgivingLeaves() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none" aria-hidden="true">
      {/* Falling Amber, Burnt Orange, Burgundy & Sage Autumn Leaves */}
      {[
        { left: '6%', delay: '0s', duration: '15s', size: 'w-6 h-6', rot: 'rotate-45', color: '#EA580C', type: 'maple' },
        { left: '19%', delay: '4s', duration: '19s', size: 'w-5 h-5', rot: '-rotate-12', color: '#D97706', type: 'oak' },
        { left: '34%', delay: '1.5s', duration: '17s', size: 'w-7 h-7', rot: 'rotate-12', color: '#881337', type: 'maple' },
        { left: '52%', delay: '6s', duration: '21s', size: 'w-4 h-4', rot: '-rotate-45', color: '#4D7C0F', type: 'oak' },
        { left: '68%', delay: '2.5s', duration: '16s', size: 'w-6 h-6', rot: 'rotate-30', color: '#F59E0B', type: 'maple' },
        { left: '83%', delay: '5s', duration: '18s', size: 'w-5 h-5', rot: '-rotate-30', color: '#C2410C', type: 'oak' },
        { left: '94%', delay: '1s', duration: '20s', size: 'w-6 h-6', rot: 'rotate-20', color: '#881337', type: 'maple' }
      ].map((leaf, i) => (
        <div
          key={i}
          className="absolute -top-10 opacity-70 animate-fall"
          style={{
            left: leaf.left,
            animationDelay: leaf.delay,
            animationDuration: leaf.duration
          }}
        >
          {leaf.type === 'maple' ? (
            <svg className={`${leaf.size} ${leaf.rot}`} viewBox="0 0 24 24" fill={leaf.color}>
              <path d="M12 2 L13.5 6 L17.5 4.5 L16.5 9 L21 9 L17.5 13.5 L21.5 17.5 L16.5 17.5 L16.5 21 L12 18 L7.5 21 L7.5 17.5 L2.5 17.5 L6.5 13.5 L3 9 L7.5 9 L6.5 4.5 L10.5 6 Z" />
            </svg>
          ) : (
            <svg className={`${leaf.size} ${leaf.rot}`} viewBox="0 0 24 24" fill={leaf.color}>
              <path d="M12 2C8 6 3 9 3 14c0 4 3 7 7 7 1 0 1-1 2-2 1 1 1 2 2 2 4 0 7-3 7-7 0-5-5-8-9-12z" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}

function ChristmasSnow() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none" aria-hidden="true">
      {/* Drifting Soft Snowflakes & Holiday Stars */}
      {[
        { left: '5%', delay: '0s', duration: '12s', size: 'w-3 h-3', opacity: 'opacity-70' },
        { left: '18%', delay: '2s', duration: '15s', size: 'w-4 h-4', opacity: 'opacity-80' },
        { left: '32%', delay: '4s', duration: '11s', size: 'w-2.5 h-2.5', opacity: 'opacity-60' },
        { left: '48%', delay: '1s', duration: '16s', size: 'w-3.5 h-3.5', opacity: 'opacity-75' },
        { left: '64%', delay: '3s', duration: '13s', size: 'w-4 h-4', opacity: 'opacity-85' },
        { left: '79%', delay: '5s', duration: '14s', size: 'w-3 h-3', opacity: 'opacity-70' },
        { left: '92%', delay: '2.5s', duration: '17s', size: 'w-2.5 h-2.5', opacity: 'opacity-60' }
      ].map((flake, i) => (
        <div
          key={i}
          className={`absolute -top-6 text-white/80 ${flake.opacity} animate-fall`}
          style={{
            left: flake.left,
            animationDelay: flake.delay,
            animationDuration: flake.duration
          }}
        >
          <svg className={flake.size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      ))}
    </div>
  );
}

function NewYearSparkles() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none" aria-hidden="true">
      {/* Drifting Champagne Gold Stars, Silver Diamonds & Firework Sparkles */}
      {[
        { left: '8%', delay: '0s', duration: '14s', size: 'w-4 h-4', color: '#FACC15', type: 'star' },
        { left: '22%', delay: '3s', duration: '17s', size: 'w-3 h-3', color: '#E2E8F0', type: 'diamond' },
        { left: '38%', delay: '1s', duration: '15s', size: 'w-5 h-5', color: '#FDE047', type: 'burst' },
        { left: '55%', delay: '5s', duration: '19s', size: 'w-3.5 h-3.5', color: '#FACC15', type: 'star' },
        { left: '72%', delay: '2s', duration: '16s', size: 'w-4 h-4', color: '#CBD5E1', type: 'diamond' },
        { left: '88%', delay: '4s', duration: '18s', size: 'w-5 h-5', color: '#FDE047', type: 'burst' }
      ].map((item, i) => (
        <div
          key={i}
          className="absolute -top-10 opacity-75 animate-fall"
          style={{
            left: item.left,
            animationDelay: item.delay,
            animationDuration: item.duration
          }}
        >
          {item.type === 'star' ? (
            <svg className={item.size} viewBox="0 0 24 24" fill={item.color}>
              <polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" />
            </svg>
          ) : item.type === 'diamond' ? (
            <svg className={item.size} viewBox="0 0 24 24" fill={item.color}>
              <polygon points="12,2 22,12 12,22 2,12" />
            </svg>
          ) : (
            <svg className={item.size} viewBox="0 0 24 24" fill="none">
              <line x1="12" y1="2" x2="12" y2="22" stroke={item.color} strokeWidth="1.5" strokeLinecap="round" />
              <line x1="2" y1="12" x2="22" y2="12" stroke={item.color} strokeWidth="1.5" strokeLinecap="round" />
              <line x1="5" y1="5" x2="19" y2="19" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
              <line x1="19" y1="5" x2="5" y2="19" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
              <circle cx="12" cy="12" r="2" fill="#FFFFFF" />
            </svg>
          )}
        </div>
      ))}

      {/* Subtle Ambient Twinkling Celebration Stars */}
      {[
        { left: '15%', top: '25%', delay: '0s', size: 'w-3 h-3', color: '#FACC15' },
        { left: '80%', top: '35%', delay: '1.2s', size: 'w-3.5 h-3.5', color: '#E2E8F0' },
        { left: '50%', top: '65%', delay: '2.4s', size: 'w-3 h-3', color: '#FDE047' }
      ].map((star, i) => (
        <div
          key={`twinkle-${i}`}
          className="absolute animate-pulse"
          style={{
            left: star.left,
            top: star.top,
            animationDelay: star.delay,
            animationDuration: '3.5s'
          }}
        >
          <svg className={star.size} viewBox="0 0 24 24" fill={star.color} opacity="0.6">
            <polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" />
          </svg>
        </div>
      ))}
    </div>
  );
}

function ChineseNewYearLanterns() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none" aria-hidden="true">
      {/* Decorative Hanging Lantern Accents in Top Corners */}
      <div className="absolute top-0 left-6 sm:left-14 opacity-80">
        <svg className="w-10 sm:w-12 h-auto drop-shadow-[0_2px_8px_rgba(220,38,38,0.5)]" viewBox="0 0 40 70" fill="none">
          <line x1="20" y1="0" x2="20" y2="15" stroke="#F59E0B" strokeWidth="2" />
          <ellipse cx="20" cy="35" rx="16" ry="20" fill="#DC2626" stroke="#F59E0B" strokeWidth="2" />
          <line x1="20" y1="15" x2="20" y2="55" stroke="#F59E0B" strokeWidth="1.5" />
          <line x1="12" y1="18" x2="12" y2="52" stroke="#F59E0B" strokeWidth="1" strokeDasharray="2,2" />
          <line x1="28" y1="18" x2="28" y2="52" stroke="#F59E0B" strokeWidth="1" strokeDasharray="2,2" />
          <line x1="20" y1="55" x2="20" y2="68" stroke="#DC2626" strokeWidth="3" />
        </svg>
      </div>
      <div className="absolute top-0 right-6 sm:right-14 opacity-80">
        <svg className="w-10 sm:w-12 h-auto drop-shadow-[0_2px_8px_rgba(220,38,38,0.5)]" viewBox="0 0 40 70" fill="none">
          <line x1="20" y1="0" x2="20" y2="15" stroke="#F59E0B" strokeWidth="2" />
          <ellipse cx="20" cy="35" rx="16" ry="20" fill="#DC2626" stroke="#F59E0B" strokeWidth="2" />
          <line x1="20" y1="15" x2="20" y2="55" stroke="#F59E0B" strokeWidth="1.5" />
          <line x1="12" y1="18" x2="12" y2="52" stroke="#F59E0B" strokeWidth="1" strokeDasharray="2,2" />
          <line x1="28" y1="18" x2="28" y2="52" stroke="#F59E0B" strokeWidth="1" strokeDasharray="2,2" />
          <line x1="20" y1="55" x2="20" y2="68" stroke="#DC2626" strokeWidth="3" />
        </svg>
      </div>

      {/* Floating Auspicious Gold Coins, Angpao & Plum Blossom Petals */}
      {[
        { left: '9%', delay: '0s', duration: '15s', size: 'w-4 h-4', type: 'coin' },
        { left: '26%', delay: '3.5s', duration: '18s', size: 'w-3.5 h-3.5', type: 'petal' },
        { left: '44%', delay: '1s', duration: '16s', size: 'w-4 h-5', type: 'angpao' },
        { left: '62%', delay: '5s', duration: '20s', size: 'w-4 h-4', type: 'coin' },
        { left: '78%', delay: '2s', duration: '17s', size: 'w-3.5 h-3.5', type: 'petal' },
        { left: '91%', delay: '4s', duration: '19s', size: 'w-4 h-5', type: 'angpao' }
      ].map((item, i) => (
        <div
          key={i}
          className="absolute -top-10 opacity-75 animate-fall"
          style={{
            left: item.left,
            animationDelay: item.delay,
            animationDuration: item.duration
          }}
        >
          {item.type === 'coin' ? (
            <svg className={item.size} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
              <rect x="9.5" y="9.5" width="5" height="5" fill="#7F1D1D" stroke="#B45309" strokeWidth="1" />
            </svg>
          ) : item.type === 'petal' ? (
            <svg className={item.size} viewBox="0 0 24 24" fill="#FDA4AF">
              <path d="M12 2C8 6 6 10 7 14c1 4 5 7 5 7s4-3 5-7c1-4-1-8-5-12z" />
            </svg>
          ) : (
            <svg className={item.size} viewBox="0 0 20 26" fill="none">
              <rect x="2" y="2" width="16" height="22" rx="2" fill="#DC2626" stroke="#B91C1C" strokeWidth="1" />
              <circle cx="10" cy="11" r="3" fill="#FDE047" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}

function ValentinesHearts() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none" aria-hidden="true">
      {/* Anchored Top Corner Hanging Hearts (Framing Viewport without blocking clicks) */}
      <div className="absolute top-0 left-6 sm:left-14 opacity-85">
        <svg className="w-8 sm:w-10 h-auto drop-shadow-[0_2px_8px_rgba(225,29,72,0.5)]" viewBox="0 0 36 60" fill="none">
          <line x1="18" y1="0" x2="18" y2="18" stroke="#FB7185" strokeWidth="1.5" strokeDasharray="2,2" />
          <ellipse cx="14" cy="18" rx="3.5" ry="2" fill="#FDE047" transform="rotate(-20 14 18)" />
          <ellipse cx="22" cy="18" rx="3.5" ry="2" fill="#FDE047" transform="rotate(20 22 18)" />
          <circle cx="18" cy="18" r="1.5" fill="#F59E0B" />
          <path
            d="M18 48 L16.55 46.68 C11.4 42.01 8 38.93 8 35.15 C8 32.07 10.42 29.65 13.5 29.65 C15.24 29.65 16.91 30.46 18 31.74 C19.09 30.46 20.76 29.65 22.5 29.65 C25.58 29.65 28 32.07 28 35.15 C28 38.93 24.6 42.01 19.45 46.69 L18 48 Z"
            fill="#E11D48"
            stroke="#BE123C"
            strokeWidth="1.2"
          />
        </svg>
      </div>
      <div className="absolute top-0 right-6 sm:right-14 opacity-85">
        <svg className="w-8 sm:w-10 h-auto drop-shadow-[0_2px_8px_rgba(225,29,72,0.5)]" viewBox="0 0 36 60" fill="none">
          <line x1="18" y1="0" x2="18" y2="18" stroke="#FB7185" strokeWidth="1.5" strokeDasharray="2,2" />
          <ellipse cx="14" cy="18" rx="3.5" ry="2" fill="#FDE047" transform="rotate(-20 14 18)" />
          <ellipse cx="22" cy="18" rx="3.5" ry="2" fill="#FDE047" transform="rotate(20 22 18)" />
          <circle cx="18" cy="18" r="1.5" fill="#F59E0B" />
          <path
            d="M18 48 L16.55 46.68 C11.4 42.01 8 38.93 8 35.15 C8 32.07 10.42 29.65 13.5 29.65 C15.24 29.65 16.91 30.46 18 31.74 C19.09 30.46 20.76 29.65 22.5 29.65 C25.58 29.65 28 32.07 28 35.15 C28 38.93 24.6 42.01 19.45 46.69 L18 48 Z"
            fill="#E11D48"
            stroke="#BE123C"
            strokeWidth="1.2"
          />
        </svg>
      </div>

      {/* Gentle Floating Hearts, Rose Petals & Golden Sparkles */}
      {[
        { left: '10%', delay: '0s', duration: '16s', size: 'w-4 h-4', type: 'heart', color: '#FB7185' },
        { left: '26%', delay: '4s', duration: '19s', size: 'w-3.5 h-3.5', type: 'petal', color: '#FDA4AF' },
        { left: '45%', delay: '1s', duration: '17s', size: 'w-5 h-5', type: 'heart', color: '#E11D48' },
        { left: '62%', delay: '5s', duration: '20s', size: 'w-3.5 h-3.5', type: 'sparkle', color: '#FDE047' },
        { left: '78%', delay: '2s', duration: '18s', size: 'w-4 h-4', type: 'heart', color: '#FB7185' },
        { left: '92%', delay: '3.5s', duration: '16s', size: 'w-3.5 h-3.5', type: 'petal', color: '#FDA4AF' }
      ].map((item, i) => (
        <div
          key={i}
          className="absolute -top-8 opacity-60 animate-fall"
          style={{
            left: item.left,
            animationDelay: item.delay,
            animationDuration: item.duration
          }}
        >
          {item.type === 'heart' ? (
            <svg className={item.size} viewBox="0 0 24 24" fill={item.color}>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : item.type === 'petal' ? (
            <svg className={item.size} viewBox="0 0 24 24" fill={item.color}>
              <path d="M12 2C8 6 6 10 7 14c1 4 5 7 5 7s4-3 5-7c1-4-1-8-5-12z" />
            </svg>
          ) : (
            <svg className={item.size} viewBox="0 0 24 24" fill={item.color}>
              <path d="M12 0 L15 9 L24 12 L15 15 L12 24 L9 15 L0 12 L9 9 Z" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}

function EasterPastels() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none" aria-hidden="true">
      {/* Gentle Spring Blossom Petals */}
      {[
        { left: '10%', delay: '0s', duration: '15s', size: 'w-4 h-4', color: '#C084FC' },
        { left: '30%', delay: '3s', duration: '18s', size: 'w-3.5 h-3.5', color: '#6EE7B7' },
        { left: '50%', delay: '1s', duration: '16s', size: 'w-4.5 h-4.5', color: '#FDE047' },
        { left: '70%', delay: '4s', duration: '20s', size: 'w-4 h-4', color: '#F472B6' },
        { left: '88%', delay: '2s', duration: '17s', size: 'w-3.5 h-3.5', color: '#A78BFA' }
      ].map((petal, i) => (
        <div
          key={i}
          className="absolute -top-8 opacity-50 animate-fall"
          style={{
            left: petal.left,
            animationDelay: petal.delay,
            animationDuration: petal.duration
          }}
        >
          <svg className={petal.size} viewBox="0 0 24 24" fill={petal.color}>
            <circle cx="12" cy="12" r="8" opacity="0.8" />
          </svg>
        </div>
      ))}
    </div>
  );
}

export default function SeasonalAtmosphere({ themeId = 'halloween' }) {
  if (themeId === 'halloween') {
    return <HalloweenAtmosphere />;
  }
  if (themeId === 'thanksgiving') {
    return <ThanksgivingAtmosphere />;
  }
  if (themeId === 'christmas') {
    return <ChristmasSnow />;
  }
  if (themeId === 'new-year') {
    return <NewYearSparkles />;
  }
  if (themeId === 'chinese-new-year') {
    return <ChineseNewYearLanterns />;
  }
  if (themeId === 'valentines-day') {
    return <ValentinesHearts />;
  }
  if (themeId === 'easter') {
    return <EasterPastels />;
  }
  // 'default' - clean without decorative particles
  return null;
}
