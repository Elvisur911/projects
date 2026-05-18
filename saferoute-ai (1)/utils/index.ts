// ============================================================
// SafeRoute AI — Utility Functions
// ============================================================

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { RiskLevel, SeverityLevel } from '@/types';

// --- Tailwind class merger ---
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Risk level helpers ---
export function riskLevelColor(level: RiskLevel): string {
  const map: Record<RiskLevel, string> = {
    low:      'text-green-400',
    moderate: 'text-yellow-400',
    high:     'text-orange-400',
    critical: 'text-red-500',
  };
  return map[level];
}

export function riskLevelBg(level: RiskLevel): string {
  const map: Record<RiskLevel, string> = {
    low:      'bg-green-500/10 border-green-500/20',
    moderate: 'bg-yellow-500/10 border-yellow-500/20',
    high:     'bg-orange-500/10 border-orange-500/20',
    critical: 'bg-red-500/10 border-red-500/20',
  };
  return map[level];
}

export function severityColor(level: SeverityLevel): string {
  const map: Record<SeverityLevel, string> = {
    low:      'text-green-400',
    medium:   'text-yellow-400',
    high:     'text-orange-400',
    critical: 'text-red-500',
  };
  return map[level];
}

export function severityBg(level: SeverityLevel): string {
  const map: Record<SeverityLevel, string> = {
    low:      'bg-green-500/10 border-green-500/20',
    medium:   'bg-yellow-500/10 border-yellow-500/20',
    high:     'bg-orange-500/10 border-orange-500/20',
    critical: 'bg-red-500/10 border-red-500/20',
  };
  return map[level];
}

// --- Format helpers ---
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatWindSpeed(ms: number): string {
  return `${(ms * 3.6).toFixed(0)} km/h`;
}

export function formatTemperature(c: number): string {
  return `${Math.round(c)}°C`;
}

export function formatVisibility(m: number): string {
  if (m >= 10000) return '10+ km';
  if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
  return `${m} m`;
}

export function formatRainfall(mm: number): string {
  return `${mm.toFixed(1)} mm/h`;
}

export function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

// --- Geo helpers ---
export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371; // Earth radius km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

export function coordsToGeoJSON(
  coords: [number, number][]
): GeoJSON.LineString {
  return {
    type: 'LineString',
    coordinates: coords,
  };
}

// --- Weather icon helper ---
export function weatherEmoji(condition: string): string {
  const map: Record<string, string> = {
    clear: '☀️',
    cloudy: '☁️',
    rain: '🌧️',
    heavy_rain: '⛈️',
    storm: '🌩️',
    flood: '🌊',
    fog: '🌫️',
    snow: '❄️',
  };
  return map[condition] ?? '🌡️';
}

// --- Random ID generator (for demo data) ---
export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// --- Clamp ---
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// --- Safety percentage color ---
export function safetyColor(pct: number): string {
  if (pct >= 80) return 'text-green-400';
  if (pct >= 60) return 'text-yellow-400';
  if (pct >= 40) return 'text-orange-400';
  return 'text-red-500';
}

export function safetyGradient(pct: number): string {
  if (pct >= 80) return 'from-green-500 to-emerald-500';
  if (pct >= 60) return 'from-yellow-500 to-amber-500';
  if (pct >= 40) return 'from-orange-500 to-red-400';
  return 'from-red-500 to-rose-600';
}

// --- Truncate text ---
export function truncate(str: string, len = 60): string {
  return str.length > len ? str.slice(0, len) + '…' : str;
}

// --- Capitalize ---
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
}
