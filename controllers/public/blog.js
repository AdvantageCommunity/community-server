import { redis } from '../../connections/redis.js';
import Blog from '../../models/blog.js';
import Community from '../../models/community.js';
import Event from '../../models/event.js';

export const getAllBlogs = async (req, res) => {
  try {
    const key = 'blogs';
    const cacheData = await redis.get(key);
    if (cacheData) return res.json({ blogs: JSON.parse(cacheData) });
    const blogs = await Blog.find()
      .populate('author', 'username profilePhoto')
      .populate('communityAuthor', 'name logo')
      .sort({ createdAt: -1 });

    await redis.set(key, JSON.stringify(blogs), 'EX', 3600);
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
    const blog = await Blog.findOne({ slug })
      .populate('author', 'profilePhoto username')
      .populate('communityAuthor', 'logo name')
      .populate('comments.user', 'username profilePhoto');
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
    })
      .populate('author', 'profilePhoto username')
      .sort({ createdAt: -1 });
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
// Community Blogs
export const allCommunitiesBlogs = async (req, res) => {
  try {
    const key = 'community_blogs';
    const cachedBlogs = await redis.get(key);
    if (cachedBlogs)
      return res.status(200).json({ blogs: JSON.parse(cachedBlogs) });
    const blogs = await Blog.find({
      communityAuthor: { $exists: true },
    })
      .populate('author', 'firstName lastname email profilePhoto')
      .populate('communityAuthor', 'name logo email')
      .sort({ createdAt: -1 });
    await redis.set(key, JSON.stringify(blogs), 'EX', 3600);
    res.status(200).json({ blogs });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};
export const getCommunitiyBlogs = async (req, res) => {
  const { slug } = req.params;
  if (!slug) {
    return res.status(400).json({ message: 'Provide Community!' });
  }

  try {
    const communityExists = await Community.findOne({ slug });
    if (!communityExists)
      return res.status(404).json({ message: 'Community not found.' });

    const blogs = await Blog.find({
      communityAuthor: communityExists._id,
    });
    res.status(200).json({ blogs });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};
export const getCommunitiyEvents = async (req, res) => {
  const { slug } = req.params;
  if (!slug) {
    return res.status(400).json({ message: 'Provide Community!' });
  }

  try {
    const communityExists = await Community.findOne({ slug: slug });
    if (!communityExists)
      return res.status(404).json({ message: 'Community not found.' });

    const events = await Event.find({
      organizer: communityExists._id,
    });
    res.status(200).json({ events });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};
