import { redis } from '../../connections/redis.js';
import Community from '../../models/community.js';
import Event from '../../models/event.js';
import { featuredEventsData } from '../../utils/index.js';
export const allCommunities = async (req, res) => {
  try {
    const key = 'communities';
    const cachedCommunties = await redis.get(key);
    if (cachedCommunties)
      return res
        .status(200)
        .json({ communities: JSON.parse(cachedCommunties) });

    const communities = await Community.find({
      // status: 'active',
    }).sort({ createdAt: -1 });
    await redis.set(key, JSON.stringify(communities), 'EX', 3600);
    res.status(200).json({ communities });
  } catch (error) {
    console.log('Error in all communities api : ' + error);

    res.status(500).json({ message: error.message });
  }
};
export const communityBySlug = async (req, res) => {
  const { slug } = req.params;
  if (!slug) res.status(404).json({ message: 'Provide community id.' });
  try {
    // const key = `community.${slug}`;
    // const cacheData = await redis.get(key);
    // if (cacheData)
    //   return res.status(200).json({ community: JSON.parse(cacheData) });
    const community = await Community.findOne({
      slug,
      // status: 'active',
    })
      .populate({
        path: 'blogs',
        model: 'Blog',
        select: 'title content coverImage createdAt read slug tags author',
        populate: {
          path: 'author',
          model: 'User',
          select: 'profilePhoto username',
        },
      })
      .populate({
        path: 'events',
        model: 'Event',
        select: 'title description imageUrl date organizer',
        populate: {
          path: 'organizer',
          model: 'Community',
          select: 'name logo',
        },
      })
      .populate('admins', 'username profilePhoto email');
    // await redis.set(key, JSON.stringify(community), 'EX', 3600);

    res.status(200).json({ community });
  } catch (error) {
    console.log('Error in community by id api : ' + error);

    res.status(500).json({ message: error.message });
  }
};
export const searchCommunity = async (req, res) => {
  const { search } = req.query;

  try {
    // const key = `community.search.${search}`;
    // const cacheData = await redis.get(key);
    // if (cacheData)
    //   return res.status(200).json({ communities: JSON.parse(cacheData) });
    const communities = await Community.find({
      // status: 'active',
      $or: [
        { name: { $regex: new RegExp(search, 'i') } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ],
    }).sort({ createdAt: -1 });
    // await redis.set(key, JSON.stringify(communities), 'EX', 3600);

    res.status(200).json({ communities });
  } catch (error) {
    console.log('Error in seach communities api : ' + error);
    res.status(500).json({ message: error.message });
  }
};
export const getPopularCommunityTags = async (req, res) => {
  try {
    // Aggregate and count the occurrence of each tag in the "tags" field of blogs
    const key = 'popularCommunityTags';
    const cacheData = await redis.get(key);
    if (cacheData) return res.status(200).json({ tags: JSON.parse(cacheData) });

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
    await redis.set(key, JSON.stringify(tagNames), 'EX', 3600);
    return res.status(200).json({ tags: tagNames });
  } catch (error) {
    console.error('Error in getPopularCommunityTags API:', error);

    return res.status(500).json({ error: 'Server error' });
  }
};
// Events

export const allEvents = async (req, res) => {
  try {
    const key = 'events';
    const cacheData = await redis.get(key);
    if (cacheData)
      return res.status(200).json({ events: JSON.parse(cacheData) });
    const events = await Event.find()
      .sort({ createdAt: -1 })
      .populate('organizer');
    await redis.set(key, JSON.stringify(events), 'EX', 3600);

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
    // const key = `event.${slug}`;
    // const cacheData = await redis.get(key);
    // if (cacheData)
    //   return res.status(200).json({ event: JSON.parse(cacheData) });
    const event = await Event.findOne({ slug }).populate(
      'organizer',
      'logo name _id'
    );
    // await redis.set(key, JSON.stringify(event), 'EX', 3600);
    return res.status(200).json({ event });
  } catch (error) {
    console.error('Error in eventById API:', error);

    return res.status(500).json({ error: 'Server error' });
  }
};
export const searchEvent = async (req, res) => {
  const {
    title,
    startDate,
    endDate,
    venue,
    location,
    eventType,
    tags,
    search,
  } = req.query;
  const query = {};

  try {
    // let cacheKey = 'searchEvents:';
    // if (title) cacheKey += `title-${title}:`;
    // if (startDate) cacheKey += `startDate-${startDate}:`;
    // if (endDate) cacheKey += `endDate-${endDate}:`;
    // if (venue) cacheKey += `venue-${venue}:`;
    // if (eventType) cacheKey += `eventType-${eventType}:`;
    // if (tags) cacheKey += `tags-${tags}:`;
    // if (location) cacheKey += `location-${location}:`;

    if (search) {
      // If search is provided, use a separate cache key and return cached results if available
      // const cachedResults = await client.get(`searchEvents:search-${search}`);
      // if (cachedResults) {
      //   return res.status(200).json({ events: JSON.parse(cachedResults) });
      // }
    }

    if (title) {
      query.title = { $regex: new RegExp(title, 'i') };
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
      query.location = {
        $or: [
          { city: { $regex: new RegExp(location, 'i') } },
          { state: { $regex: new RegExp(location, 'i') } },
          { country: { $regex: new RegExp(location, 'i') } },
        ],
      };
    }

    const events = await Event.find(query).exec();

    // Cache the results if not empty and if search parameter is not present
    // if (events.length > 0 && !search) {
    //   await client.set(cacheKey, JSON.stringify(events), 'EX', 3600);
    // }

    // Cache the results if search parameter is present
    // if (search) {
    //   await client.set(
    //     `searchEvents:search-${search}`,
    //     JSON.stringify(events),
    //     'EX',
    //     3600
    //   );
    // }

    res.status(200).json({ events });
  } catch (error) {
    console.error('Error in event search API:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
export const upcommingEvents = async (req, res) => {
  const currentDate = new Date();
  try {
    const key = 'upcomingEvents';
    const cacheData = await redis.get(key);
    if (cacheData)
      return res.status(200).json({ events: JSON.parse(cacheData) });
    const events = await Event.find({ date: { $gt: currentDate } });
    await redis.set(key, JSON.stringify(events), 'EX', 3600);

    res.status(200).json({ events });
  } catch (error) {
    console.error('Error in upcommingEvents API:', error);

    return res.status(500).json({ error: 'Server error' });
  }
};
export const pastEvents = async (req, res) => {
  const currentDate = new Date();
  try {
    const key = 'pastEvents';
    const cacheData = await redis.get(key);

    if (cacheData)
      return res.status(200).json({ events: JSON.parse(cacheData) });

    const events = await Event.find({ date: { $lt: currentDate } });
    await redis.set(key, JSON.stringify(events), 'EX', 3600);

    res.status(200).json({ events });
  } catch (error) {
    console.error('Error in pastEvents API:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};
export const featuredEvents = async (req, res) => {
  return res.status(200).json({ events: featuredEventsData });
};
