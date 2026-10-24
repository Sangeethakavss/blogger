'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <nav className="flex items-center justify-center gap-1.5 my-10 font-poppins" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition ${
          currentPage === 1
            ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#1f2b35] hover:text-black dark:hover:text-white cursor-pointer'
        }`}
        aria-label="Previous Page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {getPageNumbers().map((page, idx) => {
        if (page === '...') {
          return (
            <span key={`ellipsis-${idx}`} className="w-8 text-center text-gray-400 dark:text-gray-500 text-sm">
              ...
            </span>
          );
        }

        const isCurrent = page === currentPage;
        return (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`w-9 h-9 rounded-full text-sm font-semibold transition cursor-pointer ${
              isCurrent
                ? 'bg-[#182226] text-white dark:bg-[#e2ad76] dark:text-[#0b0f12] shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#1f2b35] hover:text-black dark:hover:text-white'
            }`}
            aria-current={isCurrent ? 'page' : undefined}
          >
            {page}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition ${
          currentPage === totalPages
            ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#1f2b35] hover:text-black dark:hover:text-white cursor-pointer'
        }`}
        aria-label="Next Page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
};

export default Pagination;

