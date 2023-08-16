import mongoose from 'mongoose';
const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 2,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  socials: [
    {
      type: String,
    },
  ],
  lead: {
    name: {
      type: String,
      required: true,
    },
    countryCode: {
      type: Number,
      default: 91,
    },
    phoneNumber: {
      type: String,
      required: true,
      minlength: 10,
    },
  },
});
const Community = mongoose.model('Community', communitySchema);
export default Community;
