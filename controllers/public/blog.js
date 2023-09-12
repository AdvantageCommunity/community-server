import Blog from '../../models/blog.js';

export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 }); // Retrieve all users from the database
    res.status(200).json({ blogs }); // Send the users as a JSON response
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Internal server error', error: error.message });
  }
};
export const getBlogBySlug = async (req, res) => {
  const { slug } = req.params;
  if (!slug) return res.status(400).json({ message: 'Provide Blog Slug.' });
  try {
    const blog = await Blog.findOne({ slug });
    if (!blog) return res.status(404).json({ message: 'Blog not found.' });
    return res.status(200).json({ blog });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Internal Server Error.', error: error.message });
  }
};
export const searchBlogs = async (req, res) => {
  const { search } = req.query;

  if (!search) {
    return res.status(400).json({ message: 'Search parameter is required' });
  }
  try {
    const blogs = await Blog.find({
      $or: [
        { title: { $regex: new RegExp(search, 'i') } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ],
    }).sort({ createdAt: -1 });
    return res.status(200).json({ blogs });
  } catch (error) {
    console.error('Error in searching for blogs:', error);
    return res.status(500).json({ message: error.message });
  }
};
export const getPopularBlogCategories = async (req, res) => {
  try {
    // Aggregate and count the occurrence of each tag in the "tags" field of blogs
    const popularTags = await Blog.aggregate([
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
        },
      },
    ]);

    // Extract the tag names from the aggregation result
    const tagNames = popularTags.map((tag) => tag._id);
    return res.status(200).json({ tags: tagNames });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};
