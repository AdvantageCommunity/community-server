import User from '../../models/users.js';
import {
  generateUniqueUsername,
  validUsername,
  validateEmail,
  isTokenExpired,
} from '../../utils/validations.js';
import { uploadToS3 } from '../../connections/aws.js';
import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcryptjs';
import Token from '../../models/token.js';
import sendMail from '../../utils/sendMail.js';
import crypto from 'crypto';
import { io } from '../../index.js';
export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  console.log(req.body);
  if (!username)
    return res.status(400).json({ message: 'Username is Required!' });
  const isValidUsername = validUsername(username);
  if (!isValidUsername)
    return res.status(400).json({ message: 'Provide Valid Username!' });
  try {
    const usernameExits = await User.findOne({ username: username });
    if (usernameExits) {
      return res.status(400).json({ message: 'Username Already Exits!' });
    }
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
    let newUser = new User({
      email,
      password,
      username,
    });
    newUser = await newUser.save();

    // const accessToken = await newUser.generateAuthToken();
    // res.cookie('userAccessToken', accessToken, {
    //   httpOnly: true,
    //   maxAge: 20 * 24 * 60 * 60 * 1000,
    // });
    const token = new Token({
      user: newUser._id.toString(),
      token: crypto.randomBytes(32).toString('hex'),
    });
    await token.save();
    const url = `${process.env.CLIENT_URL}/users/${newUser.username}/verify/${token.token}`;
    await sendMail(newUser.email, 'Verify Your Email!', url);
    return res.status(201).json({
      message: `An Email has been sent to your ${newUser.email}. Please Verify!`,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const verifyEmailLink = async (req, res) => {
  const { username, token } = req.params;
  if (!username)
    return res.status(400).json({ message: 'Provide username id.' });
  if (!token) return res.status(400).json({ message: 'Provide Token.' });
  try {
    const user = await User.findOne({ username }).select(
      'verified _id email username profilePhoto'
    );
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.verified)
      return res.status(400).json({ message: 'User already verified!' });

    const tokenExists = await Token.findOne({ user: user._id, token });
    if (!tokenExists)
      return res.status(400).json({ message: 'Invalid Token.' });
    user.verified = true;
    await user.save();
    await Token.deleteOne({ _id: tokenExists._id });
    const accessToken = await user.generateAuthToken();
    res.cookie('userAccessToken', accessToken, {
      httpOnly: true,
      maxAge: 20 * 24 * 60 * 60 * 1000,
    });
    res
      .status(200)
      .json({ message: 'Email Verified Successfullyy!', user, accessToken });
  } catch (error) {
    console.log('error in verifyEmailLink api : ' + error);
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
        'username email _id password verified isFirstLogin'
      );
    } else {
      userExist = await User.findOne({ username: identifier }).select(
        'username email _id password verified isFirstLogin'
      );
    }
    if (!userExist) return res.status(404).json({ message: 'User Not Found!' });

    const validPassword = bcrypt.compare(password, userExist.password);
    if (!validPassword)
      return res.status(401).json({ message: 'Incorrect Password!' });

    if (!userExist.verified) {
      let token = await Token.findOne({ user: userExist._id });

      if (!token) {
        token = new Token({
          user: userExist._id,
          token: crypto.randomBytes(32).toString('hex'),
        });
        await token.save();
        const url = `${process.env.CLIENT_URL}/users/${userExist.username}/verify/${token.token}`;
        await sendMail(userExist.email, 'Verify Your Email!', url);
        return res.status(201).json({
          message: `An Email has been sent to your ${userExist.email}. Please Verify!`,
        });
      } else {
        if (isTokenExpired(token)) {
          await Token.deleteOne({ _id: token._id });
          const token = new Token({
            user: userExist._id,
            token: crypto.randomBytes(32).toString('hex'),
          });
          await token.save();
          const url = `${process.env.CLIENT_URL}/users/${userExist.username}/verify/${token.token}`;
          await sendMail(userExist.email, 'Verify Your Email!', url);
          return res.status(201).json({
            message: 'An Email has been sent to your Email. Please Verify!',
          });
        }

        return res.status(400).json({
          message:
            'An Email has already been sent to your Email. Please Verify!',
        });
      }
    }
    if (userExist.isFirstLogin) {
      userExist.isFirstLogin = false;
      await userExist.save();
    }
    const accessToken = await userExist.generateAuthToken();
    res.cookie('userAccessToken', accessToken, {
      httpOnly: true,
      maxAge: 20 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({
      message: 'Login Sucessfull',
      accessToken: accessToken,
      isFirstLogin: userExist.isFirstLogin,
      user: {
        username: userExist.username,
        _id: userExist._id,
        email: userExist.email,
        verified: userExist.verified,
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

  let profilePhoto = req.file;

  const allowedUpdates = [
    'firstName',
    'lastName',
    'countryCode',
    'phoneNumber',
    'gender',
    'bio',
    'interests',
    'dateOfBirth',
  ];
  let profilePhotoResult;
  const requestedUpdates = Object.keys(updates);

  if (requestedUpdates.length <= 0)
    return res
      .status(400)
      .json({ message: 'Provide atleast one value to update.' });
  const isValidUpdate = requestedUpdates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidUpdate)
    return res.status(400).json({ message: 'Provide Valid Updates!' });
  if (profilePhoto) {
    const format = profilePhoto.originalname.split('.').pop().toLowerCase();

    if (!format) {
      return res
        .status(400)
        .json({ message: 'Could not determine image format' });
    }
    profilePhotoResult = await uploadToS3(
      profilePhoto.buffer,
      `profile/${Date.now().toString()}.${format}`
    );
  }
  try {
    if (requestedUpdates.includes('username')) {
      const usernameExits = await User.findOne({ username: req.body.username });
      if (
        usernameExits &&
        usernameExits._id?.toString() !== req.rootUser._id?.toString()
      )
        return res.status(400).json({ message: 'Username Already Exists!' });
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...updates,
        phone: {
          phoneNumber: req.body.phoneNumber,
        },
        profilePhoto: profilePhotoResult?.Location,
      },
      {
        new: true, // This option returns the updated user document
        runValidators: true, // This option runs the validators defined in the userSchema for the updates
      }
    );
    if (updatedUser)
      res.status(200).json({ success: true, message: 'User Updated!' });
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
      '_id email username isFirstLogin'
    );
    if (userExists) {
      if (userExists.isFirstLogin) {
        userExists.isFirstLogin = false;
        await userExists.save();
      }
      res.cookie('userAcessToken', tokenId, {
        httpOnly: true,
        maxAge: 20 * 24 * 60 * 60 * 1000,
      });
      res.status(200).json({
        message: 'Login Successful!',
        token: tokenId,
        user: userExists,
        isFirstLogin: userExists.isFirstLogin,
      });
    } else {
      const password = email + Date.now().toString();
      const username = await generateUniqueUsername(email);

      const newUser = new User({
        email,
        password,
        username,
        verified: true,
        isFirstLogin: true,
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
        isFirstLogin: newUser.isFirstLogin,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const validUser = async (req, res) => {
  try {
    let validUser = await User.findOne({ _id: req.rootUser._id })

      .populate({
        path: 'favorites.blogs',
        model: 'Blog',
        select: 'title author content coverImage createdAt slug read',
        populate: {
          path: 'author', // Specify the path to the author field in the Blog model
          model: 'User', // Assuming 'User' is the model for authors
          select: 'username profilePhoto', // Select the fields you want from the author
        },
      })
      .populate({
        path: 'favorites.events',
        model: 'Event',
        select: 'title organizer description imageUrl',
      });

    validUser.favorites.blogs.forEach((blog) => {
      if (blog && blog.content && blog.content.length > 80) {
        blog.content = blog.content.slice(0, 150);
      }
    });
    if (!validUser) res.json({ message: 'User is not valid' });
    res.status(201).json({
      user: validUser,
      accessToken: req.accessToken,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
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
export const followUser = async (req, res) => {
  const { userId } = req.params;
  const activeUserId = req.rootUser._id;
  if (!userId) return res.status(400).json({ message: 'Provide User Id.' });
  try {
    const userToFollow = await User.findOne({ _id: userId });
    if (!userToFollow)
      return res.status(404).json({ message: 'User Not Found.' });

    if (!req.rootUser.followings.includes(userId)) {
      req.rootUser.followings.push(userId);
      userToFollow.followers.push(activeUserId);
      await req.rootUser.save();
      await userToFollow.save();
      const notification = {
        message: `${req.rootUser.username} followed you`,
        actionType: 'follow',
        timestamp: new Date(),
        isRead: false,
      };
      userToFollow.notifications.push(notification);
      await userToFollow.save();
      io.to(userToFollow._id).emit('notification', notification);

      res.status(200).json({
        success: 'User followed successfully',
        followings: req.rootUser.followings,
      });
    } else {
      res.status(400).json({ message: 'You already follow this user.' });
    }
  } catch (error) {
    console.log('error in follow user api');
    res.status(500).json({ message: error.message });
  }
};
export const unFollowUser = async (req, res) => {
  const { userId } = req.params;
  const activeUserId = req.rootUser._id;
  if (!userId) return res.status(400).json({ message: 'Provide User Id.' });
  try {
    const userToUnfollow = await User.findOne({ _id: userId });
    if (!userToUnfollow)
      return res.status(404).json({ message: 'User Not Found.' });

    if (req.rootUser.followings.includes(userId)) {
      req.rootUser.followings = req.rootUser.followings.filter(
        (id) => id.toString() !== userId
      );
      userToUnfollow.followers = userToUnfollow.followers.filter(
        (id) => id.toString() !== activeUserId.toString()
      );

      await req.rootUser.save();
      await userToUnfollow.save();

      res.status(200).json({
        success: 'User unfollowed successfully',
        followings: req.rootUser.followings,
      });
    } else {
      res.status(400).json({ message: 'Your not following this user' });
    }
  } catch (error) {
    console.log('error in unfollow user api');
    res.status(500).json({ message: error.message });
  }
};
export const getUserFollowings = async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ message: 'Provide user id' });
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    const followings = user.followings;
    res.status(200).json({ followings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getUserFollowers = async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ message: 'Provide user id' });
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    const followers = user.followers;
    res.status(200).json({ followers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const userFavorites = async (req, res) => {
  try {
    const { favorites } = await User.findOne({ _id: req.rootUser._id })
      .populate('favorites.blogs')
      .populate('favorites.events');
    res.status(200).json({ favorites });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
