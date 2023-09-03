import express from 'express';
import {
  getAllUsers,
  getUserById,
  searchUsers,
} from '../../controllers/common/user.js';
const router = express.Router();
router.get('/users/all', getAllUsers);
router.get('/users/user/:userId', getUserById);
router.get('/users', searchUsers);

export default router;
