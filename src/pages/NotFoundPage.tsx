import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center px-4 py-24 text-center">
      <div className="max-w-md landing-glass rounded-[28px] p-8 sm:p-12 border border-border">
        <span className="font-mono text-xs uppercase tracking-widest text-accent font-semibold block mb-2">
          404 ERROR
        </span>
        <h1 className="font-sans font-bold text-3xl sm:text-4xl text-text-primary tracking-tight mb-3">
          Page Not Found
        </h1>
        <p className="font-mono text-xs sm:text-sm text-text-muted leading-relaxed mb-6">
          The requested page does not exist or may have been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full font-mono text-xs uppercase tracking-wider px-6 py-2.5 bg-accent text-accent-fg font-semibold hover:opacity-90 transition-opacity"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
};
