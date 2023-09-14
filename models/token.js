import mongoose from 'mongoose';
const tokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 20, //1 hour
  },
});
const Token = mongoose.model('Token', tokenSchema);
export default Token;
