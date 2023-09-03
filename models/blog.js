import mongoose from 'mongoose';
const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model for individual authors
    },
    communityAuthor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community', // Reference to the Community model for community authors
    },
    tags: [{ type: String, trim: true }],
    coverImage: String, // URL to a cover image for the blog post
    likes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User', // Reference to the User model for users who liked the post
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User', // Reference to the User model for comment authors
        },
        content: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);
const Blog = mongoose.model('Blog', blogSchema);
export default Blog;
