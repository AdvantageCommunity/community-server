import slugify from 'slugify';
import { uploadToS3 } from '../../../connections/aws.js';
import Blog from '../../../models/blog.js';
export const addCommunityBlog = async (req, res) => {
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
      communityAuthor: req.community._id,
    });
    await blog.save();
    return res.status(201).json({ message: 'Blog Added Successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const updatCommunityeBlog = async (req, res) => {
  let { slug, communityId } = req.params;

  const coverImage = req.file;
  let coverImageUrl;
  try {
    const blog = await Blog.findOne({
      slug,
      author: req.rootUser?._id,
      communityAuthor: communityId,
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
export const deleteCommunityBlog = async (req, res) => {
  const { slug, communityId } = req.params;
  try {
    const blog = await Blog.findOne({
      slug,
      author: req.rootUser?._id,
      communityAuthor: communityId,
    });
    if (!blog) return res.status(404).json({ message: 'Blog Not Found!' });
    const deletedBlog = await Blog.findByIdAndDelete(blog._id);
    if (!deletedBlog)
      return res
        .status(400)
        .json({ message: 'Something Went Wrong. Try Again!' });
    return res.status(200).json({ message: 'Blog deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
