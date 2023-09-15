import communityRoom from '../../../models/chat/communityRoom.js';
import { uploadToS3 } from '../../../connections/aws.js';
export const createCommunityRoom = async (req, res) => {
  const { name, description } = req.body;
  const { communityId } = req.params;
  const photo = req.file;
  if (!name) return res.status(400).json({ message: 'Provide Room name.' });
  if (!description)
    return res.status(400).json({ message: 'Provide Room description.' });
  if (!photo) return res.status(400).json({ message: 'Provide Room Photo.' });
  try {
    const format = photo.originalname.split('.').pop().toLowerCase();

    if (!format) {
      return res
        .status(400)
        .json({ message: 'Could not determine image format' });
    }
    const result = await uploadToS3(
      photo.buffer,
      `community/${Date.now().toString()}.${format}`
    );
    let room = new communityRoom({
      name,
      description,
      photo: result.Location,
      community: communityId,
    });

    room = await room.save();
    req.community.rooms.push(room._id);
    await req.community.save();
    res.status(201).json({ message: 'Room created.', room });
  } catch (error) {
    console.error('Error in creating room:', error);
    return res.status(500).json({ message: error.message });
  }
};
export const updateCommunityRoom = async (req, res) => {
  const { roomId } = req.params;
  const photo = req.file;
  let photoUrl;
  if (!roomId) return res.status(400).json({ message: 'Provide Room id.' });
  try {
    const room = await communityRoom.findOne({ _id: roomId });
    if (!room) return res.status(404).json({ message: 'Room not found.' });

    const updates = req.body;
    const allowedUpdates = ['name', 'description'];
    const requestedUpdates = Object.keys(updates);
    const isValidUpdate = requestedUpdates.every((update) =>
      allowedUpdates.includes(update)
    );
    if (!isValidUpdate)
      return res.status(400).json({ message: 'Provide Valid Updates!' });

    if (photo) {
      const format = photo.originalname.split('.').pop().toLowerCase();

      if (!format) {
        return res
          .status(400)
          .json({ message: 'Could not determine image format' });
      }
      const result = await uploadToS3(
        photo.buffer,
        `community/${Date.now().toString()}.${format}`
      );
      photoUrl = result.Location;
    }
    const updatedRoom = await communityRoom.findByIdAndUpdate(
      roomId,
      { ...updates, photo: photoUrl },
      {
        new: true, // This option returns the updated user document
        runValidators: true, // This option runs the validators defined in the userSchema for the updates
      }
    );
    if (!updatedRoom)
      return res.status(400).json({ message: 'Unable to Update the Room!' });
    return res.status(201).json({ message: 'Room Updated!' });
  } catch (error) {
    console.error('Error in updating room:', error);
    return res.status(500).json({ message: error.message });
  }
};
export const deleteCommunityRoom = async (req, res) => {
  const { roomId } = req.params;
  if (!roomId) return res.status(400).json({ message: 'Provide Room id.' });
  try {
    const room = await communityRoom.findOne({ _id: roomId });
    if (!room) return res.status(404).json({ message: 'Room not found.' });
    await communityRoom.deleteOne({ _id: roomId });
    req.community.rooms = req.community.rooms.filter(
      (room) => room.toString() !== room._id.toString()
    );
    await req.community.save();
    res.status(200).json({ message: 'Room Deleted.' });
  } catch (error) {
    console.error('Error in deleting room:', error);
    return res.status(500).json({ message: error.message });
  }
};
export const getCommunityRooms = async (req, res) => {
  const { communityId } = req.params;
  try {
    const rooms = await communityRoom
      .find({ community: communityId })
      .populate('community', 'name logo descriptio members')
      .populate('participants', 'firstName lastName username profilePhoto');
    res.status(200).json({ rooms });
  } catch (error) {
    console.error('Error in getCommunityRooms:', error);
    return res.status(500).json({ message: error.message });
  }
};
export const getCommunityRoomById = async (req, res) => {
  const { communityId, roomId } = req.params;
  if (!roomId) return res.status(400).json({ message: 'Provide Room id.' });
  try {
    const room = await communityRoom
      .findOne({
        community: communityId,
        _id: roomId,
      })
      .populate('community', 'name logo descriptio members')
      .populate('participants', 'firstName lastName username profilePhoto');
    res.status(200).json({ room });
  } catch (error) {
    console.error('Error in getCommunityRoomById:', error);
    return res.status(500).json({ message: error.message });
  }
};
