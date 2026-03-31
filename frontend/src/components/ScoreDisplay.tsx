import React from 'react'
import { ActivityScore } from '../types/weather'

interface ScoreDisplayProps {
  score: ActivityScore
}

export default function ScoreDisplay({ score }: ScoreDisplayProps) {
  const getFactorColor = (factorScore: number) => {
    if (factorScore >= 80) return 'bg-green-500'
    if (factorScore >= 60) return 'bg-yellow-500'
    if (factorScore >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    if (score >= 40) return 'text-orange-500'
    return 'text-red-500'
  }

  const factorNames: Record<string, string> = {
    temperature: 'Temperature',
    humidity: 'Humidity',
    windSpeed: 'Wind Speed',
    windGusts: 'Wind Gusts',
    visibility: 'Visibility',
    cloudCover: 'Cloud Cover',
    precipitation: 'Precipitation',
    uvIndex: 'UV Index',
    pressure: 'Pressure',
    soilMoisture: 'Soil Moisture',
    airQuality: 'Air Quality'
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(score.factors).map(([key, factor]) => (
          <div key={key} className="glass-morphism p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-white/70">
                {factorNames[key] || key}
              </span>
              <span className={`text-sm font-bold ${getScoreColor(factor.score)}`}>
                {Math.round(factor.score)}%
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${getFactorColor(factor.score)}`}
                style={{ width: `${factor.score}%` }}
              ></div>
            </div>
            <div className="mt-2 text-xs text-white/60">
              Value: {factor.value}°
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center">
        <div className={`score-indicator ${getScoreColor(score.score)} glass-morphism`}>
          <div className="relative z-10 text-center">
            <div className="text-4xl font-bold">{score.score}%</div>
            <div className="text-sm capitalize mt-1">{score.status}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
