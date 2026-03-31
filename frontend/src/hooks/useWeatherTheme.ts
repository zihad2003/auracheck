import { useMemo } from 'react'

export function useWeatherTheme(weatherData: any) {
  return useMemo(() => {
    if (!weatherData) {
      return 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }

    const { weather, cloudCover, precipitation } = weatherData
    const main = weather?.main?.toLowerCase()
    const precipProb = precipitation?.probability || 0

    if (main === 'thunderstorm' || main === 'storm') {
      return 'weather-theme-storm'
    }

    if (main === 'rain' || precipProb > 60) {
      return 'weather-theme-rain'
    }

    if (main === 'clouds' || cloudCover > 70) {
      return 'weather-theme-cloudy'
    }

    if (main === 'clear' && cloudCover < 20) {
      return 'weather-theme-clear'
    }

    const now = new Date()
    const hour = now.getHours()
    
    if (hour >= 5 && hour <= 7) {
      return 'weather-theme-sunrise'
    }
    
    if (hour >= 17 && hour <= 19) {
      return 'weather-theme-sunset'
    }

    if (hour >= 20 || hour <= 4) {
      return 'weather-theme-night'
    }

    return 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
  }, [weatherData])
}
