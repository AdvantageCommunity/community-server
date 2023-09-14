import express from 'express';
import {
  checkCommunityAdmin,
  isUserAuthenticated,
} from '../../../middleware/user.js';
import {
  addCommunityBlog,
  deleteCommunityBlog,
  updatCommunityeBlog,
} from '../../../controllers/community/blog/communityBlog.js';
import { upload } from '../../../connections/aws.js';
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

export default router;
