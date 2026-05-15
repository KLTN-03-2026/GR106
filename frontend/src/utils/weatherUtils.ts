import weatherBg from "../assets/weather-bg.png";
import rainyBg from "../assets/Rainy.png";

export const translateWeather = (condition: string): string => {
  const rainConditions = ["Rain", "Drizzle", "Thunderstorm"];
  if (rainConditions.includes(condition)) {
    return "Có mưa";
  }
  return "Trời nắng";
};

export const getWeatherBackground = (condition: string): string => {
  const rainConditions = ["Rain", "Drizzle", "Thunderstorm"];
  if (rainConditions.includes(condition)) {
    return rainyBg;
  }
  return weatherBg;
};

