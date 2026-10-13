import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@/lib/theme';

export const CustomCursor: React.FC = () => {
  const { theme } = useTheme();
  const location = useLocation();
  const [isFinePointer, setIsFinePointer] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const burstRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  // Mutable animation state (no React re-renders in rAF loop)
  const stateRef = useRef({
    // Current raw pointer
    mouseX: -100,
    mouseY: -100,
    prevMouseX: -100,
    prevMouseY: -100,
    speed: 0,
    smoothedSpeed: 0,
    dirAngle: 0,

    // Trailing points for canvas line (14 points, ~50% length)
    trail: Array.from({ length: 14 }, () => ({ x: -100, y: -100 })),

    // Follower state (centered on pointer with lerp 0.15)
    followerX: -100,
    followerY: -100,
    followerAngle: 0,
    followerSize: 24,

    // Click burst & compression
    isClicking: false,
    clickScale: 1,
    clickScaleTimer: 0,
    burstActive: false,
    burstStart: 0,

    // Hover state (fixed-size scaling, NO element rect snapping)
    hoverMode: 'default' as 'default' | 'clickable' | 'select' | 'text',

    // Visibility
    isVisible: false,
    isTabVisible: true,
    isHiddenOverSlot: false,
  });

  // Reset hover state immediately on route change
  useEffect(() => {
    const state = stateRef.current;
    state.hoverMode = 'default';
    state.isHiddenOverSlot = false;
  }, [location.pathname]);

  // Check device capabilities (pointer: fine & reduced motion)
  useEffect(() => {
    const fineMq = window.matchMedia('(pointer: fine)');
    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');

    setIsFinePointer(fineMq.matches);
    setReducedMotion(motionMq.matches);

    const onFineChange = (e: MediaQueryListEvent) => setIsFinePointer(e.matches);
    const onMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);

    fineMq.addEventListener('change', onFineChange);
    motionMq.addEventListener('change', onMotionChange);

    return () => {
      fineMq.removeEventListener('change', onFineChange);
      motionMq.removeEventListener('change', onMotionChange);
    };
  }, []);

  // Update canvas size on window resize / DPR
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }, []);

  // Listeners for pointer movement, clicks, visibility and hover detection
  useEffect(() => {
    if (!isFinePointer) return;

    document.body.classList.add('has-custom-cursor');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const updateHoverFromElement = (target: Element | null) => {
      const state = stateRef.current;
      if (!target) {
        state.hoverMode = 'default';
        state.isHiddenOverSlot = false;
        return;
      }

      // 1. Safety rules: completely hidden over marker slots, fullscreen, sliders, gap bar, inputs
      const inMarkerSlot = !!target.closest('[data-marker-slot]');
      const inFullscreen = !!target.closest('[data-fullscreen-marker]');
      const inGapBar =
        !!target.closest('aside[aria-label="Slot gap adjustment"]') ||
        !!target.closest('[data-gap-bar]');
      const inSlider =
        !!target.closest('[role="slider"]') ||
        !!target.closest('input[type="range"]');
      const inCanvas = !!target.closest('.marker-canvas');
      const inInput =
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      state.isHiddenOverSlot =
        inMarkerSlot || inFullscreen || inGapBar || inSlider || inCanvas || inInput;

      if (state.isHiddenOverSlot) {
        state.hoverMode = 'default';
        return;
      }

      // 2. Hover modes (fixed size centered scaling, no rect snapping)
      const select = target.closest('select, [role="combobox"], [data-hover-select]');
      if (select) {
        state.hoverMode = 'select';
        return;
      }

      const clickable = target.closest(
        'a, button, [role="button"], .module-row, [data-hover-clickable]'
      );
      if (clickable) {
        state.hoverMode = 'clickable';
        return;
      }

      const isText =
        target.tagName === 'P' ||
        target.tagName === 'H1' ||
        target.tagName === 'H2' ||
        target.tagName === 'H3' ||
        target.tagName === 'H4' ||
        target.tagName === 'SPAN' ||
        target.tagName === 'LABEL';

      if (isText) {
        state.hoverMode = 'text';
      } else {
        state.hoverMode = 'default';
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const state = stateRef.current;
      state.mouseX = e.clientX;
      state.mouseY = e.clientY;
      state.isVisible = true;

      // Initialize trail positions on first move
      if (state.trail[0].x < 0) {
        for (let i = 0; i < state.trail.length; i++) {
          state.trail[i].x = e.clientX;
          state.trail[i].y = e.clientY;
        }
        state.followerX = e.clientX;
        state.followerY = e.clientY;
        state.prevMouseX = e.clientX;
        state.prevMouseY = e.clientY;
      }
    };

    const handlePointerOver = (e: PointerEvent) => {
      updateHoverFromElement(e.target as Element | null);
    };

    const handlePointerOut = (e: PointerEvent) => {
      updateHoverFromElement(e.relatedTarget as Element | null);
    };

    const handleMouseDown = () => {
      const state = stateRef.current;
      if (state.isHiddenOverSlot || !state.isVisible) return;
      state.isClicking = true;
      state.clickScale = 0.7;
      state.clickScaleTimer = performance.now();
      state.burstActive = true;
      state.burstStart = performance.now();
    };

    const handleMouseUp = () => {
      stateRef.current.isClicking = false;
    };

    const handleMouseLeave = () => {
      const state = stateRef.current;
      state.isVisible = false;
      state.hoverMode = 'default';
    };

    const handleScroll = () => {
      stateRef.current.hoverMode = 'default';
    };

    const handleBlur = () => {
      const state = stateRef.current;
      state.hoverMode = 'default';
      state.isVisible = false;
    };

    const handleVisibilityChange = () => {
      stateRef.current.isTabVisible = !document.hidden;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('pointerover', handlePointerOver, { passive: true });
    document.addEventListener('pointerout', handlePointerOut, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.body.classList.remove('has-custom-cursor');
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('pointerover', handlePointerOver);
      document.removeEventListener('pointerout', handlePointerOut);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isFinePointer, resizeCanvas]);

  // Main high-performance requestAnimationFrame loop (transforms only, no layout reads)
  useEffect(() => {
    if (!isFinePointer) return;

    let animId: number;

    const loop = (now: number) => {
      animId = requestAnimationFrame(loop);

      const state = stateRef.current;
      const canvas = canvasRef.current;
      const head = headRef.current;
      const follower = followerRef.current;
      const burst = burstRef.current;
      const label = labelRef.current;

      if (!head || !follower || !canvas || !label) return;

      // Pause rendering when tab is hidden or pointer out/hidden over slot
      if (!state.isTabVisible || !state.isVisible || state.isHiddenOverSlot) {
        head.style.opacity = '0';
        follower.style.opacity = '0';
        label.style.opacity = '0';
        if (burst) burst.style.opacity = '0';
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        return;
      }

      // 1. Compute velocity & directional angle
      const dx = state.mouseX - state.prevMouseX;
      const dy = state.mouseY - state.prevMouseY;
      const frameSpeed = Math.hypot(dx, dy);

      // Lerp smoothed speed
      state.smoothedSpeed += (frameSpeed - state.smoothedSpeed) * 0.25;
      state.prevMouseX = state.mouseX;
      state.prevMouseY = state.mouseY;

      if (frameSpeed > 0.5) {
        state.dirAngle = Math.atan2(dy, dx) * (180 / Math.PI);
      }

      // 2. HEAD: 8px solid accent square with zero lag & velocity stretch
      head.style.opacity = '1';
      if (reducedMotion) {
        // Reduced motion: standard square, no stretch
        head.style.width = '8px';
        head.style.height = '8px';
        head.style.borderRadius = '0px';
        head.style.transform = `translate3d(${state.mouseX - 4}px, ${state.mouseY - 4}px, 0)`;
      } else if (state.hoverMode === 'text') {
        // Over text: head becomes a 2px x 20px vertical bar
        head.style.width = '2px';
        head.style.height = '20px';
        head.style.borderRadius = '1px';
        head.style.transform = `translate3d(${state.mouseX - 1}px, ${state.mouseY - 10}px, 0)`;
      } else {
        // Velocity stretch: faster movement stretches head into line segment aligned with movement direction
        const stretch = Math.min(3.0, 1.0 + state.smoothedSpeed * 0.08);
        if (stretch > 1.08) {
          head.style.width = `${(8 * stretch).toFixed(1)}px`;
          head.style.height = `${(8 / Math.sqrt(stretch)).toFixed(1)}px`;
          head.style.borderRadius = '1px';
          head.style.transform = `translate3d(${state.mouseX}px, ${state.mouseY}px, 0) translate(-50%, -50%) rotate(${state.dirAngle.toFixed(1)}deg)`;
        } else {
          head.style.width = '8px';
          head.style.height = '8px';
          head.style.borderRadius = '0px';
          head.style.transform = `translate3d(${state.mouseX - 4}px, ${state.mouseY - 4}px, 0)`;
        }
      }

      // 3. TRAIL LINE: continuous 1.5px line following head like a tail (28 points, lerp 0.3)
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        if (!reducedMotion) {
          // Update trail positions
          state.trail[0].x = state.mouseX;
          state.trail[0].y = state.mouseY;

          let totalDist = 0;
          for (let i = 1; i < state.trail.length; i++) {
            const pPrev = state.trail[i - 1];
            const pCurr = state.trail[i];
            const segDx = pPrev.x - pCurr.x;
            const segDy = pPrev.y - pCurr.y;
            pCurr.x += segDx * 0.43;
            pCurr.y += segDy * 0.43;
            totalDist += Math.hypot(segDx, segDy);
          }

          // If still, tail naturally snaps in and shortens to head
          if (totalDist > 1.2) {
            const N = state.trail.length;
            const isDark = theme === 'dark';

            // Draw smooth quadratic curves through midpoints with tapering width & stepped per-segment alpha
            for (let i = 0; i < N - 1; i++) {
              const p0 = state.trail[i];
              const p1 = state.trail[i + 1];
              const pNext = state.trail[Math.min(i + 2, N - 1)];

              const midX1 = (p0.x + p1.x) * 0.5;
              const midY1 = (p0.y + p1.y) * 0.5;
              const midX2 = (p1.x + pNext.x) * 0.5;
              const midY2 = (p1.y + pNext.y) * 0.5;

              const t = i / (N - 1);
              // Line width tapering from head (2.0px) to tail (0.5px)
              const lineWidth = 2.0 * (1 - t) + 0.5 * t;

              // Opacity fading toward tail with stepped per-segment alpha
              const rawAlpha = Math.max(0, (1 - t) * 0.85);
              const steppedAlpha = Math.floor(rawAlpha * 8) / 8;

              if (steppedAlpha <= 0.02) continue;

              ctx.beginPath();
              ctx.lineWidth = lineWidth;
              ctx.lineCap = 'round';
              ctx.lineJoin = 'round';
              ctx.strokeStyle = isDark
                ? `rgba(244, 235, 208, ${steppedAlpha})`
                : `rgba(11, 31, 58, ${steppedAlpha})`;

              ctx.moveTo(midX1, midY1);
              ctx.quadraticCurveTo(p1.x, p1.y, midX2, midY2);
              ctx.stroke();
            }
          }
        }
      }

      // 4. OUTLINE FOLLOWER: centered on pointer, scales to fixed size on hover (NO rect snapping)
      follower.style.opacity = '1';
      state.followerX += (state.mouseX - state.followerX) * 0.15;
      state.followerY += (state.mouseY - state.followerY) * 0.15;

      // Follower tilt (rotates slightly toward movement direction, max 15 deg, eases to 0)
      const targetTilt = frameSpeed > 0.5 ? Math.max(-15, Math.min(15, dx * 0.4)) : 0;
      state.followerAngle += (targetTilt - state.followerAngle) * 0.12;

      // Click scale animation (inward to 0.7 for 120ms)
      if (state.clickScale < 1) {
        const elapsed = now - state.clickScaleTimer;
        if (elapsed > 120) {
          state.clickScale = 1;
        } else {
          state.clickScale = 0.7 + (elapsed / 120) * 0.3;
        }
      }

      // Target size: 24px default, 38px over interactive elements
      const isInteractive =
        state.hoverMode === 'clickable' || state.hoverMode === 'select';
      const targetSize = isInteractive ? 38 : 24;
      state.followerSize += (targetSize - state.followerSize) * 0.25;

      const fSize = state.followerSize;
      const fX = state.followerX - fSize * 0.5;
      const fY = state.followerY - fSize * 0.5;

      follower.style.transform = `translate3d(${fX.toFixed(1)}px, ${fY.toFixed(1)}px, 0) rotate(${state.followerAngle.toFixed(1)}deg) scale(${state.clickScale})`;
      follower.style.width = `${fSize.toFixed(1)}px`;
      follower.style.height = `${fSize.toFixed(1)}px`;
      follower.style.borderRadius = isInteractive ? '8px' : '4px';
      follower.style.borderColor = isInteractive
        ? 'var(--color-accent)'
        : 'var(--color-border)';

      // 5. CLICK BURST: expanding 1px outline square that fades out in 400ms
      if (burst && state.burstActive && !reducedMotion) {
        const burstElapsed = now - state.burstStart;
        if (burstElapsed > 400) {
          state.burstActive = false;
          burst.style.opacity = '0';
        } else {
          const burstProgress = burstElapsed / 400;
          const burstSize = 24 + burstProgress * 28;
          const burstOpacity = 1 - burstProgress;
          burst.style.opacity = burstOpacity.toFixed(2);
          burst.style.width = `${burstSize.toFixed(1)}px`;
          burst.style.height = `${burstSize.toFixed(1)}px`;
          burst.style.transform = `translate3d(${state.followerX - burstSize * 0.5}px, ${state.followerY - burstSize * 0.5}px, 0)`;
        }
      }

      // 6. COORDINATE LABEL: live mono X:0000PX Y:0000PX, anchored beside outline follower
      label.style.opacity = '1';
      if (state.hoverMode === 'clickable') {
        label.textContent = 'OPEN';
        label.style.color = 'var(--color-accent)';
      } else if (state.hoverMode === 'select') {
        label.textContent = 'SELECT';
        label.style.color = 'var(--color-accent)';
      } else {
        const pxX = Math.max(0, Math.round(state.mouseX)).toString().padStart(4, '0');
        const pxY = Math.max(0, Math.round(state.mouseY)).toString().padStart(4, '0');
        label.textContent = `X:${pxX}PX Y:${pxY}PX`;
        label.style.color = 'var(--color-text-muted)';
      }

      // Anchor label next to follower bottom-right
      const labelX = fX + fSize + 6;
      const labelY = fY + fSize - 10;
      label.style.transform = `translate3d(${labelX.toFixed(1)}px, ${labelY.toFixed(1)}px, 0)`;
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isFinePointer, reducedMotion, theme]);

  if (!isFinePointer) return null;

  return (
    <div
      data-custom-cursor="true"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden select-none"
    >
      {/* 1. Continuous trailing velocity curve canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none w-full h-full"
      />

      {/* 2. Expanding 1px click burst square */}
      <div
        ref={burstRef}
        className="fixed top-0 left-0 border border-accent pointer-events-none opacity-0 rounded-[4px] will-change-transform"
      />

      {/* 3. Outline follower (centered on pointer with fixed scale on hover) */}
      <div
        ref={followerRef}
        className="fixed top-0 left-0 border pointer-events-none will-change-transform"
        style={{
          width: '24px',
          height: '24px',
          borderColor: 'var(--color-border)',
        }}
      />

      {/* 4. Live Coordinate / Action Label */}
      <div
        ref={labelRef}
        className="fixed top-0 left-0 font-mono text-[9px] tracking-widest whitespace-nowrap pointer-events-none opacity-0 will-change-transform select-none"
      />

      {/* 5. Solid Accent Pointer Head (8px, bg-accent, zero lag, velocity stretch) */}
      <div
        ref={headRef}
        className="fixed top-0 left-0 bg-accent pointer-events-none opacity-0 will-change-transform"
      />
    </div>
  );
};
