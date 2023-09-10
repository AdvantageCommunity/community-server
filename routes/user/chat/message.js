import express from 'express';
import { isUserAuthenticated } from '../../../middleware/user.js';
import {
  getAllMessages,
  sendMessage,
} from '../../../controllers/user/chat/message.js';
const router = express.Router();
router.post('/:chatId', isUserAuthenticated, sendMessage);
router.get('/:chatId', isUserAuthenticated, getAllMessages);

export default router;
