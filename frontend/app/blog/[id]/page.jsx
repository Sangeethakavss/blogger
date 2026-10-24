'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Clock,
  Eye,
  Heart,
  Share2,
  Bookmark,
  Edit,
  Trash2,
  MessageSquare,
  Send,
  Loader2,
  Check,
} from 'lucide-react';
import api from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import Avatar from '../../../components/Avatar';
import DeleteModal from '../../../components/DeleteModal';
import ShareModal from '../../../components/ShareModal';

export default function BlogDetailPage({ params }) {
  const { id } = params;
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savingBookmark, setSavingBookmark] = useState(false);

  const viewRecordedRef = useRef(false);

  // Fetch blog data cleanly without incrementing views on every render
  useEffect(() => {
    let isMounted = true;
    const fetchBlog = async () => {
      try {
        const res = await api.get(`/blogs/${id}`);
        if (res.data.success && isMounted) {
          const blogData = res.data.blog;
          setBlog(blogData);
          setLikesCount(blogData.likes?.length || 0);
        }
      } catch (err) {
        console.error('Failed to load blog:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBlog();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Synchronize liked status when user or blog likes update
  useEffect(() => {
    if (user && blog?.likes) {
      setIsLiked(blog.likes.some((uId) => (uId._id || uId) === user._id));
    } else {
      setIsLiked(false);
    }
  }, [user, blog?.likes]);

  // Synchronize saved/bookmark status with user collection
  useEffect(() => {
    if (user && id) {
      api.get('/blogs/user/saved')
        .then((res) => {
          if (res.data?.success && Array.isArray(res.data.blogs)) {
            const hasSaved = res.data.blogs.some((b) => b._id.toString() === id.toString());
            setIsSaved(hasSaved);
          }
        })
        .catch(() => {});
    } else {
      setIsSaved(false);
    }
  }, [user, id]);

  // Record a view once per user visit and guard against StrictMode double execution
  useEffect(() => {
    if (!id || viewRecordedRef.current) return;
    viewRecordedRef.current = true;

    if (typeof window !== 'undefined') {
      const sessionKey = `viewed_blog_${id}`;
      if (!sessionStorage.getItem(sessionKey)) {
        sessionStorage.setItem(sessionKey, '1');
        api.post(`/blogs/${id}/view`)
          .then((res) => {
            if (res.data?.success && typeof res.data.views === 'number') {
              setBlog((prev) => (prev ? { ...prev, views: res.data.views } : prev));
            }
          })
          .catch((err) => {
            console.error('Failed to record blog view:', err);
          });
      }
    }
  }, [id]);

  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/blog/${id}`);
      return;
    }

    try {
      const res = await api.post(`/blogs/${id}/like`);
      if (res.data.success) {
        setIsLiked(res.data.liked);
        setLikesCount(res.data.likesCount);
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/blog/${id}`);
      return;
    }

    setSavingBookmark(true);
    try {
      const res = await api.post(`/blogs/${id}/save`);
      if (res.data?.success) {
        setIsSaved(res.data.saved);
      }
    } catch (err) {
      console.error('Failed to toggle save:', err);
    } finally {
      setSavingBookmark(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!isAuthenticated) {
      router.push(`/login?redirect=/blog/${id}`);
      return;
    }

    setSubmittingComment(true);
    try {
      const res = await api.post(`/blogs/${id}/comments`, { content: commentText.trim() });
      if (res.data.success) {
        setBlog((prev) => ({
          ...prev,
          comments: res.data.comments,
        }));
        setCommentText('');
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
      alert(err.response?.data?.message || 'Failed to submit comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      const res = await api.delete(`/blogs/${id}`);
      if (res.data.success) {
        router.push('/profile');
      }
    } catch (err) {
      console.error('Failed to delete blog:', err);
      alert(err.response?.data?.message || 'Failed to delete blog post');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 font-poppins">
        <Loader2 className="w-8 h-8 text-[#182226] dark:text-[#e2ad76] animate-spin" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading blog post...</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4 font-poppins">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Blog Post Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400">The story you are looking for may have been removed or is unavailable.</p>
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#182226] hover:bg-black text-white dark:bg-[#e2ad76] dark:hover:bg-[#f0c395] dark:text-[#0b0f12] rounded-full text-sm font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Blogs</span>
        </Link>
      </div>
    );
  }

  const isAuthor = user && blog.author && (blog.author._id === user._id || blog.author === user._id);

  const formattedDate = new Date(blog.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const renderFormattedContent = (content) => {
    if (!content) return null;

    const blocks = content.split('\n\n');
    return blocks.map((block, idx) => {
      const trimmed = block.trim();

      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
            {trimmed.replace('### ', '')}
          </h3>
        );
      }

      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-3xl font-bold text-gray-900 dark:text-white mt-10 mb-4">
            {trimmed.replace('## ', '')}
          </h2>
        );
      }

      if (trimmed.startsWith('> ')) {
        return (
          <blockquote
            key={idx}
            className="my-6 pl-6 py-3 border-l-4 border-[#182226] dark:border-[#e2ad76] italic text-gray-800 dark:text-gray-200 text-lg sm:text-xl bg-gray-50/70 dark:bg-[#121920]/70 rounded-r-2xl"
          >
            {trimmed.replace(/^>\s*/, '').replace(/^"|"$/g, '')}
          </blockquote>
        );
      }

      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const items = trimmed.split('\n').map((line) => line.replace(/^[-*]\s*/, ''));
        return (
          <ul key={idx} className="my-4 list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 leading-relaxed">
            {items.map((item, itemIdx) => (
              <li key={itemIdx}>{item}</li>
            ))}
          </ul>
        );
      }

      return (
        <p key={idx} className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6 font-normal">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8 font-poppins">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Blogs</span>
        </Link>

        {/* Action icons & author controls */}
        <div className="flex items-center gap-2">
          {isAuthor && (
            <div className="flex items-center gap-2 mr-2 pr-2 border-r border-gray-200 dark:border-[#243340]">
              <Link
                href={`/edit/${blog._id}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#182226] hover:bg-black text-white dark:bg-[#e2ad76] dark:hover:bg-[#f0c395] dark:text-[#0b0f12] rounded-full transition"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Post</span>
              </Link>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40 rounded-full transition cursor-pointer"
                aria-label="Delete Post"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#1a252e] text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white transition cursor-pointer"
            title="Share article with friends"
            aria-label="Share article"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleBookmarkToggle}
            disabled={savingBookmark}
            className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#1a252e] transition cursor-pointer ${
              isSaved ? 'text-amber-600 dark:text-amber-400 fill-current' : 'text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white'
            }`}
            title={isSaved ? 'Saved in your collection (click to remove)' : 'Save story for later'}
            aria-label="Bookmark story"
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500 text-amber-600 dark:text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Cover Banner */}
      <div className="rounded-3xl overflow-hidden shadow-xl aspect-[16/9] bg-gray-100 dark:bg-[#121920]">
        <img
          src={blog.coverImage || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'}
          alt={blog.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Blog Header: Category, Title, Metadata with Genuine Views */}
      <div className="space-y-4 pt-2">
        <span className="inline-block bg-[#f0ede6] dark:bg-[#1a252e] text-[#182226] dark:text-[#e2ad76] border border-transparent dark:border-[#2d3d4b] text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider">
          {blog.category}
        </span>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
          {blog.title}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-gray-100 dark:border-[#1e2a34]">
          <div className="flex items-center gap-3">
            <Avatar src={blog.author?.avatar} alt={blog.author?.name} size="lg" />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                {blog.author?.name || 'Jane Smith'}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{formattedDate}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {blog.readTime || '7 min read'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1" title="Views">
                  <Eye className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">{blog.views || 0} views</span>
                </span>
              </div>
            </div>
          </div>

          {/* Like Interaction Pill */}
          <button
            type="button"
            onClick={handleLikeToggle}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition active:scale-95 cursor-pointer ${
              isLiked
                ? 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-[#121920] dark:text-gray-300 dark:border dark:border-[#243340] dark:hover:bg-[#18232c]'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-rose-500' : ''}`} />
            <span>{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
          </button>
        </div>
      </div>

      {/* Article Body */}
      <article className="prose prose-lg max-w-none pt-4 text-gray-800 dark:text-gray-200 leading-relaxed font-normal">
        {renderFormattedContent(blog.content)}
      </article>

      {/* Author Card at Bottom */}
      <div className="p-6 bg-[#f7f5f1] dark:bg-[#121920] rounded-3xl border border-[#ebe7df] dark:border-[#1e2a34] flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <Avatar src={blog.author?.avatar} alt={blog.author?.name} size="xl" />
        <div className="space-y-1.5 text-center sm:text-left flex-1">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#e2ad76]">
            About The Author
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{blog.author?.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {blog.author?.bio || 'Passionate storyteller and explorer publishing articles on Blogify.'}
          </p>
        </div>
      </div>

      {/* Comments Section */}
      <section className="pt-8 space-y-6 border-t border-gray-200 dark:border-[#1e2a34]">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-gray-700 dark:text-[#e2ad76]" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Comments ({blog.comments?.length || 0})
          </h3>
        </div>

        {/* Comment input form */}
        <form onSubmit={handleCommentSubmit} className="space-y-3">
          <textarea
            rows="3"
            placeholder={
              isAuthenticated
                ? 'Share your thoughts or feedback on this article...'
                : 'Log in to join the conversation...'
            }
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={!isAuthenticated || submittingComment}
            className="w-full p-4 rounded-2xl bg-white dark:bg-[#121920] border border-gray-200 dark:border-[#243340] text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-gray-500 dark:focus:border-[#e2ad76] transition shadow-xs disabled:bg-gray-50 dark:disabled:bg-[#0d1216] disabled:cursor-not-allowed font-poppins"
          />
          <div className="flex items-center justify-between">
            {!isAuthenticated ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                You must{' '}
                <Link href={`/login?redirect=/blog/${id}`} className="text-[#182226] dark:text-[#e2ad76] font-semibold underline">
                  login
                </Link>{' '}
                to leave a comment.
              </p>
            ) : (
              <span className="text-xs text-gray-400 dark:text-gray-500">Be respectful and kind.</span>
            )}

            <button
              type="submit"
              disabled={!isAuthenticated || submittingComment || !commentText.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#182226] hover:bg-black text-white dark:bg-[#e2ad76] dark:hover:bg-[#f0c395] dark:text-[#0b0f12] rounded-full text-sm font-semibold transition disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submittingComment ? 'Posting...' : 'Post Comment'}</span>
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-4 pt-4">
          {blog.comments?.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 italic">No comments yet. Be the first to share your thoughts!</p>
          ) : (
            blog.comments?.map((comment, idx) => (
              <div
                key={comment._id || idx}
                className="p-4 bg-white dark:bg-[#121920] rounded-2xl border border-gray-100 dark:border-[#1e2a34] shadow-xs flex items-start gap-3.5"
              >
                <Avatar src={comment.userAvatar} alt={comment.userName} size="md" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{comment.userName}</span>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{comment.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Blog Post"
        message={`Are you sure you want to permanently delete "${blog.title}"? This action cannot be reversed.`}
        loading={deleting}
      />

      {/* Interactive Social Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        blog={blog}
      />
    </div>
  );
}

