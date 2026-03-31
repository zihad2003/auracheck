const express = require('express');
const router = express.Router();
const telemetryService = require('../utils/telemetryService');
const logger = require('../utils/logger');

// Get latest telemetry data
router.get('/current', (req, res) => {
  try {
    const telemetry = telemetryService.getLatestTelemetry();
    const risks = telemetryService.calculateRiskFactors(telemetry);
    
    res.json({
      success: true,
      data: {
        telemetry,
        risks,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error fetching telemetry:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch telemetry data' 
    });
  }
});

// Get telemetry history (last 100 readings)
router.get('/history', (req, res) => {
  try {
    const { limit = 100 } = req.query;
    // In production, fetch from database or cache
    res.json({
      success: true,
      data: [],
      message: 'History endpoint - implement based on your storage'
    });
  } catch (error) {
    logger.error('Error fetching telemetry history:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch telemetry history' 
    });
  }
});

// Configure external telemetry source
router.post('/configure', (req, res) => {
  try {
    const { sourceId, apiEndpoint, apiKey, refreshInterval } = req.body;
    
    // Store configuration
    logger.info(`Configured telemetry source: ${sourceId}`);
    
    res.json({
      success: true,
      message: `Telemetry source ${sourceId} configured successfully`,
      config: { sourceId, apiEndpoint, refreshInterval }
    });
  } catch (error) {
    logger.error('Error configuring telemetry:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to configure telemetry source' 
    });
  }
});

// Get risk assessment based on current telemetry
router.get('/risk-assessment', (req, res) => {
  try {
    const { activity } = req.query;
    const telemetry = telemetryService.getLatestTelemetry();
    const risks = telemetryService.calculateRiskFactors(telemetry);
    
    // Activity-specific risk analysis
    let activityRisk = 'low';
    let recommendations = [];
    
    switch (activity) {
      case 'drone-piloting':
        if (risks.wind.level === 'high') {
          activityRisk = 'high';
          recommendations.push('Wind speed too high for drone operation');
        }
        if (risks.stability.level === 'unstable') {
          activityRisk = 'high';
          recommendations.push('Platform stability compromised');
        }
        break;
      case 'photography':
        if (risks.wind.level === 'high') {
          recommendations.push('Use tripod for stability in high wind');
        }
        break;
      case 'cycling':
        if (risks.wind.level === 'high') {
          recommendations.push('Strong crosswind - adjust route');
        }
        break;
    }
    
    res.json({
      success: true,
      data: {
        activity,
        riskLevel: activityRisk,
        risks,
        recommendations,
        telemetry: {
          windSpeed: telemetry.environment.windSpeed,
          visibility: telemetry.environment.visibility,
          temperature: telemetry.environment.temperature
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error calculating risk assessment:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to calculate risk assessment' 
    });
  }
});

module.exports = router;
