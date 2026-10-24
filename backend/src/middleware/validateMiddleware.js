export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ success: false, message: 'Full name is required' });
  }

  if (!email || email.trim() === '') {
    return res.status(400).json({ success: false, message: 'Email address is required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long',
    });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || email.trim() === '') {
    return res.status(400).json({ success: false, message: 'Email address is required' });
  }

  if (!password || password.trim() === '') {
    return res.status(400).json({ success: false, message: 'Password is required' });
  }

  next();
};

export const validateBlog = (req, res, next) => {
  const { title, content, category } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ success: false, message: 'Blog title is required' });
  }

  if (title.trim().length > 150) {
    return res.status(400).json({
      success: false,
      message: 'Blog title cannot exceed 150 characters',
    });
  }

  if (!content || content.trim() === '') {
    return res.status(400).json({ success: false, message: 'Blog content is required' });
  }

  const validCategories = [
    'Technology',
    'Lifestyle',
    'Travel',
    'Health',
    'Food',
    'Business',
    'Inspiration',
  ];

  if (category && !validCategories.includes(category)) {
    return res.status(400).json({
      success: false,
      message: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
    });
  }

  next();
};

export const validateBlogUpdate = (req, res, next) => {
  const { title, content, category } = req.body;

  if (title !== undefined && title.trim() === '') {
    return res.status(400).json({ success: false, message: 'Blog title cannot be empty' });
  }

  if (title && title.trim().length > 150) {
    return res.status(400).json({
      success: false,
      message: 'Blog title cannot exceed 150 characters',
    });
  }

  if (content !== undefined && content.trim() === '') {
    return res.status(400).json({ success: false, message: 'Blog content cannot be empty' });
  }

  const validCategories = [
    'Technology',
    'Lifestyle',
    'Travel',
    'Health',
    'Food',
    'Business',
    'Inspiration',
  ];

  if (category && !validCategories.includes(category)) {
    return res.status(400).json({
      success: false,
      message: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
    });
  }

  next();
};

