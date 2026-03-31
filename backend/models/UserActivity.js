const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  activity: {
    type: String,
    enum: ['photography', 'drone-piloting', 'outdoor-painting', 'gardening', 'cycling'],
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  successScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  weatherConditions: {
    temperature: Number,
    humidity: Number,
    windSpeed: Number,
    precipitation: Number,
    visibility: Number,
    cloudCover: Number,
    uvIndex: Number,
    pressure: Number
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String
  }
});

userActivitySchema.index({ userId: 1, timestamp: -1 });
userActivitySchema.index({ activity: 1, location: '2dsphere' });

module.exports = mongoose.model('UserActivity', userActivitySchema);
