const logger = require('./logger');

class ContextEngine {
  constructor() {
    this.activityProfiles = {
      'photography': {
        name: 'Long Exposure Photography',
        idealConditions: {
          temperature: { min: 10, max: 25, weight: 0.15 },
          windSpeed: { max: 15, weight: 0.25 },
          cloudCover: { min: 20, max: 60, weight: 0.30 },
          visibility: { min: 10, weight: 0.20 },
          precipitation: { max: 10, weight: 0.10 }
        },
        goldenHourBonus: 20,
        blueHourBonus: 15,
        description: 'Best for golden hour lighting with minimal wind'
      },
      'drone-piloting': {
        name: 'Drone Piloting',
        idealConditions: {
          temperature: { min: 5, max: 30, weight: 0.10 },
          windSpeed: { max: 20, weight: 0.35 },
          windGusts: { max: 25, weight: 0.25 },
          visibility: { min: 5, weight: 0.20 },
          precipitation: { max: 5, weight: 0.10 }
        },
        description: 'Requires low winds and good visibility'
      },
      'outdoor-painting': {
        name: 'Outdoor Painting',
        idealConditions: {
          temperature: { min: 15, max: 25, weight: 0.20 },
          humidity: { min: 30, max: 70, weight: 0.25 },
          windSpeed: { max: 20, weight: 0.20 },
          uvIndex: { max: 6, weight: 0.20 },
          precipitation: { max: 10, weight: 0.15 }
        },
        description: 'Comfortable temperature with moderate humidity'
      },
      'gardening': {
        name: 'Herb Gardening',
        idealConditions: {
          temperature: { min: 12, max: 28, weight: 0.25 },
          humidity: { min: 40, max: 80, weight: 0.25 },
          precipitation: { min: 0, max: 30, weight: 0.20 },
          soilMoisture: { min: 30, max: 70, weight: 0.20 },
          windSpeed: { max: 25, weight: 0.10 }
        },
        lastFrostCheck: true,
        description: 'Good soil moisture and temperature for planting'
      },
      'cycling': {
        name: 'Cycling',
        idealConditions: {
          temperature: { min: 10, max: 25, weight: 0.25 },
          windSpeed: { max: 25, weight: 0.25 },
          precipitation: { max: 20, weight: 0.30 },
          visibility: { min: 5, weight: 0.15 },
          airQuality: { max: 100, weight: 0.05 }
        },
        description: 'Dry conditions with moderate temperatures'
      }
    };
  }

  calculateActivityScore(activity, weatherData, timeOfDay = null) {
    const profile = this.activityProfiles[activity];
    if (!profile) {
      throw new Error(`Unknown activity: ${activity}`);
    }

    let totalScore = 0;
    let totalWeight = 0;
    const factors = {};

    for (const [param, conditions] of Object.entries(profile.idealConditions)) {
      const weight = conditions.weight;
      const value = this.extractWeatherValue(weatherData, param);
      const score = this.calculateParameterScore(value, conditions);
      
      factors[param] = {
        value,
        score,
        weight,
        status: this.getScoreStatus(score)
      };
      
      totalScore += score * weight;
      totalWeight += weight;
    }

    let finalScore = Math.round((totalScore / totalWeight) * 100);

    if (activity === 'photography' && timeOfDay) {
      const timeBonus = this.calculateTimeBonus(timeOfDay, weatherData);
      finalScore = Math.min(100, finalScore + timeBonus);
      factors.timeBonus = timeBonus;
    }

    return {
      activity: profile.name,
      score: finalScore,
      status: this.getScoreStatus(finalScore),
      factors,
      recommendations: this.generateRecommendations(activity, factors, finalScore)
    };
  }

