import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gray';
  size?: 'small' | 'medium';
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'small',
  className = ''
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-white/10 text-white border-white/20',
    success: 'bg-green-500/20 text-green-400 border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    danger: 'bg-red-500/20 text-red-400 border-red-500/30',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    gray: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  };

  const sizeStyles = {
    small: 'text-xs px-2 py-0.5',
    medium: 'text-sm px-3 py-1'
  };

  return (
    <span
      className={cn('inline-flex items-center rounded-full border font-medium', variantStyles[variant], sizeStyles[size], className)}
    >
      {children}
    </span>
  );
}
