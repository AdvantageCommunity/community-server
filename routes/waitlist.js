import express from 'express';
import { validateEmail, validateSocials } from '../utils/validations.js';
import Community from '../models/community.js';
import User from '../models/users.js';
const router = express.Router();

router.post('/user', async (req, res) => {
  const { firstName, lastName, email } = req.body;
  if (!firstName)
    return res.status(400).json({ message: 'Provide First Name.' });
  if (!lastName) return res.status(400).json({ message: 'Provide Last Name.' });
  if (!email)
    return res.status(400).json({ message: 'Provide Email Address.' });
  const emailValid = validateEmail(email);
  if (!emailValid)
    res.status(400).json({ message: 'Provide Valid Email Address.' });
  const emailExists = await User.findOne({ email });
  if (emailExists)
    return res.status(400).json({ message: 'Already in Waitlist.' });
  try {
    const newUser = new User({
      lastName,
      firstName,
      email,
    });
    await newUser.save();
    if (!newUser)
      return res
        .status(400)
        .json({ message: 'Something Went Wrong.Try Again!' });
    return res.status(201).json({ message: 'Successfully Joined!' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
router.post('/community', async (req, res) => {
  const { name, email, socials, leadName, leadPhoneNumber } = req.body;
  if (!name)
    return res.status(400).json({ message: 'Provide Community Name.' });
  if (!email)
    return res.status(400).json({ message: 'Provide Email Address.' });
  const validEmail = validateEmail(email);
  if (!validEmail) return res.status(400).json({ message: 'Invalid Email.' });
  const emailExists = await Community.findOne({ email });
  if (emailExists)
    return res.status(400).json({ message: 'Already in Waitlist.' });
  if (!leadName)
    return res.status(400).json({ message: 'Provide Community Lead Name.' });

  if (!leadPhoneNumber)
    return res
      .status(400)
      .json({ message: 'Provide Community Lead Contact Number.' });
  if (leadPhoneNumber.length < 10)
    return res.status(400).json({ message: 'Provide Valid Phone Number!' });
  if (!socials)
    return res
      .status(400)
      .json({ message: 'Provide Atleast on Social Account.' });
  const validSocials = validateSocials(socials);
  if (!validSocials)
    return res.status(400).json({ message: 'Invalid Socials.' });

  try {
    const newCommunity = new Community({
      name,
      email,
      lead: {
        name: leadName,
        phoneNumber: leadPhoneNumber,
      },
      socials,
    });
    await newCommunity.save();
    if (!newCommunity)
      return res
        .status(400)
        .json({ message: 'Something Went Wrong.Try Again!' });
    return res.status(201).json({ message: 'Successfully Joined!' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
export default router;
