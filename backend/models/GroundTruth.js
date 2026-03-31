const mongoose = require('mongoose');

const groundTruthSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      index: '2dsphere'
    }
  },
  areaCode: {
    type: String,
    required: true,
    index: true
  },
  reportType: {
    type: String,
    enum: ['drier', 'wetter', 'windier', 'calmer', 'storm', 'clear'],
    required: true
  },
  actualWeather: {
    temperature: Number,
    humidity: Number,
    windSpeed: Number,
    precipitation: Boolean,
    visibility: Number,
    cloudCover: Number
  },
  predictedWeather: {
    temperature: Number,
    humidity: Number,
    windSpeed: Number,
    precipitation: Boolean,
    visibility: Number,
    cloudCover: Number
  },
  accuracy: {
    type: Number,
    min: 0,
    max: 100
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  expiresAt: {
    type: Date,
    default: Date.now,
    expires: 24 * 60 * 60 * 1000
  }
});

groundTruthSchema.index({ areaCode: 1, timestamp: -1 });

module.exports = mongoose.model('GroundTruth', groundTruthSchema);
