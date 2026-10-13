import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

interface FlipTextProps {
  text: string;
  mode?: 'inView' | 'hover';
  isHovered?: boolean;
  staggerMs?: number;
  durationMs?: number;
  className?: string;
  asHeading?: boolean;
}

export const FlipText: React.FC<FlipTextProps> = ({
  text,
  mode = 'inView',
  isHovered = false,
  staggerMs,
  durationMs,
  className = '',
}) => {
  const containerRef = useRef<HTMLSpanElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const inView = useInView(containerRef, { once: true, amount: 0.2 });

  const [animating, setAnimating] = useState(false);
  const [waveKey, setWaveKey] = useState(0);

  const defaultStagger = mode === 'inView' ? 40 : 20;
  const defaultDuration = mode === 'inView' ? 450 : 350;
  const stagger = (staggerMs ?? defaultStagger) / 1000;
  const duration = (durationMs ?? defaultDuration) / 1000;

  // Trigger wave on hover / focus change
  const prevHovered = useRef(isHovered);
  useEffect(() => {
    if (mode === 'hover' && isHovered && !prevHovered.current) {
      setWaveKey((k) => k + 1);
      setAnimating(true);
      const totalTime = text.length * (stagger * 1000) + duration * 1000;
      const timer = setTimeout(() => setAnimating(false), totalTime + 50);
      return () => clearTimeout(timer);
    }
    prevHovered.current = isHovered;
  }, [isHovered, mode, text.length, stagger, duration]);

  // Touch device support for hover mode: play once on inView
  const playedTouchInView = useRef(false);
  useEffect(() => {
    if (mode === 'hover' && inView && !playedTouchInView.current && typeof window !== 'undefined') {
      const isTouch = window.matchMedia('(hover: none)').matches;
      if (isTouch) {
        playedTouchInView.current = true;
        setWaveKey((k) => k + 1);
        setAnimating(true);
        const totalTime = text.length * (stagger * 1000) + duration * 1000;
        const timer = setTimeout(() => setAnimating(false), totalTime + 50);
        return () => clearTimeout(timer);
      }
    }
  }, [inView, mode, text.length, stagger, duration]);

  // Track inView animation settling
  useEffect(() => {
    if (mode === 'inView' && inView) {
      setAnimating(true);
      const totalTime = text.length * (stagger * 1000) + duration * 1000;
      const timer = setTimeout(() => setAnimating(false), totalTime + 50);
      return () => clearTimeout(timer);
    }
  }, [inView, mode, text.length, stagger, duration]);

  // If prefers-reduced-motion, render static text with accessible label
  if (shouldReduceMotion) {
    return (
      <span aria-label={text} className={`inline-block ${className}`}>
        {text}
      </span>
    );
  }

  const chars = text.split('');

  return (
    <span
      ref={containerRef}
      aria-label={text}
      className={`inline-block select-none [perspective:1000px] ${className}`}
    >
      {chars.map((char, idx) => {
        const isSpace = char === ' ';
        const displayChar = isSpace ? '\u00A0' : char;

        return (
          <motion.span
            key={`${waveKey}-${idx}`}
            aria-hidden="true"
            initial={
              mode === 'inView'
                ? { rotateX: -90, opacity: 0 }
                : { rotateX: 0, opacity: 1 }
            }
            animate={
              mode === 'inView'
                ? inView
                  ? { rotateX: 0, opacity: 1 }
                  : { rotateX: -90, opacity: 0 }
                : waveKey > 0
                ? {
                    rotateX: [0, -90, 0],
                    opacity: [1, 0.4, 1],
                  }
                : { rotateX: 0, opacity: 1 }
            }
            transition={{
              duration,
              delay: idx * stagger,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{
              display: 'inline-block',
              transformOrigin: '50% 50%',
              backfaceVisibility: 'hidden',
              willChange: animating ? 'transform' : 'auto',
            }}
          >
            {displayChar}
          </motion.span>
        );
      })}
    </span>
  );
};
