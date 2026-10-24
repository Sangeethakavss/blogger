'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PenTool,
  Globe2,
  Users2,
  ArrowRight,
  Sparkles,
  Loader2,
} from 'lucide-react';
import BlogCard from '../components/BlogCard';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/blogs?limit=6&sort=popular');
        if (res.data.success) {
          setFeaturedBlogs(res.data.blogs || []);
        }
      } catch (err) {
        console.error('Failed to load featured blogs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div className="space-y-20 pb-16 font-poppins">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Hero Copy */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ede8e0] dark:bg-[#1a242c] text-[#182226] dark:text-[#e2ad76] border border-transparent dark:border-[#2d3d4b] text-xs font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Share Your Stories</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#182226] dark:text-[#f8fafc] leading-[1.08]">
              Discover. <br />
              Read. <br />
              Write.
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg font-normal">
              A place for curious minds to share ideas, explore new perspectives, and inspire the world through meaningful stories.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href={isAuthenticated ? '/create' : '/register'}
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-[#182226] hover:bg-black text-white dark:bg-[#e2ad76] dark:hover:bg-[#f0c395] dark:text-[#0b0f12] text-base font-semibold shadow-lg shadow-black/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Start Writing
              </Link>
              <Link
                href="/blogs"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 dark:bg-[#121920] dark:text-gray-200 dark:border-[#243340] dark:hover:bg-[#18232c] text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Explore Blogs
              </Link>
            </div>
          </div>

          {/* Right Column: Hero Visual with Overlay Card */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] bg-gray-200">
              <img
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
                alt="Scenic mountain landscape with lake and hiker"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

              {/* Floating Quote Card matching screenshot */}
              <div className="absolute bottom-6 right-6 max-w-xs bg-white/95 dark:bg-[#121920]/95 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-white/40 dark:border-[#243340]">
                <div className="flex items-start gap-3">
                  <span className="text-3xl font-poppins font-bold text-[#182226] dark:text-[#e2ad76] leading-none">“</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-snug">
                      Good ideas start with a single post. —
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Blogify Community</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Value Proposition Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 pt-12 border-t border-[#ece8e1] dark:border-[#1e2a34]">
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/60 dark:bg-[#121920]/60 border border-[#eeebe5] dark:border-[#1e2a34] hover:bg-white dark:hover:bg-[#162028] hover:shadow-sm transition">
            <div className="w-12 h-12 rounded-2xl bg-[#f4efe9] dark:bg-[#1a252e] text-[#182226] dark:text-[#e2ad76] flex items-center justify-center shrink-0">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Write Freely</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Share your thoughts without boundaries with our clean editor.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/60 dark:bg-[#121920]/60 border border-[#eeebe5] dark:border-[#1e2a34] hover:bg-white dark:hover:bg-[#162028] hover:shadow-sm transition">
            <div className="w-12 h-12 rounded-2xl bg-[#f4efe9] dark:bg-[#1a252e] text-[#182226] dark:text-[#e2ad76] flex items-center justify-center shrink-0">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Read Globally</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Explore diverse ideas and viewpoints from writers worldwide.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/60 dark:bg-[#121920]/60 border border-[#eeebe5] dark:border-[#1e2a34] hover:bg-white dark:hover:bg-[#162028] hover:shadow-sm transition">
            <div className="w-12 h-12 rounded-2xl bg-[#f4efe9] dark:bg-[#1a252e] text-[#182226] dark:text-[#e2ad76] flex items-center justify-center shrink-0">
              <Users2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Grow Together</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Join a supportive creative community of lifelong thinkers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Articles Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#e2ad76] mb-1">
              Top Stories
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Featured Articles
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
              Hand-picked stories and trending insights from our community.
            </p>
          </div>

          <Link
            href="/blogs"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#182226] dark:text-[#e2ad76] hover:text-black dark:hover:text-[#f0c395] hover:gap-2.5 transition-all"
          >
            <span>Explore all blogs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#182226] dark:text-[#e2ad76] animate-spin" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading stories...</p>
          </div>
        ) : featuredBlogs.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#121920] rounded-3xl border border-gray-200 dark:border-[#1e2a34]">
            <p className="text-gray-600 dark:text-gray-400">No blogs published yet.</p>
            <Link
              href="/create"
              className="mt-4 inline-block px-5 py-2.5 bg-[#182226] hover:bg-black text-white dark:bg-[#e2ad76] dark:hover:bg-[#f0c395] dark:text-[#0b0f12] rounded-full text-sm font-medium"
            >
              Write the first story
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-7">
            {featuredBlogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

