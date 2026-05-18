// ============================================================
// SafeRoute AI — Disaster Detection Logic
// Rule-based intelligent detection from weather + reports
// ============================================================

import type { WeatherData, DisasterReport, Alert, AlertType, SeverityLevel } from '@/types';
import { computeFloodRisk, computeWeatherRisk } from './risk-engine';

// ---------- Flood Detection ----------

export interface FloodDetectionResult {
  is_flooding: boolean;
  severity: SeverityLevel;
  confidence: number;   // 0–1
  reasons: string[];
}

export function detectFloodRisk(weather: WeatherData): FloodDetectionResult {
  const floodScore = computeFloodRisk(weather);
  const reasons: string[] = [];

  if (weather.rainfall_1h >= 30)  reasons.push(`Violent rainfall: ${weather.rainfall_1h.toFixed(1)} mm/h`);
  else if (weather.rainfall_1h >= 15) reasons.push(`Heavy rainfall: ${weather.rainfall_1h.toFixed(1)} mm/h`);
  else if (weather.rainfall_1h >= 7)  reasons.push(`Moderate rainfall: ${weather.rainfall_1h.toFixed(1)} mm/h`);

  if (weather.humidity > 90) reasons.push(`Critical humidity: ${weather.humidity}%`);
  if (weather.condition === 'flood') reasons.push('Flood condition reported by weather station');
  if (weather.condition === 'storm') reasons.push('Active storm increases surface runoff');

  const severity: SeverityLevel =
    floodScore >= 8 ? 'critical' :
    floodScore >= 6 ? 'high' :
    floodScore >= 3 ? 'medium' : 'low';

  return {
    is_flooding: floodScore >= 3,
    severity,
    confidence: clamp(floodScore / 10, 0, 1),
    reasons,
  };
}

// ---------- Storm / Visibility Detection ----------

export interface VisibilityHazard {
  is_hazardous: boolean;
  severity: SeverityLevel;
  visibility_m: number;
  wind_speed_ms: number;
  reasons: string[];
}

export function detectVisibilityHazard(weather: WeatherData): VisibilityHazard {
  const reasons: string[] = [];

  if (weather.visibility < 200)  reasons.push(`Near-zero visibility: ${weather.visibility}m`);
  else if (weather.visibility < 500)  reasons.push(`Very poor visibility: ${weather.visibility}m`);
  else if (weather.visibility < 1000) reasons.push(`Poor visibility: ${weather.visibility}m`);

  if (weather.wind_speed > 25) reasons.push(`Dangerous winds: ${(weather.wind_speed * 3.6).toFixed(0)} km/h`);
  else if (weather.wind_speed > 15) reasons.push(`Strong winds: ${(weather.wind_speed * 3.6).toFixed(0)} km/h`);

  if (weather.condition === 'fog') reasons.push('Dense fog conditions');
  if (weather.condition === 'storm') reasons.push('Active thunderstorm');

  const weatherScore = computeWeatherRisk(weather);
  const severity: SeverityLevel =
    weatherScore >= 8 ? 'critical' :
    weatherScore >= 6 ? 'high' :
    weatherScore >= 3 ? 'medium' : 'low';

  return {
    is_hazardous: weatherScore >= 3,
    severity,
    visibility_m: weather.visibility,
    wind_speed_ms: weather.wind_speed,
    reasons,
  };
}

// ---------- Road Safety Classification ----------

export type RoadSafetyStatus = 'safe' | 'caution' | 'dangerous' | 'impassable';

export function classifyRoadSafety(
  weather: WeatherData,
  activeReports: DisasterReport[]
): { status: RoadSafetyStatus; reasons: string[] } {
  const reasons: string[] = [];
  const flood = detectFloodRisk(weather);
  const visibility = detectVisibilityHazard(weather);

  // Impassable: any critical flood report nearby OR violent rain
  const criticalReports = activeReports.filter(r => r.severity === 'critical');
  if (criticalReports.length > 0) {
    reasons.push(`${criticalReports.length} critical incident(s) reported`);
    return { status: 'impassable', reasons };
  }
  if (weather.rainfall_1h >= 30 || weather.condition === 'flood') {
    reasons.push('Extreme rainfall or flood condition');
    return { status: 'impassable', reasons };
  }

  // Dangerous: high-severity reports or heavy rain
  const highReports = activeReports.filter(r => r.severity === 'high');
  if (highReports.length >= 2 || (flood.severity === 'high' && visibility.severity === 'high')) {
    reasons.push('Multiple high-severity hazards detected');
    return { status: 'dangerous', reasons };
  }
  if (weather.rainfall_1h >= 15 || flood.severity === 'high') {
    reasons.push('Heavy rainfall — dangerous conditions');
    return { status: 'dangerous', reasons };
  }

  // Caution: moderate reports or rain
  if (activeReports.length > 0 || flood.severity === 'medium' || visibility.severity === 'medium') {
    if (activeReports.length) reasons.push(`${activeReports.length} active incident report(s)`);
    if (flood.severity === 'medium') reasons.push('Moderate flood risk');
    if (visibility.severity === 'medium') reasons.push('Reduced visibility');
    return { status: 'caution', reasons };
  }

  reasons.push('No significant hazards detected');
  return { status: 'safe', reasons };
}

