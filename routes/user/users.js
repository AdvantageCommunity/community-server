import express from 'express';
import {
  googleAuth,
  loginUser,
  registerUser,
  updateUser,
  getActiveUserInfo,
  logoutUser,
  followUser,
  unFollowUser,
  getUserFollowings,
  getUserFollowers,
  verifyEmailLink,
  userFavorites,
} from '../../controllers/user/users.js';
import { isUserAuthenticated } from '../../middleware/user.js';
import { upload } from '../../connections/aws.js';
import { favoriteEvent } from '../../controllers/user/blog/blog.js';
const router = express.Router();

router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);
router.post('/auth/google-auth', googleAuth);
router.get('/auth/:username/verify/:token', verifyEmailLink);
router.patch(
  '/profile/me',
  upload.single('profilePhoto'),
  isUserAuthenticated,
  updateUser
);
router.get('/profile/me', isUserAuthenticated, getActiveUserInfo);
router.get('/:userId/followings', isUserAuthenticated, getUserFollowings);
router.get('/:userId/followers', isUserAuthenticated, getUserFollowers);
router.post('/auth/me/logout', isUserAuthenticated, logoutUser);
router.patch('/:userId/follow', isUserAuthenticated, followUser);
router.post('/:userId/follow', isUserAuthenticated, followUser);
router.delete('/:userId/unfollow', isUserAuthenticated, unFollowUser);
router.post('/event/:eventId/favorite', isUserAuthenticated, favoriteEvent);
router.get('/me/favorites', isUserAuthenticated,userFavorites);
export default router;
