import User from '../../models/users.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }); // Retrieve all users from the database
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
    const user = await User.findOne({ _id: userId }).select('-password');
    if (!user) return res.status(404).json({ message: 'No user found!' });
    return res.status(200).json({ user });
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
      $or: [
        { username: { $regex: new RegExp(search, 'i') } }, // Case-insensitive username search
        { email: { $regex: new RegExp(search, 'i') } }, // Case-insensitive email search
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
