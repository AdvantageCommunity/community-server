import express from 'express';
import {
  checkCommunityAdmin,
  isUserAuthenticated,
} from '../../middleware/user.js';
import {
  addCommunityBlog,
  deleteCommunityBlog,
  updatCommunityeBlog,
} from '../../controllers/community/blog/communityBlog.js';
import { upload } from '../../config/aws.js';
import {
  deleteCommunityEvent,
  postCommunityEvent,
  updateCommunityEvent,
} from '../../controllers/community/event/communityEvent.js';
const router = express.Router();
router.post(
  '/blog/:communityId',
  upload.single('coverImage'),
  isUserAuthenticated,
  checkCommunityAdmin,
  addCommunityBlog
);
router.patch(
  '/:communityId/blog/:slug',
  upload.single('coverImage'),
  isUserAuthenticated,
  checkCommunityAdmin,
  updatCommunityeBlog
);
router.delete(
  '/:communityId/blog/:slug',
  isUserAuthenticated,
  checkCommunityAdmin,
  deleteCommunityBlog
);
router.post(
  '/:communityId/event',
  upload.single('eventBanner'),
  isUserAuthenticated,
  checkCommunityAdmin,
  postCommunityEvent
);
router.patch(
  '/:communityId/event/:slug',
  upload.single('eventBanner'),
  isUserAuthenticated,
  checkCommunityAdmin,
  updateCommunityEvent
);
router.delete(
  '/:communityId/event/:slug',
  isUserAuthenticated,
  checkCommunityAdmin,
  deleteCommunityEvent
);

export default router;
