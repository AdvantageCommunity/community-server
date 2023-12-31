import Message from '../../../models/chat/message.js';
import userChat from '../../../models/chat/userChat.js';
import User from '../../../models/users.js';
import communityRoom from '../../../models/chat/communityRoom.js';
import { io } from '../../../index.js';

export const sendMessage = async (req, res) => {
  const { chatId } = req.params;
  const { message } = req.body;
  if (!message || !chatId)
    return req
      .status(400)
      .json({ message: 'Content and chat id should be present' });

  try {
    let newMessage = new Message({
      senderType: 'User',
      message,
      sender: req.rootUser._id, // need to be changed for commnity
      chat: chatId,
      chatType: 'userChat',
    });
    await newMessage.save();
    newMessage = await Message.findOne({ _id: newMessage._id })
      .populate('sender', '-password -interests')
      .populate('chat');
    newMessage = await User.populate(newMessage, {
      path: 'chat.participants',
      select: 'username profilePic email',
    });
    const chat = await userChat
      .findOne({ _id: chatId })
      .populate('participants');

    if (chat) {
      chat.latestMessage = newMessage._id;
      await chat.save();
    }
    const recipient = chat.participants.find(
      (participant) =>
        participant._id.toString() !== req.rootUser._id.toString()
    );
    if (!recipient)
      return res.status(404).json({ message: 'Recipent not found.' });
    const notification = {
      message: `${req.rootUser.username} sent you a message`,
      actionType: 'message',
      timestamp: new Date(),
      isRead: false,
    };
    recipient.notifications.push(notification);

    await recipient.save();
    io.to(recipient._id).emit('notification', notification);
    return res.status(201).json({ message: newMessage });
  } catch (error) {
    console.log('Error in Send Message API : ', error);
    res.status(500).json({ message: error.message });
  }
};
export const allUserMessages = async (req, res) => {
  const { chatId } = req.params;
  if (!chatId) return res.status(400).json({ message: 'Provide chat id.' });
  try {
    const chatExists = await userChat.findOne({
      _id: chatId,
      participants: {
        $elemMatch: {
          $eq: req.rootUser._id,
        },
      },
    });
    if (!chatExists)
      return res.status(403).json({ message: 'You cannot access this chat.' });
    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'username profilePhoto _id')
      .populate('chat');
    res.status(200).json({ messages });
  } catch (error) {
    console.log('Error in Get All Messages API : ', error);
    res.status(500).json({ message: error.message });
  }
};
export const sendMessageInRoom = async (req, res) => {
  const { roomId } = req.params;
  const { message } = req.body;
  if (!message || !roomId)
    return req
      .status(400)
      .json({ message: 'Content and chat id should be present' });
  try {
    const room = await communityRoom
      .findById(roomId)
      .populate('participants.userId');
    if (!room) return res.status(404).json({ message: 'Room not found.' });
    let newMessage = new Message({
      senderType: 'User',
      message,
      sender: req.rootUser._id, // need to be changed for commnity
      chat: roomId,
      chatType: 'communityRoom',
    });
    await newMessage.save();
    newMessage = await Message.findOne({ _id: newMessage._id })
      .populate('sender', '-password -interests')
      .populate('chat');
    newMessage = await User.populate(newMessage, {
      path: 'chat.participants',
      select: 'username profilePic email',
    });
    room.latestMessage = newMessage._id;
    await room.save();

    // Socket Io Notification related code
    let notification = {
      message: `${req.rootUser.username} sent a message in ${room.name}`,
      actionType: 'message',
      isRead: false,
    };
    room.participants.forEach(async (user) => {
      if (req.rootUser._id.toString() !== user.userId._id.toString()) {
        user.userId.notifications?.push(notification);
        await user.userId.save();
        io.to(user.userId._id).emit('notification', notification);
      }
    });
    if (room)
      res.status(201).json({ message: 'Message Sent.', msg: newMessage });
  } catch (error) {
    console.log('Error in sendMessageInRoom API : ', error);
    res.status(500).json({ message: error.message });
  }
};
export const allRoomMessages = async (req, res) => {
  const { roomId } = req.params;
  if (!roomId)
    return req
      .status(400)
      .json({ message: 'Content and chat id should be present' });
  try {
    const roomExists = await communityRoom.findOne({
      _id: roomId,
      'participants.userId': req.rootUser._id,
    });
    if (!roomExists)
      return res.status(403).json({ message: 'You cannot access this chat.' });
    const messages = await Message.find({
      chat: roomId,
    })
      .populate('sender', 'username profilePhoto _id')
      .populate('chat');
    res.status(200).json({ messages });
  } catch (error) {
    console.log('Error in allRoomMessages API : ', error);
    res.status(500).json({ message: error.message });
  }
};
