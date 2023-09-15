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
} from '../../controllers/public/blog.js';
import {
  allCommunities,
  allEvents,
  communitybyId,
  eventById,
  getPopularCommunityTags,
  pastEvents,
  searchCommunity,
  searchEvent,
  upcommingEvents,
} from '../../controllers/public/community.js';
const router = express.Router();
// User Related Routes
router.get('/users/all', getAllUsers);
router.get('/users/user/:userId', getUserById);
router.get('/users', searchUsers);

// User Blogs Related Routes
router.get('/blogs/popular-tags', getPopularBlogCategories);
router.get('/blogs/all', getAllBlogs);
router.get('/blogs/:slug', getBlogBySlug);
router.get('/blogs', searchBlogs);

// Community Related
router.get('/community/popular-tags', getPopularCommunityTags);
router.get('/community/all', allCommunities);
router.get('/community/:communityId', communitybyId);
router.get('/community', searchCommunity);
// Community Blog
router.get('/community/blog/all', allCommunitiesBlogs);
// Community Events
router.get('/community/event/search', searchEvent);
router.get('/community/event/all', allEvents);
router.get('/community/event/:eventId', eventById);
router.get('/community/event/all/upcoming', upcommingEvents);
router.get('/community/event/all/past', pastEvents);

export default router;
