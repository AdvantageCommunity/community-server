import express from 'express';
import {
  checkCommunityAdmin,
  isUserAuthenticated,
} from '../../middleware/user.js';
import {
  createCommunityRoom,
  deleteCommunityRoom,
  getCommunityRoomById,
  getCommunityRooms,
  updateCommunityRoom,
} from '../../controllers/community/room/communityRoom.js';
import { upload } from '../../config/aws.js';
const router = express.Router();
router.get('/:communityId/room/all', isUserAuthenticated, getCommunityRooms);
router.get(
  '/:communityId/room/:roomId',
  isUserAuthenticated,
  getCommunityRoomById
);
router.post(
  '/:communityId/room',
  upload.single('photo'),
  isUserAuthenticated,
  checkCommunityAdmin,
  createCommunityRoom
);
router.patch(
  '/:communityId/room/:roomId',
  upload.single('photo'),
  isUserAuthenticated,
  checkCommunityAdmin,
  updateCommunityRoom
);
router.delete(
  '/:communityId/room/:roomId',
  isUserAuthenticated,
  checkCommunityAdmin,
  deleteCommunityRoom
);

router;
export default router;
