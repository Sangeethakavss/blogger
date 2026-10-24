'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle2, Sparkles, X, ArrowRight } from 'lucide-react';

const SubscribeModal = ({ isOpen, onClose, email }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm font-poppins animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-[#12181d] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-[#23303a] text-center space-y-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="subscribe-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-white p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#1c2630] transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon with glowing badge */}
        <div className="relative mx-auto w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#182226] to-[#334652] dark:from-[#e2ad76] dark:to-[#f0c395] text-white dark:text-[#0b0f12] flex items-center justify-center shadow-xl shadow-black/15 dark:shadow-amber-500/20">
          <Mail className="w-8 h-8" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-4 ring-white dark:ring-[#12181d]">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Heading & description */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Subscription Confirmed</span>
          </div>
          <h3
            id="subscribe-modal-title"
            className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight"
          >
            You're on the list!
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-normal">
            Thank you for subscribing to <span className="font-semibold text-gray-900 dark:text-white">Blogify Stories</span>. We've registered{' '}
            <span className="font-semibold text-[#182226] dark:text-[#e2ad76] break-all">
              {email || 'your email'}
            </span>.
          </p>
        </div>

        {/* Perks Box */}
        <div className="bg-[#faf8f5] dark:bg-[#162026] rounded-2xl p-4 text-left border border-[#eeebe5] dark:border-[#23303a] space-y-2.5 text-xs text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#182226] dark:bg-[#e2ad76]" />
            <span>Curated weekly digests delivered every Sunday</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#182226] dark:bg-[#e2ad76]" />
            <span>Trending technology, lifestyle, and creative insights</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#182226] dark:bg-[#e2ad76]" />
            <span>Zero spam, and one-click unsubscribe at any time</span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/blogs"
            onClick={onClose}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-[#182226] hover:bg-black text-white dark:bg-[#e2ad76] dark:hover:bg-[#f0c395] dark:text-[#0b0f12] text-sm font-semibold transition shadow-md active:scale-[0.98]"
          >
            <span>Explore Latest Stories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1c2630] transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscribeModal;

