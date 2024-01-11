import slugify from 'slugify';
import Blog from '../../../models/blog.js';
import Event from '../../../models/event.js';
import { uploadToS3 } from '../../../config/aws.js';
import { io } from '../../../index.js';
import User from '../../../models/users.js';
import Community from '../../../models/community.js';
import { redis } from '../../../config/redis.js';
export const postBlog = async (req, res) => {
  const { title, content, tags, read } = req.body;

  const coverImage = req.file;
  if (!title) return res.status(400).json({ message: 'Provide Title!' });
  if (!content) return res.status(400).json({ message: 'Provide Content!' });
  if (!tags) return res.status(400).json({ message: 'Provide Tags!' });
  if (!coverImage)
    return res.status(400).json({ message: 'Provide Cover Image!' });
  const parsedTags = Array.isArray(tags) ? tags : JSON.parse(tags || '[]');
  const slug = slugify(title, { lower: true });
  try {
    const documentResult = await uploadToS3(
      coverImage.buffer,
      `blog/${Date.now().toString()}.jpg`
    );
    const slugAlreadyExists = await Blog.findOne({ slug });
    if (slugAlreadyExists)
      return res.status(400).json({ message: 'Try Modifying your title!' });
    const blog = new Blog({
      title,
      content,
      tags: parsedTags,
      slug,
      read,
      coverImage: documentResult.Location,
      author: req.rootUser._id,
    });
    await blog.save();
    req.rootUser.blogs.push(blog._id);

    await req.rootUser.save();
    const cacheKey = 'blogs';
    await redis.del(cacheKey);

    return res
      .status(201)
      .json({ message: 'Blog Added Successfully!', success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const updateBlog = async (req, res) => {
  let { slug } = req.params;
  const coverImage = req.file;

  let coverImageUrl;
  let prevSlug;
  try {
    const blog = await Blog.findOne({
      slug,
      author: req.rootUser?._id,
    });
    if (!blog) return res.status(404).json({ message: 'Blog Not Found!' });
    coverImageUrl = blog.coverImage;
    let updates = req.body;
    const allowedUpdates = ['title', 'content', 'tags', 'read'];
    const requestedUpdates = Object.keys(updates);
    if (requestedUpdates.includes('tags')) {
      if (!Array.isArray(updates.tags)) {
        updates.tags = JSON.parse(updates.tags);
        if (!Array.isArray(updates.tags))
          return res.status(400).json({ message: 'Tags should be an Array' });
      }
    }
    const isValidUpdate = requestedUpdates.every((update) =>
      allowedUpdates.includes(update)
    );
    if (!isValidUpdate)
      return res.status(400).json({ message: 'Provide Valid Updates!' });
    if (requestedUpdates.includes('title')) {
      prevSlug = slug;
      slug = slugify(req.body.title, { lower: true });
    }
    if (coverImage) {
      const documentResult = await uploadToS3(
        coverImage.buffer,
        `blog/${Date.now().toString()}.jpg`
      );
      coverImageUrl = documentResult.Location;
    }
    const updatedUser = await Blog.findByIdAndUpdate(
      blog._id,
      { ...updates, slug, coverImage: coverImageUrl },
      {
        new: true, // This option returns the updated user document
        runValidators: true, // This option runs the validators defined in the userSchema for the updates
      }
    );
    if (!updatedUser)
      return res.status(400).json({ message: 'Unable to Update the Blog!' });
    if (requestedUpdates.includes('title')) {
      const cacheKey = `blog.${prevSlug}`;
      await redis.del(cacheKey);
    }
    return res.status(201).json({ message: 'Blog Updated!', success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const deleteBlog = async (req, res) => {
  const { slug } = req.params;
  try {
    const blog = await Blog.findOne({
      slug,
      author: req.rootUser?._id,
    });
    if (!blog) return res.status(404).json({ message: 'Blog Not Found!' });
    const deletedBlog = await Blog.findByIdAndDelete(blog._id);
    req.rootUser.blogs = req.rootUser.blogs.filter(
      (bl) => bl._id.toString() !== blog._id
    );
    await req.rootUser.save();

    if (!deletedBlog)
      return res
        .status(400)
        .json({ message: 'Something Went Wrong. Try Again!' });
    const cacheKey = `blog.${deleteBlog.slug}`;
    await redis.del(cacheKey);
    return res
      .status(200)
      .json({ message: 'Blog deleted successfully.', success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const likeABlog = async (req, res) => {
  const { blogId } = req.params;
  const userId = req.rootUser._id;
  if (!blogId) return res.status(400).json({ message: 'Provide blog id.' });
  try {
    const blogToLike = await Blog.findOne({ _id: blogId });
    if (!blogToLike)
      return res.status(404).json({ message: 'Blog not found.' });
    if (
      !blogToLike.likes.some(
        (like) => like._id.toString() === userId.toString()
      )
    ) {
      blogToLike.likes.push({ _id: userId, createdAt: new Date() });
      await blogToLike.save();
      // Socket Io related Code
      const notification = {
        message: `${req.rootUser.username} liked on your blog`,
        actionType: 'like',
        isRead: false,
      };
      const isCommunityBlog = !!blogToLike.communityAuthor;

      if (isCommunityBlog) {
        // Blog is authored by a community
        const community = await Community.findOne({
          _id: blogToLike.communityAuthor,
        }).populate('admins');

        if (community) {
          // Iterate through the admins of the community
          community.admins.forEach(async (admin) => {
            admin?.notifications?.push(notification);
            await admin?.save();
            io.to(admin?._id).emit('notification', notification);
          });
        }
      } else {
        const recipient = await User.findOne({
          _id: blogToLike.author.toString(),
        });

        if (recipient) {
          recipient.notifications.push(notification);
          await recipient.save();
          io.to(recipient._id).emit('notification', notification);
        }
      }
      const cacheKey = `blog.${blogToLike.slug}`;
      await redis.del(cacheKey);
      return res.status(200).json({
        message: 'Blog liked successfully',
        likes: blogToLike.likes,
        success: true,
      });
    } else {
      return res
        .status(400)
        .json({ message: 'You have already liked this blog' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const unLikeABlog = async (req, res) => {
  const { blogId } = req.params;
  const userId = req.rootUser._id;

  if (!blogId) return res.status(400).json({ message: 'Provide blog id.' });

  try {
    const blogToUnLike = await Blog.findOne({ _id: blogId });

    if (!blogToUnLike)
      return res.status(404).json({ message: 'Blog not found.' });

    if (
      blogToUnLike.likes.some(
        (like) => like._id.toString() === userId.toString()
      )
    ) {
      // Remove the like from the likes array
      blogToUnLike.likes = blogToUnLike.likes.filter(
        (like) => like._id.toString() !== userId.toString()
      );

      await blogToUnLike.save();

      // Return a status code of 200 OK for a successful unlike
      const cacheKey = `blog.${blogToUnLike.slug}`;
      await redis.del(cacheKey);
      return res.status(200).json({
        message: 'Blog unliked successfully',
        likes: blogToUnLike.likes,
        success: true,
      });
    } else {
      return res.status(400).json({ message: 'You have not liked this blog' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const commentOnBlog = async (req, res) => {
  const { blogId } = req.params;
  const { content } = req.body;

  if (!blogId) return res.status(400).json({ message: 'Provide blog id' });
  if (!content) return res.status(400).json({ message: 'Provide content' });

  try {
    const blog = await Blog.findOne({ _id: blogId });
    if (!blog) return res.status(404).json({ message: 'Blog not found.' });
    const comment = {
      user: req.rootUser._id,
      content,
    };
    blog.comments.push(comment);
    await blog.save();
    const savedComment = blog.comments[blog.comments.length - 1];
    // Socket Io related Code
    let notification = {
      message: `${req.rootUser.username} commented on blog ${blog.title}`,
      actionType: 'like',
      isRead: false,
    };
    const isCommunityBlog = !!blog.communityAuthor;

    if (isCommunityBlog) {
      // Blog is authored by a community
      const community = await Community.findOne({
        _id: blog.communityAuthor,
      }).populate('admins');
      if (community) {
        // Iterate through the admins of the community
        community.admins.forEach(async (admin) => {
          admin?.notifications?.push(notification);
          await admin?.save();
          io.to(admin?._id).emit('notification', notification);
        });
      }
    } else {
      const recipient = await User.findOne({
        _id: blog.author.toString(),
      });

      if (recipient) {
        recipient.notifications.push(notification);
        await recipient.save();
        io.to(recipient._id).emit('notification', notification);
      }
    }
    const cacheKey = `blog.${blog.slug}`;
    await redis.del(cacheKey);
    res.status(201).json({ success: 'Comment Added!', comment: savedComment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const deleteComment = async (req, res) => {
  const { blogId } = req.params;
  const { commentId } = req.body;
  if (!blogId) return res.status(400).json({ message: 'Provide blog id ' });
  if (!commentId)
    return res.status(400).json({ message: 'Provide comment id' });
  try {
    const blog = await Blog.findOne({ _id: blogId });
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    if (
      blog.comments.some(
        (comment) => comment.user.toString() === req.rootUser._id.toString()
      )
    ) {
      let commentIdex = blog.comments.findIndex(
        (comment) => comment._id.toString() === commentId.toString()
      );
      const selectedComment = blog.comments[commentIdex];
      if (selectedComment.user.toString() === req.rootUser._id.toString()) {
        if (commentIdex === -1)
          return res.status(404).json({ message: 'Comment not found' });
        blog.comments.splice(commentIdex, 1);
        await blog.save();
        const cacheKey = `blog.${blog.slug}`;
        await redis.del(cacheKey);
        return res.status(200).json({ message: 'Comment deleted' });
      } else {
        return res
          .status(403)
          .json({ message: 'Your not allowed to delete this comment' });
      }
    } else {
      return res.status(404).json({ message: 'Comments Not Found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const favoriteBlog = async (req, res) => {
  const { blogId } = req.params;

  if (!blogId) return res.status(400).json({ message: 'Provide blog id ' });
  try {
    const blogExists = await Blog.findOne({ _id: blogId });
    if (!blogExists)
      return res.status(404).json({ message: 'Blog not found.' });
    if (req.rootUser.favorites.blogs.includes(blogExists._id)) {
      return res
        .status(400)
        .json({ message: 'Blog already exists in Favorites.' });
    }
    req.rootUser.favorites.blogs.push(blogExists._id);
    await req.rootUser.save();
    res.status(200).json({ succcess: 'Blog Added to Favorites.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const unFavoriteBlog = async (req, res) => {
  const { blogId } = req.params;

  try {
    if (!blogId) {
      return res.status(400).json({ message: 'Provide a valid blog id' });
    }
    const blogExists = await Blog.findOne({ _id: blogId });
    if (!blogExists) {
      return res.status(404).json({ message: 'Blog not found.' });
    }
    const user = req.rootUser;
    const favoriteIndex = user.favorites.blogs.indexOf(blogExists._id);
    if (favoriteIndex === -1) {
      return res
        .status(400)
        .json({ message: 'Blog is not in your favorites.' });
    }

    user.favorites.blogs.splice(favoriteIndex, 1);
    await user.save();

    res.status(200).json({ success: 'Blog removed from favorites.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const favoriteEvent = async (req, res) => {
  const { eventId } = req.params;
  if (!eventId) return res.status(400).json({ message: 'Provide event id ' });
  try {
    const eventExists = await Event.findOne({ _id: eventId });
    if (!eventExists)
      return res.status(404).json({ message: 'Event not found.' });
    if (req.rootUser.favorites.events.includes(eventExists._id)) {
      return res
        .status(400)
        .json({ message: 'Event already exists in Favorites.' });
    }
    req.rootUser.favorites.events.push(eventExists._id);
    await req.rootUser.save();
    res.status(200).json({ message: 'Event Added to Favorites.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
