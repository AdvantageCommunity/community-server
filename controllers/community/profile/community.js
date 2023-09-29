import { uploadToS3 } from '../../../connections/aws.js';
import { io } from '../../../index.js';
import Community from '../../../models/community.js';
import User from '../../../models/users.js';
import { isValidContacts } from '../../../utils/validations.js';

export const registerCommunity = async (req, res) => {
  let { name, description, contacts, tags } = req.body;
  if (req.rootUser.communities.length > 0)
    return res.status(401).json({ message: 'Only 1 community per user.' });
  const logo = req.files
    ? req.files['logo']
      ? req.files['logo'][0]
      : null
    : null;
  if (!name)
    return res.status(400).json({ message: 'Provide community name.' });
  if (!description)
    return res.status(400).json({ message: 'Provide community description.' });
  contacts = Array.isArray(contacts) ? tags : JSON.parse(contacts || '[]');
  const validContacts = isValidContacts(contacts);
  if (!validContacts)
    return res.status(400).json({ message: 'Invalid Contacts.' });
  if (!logo)
    return res.status(400).json({ message: 'Provide community logo.' });
  if (tags) {
    tags = Array.isArray(tags) ? tags : JSON.parse(tags || '[]');
  }
  try {
    const format = logo.originalname.split('.').pop().toLowerCase();

    if (!format) {
      return res
        .status(400)
        .json({ message: 'Could not determine image format' });
    }
    const logoResult = await uploadToS3(
      logo.buffer,
      `community/${Date.now().toString()}.${format}`
    );

    const community = new Community({
      name,
      description,
      logo: logoResult?.Location,
      contacts,
      admins: [req.rootUser._id],
      tags,
      members: [req.rootUser._id],
    });
    await community.save();
    req.rootUser.communities.push({
      community: community._id,
      role: 'admin',
    });
    await req.rootUser.save();
    res
      .status(201)
      .json({ message: 'Community creation request submitted successfully.' });
  } catch (error) {
    console.error('Error in Community Creation Request API:', error);
    res.status(500).json({ message: error.message });
  }
};
export const updateCommunityDetails = async (req, res) => {
  const { communityId } = req.params;
  let updates = req.body;
  let logoResult, coverImageResult;
  if (!communityId)
    return res.status(400).json({ message: 'Provide community id.' });
  const logo = req.files
    ? req.files['logo']
      ? req.files['logo'][0]
      : null
    : null;
  const coverImage = req.files
    ? req.files['coverImage']
      ? req.files['coverImage'][0]
      : null
    : null;

  try {
    const community = await Community.findOne({
      _id: communityId,
      status: 'active',
      admins: {
        $elemMatch: {
          $eq: req.rootUser._id,
        },
      },
    });

    if (!community)
      return res.status(404).json({ message: 'Community not found.' });

    logoResult = community.logo;
    coverImageResult = community.coverImage;
    const requestedUpdates = Object.keys(updates);
    if (requestedUpdates.length <= 0 && !coverImage && !logo)
      return res
        .status(400)
        .json({ message: 'Provide atleast one value to update.' });
    const allowedUpdates = ['name', 'description', 'contacts', 'tags'];

    if (logo !== null) {
      const logoFormat = logo.originalname.split('.').pop().toLowerCase();
      if (!logoFormat) {
        return res
          .status(400)
          .json({ message: 'Could not determine logo image format' });
      }
      const result = await uploadToS3(
        logo.buffer,
        `community/${Date.now().toString()}.${logoFormat}`
      );
      logoResult = result.Location;
    }

    if (coverImage !== null) {
      const coverImageFormat = coverImage.originalname
        .split('.')
        .pop()
        .toLowerCase();
      if (!coverImageFormat) {
        return res
          .status(400)
          .json({ message: 'Could not determine cover image format' });
      }
      const result = await uploadToS3(
        coverImage.buffer,
        `community/${Date.now().toString()}.${coverImageFormat}`
      );
      coverImageResult = result.Location;
    }
    const isValidUpdate = requestedUpdates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidUpdate)
      return res.status(400).json({ message: 'Provide Valid Updates!' });
    if (requestedUpdates.includes('tags')) {
      updates.tags = Array.isArray(updates.tags)
        ? tags
        : JSON.parse(updates.tags || '[]');
    }
    const updatedCommunity = await Community.findByIdAndUpdate(communityId, {
      ...updates,
      logo: logoResult,
      coverImage: coverImageResult,
    });
    if (!updatedCommunity)
      return res
        .status(400)
        .json({ message: 'Something went wrong when updating.' });
    res.status(201).json({ message: 'Community Detials updated.' });
  } catch (error) {
    console.error('Error in Community updation Request API:', error);
    res.status(500).json({ message: error.message });
  }
};
export const deleteCommunity = async (req, res) => {
  const { communityId } = req.params;
  if (!communityId)
    return res.status(400).json({ message: 'Provide community id.' });
  try {
    const deletedCommunity = await Community.findOneAndDelete({
      _id: communityIdToDelete,
      admins: {
        $elemMatch: {
          $eq: req.rootUser._id,
        },
      },
    });

    if (!deletedCommunity) {
      return res.status(404).json({ message: 'Community not found.' });
    } else {
      res.status(200).json({ message: 'Community Deleted.' });
    }
  } catch (error) {
    console.error('Error in deleteCommunity API:', error);
    res.status(500).json({ message: error.message });
  }
};
export const addCommunityAdmin = async (req, res) => {
  const { communityId } = req.params;
  const { userId } = req.body;
  if (!communityId)
    return res.status(400).json({ message: 'Provide community id.' });
  if (!userId) return res.status(400).json({ message: 'Provide user id.' });

  try {
    const community = await Community.findOne({
      _id: communityId,
      admins: {
        $elemMatch: {
          $eq: req.rootUser._id,
        },
      },
      status: 'active',
    });
    if (!community)
      return res.status(404).json({ message: 'Community not found.' });
    const userExists = await User.findById(userId);
    if (!userExists)
      return res.status(404).json({ message: 'User not exists.' });
    if (community.admins.includes(userExists._id))
      return res.status(400).json({ message: 'User is already admin.' });
    if (!community.members.includes(userExists._id)) {
      community.members.push(userExists._id);
    }
    community.admins.push(userExists._id);
    await community.save();
    res.status(201).json({ message: 'Admin added successfully.' });
  } catch (error) {
    console.error('Error in addCommuniytAdmin API:', error);
    res.status(500).json({ message: error.message });
  }
};
export const removeCommunityAdmin = async (req, res) => {
  const { communityId, adminId } = req.params;
  if (!communityId)
    return res.status(400).json({ message: 'Provide community id.' });
  if (!adminId) return res.status(400).json({ message: 'Provide admin id.' });
  try {
    const community = await Community.findOne({
      _id: communityId,
      admins: {
        $elemMatch: {
          $eq: req.rootUser._id,
        },
      },
      status: 'active',
    });
    if (!community)
      return res.status(404).json({ message: 'Community not found.' });

    if (req.rootUser._id.toString() === adminId) {
      return res.status(200).json({
        message: 'You are attempting to remove yourself as an admin.',
      });
    }
    const adminIndex = community.admins.findIndex(
      (admin) => admin.toString() === adminId
    );

    if (adminIndex === -1)
      return res
        .status(404)
        .json({ message: 'Admin not found in the community.' });
    community.admins.splice(adminIndex, 1);
    await community.save();
    return res.status(200).json({ message: 'Admin removed successfully.' });
  } catch (error) {
    console.error('Error in removeCommunityAdmin API:', error);
    res.status(500).json({ message: error.message });
  }
};

