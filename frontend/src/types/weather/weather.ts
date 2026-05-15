export interface WeatherData {
  temp: number;
  tempMin?: number;
  tempMax?: number;
  humidity: number;
  windSpeed: number;
  description: string;
  isRainy: boolean;
  isHighHumidity: boolean;
  icon: string;
  name: string;
  condition: 'rain' | 'clear' | 'clouds' | 'other';
}

export interface UseWeatherState {
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}
