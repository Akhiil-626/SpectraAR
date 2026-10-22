import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  useScroll,
  useTransform,
  useVelocity,
  useSpring,
  useInView,
  useReducedMotion,
  useMotionValueEvent,
} from 'framer-motion';
import {
  ArrowDown,
  ArrowUpRight,
  SunMedium,
  Smartphone,
  Maximize,
  SlidersHorizontal,
} from 'lucide-react';
import { getMarkerCountByModule } from '@/data/markers';
import { MODULES, ModuleConfig, getHeroMarqueeText } from '@/data/modules';
import { HeroWordmark } from '@/components/hero/HeroWordmark';
import { KineticTextReveal } from '@/components/animated/KineticTextReveal';
import { FlippingWordSwap } from '@/components/animated/FlippingWordSwap';
import { FlipText } from '@/components/animated/FlipText';
import { prefetchModule } from '@/App';

const SCANNING_TIPS = [
  {
    icon: SunMedium,
    title: 'Brightness',
    description: 'Set your screen to maximum brightness so the marker stays high contrast.',
  },
  {
    icon: Smartphone,
    title: 'Position',
    description: 'Keep the marker flat and fully visible, with nothing covering it and no glare from windows or lights.',
  },
  {
    icon: Maximize,
    title: 'Size',
    description: 'Use the size control so the marker is large and sharp on screen.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Layout',
    description: "In two-marker modules, arrange both markers so they fit inside the phone's camera view together.",
  },
];

const moduleNamesList = MODULES.map((m) => m.name);
const formattedModuleNames = `${moduleNamesList.slice(0, -1).join(', ')}, or ${moduleNamesList[moduleNamesList.length - 1]}`;

const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Choose a module.',
    description: `Pick from ${formattedModuleNames}.`,
  },
  {
    step: '02',
    title: 'Select a marker.',
    description: 'Choose the item to show from the dropdown. Modules that combine two items, such as chemicals or lenses, show two markers.',
  },
  {
    step: '03',
    title: 'Scan it with the AR device.',
    description: 'Point the SpectraAR app on your phone at the marker and the experiment appears in 3D.',
  },
];

// Reusable 1px divider line that draws left to right
const DividerLine: React.FC<{ className?: string }> = ({ className = '' }) => {
  const shouldReduceMotion = useReducedMotion();
  if (shouldReduceMotion) return <div className={`w-full h-px bg-border ${className}`} />;

  return (
    <div className={`w-full h-px overflow-hidden ${className}`}>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full h-full bg-border origin-left"
      />
    </div>
  );
};

// Masked heading line reveal (slides up from an overflow-hidden mask)
const MaskedLine: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({
  children,
  className = '',
  delay = 0,
}) => {
  const shouldReduceMotion = useReducedMotion();
  if (shouldReduceMotion) return <div className={className}>{children}</div>;

  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ y: '100%' }}
        whileInView={{ y: '0%' }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
};

