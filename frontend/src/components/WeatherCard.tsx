import React from 'react'
import { Cloud, Wind, Droplets, Eye, Sun, Gauge } from 'lucide-react'

interface WeatherCardProps {
  weather: {
    temperature: number
    feelsLike: number
    humidity: number
    windSpeed: number
    windDirection: number
    visibility: number
    cloudCover: number
    uvIndex: number
    weather: {
      main: string
      description: string
      icon: string
    }
  }
}

export default function WeatherCard({ weather }: WeatherCardProps) {
  const getWeatherIcon = (main: string) => {
    switch (main.toLowerCase()) {
      case 'clear':
        return <Sun className="w-12 h-12 text-yellow-400" />
      case 'clouds':
        return <Cloud className="w-12 h-12 text-gray-400" />
      case 'rain':
        return <Droplets className="w-12 h-12 text-blue-400" />
      case 'wind':
        return <Wind className="w-12 h-12 text-gray-300" />
      default:
        return <Eye className="w-12 h-12 text-blue-300" />
    }
  }

  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    return directions[Math.round(degrees / 45) % 8]
  }

  return (
    <div className="weather-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Current Weather</h3>
          <p className="text-white/70 capitalize">{weather.weather.description}</p>
        </div>
        {getWeatherIcon(weather.weather.main)}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-white">{weather.temperature}°C</div>
          <div className="text-sm text-white/70">Feels like {weather.feelsLike}°C</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-semibold text-white capitalize">
            {weather.weather.main}
          </div>
          <div className="text-sm text-white/70">UV Index {weather.uvIndex}</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wind className="w-4 h-4 text-white/70" />
            <span className="text-sm text-white/70">Wind</span>
          </div>
          <span className="text-sm text-white">
            {weather.windSpeed} km/h {getWindDirection(weather.windDirection)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Droplets className="w-4 h-4 text-white/70" />
            <span className="text-sm text-white/70">Humidity</span>
          </div>
          <span className="text-sm text-white">{weather.humidity}%</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4 text-white/70" />
            <span className="text-sm text-white/70">Visibility</span>
          </div>
          <span className="text-sm text-white">{weather.visibility} km</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cloud className="w-4 h-4 text-white/70" />
            <span className="text-sm text-white/70">Cloud Cover</span>
          </div>
          <span className="text-sm text-white">{weather.cloudCover}%</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Gauge className="w-4 h-4 text-white/70" />
            <span className="text-sm text-white/70">Pressure</span>
          </div>
          <span className="text-sm text-white">{weather.pressure} hPa</span>
        </div>
      </div>
    </div>
  )
}
