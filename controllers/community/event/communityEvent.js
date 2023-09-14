import Event from '../../../models/event.js';
import slugify from 'slugify';
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
  const slug = slugify(title, { lower: true });

  try {
    const slugAlreadyExists = await Event.findOne({ slug });
    if (slugAlreadyExists)
      return res.status(400).json({ message: 'Try Modifying your title!' });
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
      slug,
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
export const updateCommunityEvent = async (req, res) => {
  let { slug, communityId } = req.params;
  const updates = req.body;
  if (!slug) return res.status(400).json({ message: 'Provide event slug.' });
  const eventBanner = req.file;
  let eventBannerResult;
  try {
    const event = await Event.findOne({ slug, organizer: communityId });
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    const allowedUpdates = [
      'title',
      'description',
      'tags',
      'venue',
      'eventType',
      'date',
      'registrationDeadline',
      'eventWebsiteUrl',
    ];
    const requestedUpdates = Object.keys(updates);
    const isValidUpdate = requestedUpdates.every((update) =>
      allowedUpdates.includes(update)
    );
    if (!isValidUpdate)
      return res.status(400).json({ message: 'Provide Valid Updates!' });
    if (requestedUpdates.includes('title')) {
      slug = slugify(req.body.title, { lower: true });
    }
    if (eventBanner) {
      console.log('event updating');
      const format = eventBanner.originalname.split('.').pop().toLowerCase();
      if (!format) {
        return res
          .status(400)
          .json({ message: 'Could not determine image format' });
      }
      const documentResult = await uploadToS3(
        eventBanner.buffer,
        `community/event/${Date.now().toString()}.${format}`
      );
      eventBannerResult = documentResult.Location;
    }
    const updatedEvent = await Event.findByIdAndUpdate(
      event._id,
      { ...updates, slug, imageUrl: eventBannerResult },
      {
        new: true, // This option returns the updated user document
        runValidators: true, // This option runs the validators defined in the userSchema for the updates
      }
    );
    if (!updatedEvent)
      return res.status(400).json({ message: 'Unable to Update the Event!' });
    return res.status(201).json({ message: 'Event Updated!' });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: error.message });
  }
};
export const deleteCommunityEvent = async (req, res) => {
  const { slug, communityId } = req.params;
  try {
    const event = await Event.findOne({
      slug,
      organizer: communityId,
    });
    if (!event) return res.status(404).json({ message: 'Event Not Found!' });
    const deletedEvent = await Event.findByIdAndDelete(event._id);
    if (!deletedEvent)
      return res
        .status(400)
        .json({ message: 'Something Went Wrong. Try Again!' });
    return res.status(200).json({ message: 'Event deleted successfully.' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: error.message });
  }
};
