import mongoose from 'mongoose';
const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minLength: 2,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    logo: {
      type: String,
    },
    coverImage: {
      type: String,
    },
    description: {
      type: String,
    },
    blogs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog',
      },
    ],
    events: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
      },
    ],
    rooms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'communityRoom',
      },
    ],
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    contacts: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);
const Community = mongoose.model('Community', communitySchema);
export default Community;
