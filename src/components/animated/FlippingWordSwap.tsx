import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { MODULES } from '@/data/modules';

const DEFAULT_WORDS = MODULES.map((m) => m.name);

interface FlippingWordSwapProps {
  className?: string;
  prefix?: string;
  words?: string[];
}

export const FlippingWordSwap: React.FC<FlippingWordSwapProps> = ({
  className = '',
  prefix = '',
  words = DEFAULT_WORDS,
}) => {
  const [index, setIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [shouldReduceMotion, words.length]);

  if (shouldReduceMotion) {
    return (
      <div className={className}>
        {prefix ? `${prefix} ` : ''}
        {words.join(' / ')}
      </div>
    );
  }

  const currentWord = words[index];

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {prefix && <span>{prefix}</span>}
      <div className="relative inline-block overflow-hidden h-[1.3em] min-w-[7ch]">
        <AnimatePresence mode="wait">
          <motion.span
            key={currentWord}
            initial={{ y: '100%', opacity: 0, rotateX: -60 }}
            animate={{ y: '0%', opacity: 1, rotateX: 0 }}
            exit={{ y: '-100%', opacity: 0, rotateX: 60 }}
            transition={{
              duration: 0.2,
              ease: [0.2, 0, 0, 1],
            }}
            className="inline-block text-accent font-semibold whitespace-nowrap"
          >
            {currentWord}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
};
