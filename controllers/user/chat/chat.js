import communityRoom from '../../../models/chat/communityRoom.js';
import userChat from '../../../models/chat/userChat.js';
import Community from '../../../models/community.js';
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
      .populate('participants', '-password -interests')
      .populate('latestMessage');

    if (chat) {
      if (
        chat.latestMessage?.senderType === 'user' &&
        chat.latestMessage?.chatType === 'userChat'
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
    console.log('Error in accessUserChat api : ' + error);

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
      .populate('participants', '-password -interests')
      .populate('latestMessage');
    chats = await User.populate(chats, {
      path: 'latestMessage.sender',
      select: '-password -interests',
    });
    res.status(200).json({ chats });
  } catch (error) {
    console.log('Error in fetchUsers api : ' + error);
    res.status(500).json({ message: error.message });
  }
};
export const accessRoomChat = async (req, res) => {
  const { communityId, roomId } = req.params;
  if (!roomId) return res.status(400).json({ message: 'Provide Room id.' });
  if (!communityId)
    return res.status(400).json({ message: 'Provide community id.' });

  try {
    const community = await Community.findOne({ _id: communityId });
    if (!community)
      return res.status(404).json({ message: 'Community not found.' });
    if (!community.members.includes(req.rootUser._id))
      return res
        .status(400)
        .json({ message: 'You need to join the community first.' });
    let room = await communityRoom.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found.' });
    const userExists = room.participants.find(
      (user) => user.userId.toString() === req.rootUser._id.toString()
    );
    if (userExists) {
      room = room.populate('participants.userId', '-password -interests');
      return res
        .status(200)
        .json({ message: 'User is already in the room', room });
    } else {
      room.participants.push({
        userId: req.rootUser._id,
        role: 'member',
      });
      await room.save();
      return res.status(201).json({ message: 'User joined room', room });
    }
  } catch (error) {
    console.log('Error in accessRoomChat api : ' + error);
    res.status(500).json({ message: error.message });
  }
};
export const fetchAllRooms = async (req, res) => {
  try {
    let rooms = await communityRoom
      .find({
        'participants.userId': req.rootUser._id,
      })
      .populate('community', 'name logo description members')
      .populate('participants', '-password -interests');
    res.status(200).json({ rooms });
  } catch (error) {
    console.log('Error in fetchRoomChats api : ' + error);

    res.status(500).json({ message: error.message });
  }
};
