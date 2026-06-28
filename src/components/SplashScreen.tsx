/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { easePremium, durationSlow } from '../motionTokens';

interface SplashScreenProps {
  onComplete: () => void;
  lang: 'ar' | 'en';
}

export default function SplashScreen({ onComplete, lang }: SplashScreenProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Elegant timing for the splash screen presentation (1.5 seconds)
    const timer = setTimeout(() => {
      setVisible(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.45, ease: easePremium }}
          className="fixed inset-0 z-[9999] bg-[#0c1e1c] flex flex-col items-center justify-center text-white overflow-hidden"
        >
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="flex flex-col items-center space-y-6 max-w-sm px-6 text-center z-10">
            {/* Animated Logo Container */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: durationSlow, ease: easePremium }}
              className="relative flex items-center justify-center w-20 h-20 rounded-3xl bg-teal-900/40 border border-teal-500/20 shadow-xl shadow-teal-950/50"
            >
              <Sparkles className="w-10 h-10 text-amber-400" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                className="absolute inset-0 border-t-2 border-r-2 border-teal-500/30 rounded-3xl"
              />
            </motion.div>

            {/* Typography */}
            <div className="space-y-2">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: durationSlow, ease: easePremium }}
                className="text-2xl font-black tracking-tight"
              >
                {lang === 'ar' ? 'حلّها | Hal\'ha' : 'Hal\'ha | Unified Returns'}
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: durationSlow, ease: easePremium }}
                className="text-xs text-teal-300 font-medium"
              >
                {lang === 'ar' 
                  ? 'بوابة الاستبدال والاسترجاع الموحدة والمؤتمتة' 
                  : 'The Unified Automated Returns & Exchanges Portal'}
              </motion.p>
            </div>

            {/* Loading Indicator */}
            <div className="w-36 h-[2px] bg-teal-950 rounded-full overflow-hidden mt-2 relative">
              <motion.div
                initial={{ left: '-100%', width: '35%' }}
                animate={{ left: '100%' }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                className="absolute top-0 bottom-0 bg-gradient-to-r from-transparent via-teal-400 to-transparent rounded-full"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
