'use client';

import { useState, useEffect, useCallback } from 'react';
import type { WeatherData } from '@/types';
import { WEATHER_REFRESH_INTERVAL } from '@/constants';

interface UseWeatherReturn {
  weather:  WeatherData | null;
  loading:  boolean;
  error:    string | null;
  refresh:  () => void;
}

// Default Nairobi coordinates
const DEFAULT_LAT = parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LAT ?? '-1.2921');
const DEFAULT_LNG = parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LNG ?? '36.8219');

export function useWeather(
  lat = DEFAULT_LAT,
  lng = DEFAULT_LNG
): UseWeatherReturn {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetchWeather = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`/api/weather?lat=${lat}&lng=${lng}`);
      const json = await res.json();
      if (json.data) {
        setWeather(json.data);
      } else {
        throw new Error(json.error ?? 'Failed to fetch weather');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Fall back to demo data so the UI still renders
      setWeather({
        temperature:    22,
        feels_like:     21,
        humidity:       84,
        pressure:       1012,
        wind_speed:     6.7,
        wind_direction: 180,
        visibility:     8000,
        rainfall_1h:    18,
        rainfall_3h:    42,
        description:    'Heavy rain',
        icon:           '10d',
        condition:      'heavy_rain',
        timestamp:      new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  }, [lat, lng]);

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, WEATHER_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  return { weather, loading, error, refresh: fetchWeather };
}
