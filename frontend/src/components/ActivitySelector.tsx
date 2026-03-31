import React from 'react'
import { Activity } from '../types/weather'

interface ActivitySelectorProps {
  activities: Activity[]
  selectedActivity: string
  onSelect: (activity: string) => void
  activityIcons: Record<string, React.ReactNode>
}

export default function ActivitySelector({ 
  activities, 
  selectedActivity, 
  onSelect, 
  activityIcons 
}: ActivitySelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {activities.map((activity) => (
        <button
          key={activity.id}
          onClick={() => onSelect(activity.id)}
          className={`activity-button text-left p-6 transition-all duration-300 ${
            selectedActivity === activity.id
              ? 'bg-white/20 border-white/40 scale-105'
              : 'hover:bg-white/15'
          }`}
        >
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-lg ${
              selectedActivity === activity.id 
                ? 'bg-white/30 text-white' 
                : 'bg-white/10 text-white/70'
            }`}>
              {activityIcons[activity.id]}
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold mb-1 ${
                selectedActivity === activity.id 
                  ? 'text-white' 
                  : 'text-white/80'
              }`}>
                {activity.name}
              </h3>
              <p className="text-sm text-white/60">
                {activity.description}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
