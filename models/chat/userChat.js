import mongoose from 'mongoose';
const chatSchema = new mongoose.Schema(
  {
    // chatName: {
    //   type: String,
    //   trim: true,
    // },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    // isGroupChat: {
    //   type: Boolean,
    //   default: false,
    // },
    // groupAdmin: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'Community',
    // },
  },
  {
    timestamps: true,
  }
);
const userChat = mongoose.model('UserChat', chatSchema);
export default userChat;
