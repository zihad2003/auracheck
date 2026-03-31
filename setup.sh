#!/bin/bash

echo "🌤️  Setting up AuraCheck - Contextual Weather Sentinel"

# Create logs directory for backend
mkdir -p backend/logs

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "🔧 Installing backend dependencies..."
cd backend && npm install && cd ..

# Install frontend dependencies
echo "🎨 Installing frontend dependencies..."
cd frontend && npm install && cd ..

# Create environment files
echo "⚙️  Setting up environment files..."

if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env - Please add your API keys"
fi

if [ ! -f frontend/.env ]; then
    cat > frontend/.env << EOL
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
VITE_OPENWEATHER_API_KEY=your_openweather_key_here
EOL
    echo "✅ Created frontend/.env - Please add your API keys"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Add your API keys to backend/.env and frontend/.env"
echo "2. Make sure MongoDB is running on localhost:27017"
echo "3. Run 'npm run dev' to start both servers"
echo ""
echo "🔑 Required API keys:"
echo "- OpenWeatherMap API key (https://openweathermap.org/api)"
echo "- MapBox Access Token (https://mapbox.com/)"
echo ""
echo "🚀 To start the application:"
echo "   npm run dev"
