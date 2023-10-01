import User from '../../models/users.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate({
        path: 'communities.community',
        model: 'Community',
        select: 'name logo description tags admins',
      })
      .select('-password')
      .sort({ createdAt: -1 }); // Retrieve all users from the database
    res.status(200).json({ users }); // Send the users as a JSON response
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Internal server error', error: error.message });
  }
};
export const getUserById = async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ message: 'Provide User ID!' });
  try {
    let user = await User.findOne({ _id: userId })
      .select(
        'firstName username lastName profilePhoto phone.phoneNumber dateOfBirth gender bio'
      )
      .populate({
        path: 'communities.community',
        model: 'Community',
        select: 'name logo description tags admins',
      })
      .select('-password');

    const userDetails = {
      ...user._doc, // Copy all properties from user._doc
      phoneNumber: user.phone.phoneNumber, // Add phoneNumber property
    };
    delete userDetails.phone;
    if (!user) return res.status(404).json({ message: 'No user found!' });
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
    return res.status(200).json({ users });
  } catch (error) {
    console.error('Error in searching users:', error);
    return res.status(500).json({ message: error.message });
  }
};
