'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Heart, ArrowUp } from 'lucide-react';
import SubscribeModal from './SubscribeModal';

const Footer = () => {
  const [emailInput, setEmailInput] = useState('');
  const [subscribedEmail, setSubscribedEmail] = useState('');
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);

  const handleSubscribeSubmit = (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setSubscribedEmail(emailInput.trim());
    setIsSubscribeModalOpen(true);
    setEmailInput('');
  };

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-white dark:bg-[#070a0d] border-t border-[#ece8e1] dark:border-[#1a232c] mt-24 font-poppins transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#182226] text-white dark:bg-white dark:text-[#070a0d] flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-[#182226] dark:text-white">
                Blogify
              </span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              A place for curious minds to share ideas, explore new perspectives, and inspire the world through meaningful stories.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-white tracking-wider uppercase mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link href="/blogs" className="hover:text-[#182226] dark:hover:text-[#e2ad76] transition">All Articles</Link>
              </li>
              <li>
                <Link href="/blogs?category=Technology" className="hover:text-[#182226] dark:hover:text-[#e2ad76] transition">Technology</Link>
              </li>
              <li>
                <Link href="/blogs?category=Lifestyle" className="hover:text-[#182226] dark:hover:text-[#e2ad76] transition">Lifestyle</Link>
              </li>
              <li>
                <Link href="/blogs?category=Travel" className="hover:text-[#182226] dark:hover:text-[#e2ad76] transition">Travel & Nature</Link>
              </li>
              <li>
                <Link href="/blogs?category=Food" className="hover:text-[#182226] dark:hover:text-[#e2ad76] transition">Food & Health</Link>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-white tracking-wider uppercase mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link href="/create" className="hover:text-[#182226] dark:hover:text-[#e2ad76] transition">Write a Story</Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-[#182226] dark:hover:text-[#e2ad76] transition">Browse Categories</Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#182226] dark:hover:text-[#e2ad76] transition">Author Login</Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[#182226] dark:hover:text-[#e2ad76] transition">Create Free Account</Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-white tracking-wider uppercase mb-4">
              Stay Inspired
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Get the week's best stories delivered straight to your inbox.
            </p>
            <form onSubmit={handleSubscribeSubmit} className="space-y-2">
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-[#131b22] border border-gray-200 dark:border-[#22303c] text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl focus:outline-none focus:bg-white dark:focus:bg-[#17212a] focus:border-gray-400 dark:focus:border-[#e2ad76]"
              />
              <button
                type="submit"
                className="w-full py-2 bg-[#182226] hover:bg-black text-white dark:bg-[#e2ad76] dark:text-[#0b0f12] dark:hover:bg-[#d69d64] text-sm font-semibold rounded-xl transition cursor-pointer"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 dark:border-[#17212a] mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 dark:text-gray-400 gap-4">
          <div className="flex items-center gap-1">
            <span>© {new Date().getFullYear()} Blogify. Built with MERN + Next.js.</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-current inline ml-1" />
          </div>

          <button
            onClick={scrollToTop}
            type="button"
            className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Customized Subscription Success Modal */}
      <SubscribeModal
        isOpen={isSubscribeModalOpen}
        onClose={() => setIsSubscribeModalOpen(false)}
        email={subscribedEmail}
      />
    </footer>
  );
};

export default Footer;
