import Community from '../../models/community.js';

export const allCommunities = async (req, res) => {
  try {
    const communities = await Community.find({
      status: 'active',
    }).sort({ createdAt: -1 });
    res.status(200).json({ communities });
  } catch (error) {
    console.log('Error in all communities api : ' + error);

    res.status(500).json({ message: error.message });
  }
};
export const communitybyId = async (req, res) => {
  const { communityId } = req.params;
  if (!communityId) res.status(404).json({ message: 'Provide community id.' });
  try {
    const community = await Community.findOne({
      _id: communityId,
      status: 'active',
    });
    res.status(200).json({ community });
  } catch (error) {
    console.log('Error in community by id api : ' + error);

    res.status(500).json({ message: error.message });
  }
};
export const searchCommunity = async (req, res) => {
  const { search } = req.query;
  try {
    const communities = await Community.find({
      status: 'active',
      $or: [
        { name: { $regex: new RegExp(search, 'i') } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ],
    }).sort({ createdAt: -1 });
    res.status(200).json({ communities });
  } catch (error) {
    console.log('Error in seach communities api : ' + error);
    res.status(500).json({ message: error.message });
  }
};
