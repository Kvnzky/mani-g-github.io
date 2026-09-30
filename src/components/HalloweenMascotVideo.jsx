import React, { useEffect, useRef, useState } from 'react';

/**
 * Renders the Halloween Mani Wandering mascot video directly in its natural
 * rectangular aspect ratio (no circular frame, no circular border, no oval mask,
 * no cropping), seamlessly integrated into the website background.
 */
export default function HalloweenMascotVideo({
  src = './images/mani-halloween-video.mp4',
  poster = './images/logo.png',
  variant = 'hero', // 'hero' | 'badge' | 'header'
  trimEndSeconds = 6.8, // Trim out the unwanted final segment (7.0s-10.0s) so the video ends & loops cleanly
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

    // Website dark indigo RGB (#2B1B30) used for de-spilling anti-aliased checkerboard edges
    const targetBgR = 43;
    const targetBgG = 27;
    const targetBgB = 48;

    // Immediately loop back to start before the unwanted ending artifact appears
    const enforceCleanEnding = () => {
      if (trimEndSeconds > 0 && video.currentTime >= trimEndSeconds) {
        video.currentTime = 0;
        if (video.paused) {
          video.play().catch(() => {});
        }
        return true;
      }
      return false;
    };

    const processFrame = () => {
      if (!isMounted) return;

      if (video.readyState >= 2 && !video.paused && !video.ended) {
        if (enforceCleanEnding()) {
          animationFrameId = requestAnimationFrame(processFrame);
          return;
        }

        const vw = video.videoWidth || 1280;
        const vh = video.videoHeight || 720;

        // Preserve full natural aspect ratio at native HD resolution for the larger hero display
        const procW = Math.min(vw, variant === 'hero' ? 1280 : 280);
        const procH = Math.max(1, Math.round((procW * vh) / vw));

        if (canvas.width !== procW || canvas.height !== procH) {
          canvas.width = procW;
          canvas.height = procH;
        }

        try {
          ctx.drawImage(video, 0, 0, procW, procH);
          const frame = ctx.getImageData(0, 0, procW, procH);
          const data = frame.data;

          // Protect the mascot's face/body core (white eyes & fangs) while keying out the outer checkerboard
          const centerX = procW * 0.5;
          const centerY = procH * 0.53;
          const innerRx = procW * 0.165;
          const innerRy = procH * 0.31;

          // Subtle rectangular edge feather (outer 3% of rectangle edges only — no circular/oval clipping)
          const edgeMarginX = procW * 0.03;
          const edgeMarginY = procH * 0.03;

          for (let y = 0; y < procH; y++) {
            const dyInner = (y - centerY) / innerRy;
            const dyInner2 = dyInner * dyInner;

            let rectFadeY = 1;
            if (y < edgeMarginY) {
              rectFadeY = y / edgeMarginY;
            } else if (y > procH - edgeMarginY) {
              rectFadeY = (procH - y) / edgeMarginY;
            }

            for (let x = 0; x < procW; x++) {
              const idx = (y * procW + x) * 4;
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];

              const dxInner = (x - centerX) / innerRx;
              const distInner = Math.sqrt(dxInner * dxInner + dyInner2);

              // 0 inside mascot core (eyes/fangs), 1 outside portal arch where checkerboard is present
              let outsideCore = 0;
              if (distInner > 0.72) {
                outsideCore = Math.min(1, (distInner - 0.72) / 0.32);
              }

              if (outsideCore > 0) {
                const maxC = r > g ? (r > b ? r : b) : (g > b ? g : b);
                const minC = r < g ? (r < b ? r : b) : (g < b ? g : b);
                const chroma = maxC - minC;
                const luma = (r + g + b) * 0.333333;

                // Key out light neutral checkerboard background so website background shows through
                if (luma > 145 && chroma < 32) {
                  const lumaFactor = Math.min(1, Math.max(0, (luma - 145) / 68));
                  const chromaFactor = Math.min(1, Math.max(0, (32 - chroma) / 20));
                  const bgStrength = lumaFactor * chromaFactor * outsideCore;

                  if (bgStrength > 0.01) {
                    const spill = Math.min(1, bgStrength * 1.15);
                    data[idx] = Math.round(r * (1 - spill) + targetBgR * spill);
                    data[idx + 1] = Math.round(g * (1 - spill) + targetBgG * spill);
                    data[idx + 2] = Math.round(b * (1 - spill) + targetBgB * spill);
                    data[idx + 3] = Math.round(255 * Math.max(0, 1 - bgStrength * 1.08));
                  }
                }
              }

              // Feather only the very outer 3% rectangular border so no hard seam appears
              let rectFadeX = 1;
              if (x < edgeMarginX) {
                rectFadeX = x / edgeMarginX;
              } else if (x > procW - edgeMarginX) {
                rectFadeX = (procW - x) / edgeMarginX;
              }
              const rectEdgeFade = rectFadeX < rectFadeY ? rectFadeX : rectFadeY;
              if (rectEdgeFade < 1) {
                data[idx + 3] = Math.round(data[idx + 3] * Math.max(0, rectEdgeFade));
              }
            }
          }

          ctx.putImageData(frame, 0, 0);
          if (!canvasReady) setCanvasReady(true);
        } catch (err) {
          // Fallback to raw video if canvas read is restricted
        }
      }

      animationFrameId = requestAnimationFrame(processFrame);
    };

    const startPlayback = () => {
      enforceCleanEnding();
      video.play().catch(() => {});
      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(processFrame);
      }
    };

    video.addEventListener('loadeddata', startPlayback);
    video.addEventListener('play', startPlayback);
    video.addEventListener('timeupdate', enforceCleanEnding);
    startPlayback();

    return () => {
      isMounted = false;
      video.removeEventListener('loadeddata', startPlayback);
      video.removeEventListener('play', startPlayback);
      video.removeEventListener('timeupdate', enforceCleanEnding);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [src, variant, trimEndSeconds, canvasReady]);

  return (
    <div
      className={`relative select-none pointer-events-none flex items-center justify-center ${className}`}
      aria-label={ariaLabel}
    >
      {/* Source Video in its natural rectangular aspect ratio (no circular mask or cropping) */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className={`w-full h-full object-contain transition-opacity duration-300 ${
          canvasReady ? 'opacity-0 absolute inset-0' : 'opacity-100 relative z-10'
        }`}
      />

      {/* Full Rectangular Uncropped Canvas Integrated Directly Into Website Background */}
      <canvas
        ref={canvasRef}
        className={`relative z-10 w-full h-full object-contain transition-opacity duration-300 ${
          canvasReady ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}
