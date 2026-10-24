'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, Heart } from 'lucide-react';
import Avatar from './Avatar';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const BlogCard = ({ blog }) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  if (!blog) return null;

  const authorName = blog.author?.name || 'Anonymous';
  const authorAvatar = blog.author?.avatar || '';

  const [likesCount, setLikesCount] = useState(blog.likes?.length || 0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (user && blog.likes) {
      setIsLiked(blog.likes.some((uId) => (uId._id || uId) === user._id));
    } else {
      setIsLiked(false);
    }
    setLikesCount(blog.likes?.length || 0);
  }, [user, blog.likes]);

  const handleLikeClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push(`/login?redirect=/blog/${blog._id}`);
      return;
    }

    try {
      const res = await api.post(`/blogs/${blog._id}/like`);
      if (res.data?.success) {
        setIsLiked(res.data.liked);
        setLikesCount(res.data.likesCount);
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const formatCount = (count) => {
    if (!count || count === 0) return '0';
    if (count >= 1000000) return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return count.toString();
  };

  const viewsCount = blog.views || 0;

  return (
    <article className="group flex flex-col font-poppins transition-all">
      {/* Showcase Thumbnail with Smooth Rounded Corners */}
      <Link
        href={`/blog/${blog._id}`}
        className="relative block aspect-[4/3] rounded-2xl overflow-hidden bg-[#f4f2ee] dark:bg-[#141b22] border border-gray-100 dark:border-[#212e38] shadow-xs hover:shadow-md dark:hover:shadow-black/40 transition-all duration-300"
      >
        <img
          src={blog.coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80'}
          alt={blog.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Hover overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <p className="text-white text-sm font-semibold line-clamp-2 leading-snug drop-shadow-sm">
            {blog.title}
          </p>
        </div>
      </Link>

      {/* Card Info: Title + Author + Likes & Views */}
      <div className="mt-2.5 px-0.5 space-y-1">
        {/* Title */}
        <Link href={`/blog/${blog._id}`} className="block">
          <h3
            className="text-sm sm:text-[15px] font-bold text-gray-900 dark:text-white line-clamp-1 hover:text-black dark:hover:text-[#e2ad76] transition"
            title={blog.title}
          >
            {blog.title}
          </h3>
        </Link>

        {/* Bottom Row: Author (left) | Likes & Views (right) */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-0.5">
          {/* Author */}
          <div className="flex items-center gap-2 min-w-0">
            <Avatar src={authorAvatar} alt={authorName} size="xs" />
            <span
              className="font-semibold text-gray-800 dark:text-gray-200 text-xs truncate max-w-[120px] sm:max-w-[140px]"
              title={authorName}
            >
              {authorName}
            </span>
          </div>

          {/* Metrics: Likes & Views */}
          <div className="flex items-center gap-3 shrink-0 text-gray-500 dark:text-gray-400 text-xs font-medium">
            <button
              type="button"
              onClick={handleLikeClick}
              className={`flex items-center gap-1 transition-colors cursor-pointer ${
                isLiked ? 'text-rose-500' : 'hover:text-rose-500 text-gray-500 dark:text-gray-400'
              }`}
              title={`${likesCount} likes`}
              aria-label="Like story"
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current text-rose-500' : ''}`} />
              <span>{formatCount(likesCount)}</span>
            </button>

            <span
              className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white transition-colors"
              title={`${viewsCount} views`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{formatCount(viewsCount)}</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
