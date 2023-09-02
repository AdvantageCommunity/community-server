import express from 'express';
import { loginUser, registerUser } from '../controllers/users.js';
import { isUserAuthenticated } from '../middleware/user.js';
const router = express.Router();

router.post('/', registerUser);
router.post('/login', loginUser);
router.get('/', isUserAuthenticated, (req, res) => {
  res.send('Authenticated');
});

export default router;
