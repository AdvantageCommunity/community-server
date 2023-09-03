import User from '../../models/users.js';
import {
  generateUniqueUsername,
  validUsername,
  validateEmail,
} from '../../utils/validations.js';
import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcryptjs';
export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username)
    return res.status(400).json({ message: 'Username is Required!' });
  const isValidUsername = validUsername(username);
  if (!isValidUsername)
    return res.status(400).json({ message: 'Provide Valid Username!' });
  const usernameExits = await User.findOne({ username });
  if (usernameExits)
    return res.status(400).json({ message: 'Username Already Exits!' });
  if (!email) return res.status(400).json({ message: 'Email is Required!' });
  const isValidEmail = validateEmail(email);
  if (!isValidEmail)
    return res.status(400).json({ message: 'Provide Valid Email!' });
  const emailExist = await User.findOne({ email });
  if (emailExist)
    return res.status(400).json({ message: 'Email Already Exists!' });
  if (!password && password.length < 8)
    return res
      .status(400)
      .json({ message: 'Password should be more than 8 characters!' });
  try {
    const newUser = new User({
      email,
      password,
      username,
    });
    const accessToken = await newUser.generateAuthToken();
    res.cookie('userAccessToken', accessToken, {
      httpOnly: true,
      maxAge: 20 * 24 * 60 * 60 * 1000,
    });
    await newUser.save();
    return res
      .status(201)
      .json({ message: 'User Registered Successfully!', token: accessToken });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const loginUser = async (req, res) => {
  const { identifier, password } = req.body;
  if (!password || password.length < 8)
    return res.status(400).json({ message: 'Provide Valid Password!' });
  if (!identifier)
    return res
      .status(400)
      .json({ message: 'Provide Identifier i.e Email or Password!' });
  let userExist;
  try {
    const isEmail = validateEmail(identifier);
    if (isEmail) {
      userExist = await User.findOne({ email: identifier }).select(
        'username email _id password'
      );
    } else {
      userExist = await User.findOne({ username: identifier }).select(
        'username email _id password'
      );
    }
    if (!userExist) return res.status(404).json({ message: 'User Not Found!' });

    const validPassword = await bcrypt.compare(password, userExist.password);
    if (!validPassword)
      return res.status(401).json({ message: 'Incorrect Password!' });
    const accessToken = await userExist.generateAuthToken();
    res.cookie('userAccessToken', accessToken, {
      httpOnly: true,
      maxAge: 20 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({
      message: 'Login Sucessfull',
      accessToken: accessToken,
      user: {
        username: userExist.username,
        userId: userExist._id,
        email: userExist.email,
      },
    });
  } catch (error) {
    console.log('Error in Login API : ' + error.message);
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  const userId = req.rootUser?._id;
  if (!userId) return res.status(401).json({ message: 'User Not Authorized!' });
  const updates = req.body;

  const allowedUpdates = [
    'username',
    'firstName',
    'lastName',
    'countryCode',
    'phoneNumber',
    'gender',
    'bio',
    'intrests',
  ];
  const requestedUpdates = Object.keys(updates);

  const isValidUpdate = requestedUpdates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidUpdate)
    return res.status(400).json({ message: 'Provide Valid Updates!' });

  try {
    if (requestedUpdates.includes('username')) {
      const usernameExits = await User.findOne({ username: req.body.username });

      if (
        usernameExits &&
        usernameExits._id?.toString() !== req.rootUser._id?.toString()
      )
        return res.status(400).json({ message: 'Username Already Exists!' });
    }
    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true, // This option returns the updated user document
      runValidators: true, // This option runs the validators defined in the userSchema for the updates
    });
    if (updatedUser) return res.status(201).json({ message: 'User Updated!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const googleAuth = async (req, res) => {
  const { tokenId } = req.body;
  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const verify = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email_verified, email } = verify.getPayload();

    if (!email_verified)
      return res.status(400).json({ message: 'Email Not Verfied!' });
    const userExists = await User.findOne({ email }).select(
      '_id email username'
    );
    if (userExists) {
      res.cookie('userAcessToken', tokenId, {
        httpOnly: true,
        maxAge: 20 * 24 * 60 * 60 * 1000,
      });
      res.status(200).json({
        message: 'Login Successful!',
        token: tokenId,
        user: userExists,
      });
    } else {
      const password = email + Date.now().toString();
      const username = await generateUniqueUsername(email);

      const newUser = new User({
        email,
        password,
        username,
      });
      await newUser.save();
      res.cookie('userAcessToken', tokenId, {
        httpOnly: true,
        maxAge: 20 * 24 * 60 * 60 * 1000,
      });
      res.status(201).json({
        message: 'Registration Successful!',
        token: tokenId,
        user: userExists,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getActiveUserInfo = async (req, res) => {
  const userId = req.rootUser?._id;
  if (!userId) return res.status(401).json({ message: 'User Not Authorized!' });
  try {
    const userDetails = await User.findOne({ _id: userId })
      .populate({
        path: 'communities',
        model: 'Community',
        select: 'name',
      })
      .select('-password');
    res.status(200).json({ UserDetails: userDetails });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const logoutUser = async (req, res) => {
  // Instruct the client to remove the JWT token cookie
  res.clearCookie('userAccessToken', {
    httpOnly: true, // Ensure the cookie is accessible only through HTTP
    secure: true, // Requires HTTPS to transmit the cookie
    sameSite: 'strict', // Helps prevent cross-site request forgery (CSRF) attacks
  });

  res.status(201).json({ message: 'Logout successful' });
};
