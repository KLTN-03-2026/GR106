import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { WeatherData, UseWeatherState } from "../../types/weather";
import { fetchWeather } from "../../services/weather/weatherService";

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
  const weatherQuery = useQuery({
    queryKey: ["weather", "current-location"],
    queryFn: async () => {
      const getPosition = () =>
        new Promise<{ lat: number; lon: number }>((resolve) => {
          if (!navigator.geolocation) {
            resolve({ lat: DEFAULT_LAT, lon: DEFAULT_LON });
            return;
          }

          navigator.geolocation.getCurrentPosition(
            (position) =>
              resolve({
                lat: position.coords.latitude,
                lon: position.coords.longitude,
              }),
            () => resolve({ lat: DEFAULT_LAT, lon: DEFAULT_LON }),
            { timeout: 10000, maximumAge: 60000 },
          );
        });

      const { lat, lon } = await getPosition();
      const data = await fetchWeather(lat, lon);

      const normalized: WeatherData = {
        ...data,
        tempMin: data.tempMin ?? DEFAULT_WEATHER_DATA.tempMin,
        tempMax: data.tempMax ?? DEFAULT_WEATHER_DATA.tempMax,
      };

      sessionStorage.setItem(
        "weather_cache",
        JSON.stringify({ data: normalized, timestamp: Date.now() }),
      );
      return normalized;
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 0,
    initialData: () => {
      const cached = sessionStorage.getItem("weather_cache");
      if (!cached) return undefined;
      try {
        const { data, timestamp } = JSON.parse(cached) as {
          data: WeatherData;
          timestamp: number;
        };
        if (Date.now() - timestamp < 30 * 60 * 1000) {
          return data;
        }
      } catch {
        return undefined;
      }
      return undefined;
    },
  });

  const refetch = useCallback(() => {
    void weatherQuery.refetch();
  }, [weatherQuery]);

  return {
    data: weatherQuery.data ?? DEFAULT_WEATHER_DATA,
    loading: weatherQuery.isLoading || weatherQuery.isFetching,
    error: weatherQuery.error instanceof Error ? weatherQuery.error.message : null,
    refetch,
  };
};

export default useWeather;
