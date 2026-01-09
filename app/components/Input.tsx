'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  type = 'text',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setHasValue(!!e.target.value);
  };

  return (
    <div className="relative w-full">
      {label && (
        <label
          className={cn(
            'absolute left-3 sm:left-4 transition-all duration-200 pointer-events-none',
            isFocused || hasValue || props.value
              ? 'top-2 text-xs text-gray-400'
              : 'top-1/2 -translate-y-1/2 text-sm text-gray-500'
          )}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        className={cn(
          'w-full px-3 py-3 sm:px-4 sm:py-3.5',
          label && 'pt-6',
          'bg-transparent',
          'border border-[#1a1a1a]',
          'rounded-lg',
          'text-white text-sm',
          'placeholder-gray-600',
          'focus:outline-none focus:ring-2 focus:ring-white/20',
          'transition-all duration-200',
          error && 'border-red-500/60',
          className
        )}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
};
