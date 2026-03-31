import { useState, useEffect } from 'react'
import { MapPin, Users, Navigation } from 'lucide-react'

export default function WeatherMap() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUserLocation()
  }, [])

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          })
          fetchReports(position.coords.latitude, position.coords.longitude)
        },
        (error) => {
          console.error('Error getting location:', error)
          setUserLocation({ lat: 40.7128, lon: -74.0060 })
          fetchReports(40.7128, -74.0060)
        }
      )
    } else {
      setUserLocation({ lat: 40.7128, lon: -74.0060 })
      fetchReports(40.7128, -74.0060)
    }
  }

  const fetchReports = async (lat: number, lon: number) => {
    try {
      const response = await fetch(`/api/ground-truth/recent/${lat}/${lon}?radius=5&limit=20`)
      const data = await response.json()
      
      if (data.success) {
        setReports(data.data)
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
      // Demo data
      setReports([
        { _id: '1', location: { coordinates: [-74.006, 40.713] }, reportType: 'clear', timestamp: new Date().toISOString() },
        { _id: '2', location: { coordinates: [-74.008, 40.715] }, reportType: 'windier', timestamp: new Date().toISOString() },
        { _id: '3', location: { coordinates: [-74.004, 40.711] }, reportType: 'drier', timestamp: new Date().toISOString() }
      ])
    } finally {
      setLoading(false)
    }
  }

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'clear': return 'bg-green-500'
      case 'storm': return 'bg-red-500'
      case 'windier': return 'bg-yellow-500'
      case 'drier': return 'bg-blue-500'
      case 'wetter': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  const getReportTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Weather Map</h1>
          <p className="text-gray-600">Live ground truth reports from users in your area</p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Navigation className="w-5 h-5 mr-2" />
                  Live Map View
                </h2>
              </div>
              
              {/* Map Placeholder */}
              <div className="relative bg-gray-100 aspect-[16/9] lg:aspect-[2/1]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Interactive Map</p>
                    <p className="text-sm text-gray-500 mt-1">Showing {reports.length} nearby reports</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Location: {userLocation?.lat.toFixed(4)}, {userLocation?.lon.toFixed(4)}
                    </p>
                  </div>
                </div>

                {/* Simulated Report Markers */}
                {reports.map((report, index) => (
                  <div
                    key={report._id}
                    className={`absolute w-4 h-4 rounded-full ${getReportTypeColor(report.reportType)} border-2 border-white shadow-lg animate-pulse`}
                    style={{
                      left: `${30 + (index * 15)}%`,
                      top: `${40 + (index * 10)}%`
                    }}
                    title={`${getReportTypeLabel(report.reportType)} - ${new Date(report.timestamp).toLocaleTimeString()}`}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap">
                      {getReportTypeLabel(report.reportType)}
                    </div>
                  </div>
                ))}

                {/* User Location Marker */}
                <div
                  className="absolute w-6 h-6 bg-blue-600 border-2 border-white rounded-full shadow-lg flex items-center justify-center"
                  style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                >
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>

              <div className="p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{reports.length}</span> active reports within 5km
                  </div>
                  <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm font-medium">
                    Submit Report
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Legend */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Types</h3>
              <div className="space-y-3">
                {['clear', 'storm', 'windier', 'drier', 'wetter'].map((type) => (
                  <div key={type} className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getReportTypeColor(type)}`}></div>
                    <span className="text-sm text-gray-700 capitalize">{type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Reports */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Recent Reports
              </h3>
              
              {reports.length > 0 ? (
                <div className="space-y-3">
                  {reports.slice(0, 5).map((report) => (
                    <div key={report._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-3 h-3 rounded-full ${getReportTypeColor(report.reportType)}`}></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 capitalize">{report.reportType}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(report.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No recent reports</p>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{reports.length}</div>
                  <div className="text-xs text-gray-600">Total Reports</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">5km</div>
                  <div className="text-xs text-gray-600">Coverage Radius</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
