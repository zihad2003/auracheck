const express = require('express');
const router = express.Router();
const GroundTruth = require('../models/GroundTruth');
const weatherService = require('../utils/weatherService');
const logger = require('../utils/logger');

router.post('/', async (req, res) => {
  try {
    const { userId, lat, lon, reportType, actualWeather, predictedWeather } = req.body;

    if (!userId || !lat || !lon || !reportType) {
      return res.status(400).json({ 
        error: 'User ID, coordinates, and report type are required' 
      });
    }

    const validReportTypes = ['drier', 'wetter', 'windier', 'calmer', 'storm', 'clear'];
    if (!validReportTypes.includes(reportType)) {
      return res.status(400).json({ 
        error: 'Invalid report type. Must be one of: ' + validReportTypes.join(', ') 
      });
    }

    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);

    if (isNaN(latNum) || isNaN(lonNum)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    const areaCode = weatherService.generateAreaCode(latNum, lonNum);

    const groundTruthReport = new GroundTruth({
      userId,
      location: {
        type: 'Point',
        coordinates: [lonNum, latNum]
      },
      areaCode,
      reportType,
      actualWeather,
      predictedWeather,
      accuracy: calculateAccuracy(actualWeather, predictedWeather)
    });

    await groundTruthReport.save();

    req.io.to(areaCode).emit('ground-truth-update', {
      type: reportType,
      location: { lat: latNum, lon: lonNum },
      timestamp: new Date()
    });

    res.json({
      success: true,
      data: groundTruthReport
    });

  } catch (error) {
    logger.error('Ground truth submission error:', error);
    res.status(500).json({ 
      error: 'Failed to submit ground truth report',
      message: error.message 
    });
  }
});

router.get('/:areaCode', async (req, res) => {
  try {
    const { areaCode } = req.params;
    const { limit = 50 } = req.query;

    const reports = await GroundTruth.find({ areaCode })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: reports
    });

  } catch (error) {
    logger.error('Ground truth fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch ground truth reports',
      message: error.message 
    });
  }
});

router.get('/recent/:lat/:lon', async (req, res) => {
  try {
    const { lat, lon } = req.params;
    const { radius = 5, limit = 20 } = req.query;

    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);

    if (isNaN(latNum) || isNaN(lonNum)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    const radiusKm = parseFloat(radius);

    const reports = await GroundTruth.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lonNum, latNum]
          },
          $maxDistance: radiusKm * 1000
        }
      }
    })
    .sort({ timestamp: -1 })
    .limit(parseInt(limit))
    .lean();

    res.json({
      success: true,
      data: reports
    });

  } catch (error) {
    logger.error('Recent ground truth fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch recent ground truth reports',
      message: error.message 
    });
  }
});

router.get('/stats/:areaCode', async (req, res) => {
  try {
    const { areaCode } = req.params;
    const { hours = 24 } = req.query;

    const since = new Date(Date.now() - (parseInt(hours) * 60 * 60 * 1000));

    const stats = await GroundTruth.aggregate([
      {
        $match: {
          areaCode,
          timestamp: { $gte: since }
        }
      },
      {
        $group: {
          _id: '$reportType',
          count: { $sum: 1 },
          avgAccuracy: { $avg: '$accuracy' }
        }
      }
    ]);

    const totalReports = await GroundTruth.countDocuments({
      areaCode,
      timestamp: { $gte: since }
    });

    res.json({
      success: true,
      data: {
        totalReports,
        period: `${hours} hours`,
        breakdown: stats
      }
    });

  } catch (error) {
    logger.error('Ground truth stats error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch ground truth statistics',
      message: error.message 
    });
  }
});

function calculateAccuracy(actual, predicted) {
  if (!actual || !predicted) return null;

  let accuracy = 100;
  let factors = 0;

  if (actual.temperature !== undefined && predicted.temperature !== undefined) {
    const tempDiff = Math.abs(actual.temperature - predicted.temperature);
    accuracy -= Math.min(tempDiff * 5, 30);
    factors++;
  }

  if (actual.humidity !== undefined && predicted.humidity !== undefined) {
    const humidityDiff = Math.abs(actual.humidity - predicted.humidity);
    accuracy -= Math.min(humidityDiff * 0.5, 20);
    factors++;
  }

  if (actual.windSpeed !== undefined && predicted.windSpeed !== undefined) {
    const windDiff = Math.abs(actual.windSpeed - predicted.windSpeed);
    accuracy -= Math.min(windDiff * 2, 25);
    factors++;
  }

  if (actual.precipitation !== undefined && predicted.precipitation !== undefined) {
    if (actual.precipitation !== predicted.precipitation) {
      accuracy -= 40;
    }
    factors++;
  }

  return factors > 0 ? Math.max(0, Math.min(100, accuracy)) : null;
}

module.exports = router;
