import Blog from '../models/Blog.js';
import User from '../models/User.js';

// @desc    Get all blogs with search, category filtering, pagination, and sorting
// @route   GET /api/blogs
// @access  Public
export const getBlogs = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit, 10) || 6));
    const skip = (page - 1) * limit;

    const { search, category, sort, author, status } = req.query;

    const query = {};

    // Filter by status (default to Published for public list)
    if (status) {
      query.status = status;
    } else {
      query.status = 'Published';
    }

    // Filter by category
    if (category && category !== 'All' && category.trim() !== '') {
      query.category = category.trim();
    }

    // Filter by author ID
    if (author) {
      query.author = author;
    }

    // Search query on title, excerpt, and content
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { excerpt: searchRegex },
        { content: searchRegex },
      ];
    }

    // Determine sort order
    let sortOptions = { createdAt: -1 }; // newest by default
    if (sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (sort === 'popular' || sort === 'views') {
      sortOptions = { views: -1, createdAt: -1 };
    } else if (sort === 'likes') {
      sortOptions = { 'likes.length': -1, createdAt: -1 };
    }

    const totalBlogs = await Blog.countDocuments(query);
    const totalPages = Math.ceil(totalBlogs / limit) || 1;

    const blogs = await Blog.find(query)
      .populate('author', 'name email avatar bio')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      blogs,
      page,
      totalPages,
      totalBlogs,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single blog by ID
// @route   GET /api/blogs/:id
// @access  Public
export const getBlogById = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'name email avatar bio')
      .populate('comments.user', 'name avatar');

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    res.json({
      success: true,
      blog,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record a view on a blog post
// @route   POST /api/blogs/:id/view
// @access  Public
export const recordBlogView = async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true, select: 'views' }
    );

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    res.json({
      success: true,
      views: blog.views,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new blog post
// @route   POST /api/blogs
// @access  Private
export const createBlog = async (req, res, next) => {
  try {
    const { title, content, category, coverImage, status, excerpt } = req.body;

    const defaultCovers = {
      Technology: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80',
      Travel: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      Food: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80',
      Lifestyle: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      Inspiration: 'https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=1200&q=80',
      Health: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
      Business: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    };

    const finalCover =
      coverImage && coverImage.trim() !== ''
        ? coverImage
        : defaultCovers[category] || defaultCovers.Technology;

    const blog = new Blog({
      title: title.trim(),
      content: content.trim(),
      category: category || 'Technology',
      coverImage: finalCover,
      status: status || 'Published',
      excerpt: excerpt?.trim() || undefined,
      author: req.user._id,
    });

    const createdBlog = await blog.save();
    const populatedBlog = await createdBlog.populate('author', 'name email avatar bio');

    res.status(201).json({
      success: true,
      message: 'Blog created successfully!',
      blog: populatedBlog,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing blog post
// @route   PUT /api/blogs/:id
// @access  Private (Owner only)
export const updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    // Check ownership
    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only edit your own blog posts.',
      });
    }

    const { title, content, category, coverImage, status, excerpt } = req.body;

    if (title) blog.title = title.trim();
    if (content) blog.content = content.trim();
    if (category) blog.category = category;
    if (coverImage) blog.coverImage = coverImage.trim();
    if (status) blog.status = status;
    if (excerpt !== undefined) blog.excerpt = excerpt.trim();

    const updatedBlog = await blog.save();
    const populatedBlog = await updatedBlog.populate('author', 'name email avatar bio');

    res.json({
      success: true,
      message: 'Blog post updated successfully!',
      blog: populatedBlog,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a blog post
// @route   DELETE /api/blogs/:id
// @access  Private (Owner only)
export const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    // Check ownership
    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only delete your own blog posts.',
      });
    }

    await Blog.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: 'Blog post deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged in user's blogs (dashboard)
// @route   GET /api/blogs/user/my-blogs
// @access  Private
export const getUserBlogs = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const query = { author: req.user._id };

    if (req.query.status && req.query.status !== 'All') {
      query.status = req.query.status;
    }

    if (req.query.search && req.query.search.trim() !== '') {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { excerpt: searchRegex }];
    }

    const totalBlogs = await Blog.countDocuments(query);
    const totalPages = Math.ceil(totalBlogs / limit) || 1;

    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      blogs,
      page,
      totalPages,
      totalBlogs,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle like on a blog post
// @route   POST /api/blogs/:id/like
// @access  Private
export const toggleLikeBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    const userIdStr = req.user._id.toString();
    const alreadyLikedIndex = blog.likes.findIndex(
      (likeId) => likeId.toString() === userIdStr
    );

    let liked = false;
    if (alreadyLikedIndex !== -1) {
      blog.likes.splice(alreadyLikedIndex, 1);
      liked = false;
    } else {
      blog.likes.push(req.user._id);
      liked = true;
    }

    await blog.save();

    res.json({
      success: true,
      liked,
      likesCount: blog.likes.length,
      message: liked ? 'Post liked!' : 'Post unliked!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to a blog
// @route   POST /api/blogs/:id/comments
// @access  Private
export const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ success: false, message: 'Comment content cannot be empty' });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    const newComment = {
      user: req.user._id,
      userName: req.user.name,
      userAvatar: req.user.avatar,
      content: content.trim(),
      createdAt: new Date(),
    };

    blog.comments.unshift(newComment);
    await blog.save();

    res.status(201).json({
      success: true,
      message: 'Comment posted successfully',
      comments: blog.comments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get categories with counts
// @route   GET /api/blogs/meta/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    const categories = [
      'Technology',
      'Lifestyle',
      'Travel',
      'Health',
      'Food',
      'Business',
      'Inspiration',
    ];

    const counts = await Blog.aggregate([
      { $match: { status: 'Published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    counts.forEach((item) => {
      countMap[item._id] = item.count;
    });

    const categoryStats = categories.map((cat) => ({
      name: cat,
      count: countMap[cat] || 0,
    }));

    const totalPublished = await Blog.countDocuments({ status: 'Published' });

    res.json({
      success: true,
      categories: [{ name: 'All', count: totalPublished }, ...categoryStats],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle save/bookmark a blog post
// @route   POST /api/blogs/:id/save
// @access  Private
export const toggleSaveBlog = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    if (!user.savedBlogs) {
      user.savedBlogs = [];
    }

    const blogIdStr = req.params.id.toString();
    const existingIndex = user.savedBlogs.findIndex((id) => id.toString() === blogIdStr);

    let isSaved = false;
    if (existingIndex > -1) {
      user.savedBlogs.splice(existingIndex, 1);
      isSaved = false;
    } else {
      user.savedBlogs.push(blog._id);
      isSaved = true;
    }

    await user.save();

    res.json({
      success: true,
      saved: isSaved,
      savedCount: user.savedBlogs.length,
      message: isSaved ? 'Story saved to your collection!' : 'Story removed from saved collection.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's saved blogs
// @route   GET /api/blogs/user/saved
// @access  Private
export const getSavedBlogs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedBlogs',
      populate: {
        path: 'author',
        select: 'name email avatar bio',
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Filter out any blogs that may have been deleted from the database
    const validSavedBlogs = (user.savedBlogs || []).filter((b) => b != null);

    res.json({
      success: true,
      count: validSavedBlogs.length,
      blogs: validSavedBlogs,
    });
  } catch (error) {
    next(error);
  }
};

