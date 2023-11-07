import express from 'express';
import {
  getAllUsers,
  getUserById,
  searchUsers,
} from '../../controllers/public/user.js';
import {
  allCommunitiesBlogs,
  getAllBlogs,
  getBlogBySlug,
  getPopularBlogCategories,
  searchBlogs,
  getCommunitiyBlogs,
  getCommunitiyEvents,
} from '../../controllers/public/blog.js';
import {
  allCommunities,
  allEvents,
  communityBySlug,
  eventBySlug,
  featuredEvents,
  getPopularCommunityTags,
  pastEvents,
  searchCommunity,
  searchEvent,
  upcommingEvents,
} from '../../controllers/public/community.js';
const router = express.Router();
// User Related Routes
router.get('/users/all', getAllUsers);
router.get('/users/user/:username', getUserById);
router.get('/users', searchUsers);

// User Blogs Related Routes
router.get('/blogs/popular-tags', getPopularBlogCategories);
router.get('/blogs/all', getAllBlogs);
router.get('/blogs/:slug', getBlogBySlug);
router.get('/blogs', searchBlogs);

// Community Related
router.get('/community/popular-tags', getPopularCommunityTags);
router.get('/community/all', allCommunities);
router.get('/community/:slug', communityBySlug);
router.get('/communities', searchCommunity);
// Community Blog
router.get('/community/blog/all', allCommunitiesBlogs);
router.get('/community/:slug/blogs', getCommunitiyBlogs);

// Community Events
router.get('/community/event/all', allEvents);
router.get('/community/event/:slug', eventBySlug);
router.get('/community/:slug/events', getCommunitiyEvents);
router.get('/community/event/all/upcoming', upcommingEvents);
router.get('/community/event/all/past', pastEvents);
router.get('/community/event/all/featured', featuredEvents);
router.get('/events', searchEvent);

export default router;
