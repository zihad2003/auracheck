const express = require('express');
const router = express.Router();
const contextEngine = require('../utils/contextEngine');
const weatherService = require('../utils/weatherService');
const UserActivity = require('../models/UserActivity');
const logger = require('../utils/logger');

router.post('/score', async (req, res) => {
  try {
    const { activity, lat, lon, userId } = req.body;

    if (!activity || !lat || !lon) {
      return res.status(400).json({ 
        error: 'Activity, latitude, and longitude are required' 
      });
    }

    const validActivities = ['photography', 'drone-piloting', 'outdoor-painting', 'gardening', 'cycling'];
    if (!validActivities.includes(activity)) {
      return res.status(400).json({ 
        error: 'Invalid activity. Must be one of: ' + validActivities.join(', ') 
      });
    }

    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);

    if (isNaN(latNum) || isNaN(lonNum)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    const weatherData = await weatherService.getOneCallWeather(latNum, lonNum);
    
    const currentScore = contextEngine.calculateActivityScore(activity, weatherData);
    const timeWindow = contextEngine.getBestTimeWindow(activity, weatherData.hourly);

    if (userId) {
      const userActivity = new UserActivity({
        userId,
        activity,
        location: {
          type: 'Point',
          coordinates: [lonNum, latNum]
        },
        successScore: currentScore.score,
        weatherConditions: {
          temperature: weatherData.current.temperature,
          humidity: weatherData.current.humidity,
          windSpeed: weatherData.current.windSpeed,
          precipitation: weatherData.current.precipitation?.probability || 0,
          visibility: weatherData.current.visibility,
          cloudCover: weatherData.current.cloudCover,
          uvIndex: weatherData.current.uvIndex,
          pressure: weatherData.current.pressure
        }
      });

      await userActivity.save();
    }

    res.json({
      success: true,
      data: {
        current: currentScore,
        timeWindow,
        weather: {
          current: weatherData.current,
          nextHours: weatherData.hourly.slice(0, 12)
        }
      }
    });

  } catch (error) {
    logger.error('Activity score calculation error:', error);
    res.status(500).json({ 
      error: 'Failed to calculate activity score',
      message: error.message 
    });
  }
});

router.get('/activities', (req, res) => {
  try {
    const activities = Object.entries(contextEngine.activityProfiles).map(([key, profile]) => ({
      id: key,
      name: profile.name,
      description: profile.description
    }));

    res.json({
      success: true,
      data: activities
    });

  } catch (error) {
    logger.error('Get activities error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch activities',
      message: error.message 
    });
  }
});

router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { activity, limit = 50 } = req.query;

    const query = { userId };
    if (activity) {
      query.activity = activity;
    }

    const history = await UserActivity.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: history
    });

  } catch (error) {
    logger.error('Activity history error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch activity history',
      message: error.message 
    });
  }
});

router.post('/feedback', async (req, res) => {
  try {
    const { userId, activityId, rating, comment } = req.body;

    if (!userId || !activityId || !rating) {
      return res.status(400).json({ 
        error: 'User ID, activity ID, and rating are required' 
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        error: 'Rating must be between 1 and 5' 
      });
    }

    const updatedActivity = await UserActivity.findOneAndUpdate(
      { _id: activityId, userId },
      { 
        feedback: { rating, comment },
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedActivity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.json({
      success: true,
      data: updatedActivity
    });

  } catch (error) {
    logger.error('Activity feedback error:', error);
    res.status(500).json({ 
      error: 'Failed to save feedback',
      message: error.message 
    });
  }
});

module.exports = router;
