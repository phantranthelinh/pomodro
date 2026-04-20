'use client';

import { motion, AnimatePresence, type Variants } from 'framer-motion';
import Image from 'next/image';

type MascotProps = {
  currentRound: number;
  maxRounds: number;
  isRunning: boolean;
  mode: 'focus' | 'break' | 'longBreak' | 'idle';
};

export function Mascot({ currentRound, maxRounds, isRunning, mode }: MascotProps) {
  const progress = currentRound / Math.max(1, maxRounds);
  const isEvolved = progress > 0.5;
  const mascotImage = isEvolved ? '/je/je-2.png' : '/je/je.png';

  let animState = 'idle';
  if (isRunning) {
    if (mode === 'focus') animState = 'focusing';
    else animState = 'resting';
  }

  const variants: Variants = {
    idle: {
      scale: [0.98, 1, 0.98],
      y: [0, -2, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut' as const
      }
    },
    focusing: {
      scale: [0.99, 1.02, 0.99],
      y: [0, -4, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut' as const
      }
    },
    resting: {
      scale: [0.97, 1.01, 0.97],
      y: [0, -1, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut' as const
      }
    }
  };

  return (
    <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={mascotImage}
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.1, y: -10 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <motion.div
            variants={variants}
            animate={animState}
            className="w-full h-full relative"
          >
            <Image
              src={mascotImage}
              alt={isEvolved ? "Evolved Je mascot" : "Je mascot"}
              fill
              className="object-contain"
              priority
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
