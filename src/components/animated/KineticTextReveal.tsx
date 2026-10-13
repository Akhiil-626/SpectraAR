import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface KineticTextRevealProps {
  text: string;
  className?: string;
}

export const KineticTextReveal: React.FC<KineticTextRevealProps> = ({
  text,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <h1 className={className}>{text}</h1>;
  }

  // Kinetic reveal: mask slide up with fast tight motion (160ms)
  return (
    <div className="overflow-hidden inline-block leading-none">
      <motion.h1
        key={text}
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          duration: 0.18,
          ease: [0.16, 1, 0.3, 1], // snappy crisp easing
        }}
        className={className}
      >
        {text}
      </motion.h1>
    </div>
  );
};
