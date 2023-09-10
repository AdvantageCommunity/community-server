import express from 'express';
import { isUserAuthenticated } from '../../../middleware/user.js';
import {
  accessUserChat,
  fetchUserChats,
} from '../../../controllers/user/chat/chat.js';
const router = express.Router();
router.post('/:userId', isUserAuthenticated, accessUserChat);
router.get('/', isUserAuthenticated, fetchUserChats);
export default router;