// ---------- Auto-generate Alerts ----------

/**
 * Given current weather and active disaster reports,
 * automatically generate system alerts.
 */
export function generateSystemAlerts(
  weather: WeatherData,
  location_name: string,
  reports: DisasterReport[]
): Omit<Alert, 'id' | 'created_at'>[] {
  const alerts: Omit<Alert, 'id' | 'created_at'>[] = [];
  const flood = detectFloodRisk(weather);
  const vis   = detectVisibilityHazard(weather);

  // Flood warning
  if (flood.is_flooding && (flood.severity === 'high' || flood.severity === 'critical')) {
    alerts.push({
      type: 'flood_warning',
      severity: flood.severity,
      title: `Flood Warning — ${location_name}`,
      description: flood.reasons.join('. ') + '. Avoid low-lying roads.',
      affected_roads: [],
      location_name,
      source: 'weather_api',
      active: true,
    });
  }

  // Storm warning
  if (vis.is_hazardous && (vis.severity === 'high' || vis.severity === 'critical')) {
    alerts.push({
      type: 'storm_warning',
      severity: vis.severity,
      title: `Storm Warning — ${location_name}`,
      description: vis.reasons.join('. ') + '. Drive with extreme caution.',
      affected_roads: [],
      location_name,
      source: 'weather_api',
      active: true,
    });
  }

  // Road closure alerts from reports
  const closures = reports.filter(r => r.type === 'road_closure' && r.verified);
  closures.forEach(r => {
    alerts.push({
      type: 'road_closure',
      severity: r.severity,
      title: `Road Closure — ${r.location_name}`,
      description: r.description,
      affected_roads: [r.location_name],
      location: r.location,
      location_name: r.location_name,
      source: 'crowdsourced',
      active: true,
    });
  });

  // Emergency reroute if critical
  const road = classifyRoadSafety(weather, reports);
  if (road.status === 'impassable') {
    alerts.push({
      type: 'emergency_reroute',
      severity: 'critical',
      title: `Emergency Rerouting Active — ${location_name}`,
      description: 'AI engine has detected impassable conditions. All routes are being recalculated.',
      affected_roads: [],
      location_name,
      source: 'system',
      active: true,
    });
  }

  return alerts;
}

// ---------- Predictive Flood Warning ----------

export interface PredictiveFloodWarning {
  probability: number;   // 0–100
  time_horizon_hours: number;
  label: string;
  badge_color: string;
}

/**
 * Predict flood probability over the next N hours using
 * current rainfall, humidity, and condition trends.
 */
export function predictFloodProbability(weather: WeatherData): PredictiveFloodWarning {
  let probability = 0;

  // Base from rainfall
  probability += Math.min(50, (weather.rainfall_1h / 30) * 50);

  // Humidity factor
  if (weather.humidity > 95) probability += 25;
  else if (weather.humidity > 90) probability += 15;
  else if (weather.humidity > 80) probability += 5;

  // Condition factor
  if (weather.condition === 'flood')      probability += 30;
  else if (weather.condition === 'storm') probability += 20;
  else if (weather.condition === 'heavy_rain') probability += 15;
  else if (weather.condition === 'rain')  probability += 8;

  probability = clamp(Math.round(probability), 0, 100);

  const label =
    probability >= 80 ? 'IMMINENT FLOOD' :
    probability >= 60 ? 'HIGH FLOOD RISK' :
    probability >= 40 ? 'MODERATE FLOOD RISK' :
    probability >= 20 ? 'LOW FLOOD RISK' : 'MINIMAL RISK';

  const badge_color =
    probability >= 80 ? '#ef4444' :
    probability >= 60 ? '#f97316' :
    probability >= 40 ? '#f59e0b' :
    probability >= 20 ? '#22c55e' : '#64748b';

  return {
    probability,
    time_horizon_hours: 3,
    label,
    badge_color,
  };
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}
