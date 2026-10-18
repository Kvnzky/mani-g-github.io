import React from 'react';
import HalloweenAtmosphere from './HalloweenAtmosphere';

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
      {/* Golden Celebration Stars & Confetti */}
      {[
        { left: '10%', top: '15%', delay: '0s', size: 'w-4 h-4', color: '#FACC15' },
        { left: '25%', top: '45%', delay: '1s', size: 'w-3 h-3', color: '#E2E8F0' },
        { left: '42%', top: '20%', delay: '2s', size: 'w-5 h-5', color: '#FBBF24' },
        { left: '68%', top: '35%', delay: '0.5s', size: 'w-4 h-4', color: '#E2E8F0' },
        { left: '85%', top: '18%', delay: '1.5s', size: 'w-5 h-5', color: '#FACC15' },
        { left: '90%', top: '60%', delay: '2.5s', size: 'w-3.5 h-3.5', color: '#FBBF24' }
      ].map((star, i) => (
        <div
          key={i}
          className="absolute animate-pulse"
          style={{
            left: star.left,
            top: star.top,
            animationDelay: star.delay,
            animationDuration: '3s'
          }}
        >
          <svg className={star.size} viewBox="0 0 24 24" fill={star.color} opacity="0.65">
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
      <div className="absolute top-0 left-6 sm:left-14 opacity-75">
        <svg className="w-10 sm:w-12 h-auto" viewBox="0 0 40 70" fill="none">
          <line x1="20" y1="0" x2="20" y2="15" stroke="#F59E0B" strokeWidth="2" />
          <ellipse cx="20" cy="35" rx="16" ry="20" fill="#DC2626" stroke="#F59E0B" strokeWidth="2" />
          <line x1="20" y1="15" x2="20" y2="55" stroke="#F59E0B" strokeWidth="1.5" />
          <line x1="12" y1="18" x2="12" y2="52" stroke="#F59E0B" strokeWidth="1" strokeDasharray="2,2" />
          <line x1="28" y1="18" x2="28" y2="52" stroke="#F59E0B" strokeWidth="1" strokeDasharray="2,2" />
          <line x1="20" y1="55" x2="20" y2="68" stroke="#DC2626" strokeWidth="3" />
        </svg>
      </div>
      <div className="absolute top-0 right-6 sm:right-14 opacity-75">
        <svg className="w-10 sm:w-12 h-auto" viewBox="0 0 40 70" fill="none">
          <line x1="20" y1="0" x2="20" y2="15" stroke="#F59E0B" strokeWidth="2" />
          <ellipse cx="20" cy="35" rx="16" ry="20" fill="#DC2626" stroke="#F59E0B" strokeWidth="2" />
          <line x1="20" y1="15" x2="20" y2="55" stroke="#F59E0B" strokeWidth="1.5" />
          <line x1="12" y1="18" x2="12" y2="52" stroke="#F59E0B" strokeWidth="1" strokeDasharray="2,2" />
          <line x1="28" y1="18" x2="28" y2="52" stroke="#F59E0B" strokeWidth="1" strokeDasharray="2,2" />
          <line x1="20" y1="55" x2="20" y2="68" stroke="#DC2626" strokeWidth="3" />
        </svg>
      </div>
    </div>
  );
}

function ValentinesHearts() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none" aria-hidden="true">
      {/* Gentle Floating Hearts */}
      {[
        { left: '12%', delay: '0s', duration: '16s', size: 'w-5 h-5', color: '#FB7185' },
        { left: '28%', delay: '4s', duration: '19s', size: 'w-4 h-4', color: '#FDA4AF' },
        { left: '48%', delay: '1s', duration: '17s', size: 'w-6 h-6', color: '#E11D48' },
        { left: '68%', delay: '5s', duration: '20s', size: 'w-4 h-4', color: '#FB7185' },
        { left: '86%', delay: '2s', duration: '15s', size: 'w-5 h-5', color: '#FDA4AF' }
      ].map((heart, i) => (
        <div
          key={i}
          className="absolute -top-8 opacity-50 animate-fall"
          style={{
            left: heart.left,
            animationDelay: heart.delay,
            animationDuration: heart.duration
          }}
        >
          <svg className={heart.size} viewBox="0 0 24 24" fill={heart.color}>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
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
    return <ThanksgivingLeaves />;
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
