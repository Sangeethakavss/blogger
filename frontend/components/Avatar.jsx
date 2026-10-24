'use client';

import React, { useState } from 'react';
import { User } from 'lucide-react';

const sizeMap = {
  xs: 'w-5 h-5 text-[10px]',
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-24 h-24 text-2xl',
};

const iconSizeMap = {
  xs: 'w-3 h-3',
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
  xl: 'w-7 h-7',
  '2xl': 'w-10 h-10',
};

export default function Avatar({
  src,
  alt = '',
  size = 'md',
  className = '',
  textClassName = '',
}) {
  const [hasError, setHasError] = useState(false);

  // Compute initials if alt (name) is provided
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return '';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(alt);
  const sizeClasses = sizeMap[size] || sizeMap.md;
  const iconSizeClasses = iconSizeMap[size] || iconSizeMap.md;

  const showImage = Boolean(src && typeof src === 'string' && src.trim() !== '' && !hasError);

  if (showImage) {
    return (
      <img
        src={src}
        alt={alt || 'User avatar'}
        onError={() => setHasError(true)}
        className={`rounded-full object-cover shrink-0 border border-gray-200 dark:border-[#243340] ${sizeClasses} ${className}`}
      />
    );
  }

  // Sleek placeholder when no avatar or load failed
  return (
    <div
      className={`rounded-full shrink-0 flex items-center justify-center font-semibold select-none bg-[#182226] text-white dark:bg-[#1a252e] dark:text-[#e2ad76] border border-gray-200 dark:border-[#243340] ${sizeClasses} ${className}`}
      aria-label={alt || 'User avatar'}
      title={alt}
    >
      {initials ? (
        <span className={`tracking-wider ${textClassName}`}>{initials}</span>
      ) : (
        <User className={`${iconSizeClasses} text-gray-300 dark:text-[#e2ad76]`} />
      )}
    </div>
  );
}

