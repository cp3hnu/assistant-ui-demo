type GeocodingResult = {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  timezone?: string;
};

type GeocodingResponse = {
  results?: GeocodingResult[];
};

type ForecastResponse = {
  current?: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
  };
};

export type WeatherLocation = {
  name: string;
  region?: string;
  country?: string;
  timezone?: string;
};

export type WeatherSuccess = {
  source: string;
  location: WeatherLocation;
  observedAt: string;
  condition: string;
  weatherCode: number;
  temperatureCelsius: number;
  apparentTemperatureCelsius: number;
  relativeHumidityPercent: number;
  precipitationMillimeters: number;
  windSpeedKilometersPerHour: number;
};

export type WeatherError = {
  error: string;
};

export type WeatherResult = WeatherSuccess | WeatherError;

const weatherDescriptions: Record<number, string> = {
  0: "晴朗",
  1: "晴间多云",
  2: "多云",
  3: "阴",
  45: "有雾",
  48: "雾凇",
  51: "小毛毛雨",
  53: "中毛毛雨",
  55: "强毛毛雨",
  56: "轻度冻毛毛雨",
  57: "强冻毛毛雨",
  61: "小雨",
  63: "中雨",
  65: "大雨",
  66: "小冻雨",
  67: "大冻雨",
  71: "小雪",
  73: "中雪",
  75: "大雪",
  77: "米雪",
  80: "小阵雨",
  81: "中阵雨",
  82: "强阵雨",
  85: "小阵雪",
  86: "大阵雪",
  95: "雷暴",
  96: "伴有小冰雹的雷暴",
  99: "伴有大冰雹的雷暴",
};

const fetchJson = async <T>(url: URL): Promise<T> => {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`Weather service returned ${response.status}`);
  }

  return response.json() as Promise<T>;
};

export const getWeather = async ({
  location,
}: {
  location: string;
}): Promise<WeatherResult> => {
  const placeName = location.trim();

  if (!placeName || placeName.length > 100) {
    return { error: "请提供一个不超过 100 个字符的城市或地区名称。" };
  }

  try {
    const geocodingUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
    geocodingUrl.search = new URLSearchParams({
      name: placeName,
      count: "1",
      language: "zh",
      format: "json",
    }).toString();

    const geocoding = await fetchJson<GeocodingResponse>(geocodingUrl);
    const place = geocoding.results?.[0];

    if (!place) {
      return { error: `未找到“${placeName}”，请提供更具体的城市或地区名称。` };
    }

    const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
    forecastUrl.search = new URLSearchParams({
      latitude: String(place.latitude),
      longitude: String(place.longitude),
      current:
        "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m",
      timezone: "auto",
    }).toString();

    const forecast = await fetchJson<ForecastResponse>(forecastUrl);
    const current = forecast.current;

    if (!current) {
      return { error: "天气服务没有返回实时天气数据，请稍后重试。" };
    }

    return {
      source: "Open-Meteo",
      location: {
        name: place.name,
        region: place.admin1,
        country: place.country,
        timezone: place.timezone,
      },
      observedAt: current.time,
      condition: weatherDescriptions[current.weather_code] ?? "天气状况未知",
      weatherCode: current.weather_code,
      temperatureCelsius: current.temperature_2m,
      apparentTemperatureCelsius: current.apparent_temperature,
      relativeHumidityPercent: current.relative_humidity_2m,
      precipitationMillimeters: current.precipitation,
      windSpeedKilometersPerHour: current.wind_speed_10m,
    };
  } catch {
    return { error: "天气服务暂时不可用，请稍后重试。" };
  }
};
