import express from 'express';
import {
  postBlog,
  updateBlog,
  deleteBlog,
} from '../../controllers/user/blog/blog.js';
import { isUserAuthenticated } from '../../middleware/user.js';
import { upload } from '../../connections/aws.js';
const router = express.Router();

router.post('/me', upload.single('coverImage'), isUserAuthenticated, postBlog);
router.patch('/me/:slug', isUserAuthenticated, updateBlog);
router.delete('/me/:slug', isUserAuthenticated, deleteBlog);

export default router;
