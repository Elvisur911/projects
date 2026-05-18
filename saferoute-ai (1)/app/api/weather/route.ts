// ============================================================
// SafeRoute AI — GET /api/weather?lat=&lng=
// Fetches weather from OpenWeatherMap + logs to Supabase
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { WeatherData, WeatherCondition, ApiResponse } from '@/types';

function owmConditionToLocal(id: number): WeatherCondition {
  if (id >= 200 && id < 300) return 'storm';
  if (id >= 300 && id < 400) return 'rain';
  if (id === 500) return 'rain';
  if (id >= 501 && id < 600) return 'heavy_rain';
  if (id >= 600 && id < 700) return 'snow';
  if (id === 701 || id === 741) return 'fog';
  if (id >= 700 && id < 800) return 'cloudy';
  if (id === 800) return 'clear';
  if (id > 800) return 'cloudy';
  return 'clear';
}

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<WeatherData>>> {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat') ?? '-1.2921';
  const lng = searchParams.get('lng') ?? '36.8219';
  const location_name = searchParams.get('name') ?? 'Nairobi, KE';

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    // Return realistic demo data if no key configured
    return NextResponse.json({
      success: true,
      error: null,
      data: {
        temperature:    22.4,
        feels_like:     21.8,
        humidity:       84,
        pressure:       1012,
        wind_speed:     6.7,
        wind_direction: 180,
        visibility:     8000,
        rainfall_1h:    18.2,
        rainfall_3h:    42.5,
        description:    'Heavy rain',
        icon:           '10d',
        condition:      'heavy_rain',
        timestamp:      new Date().toISOString(),
      },
    });
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;
    const res  = await fetch(url, { next: { revalidate: 300 } }); // 5-min cache

    if (!res.ok) throw new Error(`OWM returned ${res.status}`);

    const raw = await res.json();

    const weather: WeatherData = {
      temperature:    raw.main.temp,
      feels_like:     raw.main.feels_like,
      humidity:       raw.main.humidity,
      pressure:       raw.main.pressure,
      wind_speed:     raw.wind.speed,
      wind_direction: raw.wind.deg ?? 0,
      visibility:     raw.visibility ?? 10000,
      rainfall_1h:    raw.rain?.['1h'] ?? 0,
      rainfall_3h:    raw.rain?.['3h'] ?? 0,
      description:    raw.weather[0].description,
      icon:           raw.weather[0].icon,
      condition:      owmConditionToLocal(raw.weather[0].id),
      timestamp:      new Date().toISOString(),
    };

    // Log to Supabase asynchronously (don't await — fire and forget)
    const supabase = await createClient();
    supabase.from('weather_logs').insert({
      lat:           parseFloat(lat),
      lng:           parseFloat(lng),
      location_name,
      temperature:   weather.temperature,
      humidity:      weather.humidity,
      rainfall_1h:   weather.rainfall_1h,
      wind_speed:    weather.wind_speed,
      condition:     weather.condition,
      raw_data:      raw,
    }).then(() => {}).catch(() => {});

    return NextResponse.json({ success: true, error: null, data: weather });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Failed', data: null },
      { status: 500 }
    );
  }
}
