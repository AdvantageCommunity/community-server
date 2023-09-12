import express from 'express';
import {
  getAllUsers,
  getUserById,
  searchUsers,
} from '../../controllers/public/user.js';
import {
  getAllBlogs,
  getBlogBySlug,
  getPopularBlogCategories,
  searchBlogs,
} from '../../controllers/public/blog.js';
const router = express.Router();
// User Related Routes
router.get('/users/all', getAllUsers);
router.get('/users/user/:userId', getUserById);
router.get('/users', searchUsers);

// Blogs Related Routes
router.get('/blogs/popular-tags', getPopularBlogCategories);
router.get('/blogs/all', getAllBlogs);
router.get('/blogs/:slug', getBlogBySlug);
router.get('/blogs', searchBlogs);

// Community Related
export default router;
