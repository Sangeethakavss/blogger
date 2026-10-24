'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  Quote,
  UploadCloud,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function CreateBlogPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Technology');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/create');
    }
  }, [authLoading, isAuthenticated, router]);

  const insertFormatting = (prefix, suffix = '') => {
    const textarea = document.getElementById('blog-content-area');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || 'text';
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 10);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (status = 'Published') => {
    if (!title.trim()) {
      setErrorMsg('Please enter a title for your blog post.');
      return;
    }

    if (!content.trim()) {
      setErrorMsg('Please write some content before publishing.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const activeCover = (customImageUrl.trim() || coverImage).trim();
      const payload = {
        title: title.trim(),
        category,
        content: content.trim(),
        coverImage: activeCover || undefined,
        status,
      };

      const res = await api.post('/blogs', payload);
      if (res.data.success) {
        router.push(`/blog/${res.data.blog._id}`);
      }
    } catch (err) {
      console.error('Failed to create blog:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to create blog. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="py-24 flex justify-center items-center font-poppins">
        <Loader2 className="w-8 h-8 animate-spin text-[#182226] dark:text-[#e2ad76]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8 font-poppins">
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
          Create New Blog
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Share your thoughts with the world
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Form Fields */}
      <div className="bg-white dark:bg-[#121920] rounded-3xl border border-[#ece8e1] dark:border-[#1e2a34] p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Title and Category Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-2">
            <label htmlFor="blog-title" className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="blog-title"
              type="text"
              required
              placeholder="Enter a catchy title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-[#faf8f5] dark:bg-[#18232c] border border-gray-200 dark:border-[#243340] rounded-2xl text-base text-gray-900 dark:text-white focus:outline-none focus:border-gray-500 dark:focus:border-[#e2ad76] focus:bg-white dark:focus:bg-[#18232c] transition"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="blog-category" className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="blog-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-[#faf8f5] dark:bg-[#18232c] border border-gray-200 dark:border-[#243340] rounded-2xl text-base text-gray-900 dark:text-white focus:outline-none focus:border-gray-500 dark:focus:border-[#e2ad76] focus:bg-white dark:focus:bg-[#18232c] transition"
            >
              <option value="Technology">Technology</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Travel">Travel</option>
              <option value="Health">Health</option>
              <option value="Food">Food</option>
              <option value="Business">Business</option>
              <option value="Inspiration">Inspiration</option>
            </select>
          </div>
        </div>

        {/* Content Area with Toolbar */}
        <div className="space-y-2">
          <label htmlFor="blog-content-area" className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Content <span className="text-red-500">*</span>
          </label>

          <div className="border border-gray-200 dark:border-[#243340] rounded-2xl overflow-hidden bg-[#faf8f5] dark:bg-[#18232c] focus-within:border-gray-500 dark:focus-within:border-[#e2ad76] focus-within:bg-white dark:focus-within:bg-[#18232c] transition">
            <div className="flex flex-wrap items-center gap-1 p-2 bg-[#f4efe9]/80 dark:bg-[#141d24] border-b border-gray-200 dark:border-[#243340] text-gray-600 dark:text-gray-300">
              <select
                onChange={(e) => {
                  if (e.target.value === 'h2') insertFormatting('## ', '\n');
                  if (e.target.value === 'h3') insertFormatting('### ', '\n');
                  e.target.value = 'normal';
                }}
                defaultValue="normal"
                className="text-xs bg-white dark:bg-[#18232c] border border-gray-200 dark:border-[#243340] rounded-lg px-2.5 py-1.5 focus:outline-none font-medium mr-2 text-gray-800 dark:text-gray-200"
              >
                <option value="normal">Normal text</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
              </select>

              <button
                type="button"
                onClick={() => insertFormatting('**', '**')}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-[#202d38] hover:text-black dark:hover:text-white transition cursor-pointer"
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => insertFormatting('*', '*')}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-[#202d38] hover:text-black dark:hover:text-white transition cursor-pointer"
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => insertFormatting('<u>', '</u>')}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-[#202d38] hover:text-black dark:hover:text-white transition cursor-pointer"
                title="Underline"
              >
                <Underline className="w-4 h-4" />
              </button>

              <div className="w-[1px] h-5 bg-gray-300 dark:bg-[#2b3a47] mx-1" />

              <button
                type="button"
                onClick={() => insertFormatting('- ', '\n')}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-[#202d38] hover:text-black dark:hover:text-white transition cursor-pointer"
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => insertFormatting('1. ', '\n')}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-[#202d38] hover:text-black dark:hover:text-white transition cursor-pointer"
                title="Numbered List"
              >
                <ListOrdered className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => insertFormatting('> "')}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-[#202d38] hover:text-black dark:hover:text-white transition cursor-pointer"
                title="Quote"
              >
                <Quote className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => insertFormatting('[Link Title](', ')')}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-[#202d38] hover:text-black dark:hover:text-white transition cursor-pointer"
                title="Link"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
            </div>

            <textarea
              id="blog-content-area"
              rows={12}
              required
              placeholder="Write your story here... You can use headings, lists, quotes, and markdown formatting."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-4 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-base focus:outline-none resize-y leading-relaxed font-poppins"
            />
          </div>
        </div>

        {/* Cover Image Section */}
        <div className="space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Cover Image <span className="text-gray-400 font-normal lowercase">(optional)</span>
          </label>

          <div className="relative border-2 border-dashed border-gray-300 dark:border-[#2e3e4c] rounded-3xl p-6 text-center hover:border-gray-500 dark:hover:border-[#e2ad76] bg-[#faf8f5]/50 dark:bg-[#18232c]/50 hover:bg-[#faf8f5] dark:hover:bg-[#18232c] transition cursor-pointer">
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-full bg-white dark:bg-[#202d38] shadow-xs flex items-center justify-center text-gray-500 dark:text-[#e2ad76]">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">PNG, JPG, or WEBP up to 5MB</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="url"
              placeholder="Or paste an external Image URL (https://...)"
              value={customImageUrl}
              onChange={(e) => setCustomImageUrl(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs bg-[#faf8f5] dark:bg-[#18232c] border border-gray-200 dark:border-[#243340] text-gray-800 dark:text-gray-200 rounded-xl focus:outline-none focus:border-gray-500 dark:focus:border-[#e2ad76]"
            />
            {customImageUrl && (
              <button
                type="button"
                onClick={() => setCustomImageUrl('')}
                className="text-xs text-gray-500 dark:text-[#e2ad76] hover:text-black dark:hover:text-white px-3 py-2 cursor-pointer font-medium"
              >
                Clear
              </button>
            )}
          </div>

          {/* Active Preview - only shown when an image is selected */}
          {(customImageUrl.trim() || coverImage) && (
            <div className="mt-4 rounded-2xl overflow-hidden aspect-[16/6] bg-gray-100 dark:bg-[#18232c] border border-gray-200 dark:border-[#243340] relative group">
              <img
                src={customImageUrl.trim() || coverImage}
                alt="Selected cover preview"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2.5 left-2.5 bg-black/70 text-white text-[11px] font-medium px-3 py-1 rounded-full backdrop-blur-xs">
                Cover Preview
              </span>
              <button
                type="button"
                onClick={() => {
                  setCoverImage('');
                  setCustomImageUrl('');
                }}
                className="absolute top-2.5 right-2.5 bg-black/70 hover:bg-red-600 text-white text-[11px] font-medium px-3 py-1 rounded-full backdrop-blur-xs transition cursor-pointer"
              >
                Remove Image
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-gray-100 dark:border-[#1e2a34] flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit('Draft')}
            className="px-6 py-2.5 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#18232c] hover:bg-gray-200 dark:hover:bg-[#202d38] transition cursor-pointer disabled:opacity-50"
          >
            Save as Draft
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit('Published')}
            className="px-7 py-2.5 rounded-full text-sm font-semibold text-white bg-[#182226] hover:bg-black dark:bg-[#e2ad76] dark:hover:bg-[#f0c395] dark:text-[#0b0f12] transition flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Publish</span>
          </button>
        </div>
      </div>
    </div>
  );
}

