import jwt from 'jsonwebtoken';
import User from '../models/users.js';
export const isUserAuthenticated = async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    return res.status(401).json({ message: 'Not Authorized! Login first' });
  }
  let accessToken = authorizationHeader.split(' ')[1];
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
