import express from 'express';
import { isUserAuthenticated } from '../../../middleware/user.js';
import {
  accessRoomChat,
  accessUserChat,
  fetchAllRooms,
  fetchUserChats,
} from '../../../controllers/user/chat/chat.js';
const router = express.Router();
router.get('/', isUserAuthenticated, fetchUserChats);
router.get('/community-room/all', isUserAuthenticated, fetchAllRooms);
router.post('/:userId', isUserAuthenticated, accessUserChat);
router.post('/:communityId/room/:roomId', isUserAuthenticated, accessRoomChat);

export default router;
