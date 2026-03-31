const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const weatherRoutes = require('./routes/weather');
const activityRoutes = require('./routes/activity');
const groundTruthRoutes = require('./routes/groundTruth');
const skyScanRoutes = require('./routes/skyScan');
const telemetryRoutes = require('./routes/telemetry');
const telemetryService = require('./utils/telemetryService');
const logger = require('./utils/logger');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});

app.use(helmet());
app.use(limiter);
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/auracheck', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => logger.info('Connected to MongoDB'))
.catch(err => logger.error('MongoDB connection error:', err));

app.use('/api/weather', weatherRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/ground-truth', groundTruthRoutes);
app.use('/api/sky-scan', skyScanRoutes);
app.use('/api/telemetry', telemetryRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);
  
  // Send initial telemetry data
  const telemetry = telemetryService.getLatestTelemetry();
  socket.emit('telemetry-update', telemetry);
  
  // Join area-based rooms for targeted updates
  socket.on('join-area', (areaCode) => {
    socket.join(areaCode);
    logger.info(`User ${socket.id} joined area: ${areaCode}`);
  });
  
  // Subscribe to telemetry stream
  socket.on('subscribe-telemetry', () => {
    logger.info(`User ${socket.id} subscribed to telemetry`);
    socket.join('telemetry-stream');
  });
  
  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

// Broadcast telemetry updates every 2 seconds
setInterval(() => {
  const telemetry = telemetryService.getLatestTelemetry();
  const risks = telemetryService.calculateRiskFactors(telemetry);
  
  io.to('telemetry-stream').emit('telemetry-update', {
    telemetry,
    risks,
    timestamp: new Date().toISOString()
  });
}, 2000);

app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

module.exports = { app, io };
