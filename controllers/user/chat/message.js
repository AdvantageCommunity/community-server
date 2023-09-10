import Message from '../../../models/chat/message.js';
import userChat from '../../../models/chat/userChat.js';
import User from '../../../models/users.js';

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
      chatType: 'UserChat',
    });
    await newMessage.save();
    newMessage = await Message.findOne({ _id: newMessage._id })
      .populate('sender', '-password -interests -isAdmin')
      .populate('chat');
    newMessage = await User.populate(newMessage, {
      path: 'chat.participants',
      select: 'username profilePic email',
    });
    const chat = await userChat.findOne({ _id: chatId });
    chat.latestMessage = newMessage._id;
    await chat.save();
    return res.status(201).json({ message: newMessage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getAllMessages = async (req, res) => {};
