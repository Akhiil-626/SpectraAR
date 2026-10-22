import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, useScroll, useMotionValueEvent, useReducedMotion } from 'framer-motion';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { Separator } from '@/components/ui/separator';
import { MODULES } from '@/data/modules';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const [hidden, setHidden] = useState(false);
  const [scrollPercent, setScrollPercent] = useState('000%');
  const [menuOpen, setMenuOpen] = useState(false);

  const { scrollY, scrollYProgress } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (shouldReduceMotion) return;

    // Slide up out of view on scroll down; return on scroll up
    if (latest > prev && latest > 80) {
      setHidden(true);
    } else if (latest < prev) {
      setHidden(false);
    }
  });

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const pct = Math.min(100, Math.max(0, Math.round(latest * 100)));
    setScrollPercent(`${pct.toString().padStart(3, '0')}%`);
  });

  const isLandingPage = location.pathname === '/';

  return (
    <>
      <motion.header
        variants={{
          visible: { y: '0%' },
          hidden: { y: '-140%' },
        }}
        animate={hidden && !shouldReduceMotion ? 'hidden' : 'visible'}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-3 z-40 w-full px-3 sm:px-6 pointer-events-none select-none mb-3"
      >
        <div className="max-w-[1416px] mx-auto pointer-events-auto">
          {/* Floating pill navigation bar */}
          <div
            className={`w-full min-h-[64px] sm:min-h-[68px] py-3 px-4 sm:px-6 rounded-full flex items-center justify-between transition-colors duration-200 ${
              isLandingPage
                ? 'landing-glass'
                : 'bg-[rgba(var(--color-fg-rgb)/0.08)] border border-[rgba(var(--color-fg-rgb)/0.2)]'
            }`}
          >
            {/* Left: logo mark + larger & heavier wordmark font-size clamp(22px, 2.2vw, 30px) */}
            <Link
              to="/"
              className="font-sans font-bold tracking-tight text-text-primary hover:text-accent transition-colors flex items-center gap-2.5 text-[clamp(22px,2.2vw,30px)] leading-none shrink-0"
            >
              <svg
                className="w-[24px] h-[24px] sm:w-[28px] sm:h-[28px] shrink-0"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                {/* 4 corner scan-brackets */}
                <path
                  d="M 2 8 V 4.5 C 2 3.12 3.12 2 4.5 2 H 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M 20 2 H 23.5 C 24.88 2 26 3.12 26 4.5 V 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M 26 20 V 23.5 C 26 24.88 24.88 26 23.5 26 H 20"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M 8 26 H 4.5 C 3.12 26 2 24.88 2 23.5 V 20"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Rounded square outline */}
                <rect
                  x="6.5"
                  y="6.5"
                  width="15"
                  height="15"
                  rx="3.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
                {/* Center targeting dot */}
                <circle cx="14" cy="14" r="1.75" fill="currentColor" />
              </svg>
              <span>SpectraAR</span>
            </Link>

            {/* Right: module links + scroll readout + theme toggle + mobile menu button */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* Desktop inline links: 1024px and above */}
              <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0">
                {MODULES.map((item) => (
                  <NavLink
                    key={item.code}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono uppercase tracking-wider rounded-full border transition-colors whitespace-nowrap ${
                        isActive
                          ? 'border-accent text-accent bg-surface font-semibold'
                          : 'border-transparent text-text-muted hover:border-border hover:text-text-primary'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={`inline-block w-1.5 h-1.5 rounded-full transition-colors ${
                            isActive ? 'bg-accent' : 'bg-border'
                          }`}
                        />
                        <span>{item.code}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>

              {/* Mobile menu trigger: below 1024px (768px and below, plus tablet) */}
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label="Open curriculum modules menu"
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-full border border-border bg-surface text-text-muted hover:border-accent hover:text-accent transition-colors cursor-pointer shrink-0"
              >
                <Menu className="h-3.5 w-3.5 text-accent" />
                <span>MODULES</span>
              </button>

              {/* Small mono scroll readout: SCROLL 000% (xl+ only to avoid cramping at 1024px) */}
              <span className="font-mono text-xs text-text-muted hidden xl:inline-block px-1 tabular-nums whitespace-nowrap">
                SCROLL {scrollPercent}
              </span>

              <Separator orientation="vertical" className="h-4 mx-0.5 hidden sm:block" />

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle light/dark theme"
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-mono rounded-full border border-border bg-surface text-text-muted hover:border-accent hover:text-accent transition-colors shrink-0 cursor-pointer"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="h-3.5 w-3.5 text-accent" />
                    <span className="hidden sm:inline">LIGHT</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-3.5 w-3.5 text-text-primary" />
                    <span className="hidden sm:inline">DARK</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Scroll progress line sits cleanly under the floating bar without overlapping */}
          <div className="w-full px-6 pt-1.5 overflow-hidden pointer-events-none">
            <motion.div
              className="h-[2px] bg-accent origin-left rounded-full w-full"
              style={{ scaleX: scrollYProgress }}
            />
          </div>
        </div>
      </motion.header>

      {/* Rounded panel dialog for mobile / small screens listing all 6 modules */}
      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent className="max-w-md w-[calc(100vw-32px)] rounded-[28px] landing-glass border border-border p-5 sm:p-6 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
            <DialogTitle className="font-sans font-bold text-lg text-text-primary tracking-tight">
              Curriculum Modules
            </DialogTitle>
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text-muted hover:text-text-primary hover:border-accent transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <DialogDescription className="sr-only">
            Select a curriculum module to view its tracking markers.
          </DialogDescription>
          <nav className="flex flex-col gap-2">
            {MODULES.map((mod) => {
              const isActive = location.pathname === mod.path;
              return (
                <Link
                  key={mod.code}
                  to={mod.path}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl border transition-all ${
                    isActive
                      ? 'border-accent bg-surface font-semibold text-accent'
                      : 'border-border/60 hover:border-border hover:bg-surface/50 text-text-primary'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isActive ? 'bg-accent' : 'bg-border'
                      }`}
                    />
                    <span className="font-mono text-xs uppercase tracking-wider text-accent font-bold">
                      {mod.code}
                    </span>
                    <span className="font-sans font-medium text-sm text-text-primary">
                      {mod.name}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-text-muted px-2.5 py-0.5 rounded-full border border-border bg-bg/60">
                    {mod.slots} {mod.slots === 1 ? 'SLOT' : 'SLOTS'}
                  </span>
                </Link>
              );
            })}
          </nav>
        </DialogContent>
      </Dialog>
    </>
  );
};
