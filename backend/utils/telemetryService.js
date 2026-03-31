const axios = require('axios');
const logger = require('./logger');

class TelemetryService {
  constructor() {
    this.telemetrySources = new Map();
    this.startMockDataStream();
  }

  // Mock real-time telemetry data (replace with actual external API)
  generateMockTelemetry() {
    return {
      timestamp: new Date().toISOString(),
      location: {
        lat: 40.7128 + (Math.random() - 0.5) * 0.01,
        lon: -74.0060 + (Math.random() - 0.5) * 0.01,
        altitude: 50 + Math.random() * 100
      },
      motion: {
        velocity: Math.random() * 60, // km/h
        acceleration: (Math.random() - 0.5) * 2, // m/s²
        heading: Math.random() * 360, // degrees
        slipAngle: (Math.random() - 0.5) * 5, // degrees
        lateralG: (Math.random() - 0.5) * 0.5 // G-force
      },
      environment: {
        windSpeed: Math.random() * 20, // km/h
        windDirection: Math.random() * 360, // degrees
        temperature: 15 + Math.random() * 15, // °C
        humidity: 40 + Math.random() * 40, // %
        pressure: 1000 + Math.random() * 30, // hPa
        visibility: 5 + Math.random() * 10 // km
      },
      status: {
        gpsAccuracy: 2 + Math.random() * 3, // meters
        signalStrength: 70 + Math.random() * 30, // %
        batteryLevel: 60 + Math.random() * 40 // %
      }
    };
  }

  startMockDataStream() {
    // Simulate external telemetry data every 2 seconds
    setInterval(() => {
      const telemetry = this.generateMockTelemetry();
      this.telemetrySources.set('default', telemetry);
    }, 2000);
  }

  getLatestTelemetry(sourceId = 'default') {
    return this.telemetrySources.get(sourceId) || this.generateMockTelemetry();
  }

  // Fetch from external API (example: drone/vehicle telemetry API)
  async fetchExternalTelemetry(apiEndpoint, apiKey) {
    try {
      const response = await axios.get(apiEndpoint, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });
      
      return {
        timestamp: new Date().toISOString(),
        source: 'external',
        data: response.data
      };
    } catch (error) {
      logger.error('Error fetching external telemetry:', error.message);
      return null;
    }
  }

  // Aggregate multiple data sources
  aggregateTelemetry(sources) {
    const aggregated = {
      timestamp: new Date().toISOString(),
      motion: {},
      environment: {},
      status: {}
    };

    sources.forEach(source => {
      const data = this.telemetrySources.get(source);
      if (data) {
        Object.assign(aggregated.motion, data.motion);
        Object.assign(aggregated.environment, data.environment);
        Object.assign(aggregated.status, data.status);
      }
    });

    return aggregated;
  }

  // Calculate risk factors for activities
  calculateRiskFactors(telemetry) {
    const risks = {
      wind: { level: 'low', score: 100 },
      visibility: { level: 'good', score: 100 },
      stability: { level: 'stable', score: 100 }
    };

    if (telemetry.environment.windSpeed > 25) {
      risks.wind = { level: 'high', score: 40 };
    } else if (telemetry.environment.windSpeed > 15) {
      risks.wind = { level: 'moderate', score: 70 };
    }

    if (telemetry.environment.visibility < 5) {
      risks.visibility = { level: 'poor', score: 50 };
    } else if (telemetry.environment.visibility < 8) {
      risks.visibility = { level: 'fair', score: 75 };
    }

    if (Math.abs(telemetry.motion.slipAngle) > 3) {
      risks.stability = { level: 'unstable', score: 60 };
    }

    return risks;
  }
}

module.exports = new TelemetryService();
