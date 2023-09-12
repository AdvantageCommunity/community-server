import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const userSchema = new mongoose.Schema(
  {
    profilePhoto: {
      type: String,
    },
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
        trim: true,
      },
      phoneNumber: {
        type: Number,
        minlength: 10,
        trim: true,
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
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    followings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    interests: [
      {
        type: String,
      },
    ],
    communities: [
      {
        community: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Community',
        },
        role: {
          type: String,
          enum: ['member', 'admin'],
          default: 'member',
          trim: true,
        },
      },
    ],
    blogs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog',
      },
    ],
  },
  {
    timestamps: true,
  }
);
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
