import axios from 'axios';
import { ENV } from '../../config/env';
import { WeatherData } from '../../types/weather';

const API_KEY = ENV.WEATHER_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export const fetchWeather = async (lat: number, lon: number): Promise<WeatherData> => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        lat,
        lon,
        appid: API_KEY,
        units: 'metric',
        lang: 'vi'
      }
    });

    const data = response.data;
    const mainCondition = data.weather[0].main.toLowerCase();
    
    let condition: WeatherData['condition'] = 'other';
    if (mainCondition.includes('rain') || mainCondition.includes('drizzle') || mainCondition.includes('thunderstorm')) {
      condition = 'rain';
    } else if (mainCondition.includes('clear')) {
      condition = 'clear';
    } else if (mainCondition.includes('cloud')) {
      condition = 'clouds';
    }

    return {
      temp: Math.round(data.main.temp),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      name: data.name,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      condition,
      isRainy: condition === 'rain',
      isHighHumidity: data.main.humidity > 80
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
};