// Mono digits count-up animation (0 to end in 600ms, ease-out)
const CountUp: React.FC<{ end: number; duration?: number; padZero?: boolean }> = ({
  end,
  duration = 600,
  padZero = false,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [count, setCount] = useState(shouldReduceMotion ? end : 0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  useEffect(() => {
    if (shouldReduceMotion) {
      setCount(end);
      return;
    }
    if (!inView) return;

    let start: number | null = null;
    let animId: number;

    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(ease * end));
      if (progress < 1) {
        animId = requestAnimationFrame(step);
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [inView, end, duration, shouldReduceMotion]);

  const display = padZero ? count.toString().padStart(2, '0') : count.toString();
  return <span ref={ref}>{display}</span>;
};

// Organic drifting background shapes behind landing sections (navy in light mode, cream in dark mode)
const DriftingBackgroundShapes: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none -z-10"
    >
      {/* Hero Shape: very faint (<8%) */}
      <motion.div
        animate={
          shouldReduceMotion
            ? {}
            : {
                x: [0, 40, -30, 0],
                y: [0, -25, 20, 0],
                rotate: [0, 15, -10, 0],
              }
        }
        transition={{ duration: 38, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-20 right-[5%] w-[420px] h-[420px] rounded-full blur-3xl opacity-[0.05] bg-fg will-change-transform"
      />

      {/* Section 2 Shape: organic shape behind How It Works (12% opacity) */}
      <motion.div
        animate={
          shouldReduceMotion
            ? {}
            : {
                x: [0, -50, 30, 0],
                y: [0, 40, -30, 0],
                scale: [1, 1.1, 0.95, 1],
              }
        }
        transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[28%] left-[2%] w-[520px] h-[520px] rounded-full blur-3xl opacity-[0.12] bg-fg will-change-transform"
      />

      {/* Section 3 Shape: organic shape behind Modules (14% opacity) */}
      <motion.div
        animate={
          shouldReduceMotion
            ? {}
            : {
                x: [0, 60, -40, 0],
                y: [0, -40, 30, 0],
                rotate: [0, -20, 15, 0],
              }
        }
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[52%] right-[3%] w-[560px] h-[560px] rounded-full blur-3xl opacity-[0.14] bg-fg will-change-transform"
      />

      {/* Section 4 Shape 1: behind Scanning Tips top-left (12% opacity) */}
      <motion.div
        animate={
          shouldReduceMotion
            ? {}
            : {
                x: [0, -40, 35, 0],
                y: [0, 30, -25, 0],
                scale: [1, 0.95, 1.05, 1],
              }
        }
        transition={{ duration: 34, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[78%] left-[6%] w-[480px] h-[480px] rounded-full blur-3xl opacity-[0.12] bg-fg will-change-transform"
      />

      {/* Section 4 Shape 2: behind Scanning Tips bottom-right (14% opacity) */}
      <motion.div
        animate={
          shouldReduceMotion
            ? {}
            : {
                x: [0, 35, -45, 0],
                y: [0, -25, 30, 0],
                scale: [1, 1.08, 0.94, 1],
              }
        }
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-[2%] right-[8%] w-[500px] h-[500px] rounded-full blur-3xl opacity-[0.14] bg-fg will-change-transform"
      />
    </div>
  );
};

// Liquid glass card with specular light following pointer
const GlassCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className = '', delay = 0 }) => {
  const shouldReduceMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const rAFRef = useRef<number | null>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
    rAFRef.current = requestAnimationFrame(() => {
      if (cardRef.current) {
        cardRef.current.style.setProperty('--mx', `${x}px`);
        cardRef.current.style.setProperty('--my', `${y}px`);
      }
    });
  };

  const handlePointerEnter = () => setIsHovered(true);
  const handlePointerLeave = () => {
    setIsHovered(false);
    if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
  };

  return (
    <motion.div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`landing-glass landing-glass-card rounded-[28px] p-6 sm:p-8 flex flex-col justify-between min-h-[220px] relative overflow-hidden ${className}`}
    >
      {/* Specular light highlight following pointer inside hovered card */}
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-300 z-0 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background:
            'radial-gradient(circle 260px at var(--mx, 20%) var(--my, 20%), rgba(var(--color-fg-rgb) / 0.14), transparent 70%)',
        }}
      />
      <div className="relative z-10 flex flex-col justify-between h-full">
        {children}
      </div>
    </motion.div>
  );
};

// Infinite scrolling marquee strip
const InfiniteMarqueeStrip: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const text = getHeroMarqueeText();
  const repeatedText = Array(10).fill(text).join('');

  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(true);

  // Pause rAF loop when offscreen
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 45, stiffness: 280 });

  const xOffset = useRef(0);
  const [xPos, setXPos] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion) return;

    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      animId = requestAnimationFrame(loop);

      if (!isInView || document.hidden) {
        lastTime = time;
        return;
      }

      const dt = Math.min(32, time - lastTime) / 1000;
      lastTime = time;

      const baseIdleSpeed = -40; // px/sec
      const v = smoothVelocity.get();
      const scrollBoost = -v * 0.05;
      const rawSpeed = baseIdleSpeed + scrollBoost;
      const clampedSpeed = Math.max(-100, Math.min(100, rawSpeed));

      xOffset.current += clampedSpeed * dt;

      if (xOffset.current < -800) {
        xOffset.current += 800;
      } else if (xOffset.current > 0) {
        xOffset.current -= 800;
      }

      setXPos(xOffset.current);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [smoothVelocity, isInView, shouldReduceMotion]);

  return (
    <div
      ref={containerRef}
      data-marquee="hero-strip"
      className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 my-4 sm:my-6 relative z-10 select-none"
    >
      <div className="w-full rounded-full landing-glass py-2 sm:py-2.5 overflow-hidden">
        <div
          style={{
            transform: shouldReduceMotion ? 'none' : `translate3d(${xPos}px, 0, 0)`,
          }}
          className="whitespace-nowrap font-mono text-xs text-text-muted tracking-widest uppercase flex items-center will-change-transform"
        >
          <span>{repeatedText}</span>
          <span>{repeatedText}</span>
        </div>
      </div>
    </div>
  );
};

