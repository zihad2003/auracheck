import { ActivityScore } from '../types/weather'

const API_BASE_URL = '/api'

export async function calculateActivityScore(
  activity: string,
  lat: number,
  lon: number,
  userId?: string
): Promise<ActivityScore> {
  const response = await fetch(`${API_BASE_URL}/activity/score`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      activity,
      lat,
      lon,
      userId: userId || 'anonymous'
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to calculate activity score')
  }

  const data = await response.json()
  return data.data.current
}

export async function getActivities() {
  const response = await fetch(`${API_BASE_URL}/activity/activities`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch activities')
  }

  const data = await response.json()
  return data.data
}

export async function submitGroundTruth(report: {
  userId: string
  lat: number
  lon: number
  reportType: string
  actualWeather: any
  predictedWeather: any
}) {
  const response = await fetch(`${API_BASE_URL}/ground-truth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(report),
  })

  if (!response.ok) {
    throw new Error('Failed to submit ground truth report')
  }

  return response.json()
}

export async function getGroundTruthReports(areaCode: string) {
  const response = await fetch(`${API_BASE_URL}/ground-truth/${areaCode}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch ground truth reports')
  }

  const data = await response.json()
  return data.data
}
