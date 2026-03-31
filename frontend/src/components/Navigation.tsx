import { Link, useLocation } from 'react-router-dom'
import { Cloud, Map, Camera, LayoutDashboard } from 'lucide-react'

export default function Navigation() {
  const location = useLocation()

  const navItems = [
    { path: '/', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
    { path: '/map', icon: <Map className="w-5 h-5" />, label: 'Weather Map' },
    { path: '/sky-scan', icon: <Camera className="w-5 h-5" />, label: 'Sky Scan' }
  ]

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Cloud className="w-7 h-7 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">AuraCheck</span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                  location.pathname === item.path
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
