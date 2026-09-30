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

    // Pre-allocate buffers for ultra-fast (<1ms) exterior flood-fill background removal
    let bgMask = null;
    let queue = null;

    const processFrame = () => {
      if (!isMounted) return;

      if (video.readyState >= 2 && !video.ended) {
        if (enforceCleanEnding()) {
          animationFrameId = requestAnimationFrame(processFrame);
          return;
        }

        const vw = video.videoWidth || 960;
        const vh = video.videoHeight || 540;

        // High-res processing width for crisp rendering and <1.5ms per-frame flood fill
        const procW = Math.min(vw, variant === 'hero' ? 768 : 280);
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

          // Central logo bounding box (x: 0.25..0.75, y: 0.04..0.94)
          // Everything outside this box is 100% outer background
          const minX = Math.floor(procW * 0.25);
          const maxX = Math.ceil(procW * 0.75);
          const minY = Math.floor(procH * 0.04);
          const maxY = Math.ceil(procH * 0.94);

          // Inner portal core where the mascot, pale moon glow, white eyes/fangs, and bills live
          const centerX = procW * 0.495;
          const centerY = procH * 0.54;
          const innerRx = procW * 0.145;
          const innerRy = procH * 0.205;

          // Helper: returns true if pixel `pIdx` is a background/white-border candidate (not dark outline & not saturated logo fill)
          const isBgCandidate = (pIdx) => {
            const i = pIdx * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const luma = (r + g + b) * 0.333333;
            // Solid dark-brown/black logo outline blocks flood fill
            if (luma < 76) return false;
            // Saturated orange/gold ("MANI WONDERING", pumpkins, portal) or purple orbs block flood fill
            const warmOrange = r - b;
            const purpleGlow = b - g;
            if (warmOrange >= 52 && luma < 225) return false;
            if (purpleGlow >= 24 && luma < 200) return false;
            return true;
          };

          let qHead = 0;
          let qTail = 0;

          // 1. Clear all pixels outside the central logo box and seed the flood-fill along the box perimeter
          for (let y = 0; y < procH; y++) {
            const rowOffset = y * procW;
            if (y <= minY || y >= maxY) {
              for (let x = 0; x < procW; x++) {
                const p = rowOffset + x;
                bgMask[p] = 1;
                data[p * 4 + 3] = 0;
                if ((y === minY || y === maxY) && x >= minX && x <= maxX) {
                  queue[qTail++] = p;
                }
              }
            } else {
              for (let x = 0; x <= minX; x++) {
                const p = rowOffset + x;
                bgMask[p] = 1;
                data[p * 4 + 3] = 0;
                if (x === minX) queue[qTail++] = p;
              }
              for (let x = maxX; x < procW; x++) {
                const p = rowOffset + x;
                bgMask[p] = 1;
                data[p * 4 + 3] = 0;
                if (x === maxX) queue[qTail++] = p;
              }
            }
          }

          // 2. BFS flood-fill from the exterior right up to the closed dark outline of the logo
          while (qHead < qTail) {
            const curr = queue[qHead++];
            const cx = curr % procW;
            const cy = (curr - cx) / procW;

            // 4-connected neighbors within [minX..maxX, minY..maxY]
            if (cx > minX) {
              const left = curr - 1;
              if (bgMask[left] === 0 && isBgCandidate(left)) {
                bgMask[left] = 1;
                data[left * 4 + 3] = 0;
                queue[qTail++] = left;
              }
            }
            if (cx < maxX) {
              const right = curr + 1;
              if (bgMask[right] === 0 && isBgCandidate(right)) {
                bgMask[right] = 1;
                data[right * 4 + 3] = 0;
                queue[qTail++] = right;
              }
            }
            if (cy > minY) {
              const up = curr - procW;
              if (bgMask[up] === 0 && isBgCandidate(up)) {
                bgMask[up] = 1;
                data[up * 4 + 3] = 0;
                queue[qTail++] = up;
              }
            }
            if (cy < maxY) {
              const down = curr + procW;
              if (bgMask[down] === 0 && isBgCandidate(down)) {
                bgMask[down] = 1;
                data[down * 4 + 3] = 0;
                queue[qTail++] = down;
              }
            }
          }

          // 3. Remove any enclosed white/gray sticker pockets outside the inner mascot portal & de-spill anti-aliased edges
          for (let y = minY + 1; y < maxY; y++) {
            const dyInner = (y - centerY) / innerRy;
            const dyInner2 = dyInner * dyInner;
            const rowOffset = y * procW;

            for (let x = minX + 1; x < maxX; x++) {
              const p = rowOffset + x;
              if (bgMask[p] === 1) continue;

              const dxInner = (x - centerX) / innerRx;
              const distInner2 = dxInner * dxInner + dyInner2;

              // Protect 100% of the inner arch portal (mascot eyes, fangs, skull, peso bills, moon glow)
              if (distInner2 < 1.0) continue;

              const idx = p * 4;
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];
              const luma = (r + g + b) * 0.333333;
              const warmOrange = r - b;
              const purpleGlow = b - g;

              // Check if this pixel touches the removed exterior background (anti-aliased outline edge)
              const touchesBg =
                bgMask[p - 1] === 1 ||
                bgMask[p + 1] === 1 ||
                bgMask[p - procW] === 1 ||
                bgMask[p + procW] === 1;

              // Enclosed neutral white/gray pockets outside the inner portal (e.g., between letters or arch curls)
              if (luma > 95 && warmOrange < 48 && purpleGlow < 22) {
                data[idx + 3] = 0;
                continue;
              }

              // De-spill and feather 1px anti-aliased boundary where dark outline meets removed white border
              if (touchesBg && luma > 48 && warmOrange < 55) {
                const edgeFade = Math.min(1, Math.max(0, (luma - 48) / 34));
                data[idx] = Math.round(r * (1 - edgeFade) + targetBgR * edgeFade);
                data[idx + 1] = Math.round(g * (1 - edgeFade) + targetBgG * edgeFade);
                data[idx + 2] = Math.round(b * (1 - edgeFade) + targetBgB * edgeFade);
                data[idx + 3] = Math.round(255 * (1 - edgeFade * 0.85));
              }
            }
          }

          ctx.putImageData(frame, 0, 0);
          if (!canvasReady) setCanvasReady(true);
        } catch (err) {
          // Ignore transient draw errors
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

    video.addEventListener('loadedmetadata', startPlayback);
    video.addEventListener('loadeddata', startPlayback);
    video.addEventListener('canplay', startPlayback);
    video.addEventListener('play', startPlayback);
    video.addEventListener('timeupdate', enforceCleanEnding);
    startPlayback();

    return () => {
      isMounted = false;
      video.removeEventListener('loadedmetadata', startPlayback);
      video.removeEventListener('loadeddata', startPlayback);
      video.removeEventListener('canplay', startPlayback);
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
      {/* Hidden source video — never shown directly so the raw white background can never appear */}
      <video
        ref={videoRef}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="opacity-0 pointer-events-none absolute inset-0 w-full h-full object-contain"
      />

      {/* Transparent background-removed canvas integrated directly into the website background */}
      <canvas
        ref={canvasRef}
        className={`relative z-10 w-full h-full object-contain transition-opacity duration-200 ${
          canvasReady ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}
