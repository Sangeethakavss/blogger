'use client';

import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

const DeleteModal = ({ isOpen, onClose, onConfirm, title = 'Delete Post', message, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs font-poppins">
      <div
        className="bg-white dark:bg-[#121920] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-[#22303c]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="flex-1">
            <h3 id="modal-headline" className="text-lg font-bold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
              {message || 'Are you sure you want to delete this blog post? This action is permanent and cannot be undone.'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 rounded-lg cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#1b252f] hover:bg-gray-200 dark:hover:bg-[#23313e] rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            {loading ? 'Deleting...' : 'Delete Permanently'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;

