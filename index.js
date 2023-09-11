import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as Server from 'socket.io';
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

const server = app.listen(PORT, () => {
  console.log(`Server listening on PORT - ${PORT}`);
});
const io = new Server.Server(server, {
  pingTimeout: 60000, //after 60 secs it will close the connection
  cors: {
    origin: process.env.CLIENT_URL,
  },
});
io.on('connection', (socket) => {
  console.log('connected to socket');
  socket.on('setup', (userData) => {
    socket.join(userData._id); // creating a room using given user's id.
    socket.emit('connected');
  });
  socket.on('join chat', (room) => {
    socket.join(room);
    console.log('user joined room :' + room); // here room is the chat id
  });
  socket.on('typing', (room) => socket.in(room._id).emit('typing'));
  socket.on('stop typing', (room) => socket.in(room._id).emit('stop typing'));
  socket.on('new message', (newMessageRecieved) => {
    const chat = newMessageRecieved.chat;
    if (!chat.users) return console.log('chat.users is not defined');
    chat.participants.forEach((participant) => {
      if (participant._id === chat.sender_id) return;
      socket.in(participant._id).emit('message recieved', newMessageRecieved);
    });
  });
  socket.off('setup', (userData) => {
    console.log('User Disconnected');
    socket.leave(userData._id);
  });
});
