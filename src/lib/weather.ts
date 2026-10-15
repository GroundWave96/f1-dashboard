export interface DayForecast {
  date: string; // data local do circuito (YYYY-MM-DD)
  code: number; // código de tempo da OMM (WMO)
  max: number;
  min: number;
  rain: number | null; // probabilidade máxima de chuva (%)
}

export type WeatherIcon = "sun" | "partly" | "cloud" | "rain" | "storm";

// A Open-Meteo prevê até 16 dias à frente; buscamos só quando a corrida está dentro desse prazo
export const FORECAST_RANGE_MS = 14 * 24 * 60 * 60 * 1000;

const isoDay = (date: Date) => date.toISOString().slice(0, 10);

const forecastCache = new Map<string, Promise<DayForecast[]>>();

/**
 * Previsão diária (Open-Meteo, gratuita e sem chave) para os dias das sessões informadas,
 * no fuso horário local do circuito.
 */
export function fetchWeekendForecast(lat: string, long: string, sessionStarts: Date[]): Promise<DayForecast[]> {
  const key = `${lat},${long},${sessionStarts.map((d) => d.getTime()).join(",")}`;
  const cached = forecastCache.get(key);
  if (cached) return cached;
  const promise = requestForecast(lat, long, sessionStarts);
  forecastCache.set(key, promise);
  promise.catch(() => forecastCache.delete(key));
  return promise;
}

async function requestForecast(lat: string, long: string, sessionStarts: Date[]): Promise<DayForecast[]> {
  const first = new Date(Math.min(...sessionStarts.map((d) => d.getTime())) - 24 * 60 * 60 * 1000);
  const last = new Date(Math.max(...sessionStarts.map((d) => d.getTime())) + 24 * 60 * 60 * 1000);

  const params = new URLSearchParams({
    latitude: lat,
    longitude: long,
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    timezone: "auto",
    start_date: isoDay(first),
    end_date: isoDay(last),
  });

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error(`Open-Meteo respondeu ${res.status}`);
  const data = await res.json();

  const offsetMs = (data.utc_offset_seconds ?? 0) * 1000;
  const wantedDays = new Set(sessionStarts.map((d) => isoDay(new Date(d.getTime() + offsetMs))));

  const daily = data.daily;
  return (daily.time as string[])
    .map((date, i) => ({
      date,
      code: daily.weather_code[i],
      max: Math.round(daily.temperature_2m_max[i]),
      min: Math.round(daily.temperature_2m_min[i]),
      rain: daily.precipitation_probability_max[i],
    }))
    .filter((day) => wantedDays.has(day.date) && day.code !== null);
}

export function weatherIcon(code: number): WeatherIcon {
  if (code <= 1) return "sun";
  if (code === 2) return "partly";
  if (code >= 95) return "storm";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  return "cloud";
}
