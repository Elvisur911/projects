-- ============================================================
-- SafeRoute AI — Supabase / PostgreSQL Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "postgis";   -- for geo queries

-- ============================================================
-- USERS (extends Supabase auth.users)
-- ============================================================
create table if not exists public.users (
  id          uuid references auth.users(id) on delete cascade primary key,
  email       text not null,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

alter table public.users enable row level security;

create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- DISASTER REPORTS (crowdsourced)
-- ============================================================
create table if not exists public.disaster_reports (
  id            uuid default uuid_generate_v4() primary key,
  user_id       uuid references public.users(id) on delete set null,
  type          text not null check (type in (
    'flood','landslide','road_closure','storm_damage',
    'traffic_jam','debris','drainage_failure','other'
  )),
  severity      text not null check (severity in ('low','medium','high','critical')),
  title         text not null,
  description   text not null,
  lat           double precision not null,
  lng           double precision not null,
  location_name text not null,
  verified      boolean default false,
  upvotes       integer default 0,
  image_url     text,
  created_at    timestamptz default now() not null,
  expires_at    timestamptz
);

alter table public.disaster_reports enable row level security;

create policy "Anyone can read active disaster reports"
  on public.disaster_reports for select
  using (expires_at is null or expires_at > now());

create policy "Authenticated users can insert reports"
  on public.disaster_reports for insert
  with check (auth.uid() is not null);

create policy "Users can update their own reports"
  on public.disaster_reports for update
  using (auth.uid() = user_id);

create index idx_disaster_reports_location
  on public.disaster_reports using gist (
    st_point(lng, lat)
  );

create index idx_disaster_reports_type_severity
  on public.disaster_reports (type, severity, created_at desc);

-- ============================================================
-- ROAD RISKS
-- ============================================================
create table if not exists public.road_risks (
  id              uuid default uuid_generate_v4() primary key,
  road_name       text not null,
  road_segment_id text,
  risk_score      numeric(4,2) default 0 check (risk_score between 0 and 10),
  risk_level      text not null check (risk_level in ('low','moderate','high','critical')),
  flood_depth_cm  numeric(6,2),
  is_passable     boolean default true,
  lat             double precision not null,
  lng             double precision not null,
  last_updated    timestamptz default now() not null
);

alter table public.road_risks enable row level security;

create policy "Anyone can read road risks"
  on public.road_risks for select using (true);

create index idx_road_risks_level
  on public.road_risks (risk_level, last_updated desc);

-- ============================================================
-- ROUTES (saved user routes)
-- ============================================================
create table if not exists public.routes (
  id                 uuid default uuid_generate_v4() primary key,
  user_id            uuid references public.users(id) on delete cascade not null,
  origin_name        text not null,
  destination_name   text not null,
  origin_lat         double precision not null,
  origin_lng         double precision not null,
  dest_lat           double precision not null,
  dest_lng           double precision not null,
  distance_km        numeric(8,2) not null,
  duration_minutes   numeric(8,2) not null,
  safety_percentage  integer not null check (safety_percentage between 0 and 100),
  risk_score         numeric(4,2) not null,
  risk_level         text not null check (risk_level in ('low','moderate','high','critical')),
  geojson            jsonb,
  created_at         timestamptz default now() not null
);

alter table public.routes enable row level security;

create policy "Users can read own routes"
  on public.routes for select
  using (auth.uid() = user_id);

create policy "Users can insert own routes"
  on public.routes for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own routes"
  on public.routes for delete
  using (auth.uid() = user_id);

create index idx_routes_user
  on public.routes (user_id, created_at desc);

-- ============================================================
-- WEATHER LOGS
-- ============================================================
create table if not exists public.weather_logs (
  id            uuid default uuid_generate_v4() primary key,
  lat           double precision not null,
  lng           double precision not null,
  location_name text not null,
  temperature   numeric(5,2),
  humidity      integer,
  rainfall_1h   numeric(6,2) default 0,
  wind_speed    numeric(5,2) default 0,
  condition     text,
  raw_data      jsonb,
  created_at    timestamptz default now() not null
);

alter table public.weather_logs enable row level security;

create policy "Anyone can read weather logs"
  on public.weather_logs for select using (true);

-- Only server-side inserts (service role)
create index idx_weather_logs_location_time
  on public.weather_logs (lat, lng, created_at desc);

-- ============================================================
-- ALERTS
-- ============================================================
create table if not exists public.alerts (
  id             uuid default uuid_generate_v4() primary key,
  type           text not null check (type in (
    'flood_warning','road_closure','storm_warning',
    'landslide_warning','emergency_reroute','traffic_disruption'
  )),
  severity       text not null check (severity in ('low','medium','high','critical')),
  title          text not null,
  description    text not null,
  affected_roads text[] default '{}',
  lat            double precision,
  lng            double precision,
  location_name  text not null,
  source         text not null check (source in ('system','weather_api','crowdsourced','government')),
  active         boolean default true,
  created_at     timestamptz default now() not null,
  expires_at     timestamptz
);

alter table public.alerts enable row level security;

create policy "Anyone can read active alerts"
  on public.alerts for select
  using (active = true and (expires_at is null or expires_at > now()));

create index idx_alerts_active
  on public.alerts (active, severity, created_at desc);

-- ============================================================
-- REALTIME: enable for live updates
-- ============================================================
alter publication supabase_realtime add table public.alerts;
alter publication supabase_realtime add table public.disaster_reports;
alter publication supabase_realtime add table public.road_risks;

-- ============================================================
-- SEED: demo alerts
-- ============================================================
insert into public.alerts (type, severity, title, description, location_name, source, active)
values
  ('flood_warning',   'critical', 'Critical Flood — Ngong Road',    'Water level 1.2m above normal. Road impassable.',                'Ngong Road, Nairobi',     'weather_api',   true),
  ('storm_warning',   'high',     'Storm Warning — Mombasa Rd',     'Visibility reduced. Drive with extreme caution.',                'Mombasa Road, Nairobi',   'weather_api',   true),
  ('road_closure',    'high',     'Road Closure — Uhuru Highway',   'Emergency works underway. Alternate routes activated.',          'Uhuru Highway, Nairobi',  'government',    true),
  ('flood_warning',   'medium',   'Flood Watch — Industrial Area',  'Rising water levels near drainage channels.',                    'Industrial Area, Nairobi','system',        true),
  ('traffic_disruption','medium', 'Heavy Traffic — Waiyaki Way',    'Accident causing major delays. Expect 40-min delays.',           'Waiyaki Way, Westlands',  'crowdsourced',  true);

insert into public.road_risks (road_name, risk_score, risk_level, flood_depth_cm, is_passable, lat, lng)
values
  ('Ngong Road',      8.5, 'critical', 120, false, -1.3082, 36.7822),
  ('Mombasa Road',    6.2, 'high',      45, true,  -1.3200, 36.8400),
  ('Waiyaki Way',     4.5, 'moderate',   0, true,  -1.2680, 36.8050),
  ('Thika Road',      2.1, 'low',         0, true,  -1.2200, 36.8800),
  ('Uhuru Highway',   7.0, 'high',       20, true,  -1.2950, 36.8280);
