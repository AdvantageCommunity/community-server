import Community from '../../models/community.js';
import Event from '../../models/event.js';
import { featuredEventsData } from '../../utils/index.js';
export const allCommunities = async (req, res) => {
  try {
    const communities = await Community.find({
      // status: 'active',
    }).sort({ createdAt: -1 });
    res.status(200).json({ communities });
  } catch (error) {
    console.log('Error in all communities api : ' + error);

    res.status(500).json({ message: error.message });
  }
};
export const communitybyId = async (req, res) => {
  const { communityId } = req.params;
  if (!communityId) res.status(404).json({ message: 'Provide community id.' });
  try {
    const community = await Community.findOne({
      _id: communityId,
      status: 'active',
    });
    res.status(200).json({ community });
  } catch (error) {
    console.log('Error in community by id api : ' + error);

    res.status(500).json({ message: error.message });
  }
};
export const searchCommunity = async (req, res) => {
  const { search } = req.query;

  try {
    const communities = await Community.find({
      // status: 'active',
      $or: [
        { name: { $regex: new RegExp(search, 'i') } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json({ communities });
  } catch (error) {
    console.log('Error in seach communities api : ' + error);
    res.status(500).json({ message: error.message });
  }
};
export const getPopularCommunityTags = async (req, res) => {
  try {
    // Aggregate and count the occurrence of each tag in the "tags" field of blogs
    const popularTags = await Community.aggregate([
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
    console.error('Error in getPopularCommunityTags API:', error);

    return res.status(500).json({ error: 'Server error' });
  }
};
// Events

export const allEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .sort({ createdAt: -1 })
      .populate('organizer');
    res.status(200).json({ events });
  } catch (error) {
    console.error('Error in allEvents API:', error);

    return res.status(500).json({ error: 'Server error' });
  }
};
export const eventBySlug = async (req, res) => {
  const { slug } = req.params;
  if (!slug) res.status(404).json({ message: 'Provide event slug.' });

  try {
    const event = await Event.findOne({ slug }).populate(
      'organizer',
      'logo name _id'
    );
    return res.status(200).json({ event });
  } catch (error) {
    console.error('Error in eventById API:', error);

    return res.status(500).json({ error: 'Server error' });
  }
};
export const searchEvent = async (req, res) => {
  let { title, startDate, endDate, venue, location, eventType, tags, search } =
    req.query;
  const query = {};

  try {
    if (title) {
      query.title = { $regex: new RegExp(title, 'i') }; // Case-insensitive title search
    }

    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (venue) {
      query.venue = { $regex: new RegExp(venue, 'i') };
    }
    if (eventType) {
      query.eventType = { $regex: new RegExp(eventType, 'i') };
    }
    if (tags) {
      tags = Array.isArray(tags) ? tags : tags.split(',');
      const tagRegexArray = tags.map((tag) => new RegExp(tag.toString(), 'i'));
      query.tags = { $in: tagRegexArray };
    }
    if (location) {
      query.location.city = { $regex: new RegExp(location, 'i') };
      query.location.state = { $regex: new RegExp(location, 'i') };
      query.location.country = { $regex: new RegExp(location, 'i') };
    }
    if (search) {
      const events = await Event.find({
        $or: [
          { title: { $regex: new RegExp(search, 'i') } }, // Case-insensitive username search
          { venue: { $regex: new RegExp(search, 'i') } }, // Case-insensitive email search
          { eventType: { $regex: new RegExp(search, 'i') } }, // Case-insensitive email search
        ],
      });

      return res.status(200).json({ events });
    }
    const events = await Event.find(query).exec();

    res.status(200).json({ events });
  } catch (error) {
    console.error('Error in event search API:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
export const upcommingEvents = async (req, res) => {
  const currentDate = new Date();
  try {
    const events = await Event.find({ date: { $gt: currentDate } });
    res.status(200).json({ events });
  } catch (error) {
    console.error('Error in upcommingEvents API:', error);

    return res.status(500).json({ error: 'Server error' });
  }
};
export const pastEvents = async (req, res) => {
  const currentDate = new Date();
  try {
    const events = await Event.find({ date: { $lt: currentDate } });
    res.status(200).json({ events });
  } catch (error) {
    console.error('Error in pastEvents API:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};
export const featuredEvents = async (req, res) => {
  return res.status(200).json({ events: featuredEventsData });
};
