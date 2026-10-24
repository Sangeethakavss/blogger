import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userAvatar: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      required: [true, 'Comment cannot be empty'],
      maxlength: [500, 'Comment cannot exceed 500 characters'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a blog title'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    content: {
      type: String,
      required: [true, 'Please provide blog content'],
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: [300, 'Excerpt cannot exceed 300 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
        'Technology',
        'Lifestyle',
        'Travel',
        'Health',
        'Food',
        'Business',
        'Inspiration',
      ],
      default: 'Technology',
    },
    coverImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['Published', 'Draft'],
      default: 'Published',
    },
    readTime: {
      type: String,
      default: '5 min read',
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [commentSchema],
  },
  {
    timestamps: true,
  }
);

// Auto-generate excerpt and read time before saving if not supplied
blogSchema.pre('save', function () {
  if (this.isModified('content')) {
    // Generate clean excerpt if empty
    if (!this.excerpt) {
      const stripped = this.content.replace(/<[^>]+>/g, '').replace(/\n+/g, ' ');
      this.excerpt = stripped.length > 160 ? stripped.substring(0, 157) + '...' : stripped;
    }

    // Calculate reading time (~200 words per minute)
    const wordCount = this.content.replace(/<[^>]+>/g, '').trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(wordCount / 200));
    this.readTime = `${minutes} min read`;
  }
});

// Text index for searching
blogSchema.index({ title: 'text', content: 'text', excerpt: 'text' });

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;
