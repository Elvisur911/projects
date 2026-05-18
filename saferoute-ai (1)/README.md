# ⚡ SafeRoute AI

**Intelligent Disaster-Safe Routing Platform**

AI-powered routing that detects floods, landslides, and road hazards in real time — recommending the *safest* route, not just the shortest.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🗺️ **Live Risk Map** | Mapbox GL map with flood zones, road risk markers, animated safe routes |
| 🧠 **AI Risk Engine** | Composite risk scoring: `FloodRisk + WeatherRisk + TrafficRisk + RoadBlockRisk` |
| 🌧️ **Weather Intel** | OpenWeatherMap integration with predictive flood probability badges |
| 🚦 **Safe Routing** | OpenRouteService with risk-weighted route cost model |
| 🔔 **Live Alerts** | Supabase Realtime flood, storm, closure, and emergency alerts |
| 👥 **Crowdsourced** | Incident reporting with AI verification badge |
| 📊 **Analytics** | Recharts dashboards — flood trends, safety %, active zones |
| 🚨 **Emergency Mode** | One-click emergency rerouting toggle |
| 🔐 **Auth** | Supabase Auth with protected dashboard routes |

---

## 🏗️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL + Realtime)
- **Map**: Mapbox GL JS + react-map-gl
- **Charts**: Recharts
- **Weather**: OpenWeatherMap API
- **Routing**: OpenRouteService API
- **Animations**: Framer Motion
- **State**: Zustand + React hooks

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/your-org/saferoute-ai.git
cd saferoute-ai
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
# Supabase — https://supabase.com/dashboard
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Mapbox — https://account.mapbox.com
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ...

# OpenWeatherMap — https://openweathermap.org/api
OPENWEATHER_API_KEY=abc123...

# OpenRouteService — https://openrouteservice.org
ORS_API_KEY=5b3ce3...

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set up Supabase database

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor**
3. Paste and run the contents of `supabase/schema.sql`

This creates all tables, RLS policies, realtime subscriptions, and seed data.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
saferoute-ai/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx         # Login page
│   │   ├── signup/page.tsx        # Signup page
│   │   └── callback/route.ts      # Supabase OAuth callback
│   ├── dashboard/
│   │   ├── layout.tsx             # Protected layout (sidebar + topbar)
│   │   ├── page.tsx               # Main dashboard
│   │   ├── map/page.tsx           # Full-page live map
│   │   ├── routes/page.tsx        # Route planner page
│   │   ├── alerts/page.tsx        # All alerts
│   │   ├── analytics/page.tsx     # Analytics dashboard
│   │   ├── reports/page.tsx       # Incident reports
│   │   ├── history/page.tsx       # Route history
│   │   └── settings/page.tsx      # User settings
│   ├── api/
│   │   ├── weather/route.ts       # OpenWeatherMap proxy
│   │   ├── routing/route.ts       # ORS + risk scoring
│   │   ├── risk-score/route.ts    # Standalone risk scoring
│   │   ├── alerts/route.ts        # CRUD for alerts
│   │   └── disaster-reports/route.ts
│   ├── globals.css                # Design tokens + global styles
│   └── layout.tsx                 # Root layout
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx            # Navigation sidebar
│   │   └── Topbar.tsx             # Header with search + emergency
│   ├── dashboard/
│   │   ├── StatsRow.tsx           # 5 KPI cards
│   │   ├── RiskAnalysis.tsx       # SVG risk ring + bars
│   │   ├── WeatherPanel.tsx       # Weather grid + flood probability
│   │   ├── EmergencyToggle.tsx    # Emergency mode button
│   │   └── IncidentFeed.tsx       # Reports feed + submit modal
│   ├── map/
│   │   └── MapPanel.tsx           # Full Mapbox GL map component
│   ├── routing/
│   │   └── RoutePlanner.tsx       # Route form + results
│   ├── alerts/
│   │   └── AlertsPanel.tsx        # Dismissible alert cards
│   └── analytics/
│       └── AnalyticsCharts.tsx    # Recharts area/bar/table
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Browser Supabase client
│   │   └── server.ts              # Server Supabase client
│   ├── risk-engine.ts             # Core risk scoring logic
│   └── disaster-detection.ts     # Rule-based hazard detection
│
├── hooks/
│   ├── useWeather.ts              # Weather fetch + auto-refresh
│   ├── useAlerts.ts               # Realtime alerts subscription
│   └── useRoute.ts                # Route generation hook
│
├── types/index.ts                 # All TypeScript types
├── utils/index.ts                 # Shared utility functions
├── constants/index.ts             # App constants + config
├── middleware.ts                  # Auth route protection
└── supabase/schema.sql            # Full DB schema + seed
```

---

## 🧠 Risk Engine

The scoring model:

```
RiskScore = (FloodRisk × 0.35) + (WeatherRisk × 0.25) + (TrafficRisk × 0.15) + (RoadBlockRisk × 0.15) + (LandslideRisk × 0.10)

RouteCost  = (DistanceWeight × 0.30 × normalizedDist) + (RiskWeight × 0.70 × riskScore/10)
```

**FloodRisk** is driven by `rainfall_1h`, humidity, and weather condition.  
**WeatherRisk** factors in visibility, wind speed, and storm conditions.  
**TrafficRisk** uses time-of-day rush hour + weather amplification.  
**RoadBlockRisk** counts verified high-severity incident reports.  
**LandslideRisk** factors rainfall + elevation.

---

## 🌍 Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel Dashboard or:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_MAPBOX_TOKEN
vercel env add OPENWEATHER_API_KEY
vercel env add ORS_API_KEY
vercel env add NEXT_PUBLIC_APP_URL   # your-app.vercel.app

# Production deploy
vercel --prod
```

**Important**: In Supabase → Authentication → URL Configuration, add your Vercel URL to **Redirect URLs**:
```
https://your-app.vercel.app/auth/callback
```

---

## 🔑 API Keys

| Service | Free Tier | Get it at |
|---|---|---|
| Supabase | 500MB DB, 2GB bandwidth | [supabase.com](https://supabase.com) |
| Mapbox | 50k map loads/month | [account.mapbox.com](https://account.mapbox.com) |
| OpenWeatherMap | 60 calls/min, 1M/month | [openweathermap.org/api](https://openweathermap.org/api) |
| OpenRouteService | 2,000 requests/day | [openrouteservice.org](https://openrouteservice.org) |

> All services have generous free tiers. The app works without API keys using realistic demo data fallbacks.

---

## 🛡️ Demo Account

To use the demo login button, create this user in your Supabase project:
- **Email**: `demo@saferoute.ai`
- **Password**: `SafeRoute2024!`

Or simply sign up with any email.

---

## 📄 License

MIT — build something that saves lives.