// Module row item with expanding circle hover layer (16% fill, no inversion), 8px element shifts, and FlipText wave
const ModuleRowItem: React.FC<{ mod: ModuleConfig }> = ({ mod }) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [isNearCenter, setIsNearCenter] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const { scrollYProgress } = useScroll({
    target: rowRef,
    offset: ['start end', 'end start'],
  });

  const titleX = useTransform(scrollYProgress, [0.25, 0.5, 0.75], ['-3%', '0%', '3%']);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setIsNearCenter(v >= 0.38 && v <= 0.62);
  });

  const handlePrefetch = () => {
    prefetchModule(mod.id);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (!linkRef.current) return;
    const rect = linkRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    linkRef.current.style.setProperty('--rx', `${x}px`);
    linkRef.current.style.setProperty('--ry', `${y}px`);
  };

  const count = getMarkerCountByModule(mod.id);

  return (
    <div ref={rowRef} className="w-full">
      <Link
        ref={linkRef}
        to={mod.path}
        data-hover-clickable="true"
        onMouseEnter={() => {
          handlePrefetch();
          setIsHovered(true);
        }}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => {
          handlePrefetch();
          setIsHovered(true);
        }}
        onBlur={() => setIsHovered(false)}
        onPointerMove={handlePointerMove}
        className={`group relative block rounded-[32px] landing-glass landing-glass-card py-6 sm:py-8 px-6 sm:px-10 transition-all duration-200 overflow-hidden hover:border-[rgba(var(--color-fg-rgb)/0.5)] ${
          isNearCenter ? 'border-accent' : ''
        }`}
      >
        {/* Expanding circle background layer on hover (foreground at 16% fill, pure CSS) */}
        <div className="module-row-hover-circle" />

        {/* Content Layer: normal foreground text colors, no color inversion */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left: Code badge and shifting title with FlipText hover wave */}
          <div className="flex items-start sm:items-center gap-4 sm:gap-8">
            <div className="flex items-center gap-2.5 shrink-0 pt-2 sm:pt-0 group-hover:translate-x-2 transition-transform duration-250 ease-out">
              <span className="w-3 h-3 rounded-full bg-accent inline-block transition-transform duration-200 group-hover:scale-125" />
              <span className="font-mono text-sm sm:text-base font-bold tracking-wider text-text-muted transition-colors">
                {mod.code}
              </span>
            </div>

            <motion.h2
              style={shouldReduceMotion ? {} : { x: titleX }}
              className="relative font-sans font-bold text-[clamp(28px,5vw,72px)] tracking-tight text-text-primary leading-none will-change-transform"
            >
              <span
                className={`inline-block transition-all duration-300 ease-out will-change-transform ${
                  shouldReduceMotion
                    ? 'opacity-100'
                    : isHovered
                    ? 'translate-x-[12px] opacity-100 font-bold'
                    : 'translate-x-0 opacity-85 font-medium'
                }`}
              >
                {mod.name}
              </span>
              <span
                aria-hidden="true"
                className={`absolute left-0 -bottom-1 h-[2px] w-full bg-accent origin-left transition-transform duration-[350ms] ease-out pointer-events-none ${
                  shouldReduceMotion
                    ? 'hidden'
                    : isHovered
                    ? 'scale-x-100'
                    : 'scale-x-0'
                }`}
              />
            </motion.h2>
          </div>

          {/* Right: slots count, markers count, arrow button shifting 8px */}
          <div className="flex items-center justify-between md:justify-end gap-6">
            <div className="flex items-center gap-4 font-mono text-xs sm:text-sm text-text-muted">
              <span className="bg-bg/60 px-3 py-1 rounded-full border border-border">
                {mod.slots} {mod.slots === 1 ? 'SLOT' : 'SLOTS'}
              </span>
              <div>
                <span className="text-accent font-semibold mr-1.5">
                  <CountUp end={count} padZero={true} />
                </span>
                <span>{count === 1 ? 'MARKER' : 'MARKERS'}</span>
              </div>
            </div>

            <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-text-muted group-hover:border-accent group-hover:text-accent group-hover:translate-x-2 transition-all duration-250 ease-out">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

