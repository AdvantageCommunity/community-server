import mongoose from 'mongoose';
const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'senderType', // Reference path dynamically set based on senderType
  },
  senderType: {
    type: String,
    enum: ['User', 'Community'], // Add more types if needed
    required: true,
  },
  message: {
    type: String,
  },
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'chatType', // Reference path dynamically set based on chatType
  },
  chatType: {
    type: String,
    enum: ['UserChat', 'CommunityRoom'], // Define chat types
    required: true,
  },
});
const Message = mongoose.model('Message', messageSchema);
export default Message;
