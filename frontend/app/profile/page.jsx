'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FolderOpen,
  User,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  Loader2,
  Camera,
  CheckCircle,
  AlertCircle,
  Bookmark,
  BookmarkX,
} from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import Pagination from '../../components/Pagination';
import DeleteModal from '../../components/DeleteModal';
import Avatar from '../../components/Avatar';

function ProfileContent() {
  const { user, logout, updateProfile, isAuthenticated, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeTab = searchParams.get('tab') || 'blogs';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [blogs, setBlogs] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [savedBlogs, setSavedBlogs] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [stats, setStats] = useState({ totalBlogs: 0, publishedBlogs: 0, draftBlogs: 0, totalViews: 0 });
  const [loading, setLoading] = useState(true);

  // Profile Edit State (Only Name and Bio, NO Avatar URL text field)
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileBio, setProfileBio] = useState(user?.bio || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Hidden file input for corner avatar button
  const avatarInputRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/profile');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfileBio(user.bio || '');
    }
  }, [user]);

  // Load user stats & blogs
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const meRes = await api.get('/auth/me');
        if (meRes.data.success) {
          setStats(meRes.data.stats || {});
        }

        const blogsRes = await api.get(`/blogs/user/my-blogs?page=${currentPage}&limit=6`);
        if (blogsRes.data.success) {
          setBlogs(blogsRes.data.blogs || []);
          setTotalPages(blogsRes.data.totalPages || 1);
          setTotalBlogs(blogsRes.data.totalBlogs || 0);
        }

        const savedRes = await api.get('/blogs/user/saved');
        if (savedRes.data.success) {
          setSavedBlogs(savedRes.data.blogs || []);
        }
      } catch (err) {
        console.error('Failed to load user profile data:', err);
      } finally {
        setLoading(false);
        setLoadingSaved(false);
      }
    };

    if (isAuthenticated) {
      fetchUserData();
    }
  }, [currentPage, activeTab, isAuthenticated]);

  const handleUnsaveBlog = async (blogId) => {
    try {
      const res = await api.post(`/blogs/${blogId}/save`);
      if (res.data?.success) {
        setSavedBlogs((prev) => prev.filter((b) => b._id !== blogId));
        setStats((prev) => ({
          ...prev,
          savedBlogs: Math.max(0, (prev.savedBlogs || 1) - 1),
        }));
      }
    } catch (err) {
      console.error('Failed to unsave blog:', err);
    }
  };

  const handleTabChange = (tab) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('tab', tab);
    newParams.set('page', '1');
    router.push(`/profile?${newParams.toString()}`);
  };

  const handlePageChange = (page) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('page', page.toString());
    router.push(`/profile?${newParams.toString()}`);
  };

  // Avatar file upload from corner icon click
  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Avatar file size exceeds 5MB limit. Please choose a smaller image.');
      return;
    }

    setUploadingAvatar(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Avatar = reader.result;
      const res = await updateProfile({ avatar: base64Avatar });
      setUploadingAvatar(false);
      if (res.success) {
        setProfileMessage({ type: 'success', text: 'Profile picture updated successfully!' });
        setTimeout(() => setProfileMessage({ type: '', text: '' }), 4000);
      } else {
        setProfileMessage({ type: 'error', text: res.message });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = async () => {
    setUploadingAvatar(true);
    const res = await updateProfile({ avatar: '' });
    setUploadingAvatar(false);
    if (res.success) {
      setProfileMessage({ type: 'success', text: 'Profile picture removed successfully!' });
      setTimeout(() => setProfileMessage({ type: '', text: '' }), 4000);
    } else {
      setProfileMessage({ type: 'error', text: res.message });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const res = await api.delete(`/blogs/${deleteTarget._id}`);
      if (res.data.success) {
        setBlogs((prev) => prev.filter((b) => b._id !== deleteTarget._id));
        setStats((prev) => ({
          ...prev,
          totalBlogs: Math.max(0, prev.totalBlogs - 1),
        }));
        setDeleteTarget(null);
      }
    } catch (err) {
      console.error('Failed to delete blog:', err);
      alert(err.response?.data?.message || 'Failed to delete blog');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage({ type: '', text: '' });

    const res = await updateProfile({
      name: profileName,
      bio: profileBio,
    });

    setSavingProfile(false);
    if (res.success) {
      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setProfileMessage({ type: '', text: '' }), 4000);
    } else {
      setProfileMessage({ type: 'error', text: res.message });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (authLoading) {
    return (
      <div className="py-24 flex justify-center items-center font-poppins">
        <Loader2 className="w-8 h-8 animate-spin text-[#182226] dark:text-[#e2ad76]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-poppins">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar */}
        <div className="lg:col-span-4 bg-white dark:bg-[#121920] rounded-3xl border border-[#ece8e1] dark:border-[#1e2a34] p-6 space-y-6 shadow-xs">
          {/* User info header with corner edit avatar icon */}
          <div className="flex flex-col items-center text-center space-y-3 pb-6 border-b border-gray-100 dark:border-[#1e2a34]">
            <div className="relative group">
              <Avatar src={user?.avatar} alt={user?.name} size="2xl" className="border-4 border-[#faf8f5] dark:border-[#1a252e] shadow-md" />

              {/* Corner Edit Avatar Icon button */}
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 p-2 bg-[#182226] hover:bg-black text-white dark:bg-[#e2ad76] dark:hover:bg-[#f0c395] dark:text-[#0b0f12] rounded-full shadow-md transition border-2 border-white dark:border-[#121920] cursor-pointer active:scale-95"
                title="Click to edit profile picture"
                aria-label="Edit Profile Avatar"
              >
                {uploadingAvatar ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Hidden file input */}
              <input
                type="file"
                ref={avatarInputRef}
                onChange={handleAvatarFileChange}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
              />
            </div>

            {user?.avatar ? (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                disabled={uploadingAvatar}
                className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition cursor-pointer"
              >
                Remove photo
              </button>
            ) : null}

            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
            {user?.bio && (
              <p className="text-xs text-gray-600 dark:text-gray-300 max-w-xs leading-relaxed italic">
                "{user?.bio}"
              </p>
            )}
          </div>

          {/* User Stats Grid with Views & Saved Counts */}
          <div className="grid grid-cols-3 gap-2 pb-6 border-b border-gray-100 dark:border-[#1e2a34] text-center">
            <div className="bg-[#faf8f5] dark:bg-[#18232c] p-2.5 rounded-2xl">
              <span className="block text-lg font-bold text-gray-900 dark:text-white">
                {stats.totalBlogs || 0}
              </span>
              <span className="text-[10px] uppercase font-semibold text-gray-500 dark:text-gray-400">
                Blogs
              </span>
            </div>
            <div className="bg-[#faf8f5] dark:bg-[#18232c] p-2.5 rounded-2xl" title="Total views">
              <span className="block text-lg font-bold text-gray-900 dark:text-white">
                {stats.totalViews || 0}
              </span>
              <span className="text-[10px] uppercase font-semibold text-gray-500 dark:text-gray-400">
                Views
              </span>
            </div>
            <div className="bg-[#faf8f5] dark:bg-[#18232c] p-2.5 rounded-2xl" title="Saved stories collection">
              <span className="block text-lg font-bold text-gray-900 dark:text-white">
                {savedBlogs.length}
              </span>
              <span className="text-[10px] uppercase font-semibold text-gray-500 dark:text-gray-400">
                Saved
              </span>
            </div>
          </div>

          {/* Navigation Menu with Saved Stories */}
          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => handleTabChange('blogs')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition text-left cursor-pointer ${
                activeTab === 'blogs'
                  ? 'bg-[#182226] text-white dark:bg-[#e2ad76] dark:text-[#0b0f12] shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#18232c] dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <FolderOpen className="w-4 h-4" />
                <span>My Blogs</span>
              </div>
              {blogs.length > 0 && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    activeTab === 'blogs' ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black' : 'bg-gray-100 text-gray-700 dark:bg-[#202d38] dark:text-gray-300'
                  }`}
                >
                  {stats.totalBlogs || blogs.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('saved')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition text-left cursor-pointer ${
                activeTab === 'saved'
                  ? 'bg-[#182226] text-white dark:bg-[#e2ad76] dark:text-[#0b0f12] shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#18232c] dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Bookmark className="w-4 h-4" />
                <span>Saved Stories</span>
              </div>
              {savedBlogs.length > 0 && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    activeTab === 'saved' ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black' : 'bg-gray-100 text-gray-700 dark:bg-[#202d38] dark:text-gray-300'
                  }`}
                >
                  {savedBlogs.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition text-left cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-[#182226] text-white dark:bg-[#e2ad76] dark:text-[#0b0f12] shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#18232c] dark:hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile Details</span>
            </button>

            <div className="pt-2 border-t border-gray-100 dark:border-[#1e2a34]">
              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40 transition text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Right Content Panel */}
        <div className="lg:col-span-8 bg-white dark:bg-[#121920] rounded-3xl border border-[#ece8e1] dark:border-[#1e2a34] p-6 sm:p-8 space-y-6 shadow-xs">
          {activeTab === 'blogs' && (
            <div className="space-y-6">
              {/* Header with "+ New Blog" button */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-[#1e2a34]">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                  My Blogs
                </h1>
                <Link
                  href="/create"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#182226] hover:bg-black text-white dark:bg-[#e2ad76] dark:hover:bg-[#f0c395] dark:text-[#0b0f12] rounded-full text-sm font-semibold shadow-xs transition active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Blog</span>
                </Link>
              </div>

              {/* Blog Posts List */}
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 text-[#182226] dark:text-[#e2ad76] animate-spin" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Loading your blog posts...</p>
                </div>
              ) : blogs.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <FileText className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto" />
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">You haven't written any blogs yet</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Share your thoughts and ideas with our global community today.</p>
                  <Link
                    href="/create"
                    className="inline-block px-5 py-2.5 bg-[#182226] hover:bg-black text-white dark:bg-[#e2ad76] dark:hover:bg-[#f0c395] dark:text-[#0b0f12] rounded-full text-sm font-semibold transition mt-2 cursor-pointer"
                  >
                    Write your first blog
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-[#1e2a34]">
                  {blogs.map((post) => (
                    <div
                      key={post._id}
                      className="py-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:bg-[#faf8f5]/50 dark:hover:bg-[#18232c]/50 px-2 rounded-2xl transition"
                    >
                      {/* Left: Thumbnail & Post info */}
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <Link
                          href={`/blog/${post._id}`}
                          className="w-20 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-[#1a252e] shrink-0 block"
                        >
                          <img
                            src={post.coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=200&q=80'}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </Link>

                        <div className="min-w-0 space-y-1">
                          <Link
                            href={`/blog/${post._id}`}
                            className="font-bold text-gray-900 hover:text-black dark:text-white dark:hover:text-[#e2ad76] line-clamp-1 text-base block"
                          >
                            {post.title}
                          </Link>
                          <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                            <span className="font-medium text-gray-600 dark:text-gray-300">{post.category}</span>
                            <span>•</span>
                            <span>{formatDate(post.createdAt)}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1" title="Views">
                              <Eye className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-300 font-medium">{post.views || 0} views</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Status badge & Action buttons */}
                      <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            post.status === 'Published'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/40'
                              : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40'
                          }`}
                        >
                          {post.status}
                        </span>

                        <Link
                          href={`/edit/${post._id}`}
                          className="p-2 text-gray-400 hover:text-[#182226] hover:bg-gray-100 dark:text-gray-400 dark:hover:text-[#e2ad76] dark:hover:bg-[#18232c] rounded-lg transition"
                          title="Edit Blog"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(post)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 dark:hover:text-red-400 rounded-lg transition cursor-pointer"
                          title="Delete Blog"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          )}

          {/* Saved Stories Collection Tab */}
          {activeTab === 'saved' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-[#1e2a34]">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                    Saved Stories
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Your personal reading collection saved across Blogify
                  </p>
                </div>
                {savedBlogs.length > 0 && (
                  <span className="px-3.5 py-1 bg-[#faf8f5] dark:bg-[#18232c] text-xs font-bold text-gray-700 dark:text-gray-300 rounded-full border border-gray-200 dark:border-[#243340] self-start sm:self-auto">
                    {savedBlogs.length} {savedBlogs.length === 1 ? 'saved story' : 'saved stories'}
                  </span>
                )}
              </div>

              {loadingSaved ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 text-[#182226] dark:text-[#e2ad76] animate-spin" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Loading your saved collection...</p>
                </div>
              ) : savedBlogs.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <Bookmark className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto" />
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">No saved stories yet</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                    When you find articles you'd love to read later, click the bookmark icon on any post to save it here.
                  </p>
                  <Link
                    href="/blogs"
                    className="inline-block px-5 py-2.5 bg-[#182226] hover:bg-black text-white dark:bg-[#e2ad76] dark:hover:bg-[#f0c395] dark:text-[#0b0f12] rounded-full text-sm font-semibold transition mt-2 cursor-pointer"
                  >
                    Explore Articles
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-[#1e2a34]">
                  {savedBlogs.map((post) => (
                    <div
                      key={post._id}
                      className="py-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:bg-[#faf8f5]/50 dark:hover:bg-[#18232c]/50 px-2 rounded-2xl transition"
                    >
                      {/* Left: Thumbnail & Post info */}
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <Link
                          href={`/blog/${post._id}`}
                          className="w-20 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-[#1a252e] shrink-0 block border border-gray-100 dark:border-[#1e2a34]"
                        >
                          <img
                            src={post.coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=200&q=80'}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </Link>

                        <div className="min-w-0 space-y-1">
                          <Link
                            href={`/blog/${post._id}`}
                            className="font-bold text-gray-900 hover:text-black dark:text-white dark:hover:text-[#e2ad76] line-clamp-1 text-base block"
                          >
                            {post.title}
                          </Link>
                          <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                            <span className="font-medium text-gray-600 dark:text-gray-300">{post.category}</span>
                            <span>•</span>
                            <span>By {post.author?.name || 'Anonymous'}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1" title="Views">
                              <Eye className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-300 font-medium">{post.views || 0} views</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <Link
                          href={`/blog/${post._id}`}
                          className="px-3.5 py-1.5 text-xs font-semibold bg-[#182226] hover:bg-black text-white dark:bg-[#e2ad76] dark:hover:bg-[#f0c395] dark:text-[#0b0f12] rounded-full transition cursor-pointer"
                        >
                          Read Story
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleUnsaveBlog(post._id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40 rounded-full transition cursor-pointer"
                          title="Remove from saved collection"
                        >
                          <BookmarkX className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-gray-100 dark:border-[#1e2a34]">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Profile Details
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Update your public profile name and bio</p>
              </div>

              {profileMessage.text && (
                <div
                  className={`p-4 rounded-2xl text-sm flex items-center gap-3 ${
                    profileMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/40'
                      : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/40'
                  }`}
                >
                  {profileMessage.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 shrink-0" />
                  )}
                  <span>{profileMessage.text}</span>
                </div>
              )}

              {/* Edit Profile Form (Avatar URL text input completely removed!) */}
              <form onSubmit={handleProfileSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label htmlFor="user-fullname" className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Full Name
                  </label>
                  <input
                    id="user-fullname"
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#faf8f5] dark:bg-[#18232c] border border-gray-200 dark:border-[#243340] text-gray-800 dark:text-white rounded-xl text-sm focus:outline-none focus:border-gray-500 dark:focus:border-[#e2ad76]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="user-bio" className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Bio
                  </label>
                  <textarea
                    id="user-bio"
                    rows={4}
                    value={profileBio}
                    onChange={(e) => setProfileBio(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#faf8f5] dark:bg-[#18232c] border border-gray-200 dark:border-[#243340] text-gray-800 dark:text-white rounded-xl text-sm focus:outline-none focus:border-gray-500 dark:focus:border-[#e2ad76] leading-relaxed"
                    placeholder="Tell the readers a little about yourself..."
                  />
                </div>

                <div className="pt-4 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-6 py-2.5 bg-[#182226] hover:bg-black text-white dark:bg-[#e2ad76] dark:hover:bg-[#f0c395] dark:text-[#0b0f12] rounded-full text-sm font-semibold transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      <DeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Blog Post"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        loading={isDeleting}
      />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 flex justify-center items-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#182226]" />
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}

