import { useState } from 'react'
import { Camera, RefreshCw, Cloud, Brain, AlertCircle, Sun } from 'lucide-react'

export default function SkyScan() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)

  const analyzeSky = () => {
    setIsAnalyzing(true)
    
    setTimeout(() => {
      setAnalysisResult({
        cloudType: 'Stratus',
        confidence: 75,
        forecast: 'Partly cloudy with chance of light rain',
        timeWindow: '15 minutes',
        recommendations: ['Bring light jacket', 'Expect occasional drizzle']
      })
      setIsAnalyzing(false)
    }, 2000)
  }

  const resetScan = () => {
    setCapturedImage(null)
    setAnalysisResult(null)
  }

  const getCloudTypeColor = (cloudType: string) => {
    switch (cloudType?.toLowerCase()) {
      case 'cumulonimbus': return 'text-red-600'
      case 'cumulus': return 'text-yellow-600'
      case 'stratus': return 'text-gray-600'
      case 'cirrus': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Sky-Scan Analysis</h1>
          <p className="text-gray-600">Point your camera at the sky for AI-powered 15-minute nowcast</p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Camera Section */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              Camera View
            </h2>
            
            <div className="relative bg-gray-100 rounded-xl overflow-hidden aspect-video">
              {!capturedImage ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Sun className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Camera preview will appear here</p>
                    <p className="text-sm text-gray-400">(Camera access required)</p>
                  </div>
                </div>
              ) : (
                <img 
                  src={capturedImage} 
                  alt="Captured sky" 
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className="flex gap-3 mt-4">
              {!capturedImage ? (
                <button
                  onClick={() => {
                    setCapturedImage('https://images.unsplash.com/photo-1601297183305-6df142704ea2?w=640')
                    analyzeSky()
                  }}
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm font-medium flex items-center justify-center"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Capture Sky
                </button>
              ) : (
                <button
                  onClick={resetScan}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium flex items-center justify-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Analysis Results */}
          <div className="space-y-4">
            {isAnalyzing ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                  <div>
                    <div className="font-medium text-gray-900">Analyzing sky conditions...</div>
                    <div className="text-sm text-gray-500">AI model processing cloud patterns</div>
                  </div>
                </div>
              </div>
            ) : analysisResult ? (
              <>
                {/* AI Results */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Brain className="w-5 h-5 mr-2" />
                    AI Analysis Results
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Cloud Type</span>
                      <span className={`font-semibold ${getCloudTypeColor(analysisResult.cloudType)}`}>
                        {analysisResult.cloudType}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Confidence</span>
                      <span className="font-semibold text-gray-900">
                        {analysisResult.confidence}%
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Confidence Level</span>
                        <span className="font-medium text-gray-900">{analysisResult.confidence}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${analysisResult.confidence}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nowcast */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Cloud className="w-5 h-5 mr-2" />
                    15-Minute Nowcast
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="font-semibold text-gray-900 mb-1">
                        {analysisResult.forecast}
                      </div>
                      <div className="text-sm text-gray-600">
                        Valid for next {analysisResult.timeWindow}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Recommendations:</h4>
                      <ul className="space-y-2">
                        {analysisResult.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Notice */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900">AI Analysis Notice</div>
                      <div className="text-sm text-gray-600 mt-1">
                        This is an experimental AI feature. Results should be used as supplementary information alongside traditional weather forecasts.
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="text-center py-8">
                  <Cloud className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Capture an image of the sky to get AI-powered analysis</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
