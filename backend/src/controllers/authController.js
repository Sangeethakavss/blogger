import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Blog from '../models/Blog.js';

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'blogify_super_secret_jwt_key_2026_modern_secure',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, avatar } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please login.',
      });
    }

    // Create user (no default avatar; left blank unless user provides one)
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      avatar: avatar && typeof avatar === 'string' ? avatar.trim() : '',
    });

    if (user) {
      res.status(201).json({
        success: true,
        message: 'Account created successfully!',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          role: user.role,
        },
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data received' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Check for user and include password field
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please verify your credentials.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please verify your credentials.',
      });
    }

    res.json({
      success: true,
      message: 'Logged in successfully!',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile & stats
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get user stats
    const totalBlogs = await Blog.countDocuments({ author: req.user._id });
    const publishedBlogs = await Blog.countDocuments({
      author: req.user._id,
      status: 'Published',
    });
    const draftBlogs = await Blog.countDocuments({
      author: req.user._id,
      status: 'Draft',
    });

    // Total views across user's blogs
    const userBlogs = await Blog.find({ author: req.user._id }).select('views likes');
    const totalViews = userBlogs.reduce((sum, b) => sum + (b.views || 0), 0);
    const totalLikes = userBlogs.reduce((sum, b) => sum + (b.likes?.length || 0), 0);
    const savedBlogsCount = user.savedBlogs?.length || 0;

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || '',
        bio: user.bio,
        role: user.role,
        savedBlogs: user.savedBlogs || [],
        createdAt: user.createdAt,
      },
      stats: {
        totalBlogs,
        publishedBlogs,
        draftBlogs,
        totalViews,
        totalLikes,
        savedBlogs: savedBlogsCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.body.name) user.name = req.body.name.trim();
    if (req.body.bio !== undefined) user.bio = req.body.bio.trim();
    if (req.body.avatar !== undefined) {
      user.avatar = req.body.avatar ? req.body.avatar.trim() : '';
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar || '',
        bio: updatedUser.bio,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
