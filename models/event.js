import mongoose from 'mongoose';
const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    venue: {
      type: String,
      required: true,
      trim: true,
    },
    eventType: {
      type: String,
      enum: ['online', 'offline'],
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },

    registrationDeadline: {
      type: Date,
      required: true,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    tags: [String],
    imageUrl: String,
    eventWebsiteUrl: String,
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model('Event', eventSchema);

export default Event;
