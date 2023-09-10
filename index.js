import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import waitlistRoutes from './routes/waitlist.js';
import userRoutes from './routes/user/users.js';
import publicRoutes from './routes/public/public.js';
import userBlogRoutes from './routes/user/blog.js';
import userChatRoutes from './routes/user/chat/chat.js';
import userMessageRoutes from './routes/user/chat/message.js';
import { connectDB } from './connections/mongoDB.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;
connectDB();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/user/blog', userBlogRoutes);
app.use('/api/v1/users/message', userMessageRoutes);
app.use('/api/v1/users/chat', userChatRoutes);
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/waitlist', waitlistRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on PORT - ${PORT}`);
});
