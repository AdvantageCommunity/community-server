import express from 'express';
import { isUserAuthenticated } from '../../../middleware/user.js';
import {
  allRoomMessages,
  allUserMessages,
  sendMessage,
  sendMessageInRoom,
} from '../../../controllers/user/chat/message.js';
const router = express.Router();
// here chat id refers to the user to user chatting
router.post('/:chatId', isUserAuthenticated, sendMessage);
router.get('/:chatId', isUserAuthenticated, allUserMessages);
router.post(
  '/community-room/message/:roomId',
  isUserAuthenticated,
  sendMessageInRoom
);
router.get(
  '/community-room/message/:roomId',
  isUserAuthenticated,
  allRoomMessages
);

export default router;
