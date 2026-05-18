'use client';

import { Cloud, RefreshCw } from 'lucide-react';
import { useWeather } from '@/hooks/useWeather';
import { predictFloodProbability } from '@/lib/disaster-detection';
import { weatherEmoji, formatWindSpeed, formatVisibility } from '@/utils';

export default function WeatherPanel() {
  const { weather, loading, refresh } = useWeather();

  const flood = weather ? predictFloodProbability(weather) : null;

  const items = weather ? [
    { icon: '🌡️', value: `${Math.round(weather.temperature)}°C`, label: 'Temperature', color: 'text-yellow-400' },
    { icon: '💧', value: `${weather.humidity}%`,                  label: 'Humidity',    color: 'text-cyan-400' },
    { icon: '🌧️', value: `${weather.rainfall_1h.toFixed(1)}mm`,  label: 'Rainfall/h',  color: 'text-red-400' },
    { icon: '💨', value: formatWindSpeed(weather.wind_speed),      label: 'Wind Speed',  color: 'text-[#e2e8f0]' },
  ] : [
    { icon: '🌡️', value: '22°C',   label: 'Temperature', color: 'text-yellow-400' },
    { icon: '💧', value: '84%',    label: 'Humidity',    color: 'text-cyan-400' },
    { icon: '🌧️', value: '18mm',   label: 'Rainfall/h',  color: 'text-red-400' },
    { icon: '💨', value: '24km/h', label: 'Wind Speed',  color: 'text-[#e2e8f0]' },
  ];

  return (
    <div className="sr-card">
      <div className="sr-card-header">
        <div className="sr-card-title">
          <Cloud className="w-4 h-4 text-cyan-400" />
          Weather Intel
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#64748b]">Nairobi, KE</span>
          <button onClick={refresh} disabled={loading}
            className="w-6 h-6 flex items-center justify-center text-[#64748b] hover:text-[#e2e8f0] cursor-pointer">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="sr-card-body space-y-3">
        {/* Weather grid */}
        <div className="grid grid-cols-2 gap-2">
          {items.map(({ icon, value, label, color }) => (
            <div key={label} className="bg-[#111827] border border-[#1e2d47] rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">{icon}</div>
              <div className={`text-[16px] font-bold font-mono-num ${color}`}>{value}</div>
              <div className="text-[10px] text-[#64748b] mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Warning banner */}
        {weather && (weather.condition === 'heavy_rain' || weather.condition === 'storm' || weather.rainfall_1h > 10) && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-500/8 border border-red-500/20">
            <span className="text-base flex-shrink-0">⚠️</span>
            <p className="text-[11px] text-red-400">
              Heavy rainfall predicted in next 3 hours. Flood risk elevated.
            </p>
          </div>
        )}

        {/* Flood probability */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <p className="text-[11px] text-[#64748b]">Flood Probability (24h)</p>
            <span className="text-[11px] font-bold" style={{ color: flood?.badge_color ?? '#f59e0b' }}>
              {flood?.probability ?? 72}%
            </span>
          </div>
          <div className="h-2 bg-[#111827] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${flood?.probability ?? 72}%`,
                background: 'linear-gradient(90deg, #22c55e, #f59e0b, #ef4444)',
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[#64748b] mt-1">
            <span>0%</span>
            <span style={{ color: flood?.badge_color ?? '#ef4444', fontWeight: 600 }}>
              {flood?.label ?? 'HIGH FLOOD RISK'}
            </span>
            <span>100%</span>
          </div>
        </div>

        {/* Extra stats */}
        {weather && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="text-center">
              <p className="text-[10px] text-[#64748b]">Visibility</p>
              <p className="text-[13px] font-mono-num text-[#e2e8f0]">{formatVisibility(weather.visibility)}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-[#64748b]">Condition</p>
              <p className="text-[13px] text-[#e2e8f0]">
                {weatherEmoji(weather.condition)} {weather.condition.replace('_', ' ')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
