import React from 'react';
import { Link } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';

export const Footer: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: shouldReduceMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <footer className="w-full border-t border-border bg-bg py-5 px-4 sm:px-6 lg:px-8 select-none transition-colors">
      <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-text-muted">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-[1px] bg-accent inline-block" />
          <span className="font-semibold text-text-primary tracking-tight">
            SpectraAR
          </span>
          <span className="text-text-muted">
            — Marker display for AR learning
          </span>
        </div>

        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-4">
            <Link
              to="/chemistry"
              className="hover:text-accent transition-colors"
            >
              CHE
            </Link>
            <span className="text-border">/</span>
            <Link
              to="/physics"
              className="hover:text-accent transition-colors"
            >
              PHY
            </Link>
            <span className="text-border">/</span>
            <Link
              to="/optics"
              className="hover:text-accent transition-colors"
            >
              OPT
            </Link>
          </nav>

          {/* Home / Back to top pill button */}
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Back to top"
            className="min-h-[40px] px-5 py-3 rounded-full border border-[rgba(var(--color-fg-rgb)/0.28)] bg-[rgba(var(--color-fg-rgb)/0.08)] hover:bg-[rgba(var(--color-fg-rgb)/0.16)] text-[rgb(var(--color-fg-rgb))] flex items-center gap-2 font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-fg-rgb))] focus-visible:outline-none"
          >
            <span>Home</span>
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M8 12V4M4 8l4-4 4 4" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
};
