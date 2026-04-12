import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { WeatherData, UseWeatherState } from "../types/weather";
import { ENV } from "../config/env";
import { translateWeather } from "../utils/weatherUtils";

const WEATHER_API_KEY = ENV.WEATHER_KEY;
const WEATHER_API_BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

const DEFAULT_LAT = 16.0678;
const DEFAULT_LON = 108.2208;

const DEFAULT_WEATHER_DATA: WeatherData = {
  temp: 30,
  tempMin: 27,
  tempMax: 31,
  humidity: 62,
  windSpeed: 5,
  description: "Có mây (Partly Cloudy)",
  isRainy: false,
  isHighHumidity: false,
  icon: "01d",
  name: "Đà Nẵng",
  condition: "clouds"
};

export const useWeather = (): UseWeatherState => {
  const [state, setState] = useState<UseWeatherState>({
    data: null,
    loading: true,
    error: null,
    refetch: () => {},
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await axios.get(WEATHER_API_BASE_URL, {
        params: {
          lat,
          lon,
          appid: WEATHER_API_KEY,
          units: "metric",
        },
        signal: controller.signal,
      });

      const { data } = response;
      const weatherCondition = data.weather[0].main;
      const mainCondition = weatherCondition.toLowerCase();
      const currentHumidity = data.main.humidity;

      const isRain =
        ["Rain", "Drizzle", "Thunderstorm"].includes(weatherCondition) ||
        data.main.rain !== undefined;

      const isHighHumidity = currentHumidity >= 80;

      let condition: WeatherData['condition'] = 'other';
      if (mainCondition.includes('rain') || mainCondition.includes('drizzle') || mainCondition.includes('thunderstorm')) {
        condition = 'rain';
      } else if (mainCondition.includes('clear')) {
        condition = 'clear';
      } else if (mainCondition.includes('cloud')) {
        condition = 'clouds';
      }

      const weatherData: WeatherData = {
        temp: Math.round(data.main.temp),
        tempMin: Math.round(data.main.temp_min),
        tempMax: Math.round(data.main.temp_max),
        humidity: currentHumidity,
        windSpeed: Math.round(data.wind.speed * 10) / 10,
        description: translateWeather(weatherCondition),
        isRainy: isRain,
        isHighHumidity,
        icon: data.weather[0].icon,
        name: data.name,
        condition
      };

      console.log("🌦️ Weather Data Fetched:", weatherData);

      if (!controller.signal.aborted) {
        setState((prev) => ({
          ...prev,
          data: weatherData,
          loading: false,
          error: null,
        }));
      }
    } catch (err: unknown) {
      if (axios.isCancel(err)) return;

      console.error(" Failed to fetch weather:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Không thể tải dữ liệu thời tiết";

      if (!controller.signal.aborted) {
        setState((prev) => ({
          ...prev,
          data: DEFAULT_WEATHER_DATA,
          loading: false,
          error: errorMessage,
        }));
      }
    }
  }, []);

  const getLocationAndFetchWeather = useCallback(() => {
    if (!navigator.geolocation) {
      fetchWeather(DEFAULT_LAT, DEFAULT_LON);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        fetchWeather(position.coords.latitude, position.coords.longitude),
      () => fetchWeather(DEFAULT_LAT, DEFAULT_LON),
      { timeout: 10000, maximumAge: 60000 },
    );
  }, [fetchWeather]);

  useEffect(() => {
    getLocationAndFetchWeather();
    return () => abortControllerRef.current?.abort();
  }, [getLocationAndFetchWeather]);

  return { ...state, refetch: getLocationAndFetchWeather };
};

export default useWeather;
