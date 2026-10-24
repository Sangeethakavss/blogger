import express from 'express';
import {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  getUserBlogs,
  toggleLikeBlog,
  addComment,
  getCategories,
  recordBlogView,
  toggleSaveBlog,
  getSavedBlogs,
} from '../controllers/blogController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateBlog, validateBlogUpdate } from '../middleware/validateMiddleware.js';

const router = express.Router();

// Public meta routes
router.get('/meta/categories', getCategories);

// User-specific routes (must be before /:id)
router.get('/user/my-blogs', protect, getUserBlogs);
router.get('/user/saved', protect, getSavedBlogs);

// General blog routes
router.route('/')
  .get(getBlogs)
  .post(protect, validateBlog, createBlog);

router.route('/:id')
  .get(getBlogById)
  .put(protect, validateBlogUpdate, updateBlog)
  .delete(protect, deleteBlog);

// Blog view tracking (idempotent from GET, safe against double-mounting)
router.post('/:id/view', recordBlogView);

// Social & bookmark interactions
router.post('/:id/like', protect, toggleLikeBlog);
router.post('/:id/save', protect, toggleSaveBlog);
router.post('/:id/comments', protect, addComment);

export default router;
