import express from 'express';
import {
  addCommunityAdmin,
  registerCommunity,
  updateCommunityDetails,
  removeCommunityAdmin,
  communityAdmins,
} from '../../controllers/community/profile/community.js';
import { upload } from '../../connections/aws.js';
import { isUserAuthenticated } from '../../middleware/user.js';
const router = express.Router();
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
router.post('/:communityId/admin', isUserAuthenticated, addCommunityAdmin);
router.delete(
  '/:communityId/admin/:adminId',
  isUserAuthenticated,
  removeCommunityAdmin
);
router.get('/:communityId/admin', isUserAuthenticated, communityAdmins);
export default router;
