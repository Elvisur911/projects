// ============================================================
// SafeRoute AI — Risk Scoring Engine
// RiskScore = FloodRisk + WeatherRisk + TrafficRisk + RoadBlockRisk
// RouteCost  = DistanceWeight * distance + RiskWeight * riskScore
// ============================================================

import type { WeatherData, RiskScore, RiskLevel, WeatherCondition } from '@/types';
import {
  WEATHER_RISK_MULTIPLIERS,
  FLOOD_RISK_RAINFALL,
  ROUTE_WEIGHTS,
  RISK_THRESHOLDS,
} from '@/constants';

// ---------- individual sub-scores (0–10) ----------

/**
 * FloodRisk: driven by rainfall, humidity, and weather condition.
 */
export function computeFloodRisk(weather: WeatherData): number {
  const rainfall = weather.rainfall_1h ?? 0;
  let score = 0;

  if (rainfall >= FLOOD_RISK_RAINFALL.critical) score = 10;
  else if (rainfall >= FLOOD_RISK_RAINFALL.high)     score = 7 + 3 * ((rainfall - FLOOD_RISK_RAINFALL.high) / (FLOOD_RISK_RAINFALL.critical - FLOOD_RISK_RAINFALL.high));
  else if (rainfall >= FLOOD_RISK_RAINFALL.moderate) score = 4 + 3 * ((rainfall - FLOOD_RISK_RAINFALL.moderate) / (FLOOD_RISK_RAINFALL.high - FLOOD_RISK_RAINFALL.moderate));
  else if (rainfall >= FLOOD_RISK_RAINFALL.low)      score = 1 + 3 * ((rainfall - FLOOD_RISK_RAINFALL.low) / (FLOOD_RISK_RAINFALL.moderate - FLOOD_RISK_RAINFALL.low));
  else score = 0;

  // Humidity boost: >90% humidity adds up to 1.5 points
  if (weather.humidity > 90) score += 1.5;
  else if (weather.humidity > 80) score += 0.7;

  // Condition boost
  if (weather.condition === 'flood') score = Math.max(score, 9.5);
  if (weather.condition === 'storm') score = Math.max(score, 7.0);

  return clamp(score, 0, 10);
}

/**
 * WeatherRisk: visibility, wind, and condition-based.
 */
export function computeWeatherRisk(weather: WeatherData): number {
  let score = WEATHER_RISK_MULTIPLIERS[weather.condition as WeatherCondition] * 10;

  // Poor visibility: < 1000m is dangerous
  if (weather.visibility < 200)       score += 3;
  else if (weather.visibility < 500)  score += 2;
  else if (weather.visibility < 1000) score += 1;

  // High wind: > 20 m/s (72 km/h) is dangerous
  if (weather.wind_speed > 30)      score += 3;
  else if (weather.wind_speed > 20) score += 2;
  else if (weather.wind_speed > 12) score += 1;

  return clamp(score, 0, 10);
}

/**
 * TrafficRisk: simulated from time of day + weather pressure.
 * In production this would use real-time traffic data.
 */
export function computeTrafficRisk(weather: WeatherData, hour?: number): number {
  const h = hour ?? new Date().getHours();
  let score = 0;

  // Rush hours: 7–9 AM and 5–7 PM
  if ((h >= 7 && h <= 9) || (h >= 17 && h <= 19)) score = 6;
  else if ((h >= 10 && h <= 16) || (h >= 20 && h <= 22)) score = 3;
  else score = 1;

  // Bad weather amplifies traffic
  const weatherMultiplier = WEATHER_RISK_MULTIPLIERS[weather.condition as WeatherCondition];
  score += weatherMultiplier * 3;

  return clamp(score, 0, 10);
}

/**
 * RoadBlockRisk: based on active disaster reports for a segment.
 * activeBlocks = count of verified incidents on/near this route.
 */
export function computeRoadBlockRisk(activeBlocks: number): number {
  if (activeBlocks === 0) return 0;
  if (activeBlocks === 1) return 4;
  if (activeBlocks === 2) return 7;
  return Math.min(10, 7 + (activeBlocks - 2) * 1.5);
}

/**
 * LandslideRisk: driven by heavy rainfall + elevation (simulated).
 */
export function computeLandslideRisk(weather: WeatherData, elevationM?: number): number {
  const rainfall = weather.rainfall_1h ?? 0;
  let score = 0;
  if (rainfall >= 20) score = 7;
  else if (rainfall >= 10) score = 4;
  else if (rainfall >= 5)  score = 2;

  // Higher elevation increases landslide risk
  const elev = elevationM ?? 1700; // Nairobi default ~1700m
  if (elev > 2000) score += 2;
  else if (elev > 1800) score += 1;

  return clamp(score, 0, 10);
}

// ---------- composite scorer ----------

export function computeRiskScore(
  weather: WeatherData,
  activeBlocks = 0,
  elevationM?: number,
  hour?: number
): RiskScore {
  const flood_risk      = computeFloodRisk(weather);
  const weather_risk    = computeWeatherRisk(weather);
  const traffic_risk    = computeTrafficRisk(weather, hour);
  const road_block_risk = computeRoadBlockRisk(activeBlocks);
  const landslide_risk  = computeLandslideRisk(weather, elevationM);

  // Weighted composite (flood + weather most important)
  const total = clamp(
    flood_risk * 0.35 +
    weather_risk * 0.25 +
    traffic_risk * 0.15 +
    road_block_risk * 0.15 +
    landslide_risk * 0.10,
    0,
    10
  );

  const safety_percentage = Math.round((1 - total / 10) * 100);
  const level = getRiskLevel(total);

  return {
    total: round2(total),
    flood_risk: round2(flood_risk),
    weather_risk: round2(weather_risk),
    traffic_risk: round2(traffic_risk),
    road_block_risk: round2(road_block_risk),
    landslide_risk: round2(landslide_risk),
    safety_percentage,
    level,
  };
}

// ---------- route cost ----------

/**
 * RouteCost used to rank alternative routes.
 * Lower cost = better route.
 */
export function computeRouteCost(distanceKm: number, riskScore: number): number {
  const normalizedDist = distanceKm / 50; // normalize against 50 km reference
  return (
    ROUTE_WEIGHTS.distance * normalizedDist +
    ROUTE_WEIGHTS.risk * (riskScore / 10)
  );
}

// ---------- helpers ----------

export function getRiskLevel(score: number): RiskLevel {
  if (score >= RISK_THRESHOLDS.critical.min) return 'critical';
  if (score >= RISK_THRESHOLDS.high.min)     return 'high';
  if (score >= RISK_THRESHOLDS.moderate.min) return 'moderate';
  return 'low';
}

export function getRiskColor(level: RiskLevel): string {
  return RISK_THRESHOLDS[level].color;
}

export function getRiskLabel(level: RiskLevel): string {
  return RISK_THRESHOLDS[level].label;
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function round2(v: number) {
  return Math.round(v * 100) / 100;
}
