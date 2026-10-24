'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme, mounted } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative p-2 rounded-full transition-all duration-300 cursor-pointer ${
        isDark
          ? 'bg-[#18232c] text-amber-300 hover:bg-[#202e3a] hover:text-amber-200 border border-[#2b3a46] shadow-xs'
          : 'bg-[#f0ece5] text-gray-700 hover:bg-[#e6e1d8] hover:text-black border border-[#e2ddd5]'
      } ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle color theme"
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {/* Render smoothly once mounted to prevent SSR hydration mismatch */}
        {mounted && isDark ? (
          <Sun className="w-4 h-4 transition-transform duration-300 rotate-0 hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 transition-transform duration-300 -rotate-12 hover:rotate-0" />
        )}
      </div>
    </button>
  );
}

