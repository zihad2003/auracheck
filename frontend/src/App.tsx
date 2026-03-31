import { Routes, Route } from 'react-router-dom'
import ActivityDashboard from './pages/ActivityDashboard'
import WeatherMap from './pages/WeatherMap'
import SkyScan from './pages/SkyScan'
import Navigation from './components/Navigation'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main>
        <Routes>
          <Route path="/" element={<ActivityDashboard />} />
          <Route path="/map" element={<WeatherMap />} />
          <Route path="/sky-scan" element={<SkyScan />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
