'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, Loader2, BookX } from 'lucide-react';
import api from '../../lib/api';
import BlogCard from '../../components/BlogCard';
import CategoryPills from '../../components/CategoryPills';
import Pagination from '../../components/Pagination';

function BlogsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get('category') || 'All';
  const currentSearch = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentSort = searchParams.get('sort') || 'newest';

  const [blogs, setBlogs] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(currentSearch);

  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  // Fetch category counts
  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        const res = await api.get('/blogs/meta/categories');
        if (res.data.success) {
          const map = {};
          res.data.categories.forEach((item) => {
            map[item.name] = item.count;
          });
          setCategoryCounts(map);
        }
      } catch (err) {
        console.error('Failed to fetch category counts:', err);
      }
    };

    fetchCategoryCounts();
  }, []);

  // Fetch blogs based on filters
  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.set('page', currentPage.toString());
        queryParams.set('limit', '8');
        queryParams.set('sort', currentSort);

        if (currentCategory && currentCategory !== 'All') {
          queryParams.set('category', currentCategory);
        }

        if (currentSearch.trim()) {
          queryParams.set('search', currentSearch.trim());
        }

        const res = await api.get(`/blogs?${queryParams.toString()}`);
        if (res.data.success) {
          setBlogs(res.data.blogs || []);
          setTotalPages(res.data.totalPages || 1);
          setTotalBlogs(res.data.totalBlogs || 0);
        }
      } catch (err) {
        console.error('Failed to fetch blogs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [currentCategory, currentSearch, currentPage, currentSort]);

  const handleCategorySelect = (category) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (category === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', category);
    }
    newParams.set('page', '1');
    router.push(`/blogs?${newParams.toString()}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams.toString());
    if (searchInput.trim()) {
      newParams.set('search', searchInput.trim());
    } else {
      newParams.delete('search');
    }
    newParams.set('page', '1');
    router.push(`/blogs?${newParams.toString()}`);
  };

  const handleSortChange = (e) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('sort', e.target.value);
    newParams.set('page', '1');
    router.push(`/blogs?${newParams.toString()}`);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('page', newPage.toString());
    router.push(`/blogs?${newParams.toString()}`);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const clearFilters = () => {
    setSearchInput('');
    router.push('/blogs');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 font-poppins">
      {/* Header section matching screenshot */}
      <div className="space-y-3">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Latest Blogs
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg max-w-2xl font-normal">
          Explore insightful stories, useful tips and fresh perspectives from our community of writers.
        </p>
      </div>

      {/* Filter and Search Bar Row */}
      <div className="space-y-6">
        <CategoryPills
          selectedCategory={currentCategory}
          onSelectCategory={handleCategorySelect}
          counts={categoryCounts}
        />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
          {/* Search form */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Filter by keywords in title, author, or content..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-white dark:bg-[#121920] text-sm text-gray-800 dark:text-gray-200 rounded-full pl-10 pr-24 py-2.5 border border-[#e2ddd5] dark:border-[#243340] focus:outline-none focus:border-gray-500 dark:focus:border-[#e2ad76] shadow-xs"
            />
            {searchInput && (
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-[#182226] hover:bg-black text-white dark:bg-[#e2ad76] dark:hover:bg-[#f0c395] dark:text-[#0b0f12] rounded-full text-xs font-semibold cursor-pointer transition"
              >
                Search
              </button>
            )}
          </form>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <SlidersHorizontal className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <label htmlFor="sort-select" className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Sort by:
            </label>
            <select
              id="sort-select"
              value={currentSort}
              onChange={handleSortChange}
              className="text-sm bg-white dark:bg-[#121920] border border-[#e2ddd5] dark:border-[#243340] rounded-xl px-3 py-1.5 focus:outline-none text-gray-700 dark:text-gray-200 font-medium cursor-pointer"
            >
              <option value="newest" className="dark:bg-[#121920]">Newest First</option>
              <option value="oldest" className="dark:bg-[#121920]">Oldest First</option>
              <option value="popular" className="dark:bg-[#121920]">Most Popular</option>
              <option value="views" className="dark:bg-[#121920]">Most Views</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Indicators */}
      {(currentCategory !== 'All' || currentSearch) && (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-[#f4efe9]/60 dark:bg-[#121920] border border-transparent dark:border-[#243340] px-4 py-2 rounded-xl">
          <span>Filtering:</span>
          {currentCategory !== 'All' && (
            <span className="font-semibold text-gray-900 dark:text-white bg-white dark:bg-[#1a252e] px-2.5 py-0.5 rounded-md border border-gray-200 dark:border-[#2d3d4b]">
              {currentCategory}
            </span>
          )}
          {currentSearch && (
            <span className="font-semibold text-gray-900 dark:text-white bg-white dark:bg-[#1a252e] px-2.5 py-0.5 rounded-md border border-gray-200 dark:border-[#2d3d4b]">
              "{currentSearch}"
            </span>
          )}
          <button
            type="button"
            onClick={clearFilters}
            className="ml-auto text-xs font-semibold text-gray-700 dark:text-[#e2ad76] underline hover:text-black dark:hover:text-[#f0c395] cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Blog Cards Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-[#182226] dark:text-[#e2ad76] animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading stories...</p>
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-[#121920] rounded-3xl border border-gray-200 dark:border-[#243340] space-y-4">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-[#1a252e] text-gray-400 dark:text-[#e2ad76] flex items-center justify-center mx-auto">
            <BookX className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">No blog posts found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            No articles match your current search or category filter. Try clearing filters or searching for something else.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="px-5 py-2.5 bg-[#182226] hover:bg-black text-white dark:bg-[#e2ad76] dark:hover:bg-[#f0c395] dark:text-[#0b0f12] rounded-full text-sm font-semibold transition cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-7">
          {blogs.map((blog) => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
        </div>
      )}

      {/* Results Summary & Pagination */}
      {!loading && blogs.length > 0 && (
        <div className="space-y-4 pt-4">
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            Showing {(currentPage - 1) * 8 + 1}–
            {Math.min(currentPage * 8, totalBlogs)} of {totalBlogs} stories
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}

export default function BlogsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 flex justify-center items-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#182226]" />
        </div>
      }
    >
      <BlogsContent />
    </Suspense>
  );
}

