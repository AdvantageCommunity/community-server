import express from 'express';
import {
  googleAuth,
  loginUser,
  registerUser,
  updateUser,
  getActiveUserInfo,
  logoutUser,
} from '../../controllers/user/users.js';
import { isUserAuthenticated } from '../../middleware/user.js';
const router = express.Router();

router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);
router.post('/auth/google-auth', googleAuth);
router.patch('/profile/me', isUserAuthenticated, updateUser);
router.get('/profile/me', isUserAuthenticated, getActiveUserInfo);
router.post('/auth/me/logout', isUserAuthenticated, logoutUser);

export default router;
