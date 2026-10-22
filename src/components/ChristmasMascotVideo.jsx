import React, { useEffect, useRef, useState } from 'react';

/**
 * Renders the Christmas Mani Wandering mascot video in its natural aspect ratio
 * with real-time background removal, seamlessly blending the animated Christmas wreath,
 * peanut mascot, decorations, snowman, and presents directly into the website's dark navy background.
 */
export default function ChristmasMascotVideo({
  src = './images/gemini_generated_video_c3ecbe19.mp4',
  fallbackSrc = './images/mani-christmas-video.mp4',
  poster = './images/mani-christmas-poster.png',
  variant = 'hero', // 'hero' | 'badge'
  className = '',
  ariaLabel = 'Mani Wandering Christmas Peanut Mascot'
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const canvasReadyRef = useRef(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for user's prefers-reduced-motion preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = (e) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener?.('change', handleChange);
      return () => mediaQuery.removeEventListener?.('change', handleChange);
    }
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    let animationFrameId = null;
    let isMounted = true;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Website Christmas dark navy background RGB (#0B2545) for edge de-spilling
    const targetBgR = 11;
    const targetBgG = 37;
    const targetBgB = 69;

    // Pre-allocated buffers for flood fill to avoid GC pauses
    let bgMask = null;
    let queue = null;

    const processFrame = () => {
      if (!isMounted) return;

      if (video.readyState >= 2 && !video.ended) {
        const vw = video.videoWidth || 1280;
        const vh = video.videoHeight || 720;

        // Process at sharp resolution for hero display
        const procW = Math.min(vw, variant === 'hero' ? 896 : 380);
        const procH = Math.max(1, Math.round((procW * vh) / vw));
        const totalPixels = procW * procH;

        if (canvas.width !== procW || canvas.height !== procH) {
          canvas.width = procW;
          canvas.height = procH;
        }

        if (!bgMask || bgMask.length !== totalPixels) {
          bgMask = new Uint8Array(totalPixels);
          queue = new Int32Array(totalPixels);
        } else {
          bgMask.fill(0);
        }

        try {
          ctx.drawImage(video, 0, 0, procW, procH);
          const frame = ctx.getImageData(0, 0, procW, procH);
          const data = frame.data;

          const cx = procW * 0.5;
          const cy = procH * 0.486;

          // Inner protected core:
          // Center moon & mascot (dx/rx, dy/ry)
          const rxCore = procW * 0.35;
          const ryCore = procH * 0.416;

          // Bottom gifts & pumpkins range
          const yBottomPresents = procH * 0.695;
          const xLeftPresents = procW * 0.129;
          const xRightPresents = procW * 0.871;

          // Top ribbon
          const yTopRibbon = procH * 0.194;
          const xLeftRibbon = procW * 0.367;
          const xRightRibbon = procW * 0.633;

          const isProtectedCore = (x, y) => {
            const dx = (x - cx) / rxCore;
            const dy = (y - cy) / ryCore;
            if (dx * dx + dy * dy < 1.0) return true;
            if (y >= yBottomPresents && x >= xLeftPresents && x <= xRightPresents) return true;
            if (y <= yTopRibbon && x >= xLeftRibbon && x <= xRightRibbon) return true;
            return false;
          };

          const isBgColor = (p, x, y) => {
            // Far outer bounds
            if (y <= procH * 0.035 && (x < procW * 0.375 || x > procW * 0.625)) return true;
            if (y >= procH * 0.722 && (x <= procW * 0.129 || x >= procW * 0.871)) return true;
            if (x <= procW * 0.012 || x >= procW * 0.988) return true;

            const i = p * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Dark shadows/branches block flood
            const luma = (r + g + b) * 0.333333;
            if (luma < 48) return false;

            const maxC = Math.max(r, g, b);
            const minC = Math.min(r, g, b);
            const sat = maxC - minC;

            // Pine green needles block flood
            if ((g > r + 3 && g > b + 3) || (g >= 46 && r < 75 && b < 65)) return false;

            // Red accents block flood
            if (r > g + 16 && r > b + 16) return false;

            // Warm gold / orange / pumpkins / gifts block flood
            if (r - b > 28 && sat > 25 && luma < 240) return false;

            // Fairy lights block flood
            if (sat > 26) return false;

            return true;
          };

          let qHead = 0;
          let qTail = 0;

          // 1. Seed queue with border pixels
          for (let y = 0; y < procH; y++) {
            const rowOffset = y * procW;
            const pLeft = rowOffset;
            const pRight = rowOffset + (procW - 1);
            if (bgMask[pLeft] === 0) { bgMask[pLeft] = 1; queue[qTail++] = pLeft; }
            if (bgMask[pRight] === 0) { bgMask[pRight] = 1; queue[qTail++] = pRight; }
          }
          for (let x = 0; x < procW; x++) {
            const pTop = x;
            const pBottom = (procH - 1) * procW + x;
            if (bgMask[pTop] === 0) { bgMask[pTop] = 1; queue[qTail++] = pTop; }
            if (bgMask[pBottom] === 0) { bgMask[pBottom] = 1; queue[qTail++] = pBottom; }
          }

          // 2. BFS flood fill
          while (qHead < qTail) {
            const curr = queue[qHead++];
            const cxPix = curr % procW;
            const cyPix = (curr - cxPix) / procW;

            const neighbors = [
              cxPix > 0 ? curr - 1 : -1,
              cxPix < procW - 1 ? curr + 1 : -1,
              cyPix > 0 ? curr - procW : -1,
              cyPix < procH - 1 ? curr + procW : -1
            ];

            for (let nIdx = 0; nIdx < 4; nIdx++) {
              const n = neighbors[nIdx];
              if (n === -1 || bgMask[n] === 1) continue;
              const nx = n % procW;
              const ny = (n - nx) / procW;

              if (isProtectedCore(nx, ny)) continue;

              if (isBgColor(n, nx, ny)) {
                bgMask[n] = 1;
                queue[qTail++] = n;
              }
            }
          }

          // 3. Post-process: clear background and de-spill edge pixels
          for (let y = 0; y < procH; y++) {
            const rowOffset = y * procW;
            for (let x = 0; x < procW; x++) {
              const p = rowOffset + x;
              const idx = p * 4;

              if (bgMask[p] === 1) {
                data[idx + 3] = 0;
                continue;
              }

              if (isProtectedCore(x, y)) continue;

              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];
              const maxC = Math.max(r, g, b);
              const minC = Math.min(r, g, b);
              const sat = maxC - minC;
              const luma = (r + g + b) * 0.333333;

              const isGreen = (g > r + 3 && g > b + 3) || (g >= 46 && r < 75 && b < 65);
              const isRed = r > g + 16 && r > b + 16;
              const isGold = (r - b > 28) && (sat > 25);
              const isDark = luma < 45;

              // Remove stray neutral snowflake / background pocket
              if (!isGreen && !isRed && !isGold && !isDark && sat < 22) {
                bgMask[p] = 1;
                data[idx + 3] = 0;
                continue;
              }

              // De-spill and feather boundary pixels touching the transparent background
              const touchesBg =
                (x > 0 && bgMask[p - 1] === 1) ||
                (x < procW - 1 && bgMask[p + 1] === 1) ||
                (y > 0 && bgMask[p - procW] === 1) ||
                (y < procH - 1 && bgMask[p + procW] === 1);

              if (touchesBg) {
                if (luma > 70 && sat < 24) {
                  data[idx] = Math.round(r * 0.3 + targetBgR * 0.7);
                  data[idx + 1] = Math.round(g * 0.3 + targetBgG * 0.7);
                  data[idx + 2] = Math.round(b * 0.3 + targetBgB * 0.7);
                  data[idx + 3] = Math.round(255 * 0.4);
                }
              }
            }
          }

          ctx.putImageData(frame, 0, 0);
          if (!canvasReadyRef.current) {
            canvasReadyRef.current = true;
            setCanvasReady(true);
          }
        } catch (err) {
          // Ignore transient frame draw error
        }
      }

      animationFrameId = requestAnimationFrame(processFrame);
    };

    const silenceAudio = () => {
      video.defaultMuted = true;
      video.muted = true;
      video.volume = 0;
    };

    const startPlayback = () => {
      silenceAudio();
      video.play().catch(() => {});
      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(processFrame);
      }
    };

    silenceAudio();
    video.addEventListener('loadedmetadata', startPlayback);
    video.addEventListener('loadeddata', startPlayback);
    video.addEventListener('canplay', startPlayback);
    video.addEventListener('play', startPlayback);
    video.addEventListener('volumechange', silenceAudio);

    // Fallback if primary src fails to load
    const handleError = () => {
      if (video.src !== fallbackSrc && fallbackSrc) {
        video.src = fallbackSrc;
        video.load();
        startPlayback();
      }
    };
    video.addEventListener('error', handleError);

    startPlayback();

    return () => {
      isMounted = false;
      video.removeEventListener('loadedmetadata', startPlayback);
      video.removeEventListener('loadeddata', startPlayback);
      video.removeEventListener('canplay', startPlayback);
      video.removeEventListener('play', startPlayback);
      video.removeEventListener('volumechange', silenceAudio);
      video.removeEventListener('error', handleError);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [src, fallbackSrc, variant, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div
        className={`relative select-none pointer-events-none flex items-center justify-center ${className}`}
        aria-label={ariaLabel}
      >
        <img
          src={poster}
          alt={ariaLabel}
          className="w-full h-full object-contain pointer-events-none drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)]"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative select-none pointer-events-none flex items-center justify-center ${className}`}
      aria-label={ariaLabel}
    >
      {/* Hidden source video — strictly muted and offscreen */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onLoadedMetadata={(e) => {
          e.currentTarget.defaultMuted = true;
          e.currentTarget.muted = true;
          e.currentTarget.volume = 0;
        }}
        className="opacity-0 pointer-events-none absolute inset-0 w-full h-full object-contain"
      />

      {/* Immediate transparent static poster while video or canvas loads */}
      <img
        src={poster}
        alt={ariaLabel}
        className={`absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-300 drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)] ${
          canvasReady ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Real-time background-removed canvas blending seamlessly into website */}
      <canvas
        ref={canvasRef}
        className={`relative z-10 w-full h-full object-contain transition-opacity duration-200 drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)] ${
          canvasReady ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}
