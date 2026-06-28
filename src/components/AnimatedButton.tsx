/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { easePremium, durationFast } from '../motionTokens';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function AnimatedButton({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: AnimatedButtonProps) {
  
  // Style configurations
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/40 shrink-0 select-none cursor-pointer text-center';
  
  const variants = {
    primary: 'bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/10 border border-teal-600/20',
    secondary: 'bg-stone-900 hover:bg-stone-800 text-white shadow-sm border border-stone-800/10',
    outline: 'bg-white hover:bg-stone-50 text-stone-900 border border-stone-200 shadow-xs',
    ghost: 'bg-transparent hover:bg-stone-100 text-stone-700',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/10 border border-rose-600/20'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-[10px]',
    md: 'px-4 py-2 text-xs',
    lg: 'px-6 py-3 text-sm'
  };

  return (
    <motion.button
      whileHover={{ 
        scale: 1.025,
        y: -1,
        boxShadow: variant === 'primary' 
          ? '0 10px 15px -3px rgba(13, 148, 136, 0.2), 0 4px 6px -4px rgba(13, 148, 136, 0.2)' 
          : '0 4px 12px rgba(0,0,0,0.05)'
      }}
      whileTap={{ scale: 0.975, y: 0 }}
      transition={{ duration: durationFast, ease: easePremium }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
