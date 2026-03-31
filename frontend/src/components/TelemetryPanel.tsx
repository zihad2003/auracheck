import { Activity, Signal, AlertTriangle, Wind, Eye, Gauge } from 'lucide-react';
import { useRealtimeTelemetry, useRiskAssessment } from '../hooks/useRealtimeTelemetry';

interface TelemetryPanelProps {
  activity?: string;
}

export default function TelemetryPanel({ activity }: TelemetryPanelProps) {
  const { telemetry, risks, isConnected, error } = useRealtimeTelemetry();
  const { assessment, loading } = useRiskAssessment(activity || '');

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
      case 'unstable':
      case 'poor':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'moderate':
      case 'fair':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getConnectionStatus = () => {
    if (error) return { color: 'text-red-600', text: 'Error' };
    if (isConnected) return { color: 'text-green-600', text: 'Live' };
    return { color: 'text-yellow-600', text: 'Polling' };
  };

  const status = getConnectionStatus();

  if (!telemetry) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <Activity className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Live Telemetry</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Connecting to telemetry stream...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Live Telemetry</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Signal className={`w-4 h-4 ${status.color}`} />
          <span className={`text-xs font-medium ${status.color}`}>{status.text}</span>
        </div>
      </div>

      {/* Motion Data */}
      <div className="mb-6">
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Motion</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Velocity</div>
            <div className="text-lg font-bold text-gray-900">
              {telemetry.motion.velocity.toFixed(1)} <span className="text-sm font-normal text-gray-500">km/h</span>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Slip Angle</div>
            <div className="text-lg font-bold text-gray-900">
              {telemetry.motion.slipAngle.toFixed(1)}°
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Lateral G-Force</div>
            <div className="text-lg font-bold text-gray-900">
              {telemetry.motion.lateralG.toFixed(2)} <span className="text-sm font-normal text-gray-500">G</span>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Heading</div>
            <div className="text-lg font-bold text-gray-900">
              {Math.round(telemetry.motion.heading)}°
            </div>
          </div>
        </div>
      </div>

      {/* Environmental Data */}
      <div className="mb-6">
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Environment</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 text-gray-600">
              <Wind className="w-4 h-4" />
              <span className="text-sm">Wind Speed</span>
            </div>
            <span className="font-semibold text-gray-900">{telemetry.environment.windSpeed.toFixed(1)} km/h</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 text-gray-600">
              <Eye className="w-4 h-4" />
              <span className="text-sm">Visibility</span>
            </div>
            <span className="font-semibold text-gray-900">{telemetry.environment.visibility.toFixed(1)} km</span>
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      {risks && (
        <div className="mb-6">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Risk Factors</h4>
          <div className="space-y-2">
            <div className={`flex items-center justify-between p-2 rounded-lg border ${getRiskColor(risks.wind.level)}`}>
              <div className="flex items-center space-x-2">
                <Wind className="w-4 h-4" />
                <span className="text-sm font-medium">Wind</span>
              </div>
              <span className="text-sm font-semibold capitalize">{risks.wind.level}</span>
            </div>
            <div className={`flex items-center justify-between p-2 rounded-lg border ${getRiskColor(risks.visibility.level)}`}>
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">Visibility</span>
              </div>
              <span className="text-sm font-semibold capitalize">{risks.visibility.level}</span>
            </div>
            <div className={`flex items-center justify-between p-2 rounded-lg border ${getRiskColor(risks.stability.level)}`}>
              <div className="flex items-center space-x-2">
                <Gauge className="w-4 h-4" />
                <span className="text-sm font-medium">Stability</span>
              </div>
              <span className="text-sm font-semibold capitalize">{risks.stability.level}</span>
            </div>
          </div>
        </div>
      )}

      {/* Activity-specific Warnings */}
      {assessment && assessment.recommendations && assessment.recommendations.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-red-900 text-sm mb-1">
                Warnings for {activity}
              </div>
              <ul className="space-y-1">
                {assessment.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="text-sm text-red-700">
                    • {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="mt-4 text-xs text-gray-400 text-center">
        Last update: {new Date(telemetry.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}
