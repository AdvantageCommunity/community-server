import slugify from 'slugify';
import Blog from '../../../models/blog.js';
import Event from '../../../models/event.js';
import { uploadToS3 } from '../../../connections/aws.js';
export const postBlog = async (req, res) => {
  const { title, content, tags } = req.body;
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
      coverImage: documentResult.Location,
      author: req.rootUser._id,
    });
    await blog.save();
    req.rootUser.blogs.push(blog._id);
    await req.rootUser.save();
    return res.status(201).json({ message: 'Blog Added Successfully!', blog });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const updateBlog = async (req, res) => {
  let { slug } = req.params;
  const coverImage = req.file;
  let coverImageUrl;
  try {
    const blog = await Blog.findOne({
      slug,
      author: req.rootUser?._id,
    });
    if (!blog) return res.status(404).json({ message: 'Blog Not Found!' });
    coverImageUrl = blog.coverImage;
    const updates = req.body;
    const allowedUpdates = ['title', 'content', 'tags'];
    const requestedUpdates = Object.keys(updates);
    const isValidUpdate = requestedUpdates.every((update) =>
      allowedUpdates.includes(update)
    );
    if (!isValidUpdate)
      return res.status(400).json({ message: 'Provide Valid Updates!' });
    if (requestedUpdates.includes('title')) {
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
    return res.status(201).json({ message: 'Blog Updated!' });
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
    return res.status(200).json({ message: 'Blog deleted successfully.' });
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
      return res
        .status(400)
        .json({ message: 'Blog liked successfully', likes: blogToLike.likes });
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
      const likeIdex = blogToUnLike.likes.findIndex(
        (like) => like._id.toString() === userId.toString()
      );
      const selectedLike = blogToUnLike.likes[likeIdex];
      if (selectedLike.user.toString() === userId.toString()) {
        if (likeIdex === -1)
          return res
            .status(404)
            .json({ message: 'You have not liked this blog' });
        blogToUnLike.likes.splice(likeIdex, 1);
        await blogToUnLike.save();
        return res.status(400).json({
          message: 'Blog unliked successfully',
          likes: blogToUnLike.likes,
        });
      } else {
        return res
          .status(403)
          .json({ message: 'Your not allowed to unlike this blog' });
      }
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
    res.status(201).json({ message: 'Comment Added!', comment: savedComment });
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
        console.log(commentIdex);
        if (commentIdex === -1)
          return res.status(404).json({ message: 'Comment not found' });
        blog.comments.splice(commentIdex, 1);
        await blog.save();
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
    res.status(200).json({ message: 'Blog Added to Favorites.' });
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
