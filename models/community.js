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
      // this need to be removed
      type: String,
    },
    logo: {
      type: String,
    },
    coverImage: {
      type: String,
      default:
        'https://images.unsplash.com/photo-1533134486753-c833f0ed4866?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    },
    description: {
      type: String,
    },
    tags: [
      {
        type: String,
      },
    ],
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
        name: String,
        link: String,
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'rejected', 'active'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);
const Community = mongoose.model('Community', communitySchema);
export default Community;
