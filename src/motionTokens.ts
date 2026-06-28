/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useReducedMotion } from 'motion/react';

// Transition Durations (in seconds)
export const durationInstant = 0;
export const durationFast = 0.15;
export const durationNormal = 0.25;
export const durationSlow = 0.4;
export const durationVerySlow = 0.6;

// Easing Curves (cubic-bezier parameters)
export const easePremium = [0.22, 1, 0.36, 1];
export const easeSnappy = [0.34, 1.56, 0.64, 1];
export const easeSlow = [0.43, 0.13, 0.23, 0.96];
export const easeInOut = [0.4, 0, 0.2, 1];
export const easeOut = [0, 0, 0.2, 1];

// Grouped token dictionary
export const motionTokens = {
  durations: {
    instant: durationInstant,
    fast: durationFast,
    normal: durationNormal,
    slow: durationSlow,
    verySlow: durationVerySlow,
  },
  easings: {
    premium: easePremium,
    snappy: easeSnappy,
    slow: easeSlow,
    easeInOut: easeInOut,
    easeOut: easeOut,
  }
};

/**
 * Custom React hook that returns dynamic transition parameters optimized for the user's motion preferences.
 * If prefers-reduced-motion is active, duration is set to 0.
 */
export function useAdaptiveTransition(
  durationType: keyof typeof motionTokens.durations = 'normal',
  easeType: keyof typeof motionTokens.easings = 'premium'
) {
  const shouldReduce = useReducedMotion();
  
  return {
    type: 'tween',
    duration: shouldReduce ? 0 : motionTokens.durations[durationType],
    ease: motionTokens.easings[easeType],
  };
}

/**
 * Static helper checking reduced motion preference client-side (safe for static configurations or environments outside React context).
 */
export function getStaticTransition(
  durationType: keyof typeof motionTokens.durations = 'normal',
  easeType: keyof typeof motionTokens.easings = 'premium'
) {
  const isReduced = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  return {
    type: 'tween',
    duration: isReduced ? 0 : motionTokens.durations[durationType],
    ease: motionTokens.easings[easeType],
  };
}
