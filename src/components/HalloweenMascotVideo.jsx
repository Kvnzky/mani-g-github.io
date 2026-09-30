import React, { useEffect, useRef, useState } from 'react';

/**
 * Renders the Halloween Mani Wandering mascot video with:
 * 1. Real-time canvas background keying & de-spilling that removes the light
 *    checkerboard background outside the central portal while preserving the
 *    mascot, "MANI WONDERING" title, bats, pumpkins, leaves, and tree branches.
 * 2. Multi-layer website-matched overlays (#1F1025 midnight purple, #2B1B30 dark
 *    indigo, and #FF6B00 jack-o-lantern radial glow) so the video blends
 *    seamlessly into the website backdrop.
 */
export default function HalloweenMascotVideo({
  src = './images/mani-halloween-video.mp4',
  poster = './images/logo.png',
  variant = 'hero', // 'hero' | 'badge' | 'header'
  className = '',
  ariaLabel = 'Mani Wandering Peanut Mascot'
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [canvasReady, setCanvasReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    let animationFrameId = null;
    let isMounted = true;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Website dark indigo RGB (#2B1B30) used for de-spilling anti-aliased edges
    const targetBgR = 43;
    const targetBgG = 27;
    const targetBgB = 48;

    const processFrame = () => {
      if (!isMounted) return;

      if (video.readyState >= 2 && !video.paused && !video.ended) {
        const vw = video.videoWidth || 640;
        const vh = video.videoHeight || 360;

        // Use a crisp internal processing resolution for smooth 60fps performance
        const procW = Math.min(vw, variant === 'hero' ? 560 : 240);
        const procH = Math.max(1, Math.round((procW * vh) / vw));

        if (canvas.width !== procW || canvas.height !== procH) {
          canvas.width = procW;
          canvas.height = procH;
        }

        try {
          ctx.drawImage(video, 0, 0, procW, procH);
          const frame = ctx.getImageData(0, 0, procW, procH);
          const data = frame.data;

          // Center of the mascot's face/body portal (protects white eyes & fangs)
          const centerX = procW * 0.5;
          const centerY = procH * 0.53;
          const innerRx = procW * 0.165;
          const innerRy = procH * 0.31;

          // Outer feather radius so the frame edges dissolve into the website overlay
          const outerRx = procW * 0.47;
          const outerRy = procH * 0.48;

          for (let y = 0; y < procH; y++) {
            const dyInner = (y - centerY) / innerRy;
            const dyInner2 = dyInner * dyInner;
            const dyOuter = (y - procH * 0.5) / outerRy;
            const dyOuter2 = dyOuter * dyOuter;

            for (let x = 0; x < procW; x++) {
              const idx = (y * procW + x) * 4;
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];

              const dxInner = (x - centerX) / innerRx;
              const distInner = Math.sqrt(dxInner * dxInner + dyInner2);

              // Smooth protection mask: 0 inside mascot core, 1 outside portal arch
              let outsideCore = 0;
              if (distInner > 0.72) {
                outsideCore = Math.min(1, (distInner - 0.72) / 0.32);
              }

              if (outsideCore > 0) {
                const maxC = r > g ? (r > b ? r : b) : (g > b ? g : b);
                const minC = r < g ? (r < b ? r : b) : (g < b ? g : b);
                const chroma = maxC - minC;
                const luma = (r + g + b) * 0.333333;

                // Checkerboard pixels & white/grey halos are bright and low-chroma (neutral)
                if (luma > 145 && chroma < 32) {
                  const lumaFactor = Math.min(1, Math.max(0, (luma - 145) / 68));
                  const chromaFactor = Math.min(1, Math.max(0, (32 - chroma) / 20));
                  const bgStrength = lumaFactor * chromaFactor * outsideCore;

                  if (bgStrength > 0.01) {
                    // De-spill RGB toward website dark indigo (#2B1B30) to eliminate white fringes
                    const spill = Math.min(1, bgStrength * 1.15);
                    data[idx] = Math.round(r * (1 - spill) + targetBgR * spill);
                    data[idx + 1] = Math.round(g * (1 - spill) + targetBgG * spill);
                    data[idx + 2] = Math.round(b * (1 - spill) + targetBgB * spill);
                    data[idx + 3] = Math.round(255 * Math.max(0, 1 - bgStrength * 1.08));
                  }
                }
              }

              // Feather outer frame perimeter so video edges merge into website overlay
              const dxOuter = (x - procW * 0.5) / outerRx;
              const distOuter = Math.sqrt(dxOuter * dxOuter + dyOuter2);
              if (distOuter > 0.84) {
                const edgeFade = Math.max(0, 1 - (distOuter - 0.84) / 0.16);
                data[idx + 3] = Math.round(data[idx + 3] * edgeFade);
              }
            }
          }

          ctx.putImageData(frame, 0, 0);
          if (!canvasReady) setCanvasReady(true);
        } catch (err) {
          // Fallback to CSS-blended video if canvas read is restricted
        }
      }

      animationFrameId = requestAnimationFrame(processFrame);
    };

    const startPlayback = () => {
      video.play().catch(() => {});
      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(processFrame);
      }
    };

    video.addEventListener('loadeddata', startPlayback);
    video.addEventListener('play', startPlayback);
    startPlayback();

    return () => {
      isMounted = false;
      video.removeEventListener('loadeddata', startPlayback);
      video.removeEventListener('play', startPlayback);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [src, variant, canvasReady]);

  return (
    <div
      className={`relative overflow-hidden select-none pointer-events-none flex items-center justify-center ${className}`}
      aria-label={ariaLabel}
    >
      {/* 1. Base Website Gradient Backdrop (#1F1025 to #2B1B30 + #FF6B00 Pumpkin Aura) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 52%, rgba(255, 107, 0, 0.34) 0%, rgba(251, 191, 36, 0.16) 34%, rgba(43, 27, 48, 0.88) 68%, #1F1025 100%)'
        }}
      />

      {/* 2. Source Video (visible as fallback with CSS radial mask until Canvas takes over) */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          canvasReady ? 'opacity-0 absolute inset-0' : 'opacity-100 relative z-10'
        }`}
        style={{
          WebkitMaskImage:
            'radial-gradient(circle at 50% 52%, #000 46%, rgba(0,0,0,0.65) 64%, transparent 88%)',
          maskImage:
            'radial-gradient(circle at 50% 52%, #000 46%, rgba(0,0,0,0.65) 64%, transparent 88%)'
        }}
      />

      {/* 3. Background-Keyed Canvas (Blends mascot, bats, leaves & branches directly onto website overlay) */}
      <canvas
        ref={canvasRef}
        className={` relative z-10 w-full h-full object-contain transition-opacity duration-300 ${
          canvasReady ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* 4. Top Website Overlay: Warm Jack-O-Lantern Glow + Midnight Purple Vignette Ring */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-20 pointer-events-none"
        style={{
          background:
            variant === 'hero'
              ? 'radial-gradient(circle at 50% 52%, rgba(255, 107, 0, 0.08) 0%, rgba(43, 27, 48, 0.18) 58%, rgba(31, 16, 37, 0.72) 86%, rgba(31, 16, 37, 0.95) 100%)'
              : 'radial-gradient(circle at 50% 52%, transparent 45%, rgba(31, 16, 37, 0.75) 90%, #1F1025 100%)'
        }}
      />
    </div>
  );
}
