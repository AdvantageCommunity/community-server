import { redis } from '../../config/redis.js';
import User from '../../models/users.js';
export const getAllUsers = async (req, res) => {
  try {
    const key = 'users';
    const cacheData = await redis.get(key);
    if (cacheData)
      return res.status(200).json({ users: JSON.parse(cacheData) });
    const users = await User.find()
      .populate({
        path: 'communities.community',
        model: 'Community',
        select: 'name logo description tags admins',
      })
      .select('-password')
      .sort({ createdAt: -1 }); // Retrieve all users from the database
    await redis.set(key, JSON.stringify(users), 'EX', 3600);

    res.status(200).json({ users }); // Send the users as a JSON response
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Internal server error', error: error.message });
  }
};
export const getUserById = async (req, res) => {
  const { username } = req.params;

  if (!username) return res.status(400).json({ message: 'Provide User ID!' });
  try {
    // const key = `user.${username}`;
    // const cacheData = await redis.get(key);
    // if (cacheData) return res.status(200).json({ user: JSON.parse(cacheData) });
    let user = await User.findOne({ username })
      .select(
        'firstName username lastName email profilePhoto phone dateOfBirth gender bio blogs followers followings interests communities.role'
      )
      .populate({
        path: 'blogs',
        model: 'Blog',
        populate: {
          path: 'author',
          model: 'User',
          select: 'username profilePhoto',
        },
      })
      .populate({
        path: 'communities.community',
        model: 'Community',
        select: 'name logo description tags admins role slug',
      })
      .populate({
        path: 'followers',
        model: 'User',
        select: 'username profilePhoto',
      })
      .populate({
        path: 'followings',
        model: 'User',
        select: 'username profilePhoto',
      })

      .select('-password');
    const userDetails = {
      ...user._doc, // Copy all properties from user._doc
      phoneNumber: user.phone.phoneNumber, // Add phoneNumber property
    };
    delete userDetails.phone;
    if (!userDetails)
      return res.status(404).json({ message: 'No user found!' });
    // await redis.set(key, JSON.stringify(userDetails), 'EX', 3600);

    return res.status(200).json({ user: userDetails });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
};
export const searchUsers = async (req, res) => {
  const { search } = req.query;

  if (!search) {
    return res.status(400).json({ message: 'Search parameter is required' });
  }
  try {
    // const key = `user.search.${search}`;
    // const cacheData = await redis.get(key);
    // if (cacheData)
    //   return res.status(200).json({ users: JSON.parse(cacheData) });
    const users = await User.find({
      $and: [
        {
          $or: [
            { username: { $regex: new RegExp(search, 'i') } }, // Case-insensitive username search
            { email: { $regex: new RegExp(search, 'i') } }, // Case-insensitive email search
          ],
        },
      ],
    })
      .select('-password')
      .sort({ createdAt: -1 });
    // await redis.set(key, JSON.stringify(users), 'EX', 3600);

    return res.status(200).json({ users });
  } catch (error) {
    console.error('Error in searching users:', error);
    return res.status(500).json({ message: error.message });
  }
};