// Single Scanning Tip Card with specular highlight and FlipText wave
const ScanningTipCard: React.FC<{ tip: typeof SCANNING_TIPS[0]; idx: number }> = ({ tip, idx }) => {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = tip.icon;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      <GlassCard delay={idx * 0.08} className="p-6 sm:p-7 min-h-[220px]">
        <div className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-primary bg-surface mb-4">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="font-mono text-[10px] text-text-muted uppercase tracking-wider mb-1.5">
            TIP 0{idx + 1}
          </div>
          <h4 className="font-sans font-bold text-lg text-text-primary mb-2">
            <FlipText mode="hover" isHovered={isHovered} text={tip.title} />
          </h4>
          <p className="font-mono text-xs text-text-muted leading-relaxed">
            {tip.description}
          </p>
        </div>
      </GlassCard>
    </div>
  );
};

export const LandingPage: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);

  const totalMarkers = MODULES.reduce(
    (sum, mod) => sum + getMarkerCountByModule(mod.id),
    0
  );

  const scrollToModules = () => {
    const el = document.getElementById('modules');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Hero Exit transforms
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const heroScale = useTransform(heroProgress, [0, 1], [1, 0.94]);
  const heroOpacity = useTransform(heroProgress, [0, 0.8], [1, 0]);

  return (
    <div className="w-full relative min-h-screen overflow-x-hidden">
      {/* SVG filter for Chromium progressive refraction enhancement */}
      <svg className="sr-only" aria-hidden="true">
        <filter id="glass-refract">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      {/* Drifting organic background shapes behind landing sections */}
      <DriftingBackgroundShapes />

      {/* SECTION 1: HERO */}
      <section
        ref={heroRef}
        className="relative w-full min-h-[calc(100vh-80px)] flex flex-col justify-between pt-4 sm:pt-8 pb-10"
      >
        {/* Top Eyebrow */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4">
          <div className="flex items-center justify-between text-xs font-mono text-text-muted">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent inline-block animate-pulse" />
              <span>SYSTEM READY</span>
            </div>
            <div className="hidden sm:flex items-center gap-4">
              <span>SCHOOL SCIENCE</span>
              <span>•</span>
              <span>AR MARKERS</span>
            </div>
          </div>
        </div>

        {/* Center: The Wordmark with Hero Exit scale & fade */}
        <motion.div
          style={
            shouldReduceMotion
              ? {}
              : {
                  scale: heroScale,
                  opacity: heroOpacity,
                }
          }
          className="w-full max-w-[1420px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 my-auto flex flex-col items-center justify-center will-change-transform"
        >
          <div className="w-full">
            <HeroWordmark />
          </div>

          {/* Subtitle & Hero Description */}
          <div className="mt-8 text-center max-w-2xl mx-auto space-y-3">
            <KineticTextReveal
              text="AR marker dashboard for school science experiments."
              className="font-mono text-xs sm:text-sm text-text-muted leading-relaxed"
            />
            <p className="font-mono text-xs sm:text-sm text-text-muted leading-relaxed max-w-xl mx-auto">
              SpectraAR is an augmented reality lab for school science. Pick an experiment from {MODULES.length} modules, scan its marker with the SpectraAR app on your phone, and the experiment appears in 3D on your desk for you to explore and adjust.
            </p>
          </div>
        </motion.div>

        {/* Marquee scrolling strip */}
        <InfiniteMarqueeStrip />

        {/* Hero Bottom Bar */}
        <motion.div
          style={shouldReduceMotion ? {} : { opacity: heroOpacity }}
          className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
            <button
              type="button"
              onClick={scrollToModules}
              className="rounded-full flex items-center gap-2 font-mono text-xs uppercase tracking-wider px-5 py-2 transition-colors cursor-pointer border bg-[rgba(var(--color-fg-rgb)/0.22)] border-[rgba(var(--color-fg-rgb)/0.6)] text-[rgb(var(--color-fg-rgb))] hover:bg-[rgba(var(--color-fg-rgb)/0.32)] hover:border-[rgb(var(--color-fg-rgb))]"
            >
              <span>Explore Modules</span>
              <ArrowDown className="h-3.5 w-3.5" />
            </button>

            <div className="font-mono text-xs text-text-muted landing-glass px-4 py-2.5 rounded-full flex items-center gap-1">
              <span className="text-accent font-semibold">
                <CountUp end={MODULES.length} duration={600} /> MODULES
              </span>
              <span className="mx-2 text-border">/</span>
              <span>
                <CountUp end={totalMarkers} duration={600} /> MARKERS
              </span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 2: HOW IT WORKS - NORMAL CARD REVEAL (NO CONNECTOR LINES) */}
      <section id="how-it-works" className="w-full py-16 sm:py-24 relative">
        <DividerLine />
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="mb-12 text-left">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs uppercase tracking-widest text-text-muted">
                WORKFLOW:
              </span>
              <FlippingWordSwap
                words={['Choose', 'Select', 'Scan']}
                className="font-mono text-xs uppercase tracking-widest text-accent font-semibold"
              />
            </div>
            <MaskedLine>
              <KineticTextReveal
                text="How It Works"
                className="font-sans font-bold text-3xl sm:text-5xl text-text-primary tracking-tight"
              />
            </MaskedLine>
          </div>

          {/* Three cards in normal-flow row (3 cols at 1024px+, vertical stack below, NO crossing lines) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
            {HOW_IT_WORKS_STEPS.map((step, idx) => (
              <GlassCard key={step.step} delay={idx * 0.12}>
                <div>
                  <div className="font-mono text-2xl font-bold text-accent mb-4 tracking-wider">
                    {step.step}
                  </div>
                  <h3 className="font-sans font-bold text-2xl sm:text-3xl text-text-primary tracking-tight mb-3">
                    {step.title}
                  </h3>
                  <p className="font-mono text-xs sm:text-sm text-text-muted leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-border flex items-center justify-between text-text-muted font-mono text-[10px] uppercase tracking-wider">
                  <span>STEP {step.step}</span>
                  <span className="text-accent">READY</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: MODULES */}
      <section id="modules" className="w-full py-16 sm:py-24 relative">
        <DividerLine />
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="mb-12 text-left">
            <MaskedLine>
              <span className="font-mono text-xs uppercase tracking-widest text-text-muted block mb-2">
                CURRICULUM MODULES
              </span>
            </MaskedLine>
            <MaskedLine delay={0.08}>
              <KineticTextReveal
                text="Modules"
                className="font-sans font-bold text-3xl sm:text-5xl md:text-6xl text-text-primary tracking-tight"
              />
            </MaskedLine>
          </div>

          <div className="flex flex-col gap-4 sm:gap-5">
            {MODULES.map((mod) => (
              <ModuleRowItem key={mod.code} mod={mod} />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: SCANNING TIPS - LIQUID CRYSTAL CONTAINER (NOT INVERTED) */}
      <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative">
        <div className="w-full landing-glass rounded-[40px] py-14 sm:py-20 px-6 sm:px-12 relative overflow-hidden">
          <div className="mb-12 text-left">
            <span className="font-mono text-xs uppercase tracking-widest text-text-muted block mb-2">
              BEST PRACTICES
            </span>
            <h2 className="font-sans font-bold text-3xl sm:text-5xl md:text-6xl text-text-primary tracking-tight">
              <FlipText mode="inView" text="Scanning Tips" />
            </h2>
          </div>

          {/* Four tip cards with GlassCard, 28px radius, specular highlight, and FlipText wave on title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {SCANNING_TIPS.map((tip, idx) => (
              <ScanningTipCard key={tip.title} tip={tip} idx={idx} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