export const communityAdmins = async (req, res) => {
  const { communityId } = req.params;
  if (!communityId)
    return res.status(400).json({ message: 'Provide community id.' });
  try {
    const community = await Community.findById(communityId).populate(
      'admins',
      'username firstName lastName email profilePhoto'
    );
    if (!community)
      return res.status(404).json({ message: 'Community not found.' });
    res.status(200).json({ admins: community.admins });
  } catch (error) {
    console.error('Error in communityAdmins API:', error);
    res.status(500).json({ message: error.message });
  }
};
export const removeCommunityMember = async (req, res) => {
  const { communityId, memberId } = req.params;
  if (req.rootUser._id.toString() === memberId.toString())
    return res
      .status(400)
      .json({ message: 'You are attempting to remove yourself.' });
  if (!communityId)
    return res.status(400).json({ message: 'Provide community id.' });
  if (!memberId) return res.status(400).json({ message: 'Provide member id.' });
  try {
    const community = await Community.findOne({
      _id: communityId,
      status: 'active',
    });
    if (!community)
      return res.status(404).json({ message: 'Community not found.' });
    if (!community.admins.includes(req.rootUser._id))
      return res
        .status(403)
        .json({ message: 'Only admins can remove members.' });
    const userIndex = community.members.findIndex(
      (member) => member.toString() === memberId.toString()
    );

    if (userIndex === -1) {
      return res.status(400).json({
        message: 'User is not a member of the community. No action taken.',
      });
    }

    community.members.splice(userIndex, 1);
    await community.save();
    const user = await User.findById(memberId);
    if (user) {
      user.communities = user.communities.filter(
        (community) => community.community.toString() !== communityId.toString()
      );
      await user.save();
    }
    return res
      .status(200)
      .json({ message: 'Member has been removed from the community.' });
  } catch (error) {
    console.error('Error in removeCommunityMember API:', error);
    res.status(500).json({ message: error.message });
  }
};
export const viewCommunityMembers = async (req, res) => {
  const { communityId } = req.params;
  if (!communityId)
    return res.status(400).json({ message: 'Provide community id.' });
  try {
    const community = await Community.findOne({
      _id: communityId,
      status: 'active',
    }).populate('members', 'firstName lastName email profilePhoto');
    res.status(200).json({ members: community.members });
  } catch (error) {
    console.error('Error in viewCommunityMembers API:', error);
    res.status(500).json({ message: error.message });
  }
};
export const joinCommunity = async (req, res) => {
  const { communityId } = req.params;
  if (!communityId)
    return res.status(400).json({ message: 'Provide community id.' });
  try {
    const community = await Community.findOne({
      _id: communityId,
      // status: 'active',
    }).populate('admins');
    if (!community)
      return res.status(404).json({ message: 'Community not found.' });
    if (community.members.includes(req.rootUser._id)) {
      return res
        .status(400)
        .json({ message: 'User is already a member of the community.' });
    }
    community.members.push(req.rootUser._id);

    req.rootUser.communities.push({
      community: community._id,
    });
    await community.save();
    await req.rootUser.save();
    let notification = {
      message: `${req.rootUser.username} has joined community`,
      actionType: 'joined',
      isRead: false,
    };

    community.admins.forEach(async (admin) => {
      admin.notifications.push(notification);
      await admin.save();
      io.to(admin._id).emit('notification', notification);
    });
    res.status(200).json({
      message: 'User has joined the community successfully.',
      success: true,
    });
  } catch (error) {
    console.error('Error in joinCommunity API:', error);
    res.status(500).json({ message: error.message });
  }
};
export const leaveCommunity = async (req, res) => {
  const { communityId } = req.params;
  if (!communityId)
    return res.status(400).json({ message: 'Provide community id.' });
  try {
    const community = await Community.findOne({
      _id: communityId,
      status: 'active',
    }).populate('admins');
    if (!community)
      return res.status(404).json({ message: 'Community not found.' });
    if (!community.members.includes(req.rootUser._id))
      return res
        .status(400)
        .json({ message: 'User is not a member of the community.' });
    community.members = community.members.filter(
      (member) => member.toString() !== req.rootUser._id.toString()
    );
    req.rootUser.communities = req.rootUser.communities.filter(
      (com) => com.community.toString() !== communityId.toString()
    );
    await community.save();
    await req.rootUser.save();
    let notification = {
      message: `${req.rootUser.username} has left community`,
      actionType: 'left',
      isRead: false,
    };

    community.admins.forEach(async (admin) => {
      admin.notifications.push(notification);
      await admin.save();
      io.to(admin._id).emit('notification', notification);
    });
    return res
      .status(200)
      .json({ message: 'User has left the community successfully.' });
  } catch (error) {
    console.error('Error in leaveCommunity API:', error);
    res.status(500).json({ message: error.message });
  }
};
