# AuraCheck: The Contextual Weather Sentinel

A full-stack weather application that provides activity-specific forecasting with real-time crowdsourced corrections.

## 🌟 Unique Features

- **Activity-Specific Risk Profiles**: Select your activity (Photography, Drone Piloting, Outdoor Painting, Gardening) and get customized weather thresholds
- **Sky-Scan Feature**: Point your camera at the sky for AI-powered 15-minute nowcasts
- **Crowdsourced Micro-Corrections**: Real-time user feedback within 1km radius updates local forecasts

## 🏗️ Project Structure

```
AuraCheck/
├── backend/           # Node.js + Express + MongoDB
├── frontend/          # React + Tailwind CSS
├── shared/           # Shared types and utilities
├── package.json      # Root package management
└── README.md         # This file
```

## 🚀 Quick Start

1. Install dependencies:
   ```bash
   npm run install-all
   ```

2. Set up environment variables:
   - Copy `backend/.env.example` to `backend/.env`
   - Add your API keys (OpenWeatherMap, MapBox, etc.)

3. Start development servers:
   ```bash
   npm run dev
   ```

## 🛠️ Tech Stack

### Frontend
- React.js with TypeScript
- Tailwind CSS (Glassmorphism UI)
- Lucide-react icons
- MapBox GL JS for mapping

### Backend
- Node.js + Express
- MongoDB for data storage
- Socket.io for real-time updates
- OpenWeatherMap One Call API 3.0

### Key Features
- Activity Success Score (0-100%)
- Ground Truth reporting system
- Dynamic weather-based theming
- Real-time crowdsourced corrections

## 📱 Supported Activities

- **Long Exposure Photography**: Golden hour timing + Low cloud cover
- **Herb Gardening**: Last frost alerts + Soil moisture estimates  
- **Cycling**: Wind speed + Precipitation probability
- **Drone Piloting**: Wind gusts + Visibility conditions
- **Outdoor Painting**: UV index + Humidity levels

## 🔧 Environment Variables

Create `backend/.env` with:

```
OPENWEATHER_API_KEY=your_openweather_key
MONGODB_URI=your_mongodb_connection
MAPBOX_ACCESS_TOKEN=your_mapbox_token
PORT=5000
NODE_ENV=development
```

## 📊 API Endpoints

- `GET /api/weather/:lat/:lon` - Get weather data
- `POST /api/activity/score` - Calculate activity success score
- `POST /api/ground-truth` - Submit weather correction
- `GET /api/ground-truth/:area` - Get crowdsourced data

## 🎨 Dynamic Theming

The UI automatically adapts based on current weather:
- Deep indigo for storms
- Soft amber for sunsets  
- Light blue for clear skies
- Gray tones for overcast conditions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
