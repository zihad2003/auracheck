const axios = require('axios');
const logger = require('./logger');

class WeatherService {
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY;
    this.baseURL = 'https://api.openweathermap.org/data/3.0';
  }

  async getOneCallWeather(lat, lon) {
    try {
      // Check if using demo key - return mock data
      if (this.apiKey === 'demo_key_please_replace') {
        logger.info('Using mock weather data (demo mode)');
        return this.getMockWeatherData(lat, lon);
      }

      const response = await axios.get(`${this.baseURL}/onecall`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          exclude: 'minutely,alerts',
          units: 'metric'
        }
      });

      return this.formatWeatherData(response.data);
    } catch (error) {
      logger.error('Error fetching weather data:', error.message);
      // Return mock data on error
      logger.info('Falling back to mock weather data');
      return this.getMockWeatherData(lat, lon);
    }
  }

  async getCurrentWeather(lat, lon) {
    try {
      const response = await axios.get(`${this.baseURL}/weather`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      return this.formatCurrentWeather(response.data);
    } catch (error) {
      logger.error('Error fetching current weather:', error.message);
      throw new Error('Failed to fetch current weather');
    }
  }

  formatWeatherData(data) {
    return {
      current: {
        temperature: Math.round(data.current.temp),
        feelsLike: Math.round(data.current.feels_like),
        humidity: data.current.humidity,
        pressure: data.current.pressure,
        windSpeed: data.current.wind_speed,
        windDirection: data.current.wind_deg,
        visibility: data.current.visibility / 1000,
        cloudCover: data.current.clouds,
        uvIndex: data.current.uvi,
        weather: {
          main: data.current.weather[0].main,
          description: data.current.weather[0].description,
          icon: data.current.weather[0].icon
        },
        sunrise: new Date(data.current.sunrise * 1000),
        sunset: new Date(data.current.sunset * 1000)
      },
      hourly: data.hourly.slice(0, 48).map(hour => ({
        timestamp: new Date(hour.dt * 1000),
        temperature: Math.round(hour.temp),
        feelsLike: Math.round(hour.feels_like),
        humidity: hour.humidity,
        windSpeed: hour.wind_speed,
        windDirection: hour.wind_deg,
        visibility: hour.visibility / 1000,
        cloudCover: hour.clouds,
        precipitation: {
          probability: hour.pop * 100,
          amount: hour.rain?.['1h'] || hour.snow?.['1h'] || 0
        },
        weather: {
          main: hour.weather[0].main,
          description: hour.weather[0].description,
          icon: hour.weather[0].icon
        }
      })),
      daily: data.daily.slice(0, 7).map(day => ({
        timestamp: new Date(day.dt * 1000),
        temperature: {
          min: Math.round(day.temp.min),
          max: Math.round(day.temp.max),
          morning: Math.round(day.temp.morn),
          day: Math.round(day.temp.day),
          evening: Math.round(day.temp.eve),
          night: Math.round(day.temp.night)
        },
        humidity: day.humidity,
        windSpeed: day.wind_speed,
        windDirection: day.wind_deg,
        visibility: day.visibility / 1000,
        cloudCover: day.clouds,
        precipitation: {
          probability: day.pop * 100,
          amount: day.rain || day.snow || 0
        },
        uvIndex: day.uvi,
        weather: {
          main: day.weather[0].main,
          description: day.weather[0].description,
          icon: day.weather[0].icon
        },
        sunrise: new Date(day.sunrise * 1000),
        sunset: new Date(day.sunset * 1000)
      }))
    };
  }

  formatCurrentWeather(data) {
    return {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind.speed,
      windDirection: data.wind.deg,
      visibility: data.visibility / 1000,
      cloudCover: data.clouds.all,
      weather: {
        main: data.weather[0].main,
        description: data.weather[0].description,
        icon: data.weather[0].icon
      },
      sunrise: new Date(data.sys.sunrise * 1000),
      sunset: new Date(data.sys.sunset * 1000)
    };
  }

  generateAreaCode(lat, lon) {
    const latGrid = Math.floor(lat * 10);
    const lonGrid = Math.floor(lon * 10);
    return `${latGrid}${lonGrid}`;
  }

  getMockWeatherData(lat, lon) {
    const now = new Date();
    return {
      current: {
        temperature: 22,
        feelsLike: 24,
        humidity: 65,
        pressure: 1013,
        windSpeed: 12,
        windDirection: 180,
        visibility: 10,
        cloudCover: 40,
        uvIndex: 5,
        weather: {
          main: 'Clouds',
          description: 'partly cloudy',
          icon: '02d'
        },
        sunrise: new Date(now.getTime() - 4 * 3600000),
        sunset: new Date(now.getTime() + 6 * 3600000)
      },
      hourly: Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(now.getTime() + i * 3600000),
        temperature: 20 + Math.sin(i / 24 * Math.PI) * 8,
        feelsLike: 22 + Math.sin(i / 24 * Math.PI) * 8,
        humidity: 60 + Math.random() * 20,
        windSpeed: 8 + Math.random() * 10,
        windDirection: 150 + Math.random() * 60,
        visibility: 8 + Math.random() * 4,
        cloudCover: 30 + Math.random() * 40,
        precipitation: {
          probability: Math.random() * 30,
          amount: 0
        },
        weather: {
          main: i % 3 === 0 ? 'Clear' : 'Clouds',
          description: i % 3 === 0 ? 'clear sky' : 'scattered clouds',
          icon: i % 3 === 0 ? '01d' : '03d'
        }
      })),
      daily: Array.from({ length: 7 }, (_, i) => ({
        timestamp: new Date(now.getTime() + i * 86400000),
        temperature: {
          min: 15 + Math.random() * 5,
          max: 25 + Math.random() * 5,
          morning: 18,
          day: 24,
          evening: 20,
          night: 16
        },
        humidity: 65,
        windSpeed: 10,
        windDirection: 180,
        visibility: 10,
        cloudCover: 40,
        precipitation: {
          probability: 20,
          amount: 0
        },
        uvIndex: 5,
        weather: {
          main: 'Clouds',
          description: 'partly cloudy',
          icon: '02d'
        },
        sunrise: new Date(now.getTime() + i * 86400000 - 4 * 3600000),
        sunset: new Date(now.getTime() + i * 86400000 + 6 * 3600000)
      }))
    };
  }
}

module.exports = new WeatherService();
