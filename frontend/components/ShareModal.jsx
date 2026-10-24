'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Share2,
  Mail,
  Send,
} from 'lucide-react';

export default function ShareModal({ isOpen, onClose, blog }) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !blog) return null;

  const title = blog.title || 'Check out this story on Blogify';

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const socialChannels = [
    {
      name: 'X (Twitter)',
      color: 'bg-black text-white hover:bg-neutral-800',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      shareUrl: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'LinkedIn',
      color: 'bg-[#0a66c2] text-white hover:bg-[#004182]',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 0 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.4 9.74v-8.37H5.06v8.37h2.8z" />
        </svg>
      ),
      shareUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'WhatsApp',
      color: 'bg-[#25D366] text-white hover:bg-[#128C7E]',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.55c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.57.13.17 1.75 2.67 4.23 3.75.59.26 1.05.41 1.41.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.17-.48-.29z" />
        </svg>
      ),
      shareUrl: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + shareUrl)}`,
    },
    {
      name: 'Facebook',
      color: 'bg-[#1877F2] text-white hover:bg-[#0d65d9]',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      shareUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'Reddit',
      color: 'bg-[#FF4500] text-white hover:bg-[#e03d00]',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.56 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.197-2.512-.73a.326.326 0 0 0-.232-.095z" />
        </svg>
      ),
      shareUrl: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`,
    },
    {
      name: 'Email',
      color: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      icon: <Mail className="w-4 h-4" />,
      shareUrl: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent('Read this story on Blogify: ' + shareUrl)}`,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs font-poppins animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#121920] rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 dark:border-[#22303c] p-6 space-y-6 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#1e2a35]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#faf8f5] dark:bg-[#19242d] flex items-center justify-center text-[#182226] dark:text-[#e2ad76]">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                Share Article
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Spread this story with your friends & followers
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#1a2530] text-gray-400 hover:text-gray-700 dark:hover:text-white transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Article Preview Card */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#faf8f5] dark:bg-[#161f27] border border-[#ece8e1] dark:border-[#23313e]">
          <img
            src={blog.coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=400&q=80'}
            alt={blog.title}
            className="w-14 h-14 rounded-xl object-cover shrink-0 border border-gray-200 dark:border-slate-700"
          />
          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider">
              {blog.category || 'Article'}
            </span>
            <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1 leading-snug">
              {blog.title}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
              By {blog.author?.name || 'Anonymous'}
            </p>
          </div>
        </div>

        {/* Social Share Grid */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Share via social media
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {socialChannels.map((channel) => (
              <a
                key={channel.name}
                href={channel.shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl text-xs font-semibold transition-all duration-200 shadow-xs hover:shadow active:scale-95 ${channel.color}`}
              >
                {channel.icon}
                <span className="text-[11px]">{channel.name}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Copy Link Section */}
        <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-[#1e2a35]">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Or copy direct link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              onFocus={(e) => e.target.select()}
              className="flex-1 px-3.5 py-2.5 bg-[#faf8f5] dark:bg-[#161f27] border border-gray-200 dark:border-[#263543] rounded-xl text-xs text-gray-700 dark:text-gray-200 font-medium focus:outline-none focus:border-black dark:focus:border-[#e2ad76] truncate"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#182226] text-white hover:bg-black dark:bg-[#e2ad76] dark:text-[#0b0f12] dark:hover:bg-[#d69d64] active:scale-95'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

