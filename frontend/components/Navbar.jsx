'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  BookOpen,
  Search,
  PenSquare,
  Bell,
  User,
  LogOut,
  FolderOpen,
  Bookmark,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import Avatar from './Avatar';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
    setNotificationOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/blogs?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/blogs');
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Blogs', path: '/blogs' },
    { name: 'Categories', path: '/categories' },
  ];

  const isActive = (path) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#faf8f5]/90 dark:bg-[#0b0f12]/90 backdrop-blur-md border-b border-[#ece8e1] dark:border-[#1d2730] transition-colors duration-300 font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#182226] text-white dark:bg-white dark:text-[#0b0f12] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-[#182226] dark:text-white font-poppins">
            Blogify
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-gray-600 dark:text-gray-300">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              className={`transition-colors relative py-1 ${
                isActive(link.path)
                  ? 'text-[#182226] dark:text-white font-semibold'
                  : 'hover:text-[#182226] dark:hover:text-white'
              }`}
            >
              {link.name}
              {isActive(link.path) && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#182226] dark:bg-[#e2ad76] rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* Search Bar */}
        <div className="hidden lg:flex items-center flex-1 max-w-xs mx-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f1eeea]/70 dark:bg-[#151c23] hover:bg-[#ece8e2] dark:hover:bg-[#1a232c] focus:bg-white dark:focus:bg-[#182129] text-sm text-gray-800 dark:text-gray-100 rounded-full pl-10 pr-4 py-2 border border-transparent focus:border-gray-300 dark:focus:border-slate-700 focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </form>
        </div>

        {/* Right Section: Theme Toggle + Auth Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Theme Switcher Toggle */}
          <ThemeToggle />

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                href="/create"
                className="hidden md:inline-flex items-center gap-2 bg-[#182226] hover:bg-black text-white dark:bg-[#e2ad76] dark:text-[#0b0f12] dark:hover:bg-[#d69d64] text-sm font-semibold px-4 py-2 rounded-full transition-all shadow-sm active:scale-95"
              >
                <PenSquare className="w-4 h-4" />
                <span>Write</span>
              </Link>

              {/* Notification icon & popover */}
              <div className="relative" ref={notificationRef}>
                <button
                  type="button"
                  aria-label="Notifications"
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-[#18222a] transition relative cursor-pointer"
                  onClick={() => setNotificationOpen(!notificationOpen)}
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-[#faf8f5] dark:ring-[#0b0f12]" />
                </button>

                {notificationOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#131b21] rounded-2xl shadow-xl border border-gray-100 dark:border-[#222f3b] p-4 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-[#1d2934]">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                        Notifications
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold">
                        All Caught Up
                      </span>
                    </div>
                    <div className="py-3 text-center space-y-1">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        No new notifications
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        When people like your stories or reply to your comments, they will appear here.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-gray-300 dark:hover:ring-slate-700 transition cursor-pointer"
                  aria-expanded={dropdownOpen}
                >
                  <Avatar src={user?.avatar} alt={user?.name} size="md" />
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 hidden md:block" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#131b21] rounded-2xl shadow-xl border border-gray-100 dark:border-[#222f3b] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-[#1d2934]">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    </div>

                    <Link
                      href="/create"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#19242d] hover:text-[#182226] dark:hover:text-white transition"
                    >
                      <PenSquare className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      Create New Blog
                    </Link>

                    <Link
                      href="/profile"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#19242d] hover:text-[#182226] dark:hover:text-white transition"
                    >
                      <FolderOpen className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      My Blogs
                    </Link>

                    <Link
                      href="/profile?tab=saved"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#19242d] hover:text-[#182226] dark:hover:text-white transition"
                    >
                      <Bookmark className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      Saved Stories
                    </Link>

                    <Link
                      href="/profile?tab=profile"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#19242d] hover:text-[#182226] dark:hover:text-white transition"
                    >
                      <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      Edit Profile
                    </Link>

                    <div className="border-t border-gray-100 dark:border-[#1d2934] my-1" />

                    <button
                      type="button"
                      onClick={logout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-[#182226] dark:hover:text-white px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#18222a] transition"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold text-white bg-[#182226] hover:bg-black dark:bg-[#e2ad76] dark:text-[#0b0f12] dark:hover:bg-[#d69d64] px-5 py-2.5 rounded-full shadow-sm transition active:scale-95"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Actions: Theme Toggle + Menu */}
        <div className="flex sm:hidden items-center gap-2">
          <ThemeToggle />

          {isAuthenticated && (
            <Link
              href="/create"
              className="p-2 bg-[#182226] text-white dark:bg-[#e2ad76] dark:text-[#0b0f12] rounded-full"
              aria-label="Create Post"
            >
              <PenSquare className="w-4 h-4" />
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white rounded-lg focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#faf8f5] dark:bg-[#0f151a] border-b border-gray-200 dark:border-[#1e2a34] px-4 pt-2 pb-6 space-y-3 font-poppins">
          <form onSubmit={handleSearchSubmit} className="relative w-full mb-3">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#151c23] text-sm text-gray-800 dark:text-gray-100 rounded-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-800 focus:outline-none"
            />
          </form>

          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                className={`px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive(link.path)
                    ? 'bg-[#182226] text-white dark:bg-[#e2ad76] dark:text-black font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1a232b]'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {isAuthenticated ? (
              <>
                <Link
                  href="/create"
                  className="px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1a232b] flex items-center gap-2"
                >
                  <PenSquare className="w-4 h-4" />
                  <span>Write New Blog</span>
                </Link>
                <Link
                  href="/profile"
                  className="px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1a232b] flex items-center gap-2"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>My Blogs</span>
                </Link>
                <Link
                  href="/profile?tab=saved"
                  className="px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1a232b] flex items-center gap-2"
                >
                  <Bookmark className="w-4 h-4" />
                  <span>Saved Stories</span>
                </Link>
                <Link
                  href="/profile?tab=profile"
                  className="px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1a232b] flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  <span>Edit Profile</span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 text-left cursor-pointer w-full"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href="/login"
                  className="w-full text-center px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#172129] rounded-xl hover:bg-gray-200 transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="w-full text-center px-4 py-2.5 text-sm font-semibold text-white bg-[#182226] dark:bg-[#e2ad76] dark:text-black rounded-xl hover:bg-black transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
