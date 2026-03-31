const express = require('express');
const router = express.Router();
const weatherService = require('../utils/weatherService');
const logger = require('../utils/logger');

router.get('/:lat/:lon', async (req, res) => {
  try {
    const { lat, lon } = req.params;
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);

    if (isNaN(latNum) || isNaN(lonNum) || 
        latNum < -90 || latNum > 90 || 
        lonNum < -180 || lonNum > 180) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    const weatherData = await weatherService.getOneCallWeather(latNum, lonNum);
    
    res.json({
      success: true,
      data: weatherData,
      areaCode: weatherService.generateAreaCode(latNum, lonNum)
    });

  } catch (error) {
    logger.error('Weather route error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch weather data',
      message: error.message 
    });
  }
});

router.get('/current/:lat/:lon', async (req, res) => {
  try {
    const { lat, lon } = req.params;
    
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);

    if (isNaN(latNum) || isNaN(lonNum)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    const currentWeather = await weatherService.getCurrentWeather(latNum, lonNum);
    
    res.json({
      success: true,
      data: currentWeather
    });

  } catch (error) {
    logger.error('Current weather route error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch current weather',
      message: error.message 
    });
  }
});

module.exports = router;
