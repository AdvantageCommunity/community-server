import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    minLength: 2,
  },
  lastName: {
    type: String,
    minLength: 2,
  },
  // phone: {
  //   countryCode: Number,
  //   phoneNumber: Number,
  // },
  // dateOfBirth: {
  //   type: Date,
  // },
  // gender: {
  //   type: String,
  //   enum: ['male', 'female', 'other'],
  // },
  // bio: {
  //   type: String,
  // },
  // username: {
  //   type: String,
  //   trim: true,
  //   // unique: true,
  // },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  // password: {
  //   type: String,
  //   // required: true,
  //   trim: true,
  // },
  // intrests: [
  //   {
  //     type: String,
  //   },
  // ],
});
const User = mongoose.model('User', userSchema);
export default User;
