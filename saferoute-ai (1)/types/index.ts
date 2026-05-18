// ============================================================
// SafeRoute AI — Global TypeScript Types
// ============================================================

// --- Auth ---
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}

// --- Coordinates ---
export interface LatLng {
  lat: number;
  lng: number;
}

// --- Weather ---
export interface WeatherData {
  temperature: number;        // °C
  feels_like: number;
  humidity: number;           // %
  pressure: number;           // hPa
  wind_speed: number;         // m/s
  wind_direction: number;     // degrees
  visibility: number;         // meters
  rainfall_1h: number;        // mm
  rainfall_3h: number;        // mm
  description: string;
  icon: string;
  condition: WeatherCondition;
  timestamp: string;
}

export type WeatherCondition =
  | 'clear'
  | 'cloudy'
  | 'rain'
  | 'heavy_rain'
  | 'storm'
  | 'flood'
  | 'fog'
  | 'snow';

// --- Risk Scoring ---
export interface RiskScore {
  total: number;              // 0–10 composite
  flood_risk: number;         // 0–10
  weather_risk: number;       // 0–10
  traffic_risk: number;       // 0–10
  road_block_risk: number;    // 0–10
  landslide_risk: number;     // 0–10
  safety_percentage: number;  // 0–100 (inverse of risk)
  level: RiskLevel;
}

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

// --- Routing ---
export interface RouteRequest {
  origin: string | LatLng;
  destination: string | LatLng;
  avoid_floods: boolean;
  avoid_storms: boolean;
  avoid_road_blocks: boolean;
  avoid_traffic: boolean;
  profile: 'driving-car' | 'driving-hgv' | 'foot-walking';
}

export interface RouteResult {
  id: string;
  coordinates: [number, number][];   // [lng, lat] pairs for Mapbox
  distance_km: number;
  duration_minutes: number;
  risk_score: RiskScore;
  waypoints: RouteWaypoint[];
  warnings: string[];
  alternative_exists: boolean;
  computed_at: string;
}

export interface RouteWaypoint {
  coordinates: LatLng;
  instruction: string;
  distance: number;
  duration: number;
}

// --- Disaster Reports ---
export interface DisasterReport {
  id: string;
  user_id: string;
  type: DisasterType;
  severity: SeverityLevel;
  title: string;
  description: string;
  location: LatLng;
  location_name: string;
  verified: boolean;
  upvotes: number;
  image_url?: string;
  created_at: string;
  expires_at?: string;
}

export type DisasterType =
  | 'flood'
  | 'landslide'
  | 'road_closure'
  | 'storm_damage'
  | 'traffic_jam'
  | 'debris'
  | 'drainage_failure'
  | 'other';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

// --- Alerts ---
export interface Alert {
  id: string;
  type: AlertType;
  severity: SeverityLevel;
  title: string;
  description: string;
  affected_roads: string[];
  location?: LatLng;
  location_name: string;
  source: 'system' | 'weather_api' | 'crowdsourced' | 'government';
  active: boolean;
  created_at: string;
  expires_at?: string;
}

export type AlertType =
  | 'flood_warning'
  | 'road_closure'
  | 'storm_warning'
  | 'landslide_warning'
  | 'emergency_reroute'
  | 'traffic_disruption';

// --- Road Risk ---
export interface RoadRisk {
  id: string;
  road_name: string;
  road_segment_id?: string;
  risk_score: number;
  risk_level: RiskLevel;
  flood_depth?: number;       // cm
  is_passable: boolean;
  last_updated: string;
  coordinates: LatLng[];
}

// --- Analytics ---
export interface AnalyticsData {
  flood_risk_trend: TrendPoint[];
  safety_percentage_trend: TrendPoint[];
  active_disaster_zones: ActiveZone[];
  total_alerts: number;
  total_safe_routes: number;
  total_flood_zones: number;
  total_road_closures: number;
  incidents_reported: number;
}

export interface TrendPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ActiveZone {
  name: string;
  risk_level: RiskLevel;
  risk_percentage: number;
  type: DisasterType;
}

// --- Weather Log (DB) ---
export interface WeatherLog {
  id: string;
  location: LatLng;
  location_name: string;
  data: WeatherData;
  created_at: string;
}

// --- Supabase DB Row Types ---
export interface DbUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbDisasterReport {
  id: string;
  user_id: string;
  type: DisasterType;
  severity: SeverityLevel;
  title: string;
  description: string;
  lat: number;
  lng: number;
  location_name: string;
  verified: boolean;
  upvotes: number;
  image_url: string | null;
  created_at: string;
  expires_at: string | null;
}

export interface DbAlert {
  id: string;
  type: AlertType;
  severity: SeverityLevel;
  title: string;
  description: string;
  affected_roads: string[];
  lat: number | null;
  lng: number | null;
  location_name: string;
  source: string;
  active: boolean;
  created_at: string;
  expires_at: string | null;
}

export interface DbRoute {
  id: string;
  user_id: string;
  origin_name: string;
  destination_name: string;
  origin_lat: number;
  origin_lng: number;
  dest_lat: number;
  dest_lng: number;
  distance_km: number;
  duration_minutes: number;
  safety_percentage: number;
  risk_score: number;
  risk_level: RiskLevel;
  geojson: object;
  created_at: string;
}

export interface DbRoadRisk {
  id: string;
  road_name: string;
  risk_score: number;
  risk_level: RiskLevel;
  flood_depth: number | null;
  is_passable: boolean;
  lat: number;
  lng: number;
  last_updated: string;
}

export interface DbWeatherLog {
  id: string;
  lat: number;
  lng: number;
  location_name: string;
  temperature: number;
  humidity: number;
  rainfall_1h: number;
  wind_speed: number;
  condition: WeatherCondition;
  raw_data: object;
  created_at: string;
}

// --- UI State ---
export interface DashboardState {
  emergency_mode: boolean;
  selected_alert: Alert | null;
  map_style: 'dark' | 'satellite' | 'streets';
  show_flood_layer: boolean;
  show_risk_heatmap: boolean;
  show_weather_overlay: boolean;
  active_route: RouteResult | null;
}

// --- API Responses ---
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}
