export const translateWeather = (condition: string): string => {
  const mapping: Record<string, string> = {
    'Clear': 'Trời quang đãng (Clear)',
    'Clouds': 'Nhiều mây (Clouds)',
    'Rain': 'Có mưa (Rain)',
    'Drizzle': 'Mưa phùn (Drizzle)',
    'Thunderstorm': 'Dông bão (Thunderstorm)',
    'Snow': 'Có tuyết (Snow)',
    'Mist': 'Sương mù (Mist)',
    'Smoke': 'Khói (Smoke)',
    'Haze': 'Sương mờ (Haze)',
    'Dust': 'Bụi (Dust)',
    'Fog': 'Sương mù dày (Fog)',
    'Sand': 'Bụi cát (Sand)',
    'Ash': 'Tro núi lửa (Ash)',
    'Squall': 'Gió giật (Squall)',
    'Tornado': 'Lốc xoáy (Tornado)',
  };

  return mapping[condition] || condition;
};
