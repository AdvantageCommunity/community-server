import express from 'express';
import {
  addCommunityAdmin,
  registerCommunity,
  updateCommunityDetails,
  removeCommunityAdmin,
  communityAdmins,
  joinCommunity,
  leaveCommunity,
  removeCommunityMember,
  viewCommunityMembers,
} from '../../controllers/community/profile/community.js';
import { upload } from '../../connections/aws.js';
import { isUserAuthenticated } from '../../middleware/user.js';
const router = express.Router();

// Join a community
router.post('/:communityId/join', isUserAuthenticated, joinCommunity);
// Leave a community
router.post('/:communityId/leave', isUserAuthenticated, leaveCommunity);
// view community members using community id
router.get('/:communityId', isUserAuthenticated, viewCommunityMembers);
// Register community
router.post(
  '/register',
  upload.fields([
    {
      name: 'logo',
      maxCount: 1,
    },
  ]),
  isUserAuthenticated,
  registerCommunity
);
// Update Community Profile
router.patch(
  '/:communityId',
  upload.fields([
    {
      name: 'logo',
      maxCount: 1,
    },
    {
      name: 'coverImage',
      maxCount: 1,
    },
  ]),
  isUserAuthenticated,
  updateCommunityDetails
);
router.get('/:communityId/admin', isUserAuthenticated, communityAdmins);
// Add community admins from users
router.post('/:communityId/admin', isUserAuthenticated, addCommunityAdmin);
// removed existing community admin using there id
router.delete(
  '/:communityId/admin/:adminId',
  isUserAuthenticated,
  removeCommunityAdmin
);
// Admin can remove member's from the community
router.delete(
  '/:communityId/remove/:memberId',
  isUserAuthenticated,
  removeCommunityMember
);
// Get all the admins of a community
// Events

export default router;
