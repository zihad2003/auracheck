export interface WeatherData {
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
    visibility: number;
    cloudCover: number;
    uvIndex: number;
    weather: {
      main: string;
      description: string;
      icon: string;
    };
    sunrise: Date;
    sunset: Date;
  };
  hourly: HourlyWeather[];
  daily: DailyWeather[];
}

export interface HourlyWeather {
  timestamp: Date;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  visibility: number;
  cloudCover: number;
  precipitation: {
    probability: number;
    amount: number;
  };
  weather: {
    main: string;
    description: string;
    icon: string;
  };
}

export interface DailyWeather {
  timestamp: Date;
  temperature: {
    min: number;
    max: number;
    morning: number;
    day: number;
    evening: number;
    night: number;
  };
  humidity: number;
  windSpeed: number;
  windDirection: number;
  visibility: number;
  cloudCover: number;
  precipitation: {
    probability: number;
    amount: number;
  };
  uvIndex: number;
  weather: {
    main: string;
    description: string;
    icon: string;
  };
  sunrise: Date;
  sunset: Date;
}

export interface ActivityScore {
  activity: string;
  score: number;
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'terrible';
  factors: Record<string, {
    value: number;
    score: number;
    weight: number;
    status: string;
  }>;
  recommendations: string[];
}

export interface Activity {
  id: string;
  name: string;
  description: string;
}

export interface GroundTruthReport {
  userId: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  areaCode: string;
  reportType: 'drier' | 'wetter' | 'windier' | 'calmer' | 'storm' | 'clear';
  actualWeather: {
    temperature?: number;
    humidity?: number;
    windSpeed?: number;
    precipitation?: boolean;
    visibility?: number;
    cloudCover?: number;
  };
  predictedWeather: {
    temperature?: number;
    humidity?: number;
    windSpeed?: number;
    precipitation?: boolean;
    visibility?: number;
    cloudCover?: number;
  };
  accuracy?: number;
  timestamp: Date;
}

export interface UserLocation {
  lat: number;
  lon: number;
}
