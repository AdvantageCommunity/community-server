import mongoose from 'mongoose';
const communityRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
  },
  latestMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true,
  },

  participants: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      role: {
        type: String,
        enum: ['member', 'admin'],
        default: 'member',
      },
    },
  ],
});
const communityRoom = mongoose.model('communityRoom', communityRoomSchema);
export default communityRoom;
