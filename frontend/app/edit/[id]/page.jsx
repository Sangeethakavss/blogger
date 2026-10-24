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
  ArrowLeft,
} from 'lucide-react';
import api from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

export default function EditBlogPage({ params }) {
  const { id } = params;
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Technology');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [status, setStatus] = useState('Published');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?redirect=/edit/${id}`);
      return;
    }

    const fetchBlog = async () => {
      try {
        const res = await api.get(`/blogs/${id}`);
        if (res.data.success) {
          const blog = res.data.blog;
          const authorId = blog.author?._id || blog.author;
          if (user && authorId && authorId.toString() !== user._id.toString()) {
            setErrorMsg('You do not have permission to edit this blog post.');
            setLoading(false);
            return;
          }

          setTitle(blog.title || '');
          setCategory(blog.category || 'Technology');
          setContent(blog.content || '');
          setCoverImage(blog.coverImage || '');
          setStatus(blog.status || 'Published');
        }
      } catch (err) {
        console.error('Failed to load blog:', err);
        setErrorMsg('Failed to fetch blog post for editing.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchBlog();
    }
  }, [id, user, isAuthenticated, authLoading, router]);

  const insertFormatting = (prefix, suffix = '') => {
    const textarea = document.getElementById('edit-content-area');
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
      alert('File size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (newStatus) => {
    if (!title.trim()) {
      setErrorMsg('Please enter a title for your blog post.');
      return;
    }

    if (!content.trim()) {
      setErrorMsg('Please write some content.');
      return;
    }

    setErrorMsg('');
    setSaving(true);

    try {
      const payload = {
        title: title.trim(),
        category,
        content: content.trim(),
        coverImage: customImageUrl.trim() || coverImage,
        status: newStatus || status,
      };

      const res = await api.put(`/blogs/${id}`, payload);
      if (res.data.success) {
        router.push(`/blog/${id}`);
      }
    } catch (err) {
      console.error('Failed to update blog:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to update blog post.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 font-poppins">
        <Loader2 className="w-8 h-8 text-[#182226] dark:text-[#e2ad76] animate-spin" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading blog details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8 font-poppins">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel & Go Back</span>
        </button>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 dark:bg-[#18232c] text-gray-700 dark:text-gray-300 border border-transparent dark:border-[#243340]">
          Status: {status}
        </span>
      </div>

      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
          Edit Blog Post
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Update and refine your story
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
        {/* Title & Category */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-2">
            <label htmlFor="edit-title" className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="edit-title"
              type="text"
              required
              placeholder="Enter blog title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-[#faf8f5] dark:bg-[#18232c] border border-gray-200 dark:border-[#243340] rounded-2xl text-base text-gray-900 dark:text-white focus:outline-none focus:border-gray-500 dark:focus:border-[#e2ad76] focus:bg-white dark:focus:bg-[#18232c] transition"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-category" className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="edit-category"
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
          <label htmlFor="edit-content-area" className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
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
              id="edit-content-area"
              rows={12}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-4 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-base focus:outline-none resize-y leading-relaxed font-poppins"
            />
          </div>
        </div>

        {/* Cover Image */}
        <div className="space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Cover Image <span className="text-gray-400 font-normal lowercase">(optional)</span>
          </label>

          <div className="relative border-2 border-dashed border-gray-300 dark:border-[#2e3e4c] rounded-3xl p-6 text-center hover:border-gray-500 dark:hover:border-[#e2ad76] bg-[#faf8f5]/50 dark:bg-[#18232c]/50 transition cursor-pointer">
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <UploadCloud className="w-6 h-6 text-gray-500 dark:text-[#e2ad76]" />
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Change Cover Image</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Click to upload or drag & drop</p>
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

          {/* Active Preview */}
          {(customImageUrl.trim() || coverImage) && (
            <div className="rounded-2xl overflow-hidden aspect-[16/6] bg-gray-100 dark:bg-[#18232c] border border-gray-200 dark:border-[#243340] relative group">
              <img
                src={customImageUrl.trim() || coverImage}
                alt="Current cover preview"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2.5 left-2.5 bg-black/70 text-white text-[11px] font-medium px-3 py-1 rounded-full backdrop-blur-xs">
                Current Cover
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

        {/* Actions */}
        <div className="pt-6 border-t border-gray-100 dark:border-[#1e2a34] flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('Draft')}
            className="px-6 py-2.5 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#18232c] hover:bg-gray-200 dark:hover:bg-[#202d38] transition cursor-pointer"
          >
            Save as Draft
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('Published')}
            className="px-7 py-2.5 rounded-full text-sm font-semibold text-white bg-[#182226] hover:bg-black dark:bg-[#e2ad76] dark:hover:bg-[#f0c395] dark:text-[#0b0f12] transition flex items-center gap-2 shadow-md cursor-pointer"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Save & Publish</span>
          </button>
        </div>
      </div>
    </div>
  );
}

