import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface TextMorphProps {
  idText?: string;
  nameText: string;
  className?: string;
}

export const TextMorph: React.FC<TextMorphProps> = ({
  idText,
  nameText,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className={`font-mono text-xs ${className}`}>
        {idText && <span className="text-text-muted mr-2">{idText}</span>}
        <span className="text-text-primary font-medium">{nameText}</span>
      </div>
    );
  }

  return (
    <div className={`font-mono text-xs ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${idText}-${nameText}`}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -3 }}
          transition={{ duration: 0.14, ease: 'easeOut' }}
          className="flex items-center flex-wrap gap-x-2"
        >
          {idText && (
            <span className="text-accent bg-surface px-2 py-0.5 rounded-full border border-border">
              {idText}
            </span>
          )}
          <span className="text-text-primary font-medium tracking-tight">
            {nameText}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
