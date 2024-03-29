import express from 'express';
import {
  postBlog,
  updateBlog,
  deleteBlog,
  likeABlog,
  commentOnBlog,
  unLikeABlog,
  deleteComment,
  favoriteBlog,
  unFavoriteBlog,
} from '../../controllers/user/blog/blog.js';
import { isUserAuthenticated } from '../../middleware/user.js';
import { upload } from '../../config/aws.js';
const router = express.Router();

router.post('/me', upload.single('coverImage'), isUserAuthenticated, postBlog);
router.patch(
  '/me/:slug',
  upload.single('coverImage'),
  isUserAuthenticated,
  updateBlog
);
router.delete('/me/:slug', isUserAuthenticated, deleteBlog);
router.post('/:blogId/like', isUserAuthenticated, likeABlog);
router.delete('/:blogId/like', isUserAuthenticated, unLikeABlog);
router.post('/:blogId/comment', isUserAuthenticated, commentOnBlog);
router.delete('/:blogId/comment', isUserAuthenticated, deleteComment);
router.post('/:blogId/favorite', isUserAuthenticated, favoriteBlog);
router.delete('/:blogId/favorite', isUserAuthenticated, unFavoriteBlog);

export default router;
