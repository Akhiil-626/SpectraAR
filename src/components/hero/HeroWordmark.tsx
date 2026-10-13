import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTheme } from '@/lib/theme';
import {
  WORDMARK_VIEWBOX,
  WORDMARK_WIDTH,
  WORDMARK_HEIGHT,
  WORDMARK_PATH_D,
  WORDMARK_TICKS,
  WORDMARK_CROSSHAIRS,
  WORDMARK_BBOX,
} from './wordmarkPath';

const CENTER_X = (WORDMARK_BBOX.x1 + WORDMARK_BBOX.x2) / 2;
const CENTER_Y = (WORDMARK_BBOX.y1 + WORDMARK_BBOX.y2) / 2;

export const HeroWordmark: React.FC = () => {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  // SVG circle refs inside the organic ink mask
  const scrollCircleRef = useRef<SVGCircleElement>(null);
  const cursorCircleRef = useRef<SVGCircleElement>(null);
  const trailCirclesRef = useRef<(SVGCircleElement | null)[]>([]);

  // Cached container rect to eliminate layout reads during pointer moves and rAF
  const cachedRectRef = useRef<{ left: number; top: number; width: number; height: number }>({
    left: 0,
    top: 0,
    width: 1200,
    height: 268,
  });

  const updateCachedRect = useCallback(() => {
    if (!containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      cachedRectRef.current = {
        left: r.left,
        top: r.top,
        width: r.width,
        height: r.height,
      };
    }
  }, []);

  useEffect(() => {
    updateCachedRect();
    window.addEventListener('resize', updateCachedRect);
    window.addEventListener('scroll', updateCachedRect, { passive: true });
    const ro = new ResizeObserver(updateCachedRect);
    if (containerRef.current) {
      ro.observe(containerRef.current);
    }
    return () => {
      window.removeEventListener('resize', updateCachedRect);
      window.removeEventListener('scroll', updateCachedRect);
      ro.disconnect();
    };
  }, [updateCachedRect]);

  // Radius R: responsive target radius based on viewport width
  const getRadiusCanvas = useCallback(() => {
    const w = cachedRectRef.current.width || 1200;
    let rScreen = 120;
    if (w >= 1200) {
      rScreen = 120;
    } else if (w >= 768) {
      const t = (w - 768) / (1200 - 768);
      rScreen = 90 + t * 30;
    } else {
      const t = Math.max(0, (w - 360) / (768 - 360));
      rScreen = 70 + t * 20;
    }
    return rScreen * (WORDMARK_WIDTH / w);
  }, []);

  // Animation state ref (transforms & attribute updates only, zero React re-renders in rAF loop)
  const animStateRef = useRef({
    cursorX: CENTER_X,
    cursorY: CENTER_Y,
    targetCursorX: CENTER_X,
    targetCursorY: CENTER_Y,
    cursorR: 0,
    targetCursorR: 0,
    scrollR: 0,
    targetScrollR: 0,
    isVisible: true,
    introSweep: 0, // 0..1 auto reveal sweep on load
    trail: Array.from({ length: 6 }, () => ({
      x: CENTER_X,
      y: CENTER_Y,
      r: 0,
    })),
  });

  // Check prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // JavaScript grows circle radius on scroll
  useEffect(() => {
    if (reducedMotion) return;
    const onScroll = () => {
      const sy = window.scrollY;
      // Grows radius on scroll smoothly from 0
      const targetR = Math.min(650, sy * 0.95);
      animStateRef.current.targetScrollR = targetR;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [reducedMotion]);

  // Main rAF loop for smooth spring growth, cursor following, and trailing droplets
  useEffect(() => {
    if (reducedMotion) return;

    let animId: number;

    const observer = new IntersectionObserver(([entry]) => {
      animStateRef.current.isVisible = entry.isIntersecting;
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    const render = () => {
      animId = requestAnimationFrame(render);
      const state = animStateRef.current;
      if (!state.isVisible || document.hidden) return;

      // 1. Interpolate cursor position and radius
      state.cursorX += (state.targetCursorX - state.cursorX) * 0.25;
      state.cursorY += (state.targetCursorY - state.cursorY) * 0.25;
      state.cursorR += (state.targetCursorR - state.cursorR) * 0.12;

      // 2. Interpolate scroll radius
      state.scrollR += (state.targetScrollR - state.scrollR) * 0.12;

      // 3. Auto intro reveal sweep on initial load
      if (state.introSweep >= 0 && state.introSweep <= 1) {
        state.introSweep += 0.014;
        if (state.introSweep > 1) {
          state.introSweep = -1;
        }
      }

      // Update cursor circle in mask
      if (cursorCircleRef.current) {
        cursorCircleRef.current.setAttribute('cx', state.cursorX.toFixed(1));
        cursorCircleRef.current.setAttribute('cy', state.cursorY.toFixed(1));
        cursorCircleRef.current.setAttribute('r', Math.max(0, state.cursorR).toFixed(1));
      }

      // Update scroll circle in mask
      if (scrollCircleRef.current) {
        let effectiveScrollR = state.scrollR;
        if (state.introSweep >= 0 && state.introSweep <= 1) {
          const sweepCurve = Math.sin(state.introSweep * Math.PI);
          effectiveScrollR = Math.max(effectiveScrollR, sweepCurve * 95);
        }
        scrollCircleRef.current.setAttribute('r', Math.max(0, effectiveScrollR).toFixed(1));
      }

      // 4. Update trailing droplets
      const N = state.trail.length;
      for (let i = 0; i < N; i++) {
        const prev = i === 0 ? { x: state.cursorX, y: state.cursorY } : state.trail[i - 1];
        const curr = state.trail[i];
        curr.x += (prev.x - curr.x) * 0.35;
        curr.y += (prev.y - curr.y) * 0.35;
        const trailFactor = Math.max(0, 1 - (i + 1) / (N + 1));
        curr.r = state.cursorR * trailFactor * 0.85;

        const el = trailCirclesRef.current[i];
        if (el) {
          el.setAttribute('cx', curr.x.toFixed(1));
          el.setAttribute('cy', curr.y.toFixed(1));
          el.setAttribute('r', Math.max(0, curr.r).toFixed(1));
        }
      }
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, [reducedMotion]);

  // Handle pointer coordinates mapping using cached rect (no layout reads)
  const updatePointer = useCallback(
    (clientX: number, clientY: number) => {
      const rect = cachedRectRef.current;
      if (rect.width <= 0 || rect.height <= 0) return;

      const scaleX = WORDMARK_WIDTH / rect.width;
      const scaleY = WORDMARK_HEIGHT / rect.height;
      const x = (clientX - rect.left) * scaleX;
      const y = (clientY - rect.top) * scaleY;

      const state = animStateRef.current;
      state.targetCursorX = x;
      state.targetCursorY = y;
      state.targetCursorR = getRadiusCanvas();
      setCursorPos({ x, y });
    },
    [getRadiusCanvas]
  );

  const handlePointerEnter = (e: React.PointerEvent) => {
    setIsHovered(true);
    animStateRef.current.targetCursorR = getRadiusCanvas();
    updatePointer(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    updatePointer(e.clientX, e.clientY);
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    setCursorPos(null);
    animStateRef.current.targetCursorR = 0; // decays smoothly back to 0
  };

  return (
    <div
      ref={containerRef}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative w-full max-w-[1420px] mx-auto select-none touch-none cursor-none"
      style={{ aspectRatio: `${WORDMARK_WIDTH} / ${WORDMARK_HEIGHT}` }}
      aria-label="SpectraAR Hero Wordmark"
    >
      <svg
        viewBox={WORDMARK_VIEWBOX}
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Shared organic ink filter: feTurbulence + feDisplacementMap + feGaussianBlur + feComponentTransfer */}
          <filter
            id="spectra-ink-filter"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
            filterUnits="userSpaceOnUse"
            primitiveUnits="userSpaceOnUse"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.04"
              numOctaves="3"
              result="noise"
              seed="3"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="100"
              xChannelSelector="R"
              yChannelSelector="G"
              result="warped"
            />
            <feGaussianBlur in="warped" stdDeviation="1.8" result="blurred" />
            <feComponentTransfer in="blurred" result="sharpened">
              <feFuncA type="linear" slope="2.2" intercept="-0.6" />
            </feComponentTransfer>
          </filter>

          {/* SVG Mask holding circles whose radius starts at 0 */}
          <mask
            id="spectra-ink-mask"
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width={WORDMARK_WIDTH}
            height={WORDMARK_HEIGHT}
          >
            <rect width={WORDMARK_WIDTH} height={WORDMARK_HEIGHT} fill="black" />
            <g filter={reducedMotion ? undefined : 'url(#spectra-ink-filter)'}>
              {/* Scroll-driven circle that grows on scroll */}
              <circle
                ref={scrollCircleRef}
                cx={CENTER_X}
                cy={CENTER_Y}
                r="0"
                fill="white"
              />
              {/* Cursor-following circle whose radius grows on hover */}
              <circle
                ref={cursorCircleRef}
                cx={CENTER_X}
                cy={CENTER_Y}
                r="0"
                fill="white"
              />
              {/* Trailing droplet circles that merge into liquid ink */}
              {Array.from({ length: 6 }).map((_, idx) => (
                <circle
                  key={idx}
                  ref={(el) => {
                    trailCirclesRef.current[idx] = el;
                  }}
                  cx={CENTER_X}
                  cy={CENTER_Y}
                  r="0"
                  fill="white"
                />
              ))}
            </g>
          </mask>
        </defs>

        {/* 1. Underlying Wordmark Layer with soft light tint instead of being blank */}
        <path
          d={WORDMARK_PATH_D}
          fill="rgba(var(--color-fg-rgb) / 0.14)"
          stroke="var(--color-border)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          className="transition-colors duration-200"
          style={{ strokeWidth: 'clamp(1.5px, 0.22vw, 2.5px)' }}
        />

        {/* 2. Ink Reveal Layer: solid 100% Cream (dark) or Navy (light) revealed on hover/scroll */}
        <path
          d={WORDMARK_PATH_D}
          fill={theme === 'dark' ? '#F4EBD0' : '#0B1F3A'}
          mask="url(#spectra-ink-mask)"
          className="pointer-events-none transition-colors duration-200"
        />

        {/* Small registration tick marks at path corners and midpoints */}
        <g
          stroke="var(--color-border)"
          strokeWidth="1.5"
          style={{ strokeWidth: 'clamp(1.0px, 0.14vw, 1.5px)' }}
        >
          {WORDMARK_TICKS.map((t, idx) => (
            <line key={`tick-${idx}`} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} />
          ))}
        </g>

        {/* Technical crosshairs (+) at centers of rounded letters */}
        <g
          stroke="var(--color-accent)"
          strokeWidth="1.5"
          opacity="0.8"
          style={{ strokeWidth: 'clamp(1.0px, 0.14vw, 1.5px)' }}
        >
          {WORDMARK_CROSSHAIRS.map((c, idx) => (
            <g key={`cross-${idx}`}>
              <line
                x1={c.cx - c.size / 2}
                y1={c.cy}
                x2={c.cx + c.size / 2}
                y2={c.cy}
              />
              <line
                x1={c.cx}
                y1={c.cy - c.size / 2}
                x2={c.cx}
                y2={c.cy + c.size / 2}
              />
            </g>
          ))}
        </g>
      </svg>

      {/* Small solid accent-colored square (8px, bg-accent) marking exact cursor position */}
      {isHovered && cursorPos && !reducedMotion && (
        <div
          className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 bg-accent z-20"
          style={{
            width: '8px',
            height: '8px',
            left: `${(cursorPos.x / WORDMARK_WIDTH) * 100}%`,
            top: `${(cursorPos.y / WORDMARK_HEIGHT) * 100}%`,
          }}
        />
      )}
    </div>
  );
};
