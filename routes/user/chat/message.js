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
router.post('/:roomId/message', isUserAuthenticated, sendMessageInRoom);
router.get('/:roomId/message', isUserAuthenticated, allRoomMessages);

export default router;
