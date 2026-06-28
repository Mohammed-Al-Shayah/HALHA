/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';

export default function AnimatedBackground() {
  const shouldReduce = useReducedMotion();

  // Generate deterministic coordinates for particles to avoid hydration mismatches
  const particles = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      size: Math.random() * 6 + 3, // 3px to 9px
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: Math.random() * 20 + 20, // 20s to 40s
      delay: Math.random() * -20, // negative delay so they start animated
      xRange: [0, Math.random() * 60 - 30, Math.random() * 60 - 30, 0],
      yRange: [0, Math.random() * -120 - 40, Math.random() * -60 - 20, 0],
    }));
  }, []);

  if (shouldReduce) {
    // If reduced motion is enabled, fallback to a clean static background.
    return (
      <div className="fixed inset-0 -z-10 bg-[#faf8f5] overflow-hidden pointer-events-none" />
    );
  }

  return (
    <div className="fixed inset-0 -z-10 bg-[#faf8f5] overflow-hidden pointer-events-none">
      {/* 1. Dynamic Fluid Orb - Teal (Top Left / Center-Left) */}
      <motion.div
        animate={{
          x: [0, 80, -40, 0],
          y: [0, -60, 40, 0],
          scale: [1, 1.2, 0.9, 1],
          rotate: [0, 120, 240, 360],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[-10%] left-[-5%] w-[55vw] h-[55vw] bg-teal-500/6 rounded-[40%_60%_70%_30%_/_40%_50%_60%_5%_50%] blur-[130px]"
      />

      {/* 2. Dynamic Fluid Orb - Amber (Bottom Right / Center-Right) */}
      <motion.div
        animate={{
          x: [0, -70, 40, 0],
          y: [0, 60, -40, 0],
          scale: [1, 0.85, 1.15, 1],
          rotate: [360, 240, 120, 0],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[-15%] right-[-5%] w-[65vw] h-[65vw] bg-amber-500/4 rounded-[50%_40%_30%_70%_/_50%_60%_70%_40%] blur-[150px]"
      />

      {/* 3. Dynamic Fluid Orb - Indigo/Emerald Hybrid (Center Left) */}
      <motion.div
        animate={{
          x: [0, 50, -50, 0],
          y: [0, 80, -80, 0],
          scale: [0.9, 1.1, 0.9, 0.9],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[30%] left-[-15%] w-[45vw] h-[45vw] bg-indigo-500/3 rounded-full blur-[120px]"
      />

      {/* 4. Dynamic Fluid Orb - Soft Coral/Rose (Top Right) */}
      <motion.div
        animate={{
          x: [0, -40, 40, 0],
          y: [0, 50, -30, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{
          duration: 32,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[-5%] right-[10%] w-[40vw] h-[40vw] bg-rose-400/3 rounded-full blur-[110px]"
      />

      {/* Floating Sparkles & Floating Micro-particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute',
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
          }}
          animate={{
            x: p.xRange,
            y: p.yRange,
            opacity: [0.1, 0.5, 0.3, 0.1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="bg-teal-500/20 rounded-full blur-[1px] shadow-[0_0_8px_rgba(20,184,166,0.3)]"
        />
      ))}

      {/* Decorative premium fine grid pattern with soft shimmer effect */}
      <motion.div 
        animate={{
          opacity: [0.25, 0.38, 0.25],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e0_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" 
      />
    </div>
  );
}

