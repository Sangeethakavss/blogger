import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  validateRegister,
  validateLogin,
} from '../middleware/validateMiddleware.js';

const router = express.Router();

router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;

