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
import {
  allCommunities,
  communitybyId,
  getPopularCommunityTags,
  searchCommunity,
} from '../../controllers/public/community.js';
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
router.get('/community/popular-tags', getPopularCommunityTags);
router.get('/community/all', allCommunities);
router.get('/community/:communityId', communitybyId);
router.get('/community', searchCommunity);

export default router;
