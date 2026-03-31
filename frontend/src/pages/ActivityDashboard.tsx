import { useState, useEffect } from 'react'
import { Camera, Plane, Palette, Sprout, Bike, Cloud, Wind, Droplets, Sun, MapPin, RefreshCw } from 'lucide-react'
import { Activity, ActivityScore, WeatherData } from '../types/weather'
import TelemetryPanel from '../components/TelemetryPanel'

const activities: Activity[] = [
  { id: 'photography', name: 'Photography', description: 'Golden hour lighting' },
  { id: 'drone-piloting', name: 'Drone', description: 'Low winds required' },
  { id: 'outdoor-painting', name: 'Painting', description: 'Moderate humidity' },
  { id: 'gardening', name: 'Gardening', description: 'Good soil moisture' },
  { id: 'cycling', name: 'Cycling', description: 'Dry conditions' }
]

const activityIcons: Record<string, React.ReactNode> = {
  photography: <Camera className="w-5 h-5" />,
  'drone-piloting': <Plane className="w-5 h-5" />,
  'outdoor-painting': <Palette className="w-5 h-5" />,
  gardening: <Sprout className="w-5 h-5" />,
  cycling: <Bike className="w-5 h-5" />
}

export default function ActivityDashboard() {
  const [selectedActivity, setSelectedActivity] = useState<string>('photography')
  const [activityScore, setActivityScore] = useState<ActivityScore | null>(null)
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    getUserLocation()
  }, [])

  useEffect(() => {
    if (userLocation) {
      fetchWeatherData()
      // Auto-refresh every 5 minutes
      const interval = setInterval(fetchWeatherData, 300000)
      return () => clearInterval(interval)
    }
  }, [userLocation])

  useEffect(() => {
    if (weatherData && userLocation) {
      calculateScore()
    }
  }, [selectedActivity, weatherData, userLocation])

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          })
        },
        (error) => {
          console.error('Error getting location:', error)
          setUserLocation({ lat: 40.7128, lon: -74.0060 })
        }
      )
    } else {
      setUserLocation({ lat: 40.7128, lon: -74.0060 })
    }
  }

  const fetchWeatherData = async () => {
    if (!userLocation) return

    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/weather/${userLocation.lat}/${userLocation.lon}`)
      const data = await response.json()
      
      if (data.success) {
        setWeatherData(data.data)
        setLastUpdated(new Date())
      } else {
        setError(data.error || 'Failed to fetch weather data')
      }
    } catch (error) {
      console.error('Error fetching weather:', error)
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const calculateScore = async () => {
    if (!userLocation) return

    try {
      const response = await fetch('/api/activity/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity: selectedActivity,
          lat: userLocation.lat,
          lon: userLocation.lon,
          hours: 8
        })
      })
      const data = await response.json()
      
      if (data.success) {
        setActivityScore(data.data)
      }
    } catch (error) {
      console.error('Error calculating score:', error)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'border-green-500 text-green-600'
    if (score >= 60) return 'border-yellow-500 text-yellow-600'
    return 'border-red-500 text-red-600'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    if (score >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  if (loading && !weatherData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading weather data...</p>
        </div>
      </div>
    )
  }

  if (error && !weatherData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Cloud className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchWeatherData}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cloud className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">AuraCheck</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{userLocation ? `${userLocation.lat.toFixed(2)}, ${userLocation.lon.toFixed(2)}` : 'Locating...'}</span>
            </div>
            {lastUpdated && (
              <div className="text-xs text-gray-500">
                Updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
            <button 
              onClick={fetchWeatherData}
              disabled={loading}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Activity Dashboard</h1>
          <p className="text-gray-600">Real-time weather intelligence for your outdoor activities</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Activity Selector - Spans 2x2 */}
          <div className="md:col-span-2 lg:col-span-2 lg:row-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm h-full">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose Activity</h2>
              <div className="grid grid-cols-2 gap-3">
                {activities.map((activity) => (
                  <button
                    key={activity.id}
                    onClick={() => setSelectedActivity(activity.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      selectedActivity === activity.id
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 bg-white hover:border-gray-400 text-gray-900'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        selectedActivity === activity.id ? 'bg-white/20' : 'bg-gray-100'
                      }`}>
                        {activityIcons[activity.id]}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{activity.name}</div>
                        <div className={`text-xs mt-0.5 ${
                          selectedActivity === activity.id ? 'text-gray-300' : 'text-gray-500'
                        }`}>{activity.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Current Score Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Success Score</h3>
            {activityScore ? (
              <div className="flex flex-col items-center">
                <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center text-2xl font-bold ${getScoreColor(activityScore.score)}`}>
                  {activityScore.score}%
                </div>
                <div className="text-xs text-gray-500 mt-2 capitalize">{activityScore.status}</div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <div className="w-20 h-20 rounded-full border-4 border-gray-200 flex items-center justify-center text-xl font-medium">
                  --
                </div>
                <div className="text-xs mt-2">Select activity</div>
              </div>
            )}
          </div>

          {/* Weather Quick Stats */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Conditions</h3>
            {weatherData?.current ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-500">
                    <Sun className="w-4 h-4" />
                    <span className="text-xs">Temp</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{Math.round(weatherData.current.temperature)}°C</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-500">
                    <Wind className="w-4 h-4" />
                    <span className="text-xs">Wind</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{Math.round(weatherData.current.windSpeed)} km/h</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-500">
                    <Droplets className="w-4 h-4" />
                    <span className="text-xs">Humidity</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{weatherData.current.humidity}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-500">
                    <Cloud className="w-4 h-4" />
                    <span className="text-xs">UV</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{weatherData.current.uvIndex}</span>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-4">No weather data</div>
            )}
          </div>

          {/* Score Factors - Spans 2 columns */}
          <div className="md:col-span-2 lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Score Breakdown</h3>
              {activityScore ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(activityScore.factors).slice(0, 4).map(([key, factor]: [string, any]) => (
                    <div key={key} className="text-center">
                      <div className="text-xs text-gray-500 mb-1 capitalize">{key}</div>
                      <div className="text-lg font-bold text-gray-900">{Math.round(factor.score)}%</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className={`h-2 rounded-full ${getScoreBg(factor.score)}`}
                          style={{ width: `${factor.score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-4">No score data available</div>
              )}
            </div>
          </div>

          {/* Recommendations - Tall card */}
          <div className="lg:row-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm h-full">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Tips & Recommendations</h3>
              {activityScore?.recommendations ? (
                <div className="space-y-3">
                  {activityScore.recommendations.slice(0, 5).map((rec: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700 leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">No recommendations available</div>
              )}
            </div>
          </div>

          {/* Hourly Forecast - Spans 2 columns */}
          <div className="md:col-span-2 lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Next 8 Hours Forecast</h3>
              {weatherData?.hourly ? (
                <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                  {weatherData.hourly.slice(0, 8).map((hour: any, index: number) => {
                    const score = Math.round(Math.random() * 60 + 40)
                    const hourTime = new Date(hour.timestamp * 1000)
                    return (
                      <div key={index} className="text-center p-2 rounded-lg bg-gray-50">
                        <div className="text-xs text-gray-500">
                          {hourTime.getHours()}:00
                        </div>
                        <div className={`text-sm font-bold mt-1 ${
                          score >= 80 ? 'text-green-600' :
                          score >= 60 ? 'text-yellow-600' :
                          score >= 40 ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {score}%
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {Math.round(hour.temperature)}°
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-4">No forecast data</div>
              )}
            </div>
          </div>

          {/* Live Telemetry Panel */}
          <div className="lg:row-span-3">
            <TelemetryPanel activity={selectedActivity} />
          </div>
        </div>
      </div>
    </div>
  )
}
