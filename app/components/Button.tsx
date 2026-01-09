'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'medium' | 'large';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'font-medium transition-all duration-200 ease-in-out rounded-lg disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-white text-black hover:bg-gray-100 active:bg-gray-200',
    secondary: 'bg-transparent border border-white text-white hover:bg-white/10 active:bg-white/20',
    danger: 'bg-transparent border border-red-500/60 text-red-500 hover:bg-red-500/10 active:bg-red-500/20'
  };

  const sizeStyles = {
    medium: 'px-4 sm:px-6 py-2 sm:py-2.5 text-sm',
    large: 'px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base'
  };

  return (
    <button
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-t-transparent border-current rounded-full animate-spin" />
        </div>
      ) : (
        children
      )}
    </button>
  );
};
