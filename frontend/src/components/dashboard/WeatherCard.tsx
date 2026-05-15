import {
  Cloud,
  Wind,
  Droplets,
  Sun,
  CloudRain,
  Snowflake,
} from "lucide-react";
import { useWeather } from "../../hooks/weather/useWeather";
import weatherBg from "../../assets/weather-bg.png";
import rainyBg from "../../assets/Rainy.png";

const WEATHER_BG_URL = weatherBg;
const WEATHER_BG_URL_Rainy = rainyBg;

interface WeatherCardProps {
  isRainy?: boolean;
}

// Hàm phụ trợ chọn icon Lucide dựa trên mô tả thời tiết (để icon đồng bộ với text)
const getWeatherIcon = (description: string) => {
  const desc = description.toLowerCase();
  if (desc.includes("mưa") || desc.includes("rain") || desc.includes("drizzle") || desc.includes("thunderstorm"))
    return <CloudRain size={13} />;
  if (desc.includes("tuyết") || desc.includes("snow"))
    return <Snowflake size={13} />;
  if (desc.includes("nắng") || desc.includes("quang") || desc.includes("clear"))
    return <Sun size={13} />;
  return <Cloud size={13} />; // Mặc định là mây
};


export default function WeatherCard({
  isRainy: defaultIsRainy = false,
}: WeatherCardProps) {
  const { data: weatherData, loading, error } = useWeather();

  // Use API data or default
  const isRainy = weatherData?.isRainy ?? defaultIsRainy;
  const bgUrl = isRainy ? WEATHER_BG_URL_Rainy : WEATHER_BG_URL;
  const temp = weatherData?.temp ?? 30;
  const tempMin = weatherData?.tempMin ?? 27;
  const tempMax = weatherData?.tempMax ?? 31;
  const humidity = weatherData?.humidity ?? 62;
  const windSpeed = weatherData?.windSpeed ?? 5;
  const description = weatherData?.description || "Mây (Clouds)";

  return (
    <div
      className="relative rounded-2xl overflow-hidden flex-1 min-w-0 shadow-sm h-full"
      style={{ minHeight: 180 }}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: `url(${bgUrl})` }}
      />
      {/* Subtle overlay so text is readable */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px]" />

      {/* Content */}
      <div className="relative z-10 p-3 h-full flex flex-col justify-between">
        {/* Top row */}
        <div className="flex items-start justify-between">
          <span className="text-[#3A3A8C] font-semibold text-sm">
            Thời tiết
          </span>
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end gap-1 text-[#3A3A8C] text-xs font-medium z-20">
              {/* --- ĐÃ CẬP NHẬT: Hiện rõ chữ và icon --- */}
              <span className="flex items-center gap-1">
                {getWeatherIcon(description)} {description}
              </span>
              <span className="flex items-center gap-1">
                <Wind size={13} /> Gió: {windSpeed}m/s
              </span>
              <span className="flex items-center gap-1">
                <Droplets size={13} /> Độ ẩm: {humidity}%
              </span>
              {/* Hiển thị thêm cảnh báo nếu độ ẩm cao */}
              {weatherData?.isHighHumidity && (
                <span className="text-[10px] text-blue-700 opacity-80 mt-[-2px]">
                  (Độ ẩm cao)
                </span>
              )}
              {/* -------------------------------------- */}
            </div>
          </div>
        </div>

        {/* Main temp */}
        <div className="text-center">
          {loading ? (
            <span className="text-2xl font-bold text-[#1a1a4e]">⏳</span>
          ) : error ? (
            <span className="text-xs font-semibold text-red-500">{error}</span>
          ) : (
            <span className="text-4xl font-bold text-[#1a1a4e]">{temp}°</span>
          )}
        </div>

        {/* Temp bar + labels */}
        <div className="relative">
          <div className="flex justify-between text-[11px] font-semibold text-[#3A3A8C] mb-2">
            <div className="flex flex-1 justify-around pr-1">
              <span>{tempMin}°</span>
              <span>{Math.round((tempMin + tempMax) / 2)}°</span>
            </div>
            <div className="flex flex-1 justify-around pl-1">
              <span>{temp}°</span>
              <span>{tempMax}°</span>
            </div>
          </div>
          {/* Segmented bar with 2 bars */}
          <div className="flex gap-2">
            {/* Bar 1: Green to Yellow-Green */}
            <div
              className="flex-1 h-5 rounded-full overflow-hidden relative"
              style={{
                background:
                  "linear-gradient(to right, #22c55e 0%, #84cc16 100%)",
              }}
            >
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.6) 3px, rgba(255,255,255,0.6) 6px)",
                }}
              />
            </div>
            {/* Bar 2: Yellow to Orange */}
            <div
              className="flex-1 h-5 rounded-full overflow-hidden relative"
              style={{
                background:
                  "linear-gradient(to right, #eab308 0%, #f97316 100%)",
              }}
            >
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.6) 3px, rgba(255,255,255,0.6) 6px)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
