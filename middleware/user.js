import jwt from 'jsonwebtoken';
import User from '../models/users.js';
import Community from '../models/community.js';
export const isUserAuthenticated = async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    return res.status(401).json({ message: 'Not Authorized! Login first' });
  }
  // let accessToken = authorizationHeader.split(' ')[0]; // when using localhost

  let accessToken = authorizationHeader.split(' ')[1]; // when using postman

  if (accessToken.length < 500) {
    let verfiyToken;
    try {
      verfiyToken = jwt.verify(accessToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid Token!' });
    }
    const verifiedUser = await User.findOne({ _id: verfiyToken.id })?.select(
      '-password'
    );
    if (!verifiedUser)
      return res.status(401).json({ message: 'Not Authorized. Login First!' });
    req.rootUser = verifiedUser;
    req.userToken = accessToken;
  } else {
    const verifyGoogleToken = jwt.decode(accessToken);
    const verifiedUser = await User.findOne({
      email: verifyGoogleToken.email,
    })?.select('-password');
    req.rootUser = verifiedUser;
    req.accessToken = accessToken;
  }

  next();
};
export const checkCommunityAdmin = async (req, res, next) => {
  const { communityId } = req.params;

  const { _id: userId } = req.rootUser;
  if (!communityId)
    return res.status(400).json({ message: 'Provide community Id.' });
  if (!userId)
    return res.status(400).json({ message: 'User not authenticated.' });
  try {
    const community = await Community.findOne({ _id: communityId })
      .populate('admins')
      .populate('members');
    if (!community)
      return res.status(404).json({ message: 'Community not found.' });
    if (!community.admins.some((admin) => admin._id.equals(userId)))
      return res
        .status(403)
        .json({ message: 'You are not an admin of this community.' });
    req.community = community;
    next();
  } catch (error) {
    console.error('Error in checkAdmin middleware:', error);
    res
      .status(500)
      .json({ message: 'An error occurred while checking admin status.' });
  }
};