  extractWeatherValue(weatherData, param) {
    switch (param) {
      case 'temperature':
        return weatherData.current?.temperature || weatherData.temperature;
      case 'humidity':
        return weatherData.current?.humidity || weatherData.humidity;
      case 'windSpeed':
        return weatherData.current?.windSpeed || weatherData.windSpeed;
      case 'windGusts':
        return weatherData.current?.windGust || weatherData.windGust;
      case 'visibility':
        return weatherData.current?.visibility || weatherData.visibility;
      case 'cloudCover':
        return weatherData.current?.cloudCover || weatherData.cloudCover;
      case 'precipitation':
        return weatherData.current?.precipitation?.probability || 
               (weatherData.precipitation ? (weatherData.precipitation.probability || 100) : 0);
      case 'uvIndex':
        return weatherData.current?.uvIndex || weatherData.uvIndex;
      case 'pressure':
        return weatherData.current?.pressure || weatherData.pressure;
      case 'soilMoisture':
        return weatherData.soilMoisture || 50;
      case 'airQuality':
        return weatherData.airQuality || 50;
      default:
        return 0;
    }
  }

  calculateParameterScore(value, conditions) {
    if (conditions.min !== undefined && conditions.max !== undefined) {
      if (value >= conditions.min && value <= conditions.max) {
        return 100;
      } else if (value < conditions.min) {
        return Math.max(0, 100 - ((conditions.min - value) / conditions.min) * 100);
      } else {
        return Math.max(0, 100 - ((value - conditions.max) / conditions.max) * 100);
      }
    } else if (conditions.max !== undefined) {
      return Math.max(0, 100 - (value / conditions.max) * 100);
    } else if (conditions.min !== undefined) {
      return Math.min(100, (value / conditions.min) * 100);
    }
    return 100;
  }

  calculateTimeBonus(timeOfDay, weatherData) {
    if (!weatherData.current?.sunrise || !weatherData.current?.sunset) {
      return 0;
    }

    const now = new Date();
    const sunrise = new Date(weatherData.current.sunrise);
    const sunset = new Date(weatherData.current.sunset);
    
    const goldenHourMorning = new Date(sunrise.getTime() + 60 * 60 * 1000);
    const goldenHourEvening = new Date(sunset.getTime() - 60 * 60 * 1000);
    
    const blueHourMorning = new Date(sunrise.getTime() - 30 * 60 * 1000);
    const blueHourEvening = new Date(sunset.getTime() + 30 * 60 * 1000);

    if ((now >= goldenHourMorning && now <= sunrise) || 
        (now >= goldenHourEvening && now <= sunset)) {
      return 20;
    } else if ((now >= blueHourMorning && now <= goldenHourMorning) || 
               (now >= sunset && now <= blueHourEvening)) {
      return 15;
    }
    
    return 0;
  }

  getScoreStatus(score) {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    if (score >= 20) return 'poor';
    return 'terrible';
  }

  generateRecommendations(activity, factors, score) {
    const recommendations = [];
    
    for (const [param, factor] of Object.entries(factors)) {
      if (factor.score < 60) {
        switch (param) {
          case 'windSpeed':
            recommendations.push('Consider waiting for calmer winds');
            break;
          case 'precipitation':
            recommendations.push('Rain expected - bring waterproof gear');
            break;
          case 'cloudCover':
            if (activity === 'photography') {
              recommendations.push('Too many clouds - wait for clearer skies');
            }
            break;
          case 'temperature':
            if (factor.value < 15) {
              recommendations.push('Dress warmly - temperatures are low');
            } else if (factor.value > 25) {
              recommendations.push('Stay hydrated - temperatures are high');
            }
            break;
          case 'visibility':
            recommendations.push('Poor visibility may affect your activity');
            break;
        }
      }
    }

    if (score >= 80) {
      recommendations.push('Perfect conditions for your activity!');
    } else if (score < 40) {
      recommendations.push('Consider postponing or choosing a different activity');
    }

    return recommendations;
  }

  getBestTimeWindow(activity, hourlyData) {
    const scoredHours = hourlyData.map(hour => {
      const score = this.calculateActivityScore(activity, hour);
      return {
        timestamp: hour.timestamp,
        score: score.score,
        status: score.status
      };
    });

    scoredHours.sort((a, b) => b.score - a.score);

    return {
      bestHour: scoredHours[0],
      top3Hours: scoredHours.slice(0, 3),
      nextGoodHour: scoredHours.find(hour => hour.score >= 60)
    };
  }
}

module.exports = new ContextEngine();
