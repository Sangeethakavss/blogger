'use client';

import React from 'react';

const CATEGORIES = [
  'All',
  'Technology',
  'Lifestyle',
  'Travel',
  'Health',
  'Food',
  'Business',
  'Inspiration',
];

const CategoryPills = ({ selectedCategory, onSelectCategory, counts = {} }) => {
  return (
    <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none scroll-smooth font-poppins">
      {CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === cat;
        const count = counts[cat];

        return (
          <button
            key={cat}
            type="button"
            onClick={() => onSelectCategory(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
              isSelected
                ? 'bg-[#182226] text-white dark:bg-[#e2ad76] dark:text-[#0b0f12] shadow-md'
                : 'bg-white dark:bg-[#141c22] text-gray-700 dark:text-gray-300 hover:bg-[#ece8e2]/60 dark:hover:bg-[#1a252e] hover:text-gray-900 dark:hover:text-white border border-[#e5e0d8] dark:border-[#22303c]'
            }`}
          >
            {cat}
            {count !== undefined && count > 0 && (
              <span
                className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  isSelected
                    ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black'
                    : 'bg-gray-100 dark:bg-[#1e2a34] text-gray-600 dark:text-gray-400'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryPills;

