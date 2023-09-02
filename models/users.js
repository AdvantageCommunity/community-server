import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    trim: true,
    unique: true,
  },
  firstName: {
    type: String,
    minLength: 2,
  },
  lastName: {
    type: String,
    minLength: 2,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    countryCode: {
      type: Number,
      minlength: 2,
    },
    phoneNumber: {
      type: Number,
      minlength: 10,
    },
  },
  dateOfBirth: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
  },
  bio: {
    type: String,
  },

  intrests: [
    {
      type: String,
    },
  ],
  communities: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
    },
  ],
});
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

userSchema.methods.generateAuthToken = function () {
  try {
    let token = jwt.sign(
      { id: this._id, email: this.email },
      process.env.JWT_SECRET,
      {
        expiresIn: '20d',
      }
    );
    return token;
  } catch (error) {
    console.log('Error while generating JWT Token!');
  }
};
const User = mongoose.model('User', userSchema);
export default User;
