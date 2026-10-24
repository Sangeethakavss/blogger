'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Laptop,
  Compass,
  Utensils,
  Smile,
  Sparkles,
  HeartPulse,
  Briefcase,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import api from '../../lib/api';

const CATEGORY_META = {
  Technology: {
    icon: Laptop,
    image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=600&q=80',
    description: 'Insights into modern engineering, developer tools, remote work, and tech innovation.',
  },
  Travel: {
    icon: Compass,
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    description: 'Adventures through alpine valleys, scenic hills, cultural expeditions, and nature travelogues.',
  },
  Food: {
    icon: Utensils,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    description: 'Wholesome culinary journeys, nutrient-dense nutrition, and mindful eating habits.',
  },
  Lifestyle: {
    icon: Smile,
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
    description: 'Minimalism, home design, intentional habits, and balanced modern living.',
  },
  Inspiration: {
    icon: Sparkles,
    image: 'https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=600&q=80',
    description: 'Mindset shifts, stoic reflections, positive psychology, and personal transformation.',
  },
  Health: {
    icon: HeartPulse,
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
    description: 'Wellness, restorative sleep, movement, and mental health fundamentals.',
  },
  Business: {
    icon: Briefcase,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
    description: 'Entrepreneurship, leadership, productivity systems, and sustainable growth.',
  },
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/blogs/meta/categories');
        if (res.data.success) {
          setCategories(res.data.categories.filter((c) => c.name !== 'All'));
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 font-poppins">
      <div className="space-y-2">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Explore by Category
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg max-w-2xl font-normal">
          Dive deep into topics that ignite your curiosity, from cutting-edge tech to tranquil travelogues.
        </p>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-[#182226] dark:text-[#e2ad76] animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading categories...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat) => {
            const meta = CATEGORY_META[cat.name] || CATEGORY_META.Technology;
            const Icon = meta.icon;

            return (
              <Link
                key={cat.name}
                href={`/blogs?category=${encodeURIComponent(cat.name)}`}
                className="group relative rounded-3xl overflow-hidden bg-white dark:bg-[#121920] border border-[#eae6df] dark:border-[#1e2a34] shadow-xs hover:shadow-xl hover:border-gray-300 dark:hover:border-[#2d3d4b] transition-all flex flex-col"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-[#1a252e]">
                  <img
                    src={meta.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 flex items-center gap-2 text-white">
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xl font-bold">{cat.name}</span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-normal">
                    {meta.description}
                  </p>

                  <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-[#1e2a34]">
                    <span>{cat.count} {cat.count === 1 ? 'Article' : 'Articles'}</span>
                    <span className="flex items-center gap-1 text-[#182226] dark:text-[#e2ad76] group-hover:translate-x-1 transition-transform">
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

