// ============================================================
// SafeRoute AI — Application Constants
// ============================================================

export const APP_NAME = 'SafeRoute AI';
export const APP_VERSION = '1.0.0';

// --- Map defaults (Nairobi) ---
export const DEFAULT_CENTER: [number, number] = [36.8219, -1.2921];
export const DEFAULT_ZOOM = 12;
export const MAX_ZOOM = 18;
export const MIN_ZOOM = 5;

// --- Map styles ---
export const MAP_STYLES = {
  dark: 'mapbox://styles/mapbox/dark-v11',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  streets: 'mapbox://styles/mapbox/streets-v12',
  navigation: 'mapbox://styles/mapbox/navigation-night-v1',
} as const;

// --- Risk thresholds ---
export const RISK_THRESHOLDS = {
  low: { min: 0, max: 3, label: 'Low Risk', color: '#22c55e' },
  moderate: { min: 3, max: 6, label: 'Moderate Risk', color: '#f59e0b' },
  high: { min: 6, max: 8, label: 'High Risk', color: '#f97316' },
  critical: { min: 8, max: 10, label: 'Critical Risk', color: '#ef4444' },
} as const;

// --- Weather risk multipliers for risk scoring ---
export const WEATHER_RISK_MULTIPLIERS = {
  clear: 0.0,
  cloudy: 0.1,
  fog: 0.3,
  rain: 0.5,
  heavy_rain: 0.8,
  storm: 1.0,
  flood: 1.0,
  snow: 0.6,
} as const;

// --- Flood risk: rainfall thresholds (mm/h) ---
export const FLOOD_RISK_RAINFALL = {
  none: 0,          // 0 mm/h
  low: 2.5,         // light rain
  moderate: 7.6,    // moderate rain
  high: 15.0,       // heavy rain
  critical: 30.0,   // violent rain
} as const;

// --- Route cost weights ---
export const ROUTE_WEIGHTS = {
  distance: 0.3,    // 30% weight on distance
  risk: 0.7,        // 70% weight on safety risk
} as const;

// --- Disaster type labels & icons ---
export const DISASTER_TYPE_CONFIG = {
  flood: { label: 'Flood', icon: '💧', color: '#3b82f6' },
  landslide: { label: 'Landslide', icon: '⛰️', color: '#a16207' },
  road_closure: { label: 'Road Closure', icon: '🚧', color: '#f59e0b' },
  storm_damage: { label: 'Storm Damage', icon: '⛈️', color: '#6366f1' },
  traffic_jam: { label: 'Traffic Jam', icon: '🚗', color: '#64748b' },
  debris: { label: 'Debris', icon: '🪨', color: '#92400e' },
  drainage_failure: { label: 'Drainage Failure', icon: '🌊', color: '#0e7490' },
  other: { label: 'Other', icon: '⚠️', color: '#94a3b8' },
} as const;

// --- Alert type labels ---
export const ALERT_TYPE_CONFIG = {
  flood_warning: { label: 'Flood Warning', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  road_closure: { label: 'Road Closure', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  storm_warning: { label: 'Storm Warning', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  landslide_warning: { label: 'Landslide Warning', color: '#a16207', bg: 'rgba(161,98,7,0.1)' },
  emergency_reroute: { label: 'Emergency Reroute', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  traffic_disruption: { label: 'Traffic Disruption', color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
} as const;

// --- Severity colors ---
export const SEVERITY_COLORS = {
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
} as const;

// --- Severity bg colors ---
export const SEVERITY_BG_COLORS = {
  low: 'rgba(34,197,94,0.1)',
  medium: 'rgba(245,158,11,0.1)',
  high: 'rgba(249,115,22,0.1)',
  critical: 'rgba(239,68,68,0.1)',
} as const;

// --- ORS profile ---
export const ORS_PROFILES = {
  'driving-car': 'driving-car',
  'driving-hgv': 'driving-hgv',
  'foot-walking': 'foot-walking',
} as const;

// --- Danger zone radius for avoidance (meters) ---
export const DANGER_ZONE_RADIUS = 500;

// --- Weather refresh interval (ms) ---
export const WEATHER_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

// --- Alert refresh interval (ms) ---
export const ALERTS_REFRESH_INTERVAL = 60 * 1000; // 1 minute

// --- Nairobi area bounding box ---
export const NAIROBI_BOUNDS = {
  sw: [36.6, -1.45] as [number, number],
  ne: [37.1, -1.1] as [number, number],
};

// --- Demo flood zone polygons (GeoJSON coordinates) for map overlays ---
export const DEMO_FLOOD_ZONES = [
  {
    id: 'ngong-road-flood',
    name: 'Ngong Road',
    severity: 'critical' as const,
    coordinates: [
      [36.778, -1.305],
      [36.792, -1.300],
      [36.798, -1.315],
      [36.782, -1.318],
      [36.778, -1.305],
    ],
  },
  {
    id: 'mombasa-road-flood',
    name: 'Mombasa Road',
    severity: 'high' as const,
    coordinates: [
      [36.84, -1.32],
      [36.855, -1.318],
      [36.858, -1.33],
      [36.843, -1.332],
      [36.84, -1.32],
    ],
  },
  {
    id: 'westlands-flood',
    name: 'Westlands',
    severity: 'moderate' as const,
    coordinates: [
      [36.805, -1.265],
      [36.818, -1.262],
      [36.82, -1.272],
      [36.808, -1.275],
      [36.805, -1.265],
    ],
  },
];

// --- Nav items ---
export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/dashboard/map', label: 'Live Map', icon: 'Map' },
  { href: '/dashboard/routes', label: 'Route Planner', icon: 'Route' },
  { href: '/dashboard/alerts', label: 'Alerts', icon: 'AlertTriangle', badge: true },
  { href: '/dashboard/analytics', label: 'Analytics', icon: 'BarChart3' },
  { href: '/dashboard/reports', label: 'Report Incident', icon: 'PlusCircle' },
  { href: '/dashboard/history', label: 'Route History', icon: 'History' },
  { href: '/dashboard/settings', label: 'Settings', icon: 'Settings' },
] as const;
