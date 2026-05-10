'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  initialOpacity?: number;
  initialY?: number;
  once?: boolean;
}

export function AnimatedCard({
  children,
  className,
  delay = 0,
  initialOpacity = 0,
  initialY = 20,
  once = true,
}: AnimatedCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: initialOpacity, y: initialY }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}