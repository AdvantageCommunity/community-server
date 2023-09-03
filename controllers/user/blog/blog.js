import slugify from 'slugify';
import Blog from '../../../models/blog.js';
export const postBlog = async (req, res) => {
  const { title, content, tags, coverImage } = req.body;
  if (!title) return res.status(400).json({ message: 'Provide Title!' });
  if (!content) return res.status(400).json({ message: 'Provide Content!' });
  if (!tags) return res.status(400).json({ message: 'Provide Tags!' });
  if (!coverImage)
    return res.status(400).json({ message: 'Provide Cover Image!' });
  const slug = slugify(title, { lower: true });
  try {
    const slugAlreadyExists = await Blog.findOne({ slug });
    if (slugAlreadyExists)
      return res.status(400).json({ message: 'Try Modifying your title!' });
    const blog = new Blog({
      title,
      content,
      tags,
      slug,
      coverImage,
      author: req.rootUser?._id,
    });
    await blog.save();
    return res.status(201).json({ message: 'Blog Added Successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const updateBlog = async (req, res) => {
  let { slug } = req.params;
  try {
    const blog = await Blog.findOne({
      slug,
      author: req.rootUser?._id,
    });
    if (!blog) return res.status(404).json({ message: 'Blog Not Found!' });
    const updates = req.body;
    const allowedUpdates = ['title', 'content', 'tags', 'coverImage'];
    const requestedUpdates = Object.keys(updates);
    const isValidUpdate = requestedUpdates.every((update) =>
      allowedUpdates.includes(update)
    );
    if (!isValidUpdate)
      return res.status(400).json({ message: 'Provide Valid Updates!' });
    if (requestedUpdates.includes('title')) {
      slug = slugify(req.body.title, { lower: true });
    }
    const updatedUser = await Blog.findByIdAndUpdate(
      blog._id,
      { ...updates, slug },
      {
        new: true, // This option returns the updated user document
        runValidators: true, // This option runs the validators defined in the userSchema for the updates
      }
    );
    if (!updatedUser)
      return res.status(201).json({ message: 'Unable to Update the Blog!' });
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
    if (!deletedBlog)
      return res
        .status(400)
        .json({ message: 'Something Went Wrong. Try Again!' });
    return res.status(200).json({ message: 'Blog deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
