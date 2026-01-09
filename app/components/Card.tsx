'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div
      className={cn(
        'bg-neutral-900/60 backdrop-blur-2xl border border-white/5 hover:border-white/20 shadow-2xl rounded-[24px]',
        'p-4 sm:p-6 md:p-8',
        'transition-all duration-300',
        className
      )}
    >
      {children}
    </div>
  );
};
