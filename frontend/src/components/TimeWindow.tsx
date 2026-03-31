import React from 'react'
import { format } from 'date-fns'
import { Clock, TrendingUp } from 'lucide-react'
import { HourlyWeather } from '../types/weather'

interface TimeWindowProps {
  activity: string
  hourlyData: HourlyWeather[]
}

export default function TimeWindow({ activity, hourlyData }: TimeWindowProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    if (score >= 40) return 'text-orange-500'
    return 'text-red-500'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20'
    if (score >= 60) return 'bg-yellow-500/20'
    if (score >= 40) return 'bg-orange-500/20'
    return 'bg-red-500/20'
  }

  const calculateSimpleScore = (hour: HourlyWeather) => {
    let score = 100
    
    if (hour.precipitation.probability > 30) score -= 30
    if (hour.windSpeed > 25) score -= 25
    if (hour.cloudCover > 80 && activity === 'photography') score -= 20
    if (hour.temperature < 10 || hour.temperature > 30) score -= 15
    
    return Math.max(0, Math.min(100, score))
  }

  const scoredHours = hourlyData.map(hour => ({
    ...hour,
    score: calculateSimpleScore(hour)
  }))

  const bestHour = scoredHours.reduce((best, current) => 
    current.score > best.score ? current : best
  )

  const nextGoodHours = scoredHours.filter(hour => hour.score >= 60).slice(0, 3)

  return (
    <div className="weather-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Best Time Windows
        </h3>
        <div className="flex items-center text-green-400">
          <TrendingUp className="w-4 h-4 mr-1" />
          <span className="text-sm">Peak: {format(bestHour.timestamp, 'HH:mm')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-medium text-white mb-4">Optimal Times</h4>
          <div className="space-y-3">
            {nextGoodHours.map((hour, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border border-white/20 ${getScoreBgColor(hour.score)}`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-white">
                      {format(hour.timestamp, 'HH:mm')}
                    </div>
                    <div className="text-sm text-white/70">
                      {hour.temperature}°C • {hour.precipitation.probability}% rain
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${getScoreColor(hour.score)}`}>
                    {Math.round(hour.score)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-lg font-medium text-white mb-4">24-Hour Outlook</h4>
          <div className="space-y-2">
            {scoredHours.slice(0, 8).map((hour, index) => (
              <div key={index} className="flex items-center space-x-3">
                <span className="text-sm text-white/70 w-12">
                  {format(hour.timestamp, 'HH:mm')}
                </span>
                <div className="flex-1 bg-white/20 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      hour.score >= 80 ? 'bg-green-500' :
                      hour.score >= 60 ? 'bg-yellow-500' :
                      hour.score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${hour.score}%` }}
                  ></div>
                </div>
                <span className={`text-sm font-medium w-8 text-right ${getScoreColor(hour.score)}`}>
                  {Math.round(hour.score)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
