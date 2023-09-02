import User from '../models/users.js';
import { validUsername, validateEmail } from '../utils/validations.js';
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
      maxAge: 60 * 24 * 60 * 60 * 1000,
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
    console.log(password, userExist.password);
    const validPassword = await bcrypt.compare(password, userExist.password);
    if (!validPassword)
      return res.status(401).json({ message: 'Incorrect Password!' });
    const accessToken = await userExist.generateAuthToken();
    res.cookie('userAccessToken', accessToken, {
      httpOnly: true,
      maxAge: 60 * 24 * 60 * 60 * 1000,
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
