'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const savedTheme = localStorage.getItem('blogify_theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setTheme(savedTheme);
        applyTheme(savedTheme);
      } else {
        // System preference default
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = prefersDark ? 'dark' : 'light';
        setTheme(initialTheme);
        applyTheme(initialTheme);
      }
    } catch (e) {
      // Fallback
    }
  }, []);

  const applyTheme = (targetTheme) => {
    const root = document.documentElement;
    if (targetTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Update color-scheme meta for browser controls
    let meta = document.querySelector('meta[name="color-scheme"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'color-scheme';
      document.head.appendChild(meta);
    }
    meta.content = targetTheme;
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    applyTheme(newTheme);
    try {
      localStorage.setItem('blogify_theme', newTheme);
    } catch (e) {}
  };

  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'light',
      isDark: false,
      toggleTheme: () => {},
      mounted: false,
    };
  }
  return context;
};

