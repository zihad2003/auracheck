import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface TelemetryData {
  timestamp: string;
  location: {
    lat: number;
    lon: number;
    altitude: number;
  };
  motion: {
    velocity: number;
    acceleration: number;
    heading: number;
    slipAngle: number;
    lateralG: number;
  };
  environment: {
    windSpeed: number;
    windDirection: number;
    temperature: number;
    humidity: number;
    pressure: number;
    visibility: number;
  };
  status: {
    gpsAccuracy: number;
    signalStrength: number;
    batteryLevel: number;
  };
}

interface RiskFactors {
  wind: { level: string; score: number };
  visibility: { level: string; score: number };
  stability: { level: string; score: number };
}

interface TelemetryUpdate {
  telemetry: TelemetryData;
  risks: RiskFactors;
  timestamp: string;
}

export function useRealtimeTelemetry() {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [risks, setRisks] = useState<RiskFactors | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect to WebSocket server
    const socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to telemetry stream');
      setIsConnected(true);
      setError(null);
      // Subscribe to telemetry updates
      socket.emit('subscribe-telemetry');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from telemetry stream');
      setIsConnected(false);
    });

    socket.on('telemetry-update', (data: TelemetryUpdate) => {
      setTelemetry(data.telemetry);
      setRisks(data.risks);
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError('Failed to connect to real-time stream');
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Fallback to REST API if WebSocket fails
  const fetchTelemetry = useCallback(async () => {
    try {
      const response = await fetch('/api/telemetry/current');
      const data = await response.json();
      
      if (data.success) {
        setTelemetry(data.data.telemetry);
        setRisks(data.data.risks);
      }
    } catch (err) {
      console.error('Error fetching telemetry:', err);
    }
  }, []);

  // Auto-fetch if WebSocket is not connected
  useEffect(() => {
    if (!isConnected) {
      fetchTelemetry();
      const interval = setInterval(fetchTelemetry, 5000);
      return () => clearInterval(interval);
    }
  }, [isConnected, fetchTelemetry]);

  return {
    telemetry,
    risks,
    isConnected,
    error,
    refresh: fetchTelemetry
  };
}

export function useRiskAssessment(activity: string) {
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activity) return;

    const fetchAssessment = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/telemetry/risk-assessment?activity=${activity}`);
        const data = await response.json();
        
        if (data.success) {
          setAssessment(data.data);
        }
      } catch (error) {
        console.error('Error fetching risk assessment:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
    // Refresh every 10 seconds
    const interval = setInterval(fetchAssessment, 10000);
    return () => clearInterval(interval);
  }, [activity]);

  return { assessment, loading };
}
