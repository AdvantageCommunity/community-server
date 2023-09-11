import express from 'express';
import { isUserAuthenticated } from '../../../middleware/user.js';
import {
  accessRoomChat,
  accessUserChat,
  fetchAllRooms,
  fetchUserChats,
} from '../../../controllers/user/chat/chat.js';
const router = express.Router();
router.post('/:userId', isUserAuthenticated, accessUserChat);
router.get('/', isUserAuthenticated, fetchUserChats);
router.post(
  '/community-room/chat/:roomId',
  isUserAuthenticated,
  accessRoomChat
);
router.get('/community-room/chat/:roomId', isUserAuthenticated, fetchAllRooms);

export default router;
