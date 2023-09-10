import userChat from '../../../models/chat/userChat.js';
import User from '../../../models/users.js';

export const accessUserChat = async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ message: 'Provide user id.' });
  try {
    let chat = await userChat
      .findOne({
        $and: [
          {
            participants: {
              $elemMatch: { $eq: req.rootUser._id },
            },
          },
          {
            participants: {
              $elemMatch: { $eq: userId },
            },
          },
        ],
      })
      .populate('participants', '-password -isAdmin -')
      .populate('latestMessage');

    if (chat) {
      if (
        chat.latestMessage?.senderType === 'User' &&
        chat.latestMessage?.chatType === 'UserChat'
      ) {
        chat = User.populate(chat, {
          path: 'latestMessage.sender',
          select: 'username profilePhoto',
        });
      } else {
        return res.status(404).json({ message: 'No message found' });
      }
      res.status(200).json({ chat: chat[0] });
    } else {
      const newChat = new userChat({
        participants: [req.rootUser._id, userId],
      });
      await newChat.save();
      const fullChat = await userChat
        .findOne({ _id: newChat._id })
        .populate('participants', '-password');
      res.status(201).json({ chat: fullChat });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const fetchUserChats = async (req, res) => {
  try {
    let chats = await userChat
      .find({
        participants: {
          $elemMatch: {
            $eq: req.rootUser._id,
          },
        },
      })
      .populate('participants', '-password -isAdmin -interests')
      .populate('latestMessage');
    chats = await User.populate(chats, {
      path: 'latestMessage.sender',
      select: '-password -isAdmin -interests',
    });
    res.status(200).json({ chats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
