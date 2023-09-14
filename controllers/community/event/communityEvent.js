import Event from '../../../models/event.js';
import { uploadToS3 } from '../../../connections/aws.js';
export const postCommunityEvent = async (req, res) => {
  const {
    title,
    description,
    venue,
    eventType,
    date,
    registrationDeadline,
    tags,
    eventWebsiteUrl,
  } = req.body;
  const { communityId } = req.params;
  const eventBanner = req.file;
  if (!title) return res.status(400).json({ message: 'Provide title.' });
  if (!description)
    return res.status(400).json({ message: 'Provide description.' });
  if (!venue) return res.status(400).json({ message: 'Provide event venue.' });
  if (!eventType)
    return res
      .status(400)
      .json({ message: 'Provide event type i.e offline or online.' });
  if (!date) return res.status(400).json({ message: 'Provide date.' });
  if (!eventWebsiteUrl)
    return res.status(400).json({ message: 'Provide event Website url.' });
  if (!registrationDeadline)
    return res.status(400).json({ message: 'Provide registration deadline.' });
  const parsedTags = Array.isArray(tags) ? tags : JSON.parse(tags || '[]');
  if (!eventBanner)
    return res.status(400).json({ message: 'Provide Event banner photo.' });
  try {
    const format = eventBanner.originalname.split('.').pop().toLowerCase();

    if (!format) {
      return res
        .status(400)
        .json({ message: 'Could not determine image format' });
    }
    const result = await uploadToS3(
      eventBanner.buffer,
      `community/event/${Date.now().toString()}.${format}`
    );
    const event = new Event({
      title,
      description,
      venue,
      eventType,
      date,
      registrationDeadline,
      organizer: communityId,
      tags: parsedTags,
      imageUrl: result.Location,
      eventWebsiteUrl,
    });
    const savedEvent = await event.save();
    res
      .status(201)
      .json({ message: 'Event added successfully', event: savedEvent });
  } catch (error) {
    console.error('Error adding event:', error);
    res.status(500).json({ message: error.message });
  }
};
export const updateCommunityEvent = async (req, res) => {};
export const deleteCommunityEvent = async (req, res) => {};
