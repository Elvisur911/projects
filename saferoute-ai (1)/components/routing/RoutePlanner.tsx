'use client';

import { useState } from 'react';
import { ArrowUpDown, Sparkles, Loader2, Navigation, CheckCircle2, Droplets, CloudLightning, Construction, TrafficCone } from 'lucide-react';
import { cn } from '@/utils';
import type { RouteResult } from '@/types';

const riskFilters = [
  { key: 'avoid_floods',      label: 'Flood Zones',  icon: Droplets,      color: 'red' },
  { key: 'avoid_storms',      label: 'Storm Areas',  icon: CloudLightning, color: 'yellow' },
  { key: 'avoid_road_blocks', label: 'Road Blocks',  icon: Construction,  color: 'cyan' },
  { key: 'avoid_traffic',     label: 'Traffic Jams', icon: TrafficCone,   color: 'default' },
];

const colorMap: Record<string, string> = {
  red:     'border-red-500/30    bg-red-500/5    text-red-400',
  yellow:  'border-yellow-500/30 bg-yellow-500/5 text-yellow-400',
  cyan:    'border-cyan-500/30   bg-cyan-500/5   text-cyan-400',
  default: 'border-[#243450]     bg-[#111827]    text-[#e2e8f0]',
};

export default function RoutePlanner() {
  const [origin, setOrigin]       = useState('Westlands, Nairobi');
  const [dest, setDest]           = useState('CBD, Nairobi');
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState<RouteResult | null>(null);
  const [filters, setFilters]     = useState({
    avoid_floods: true,
    avoid_storms: true,
    avoid_road_blocks: true,
    avoid_traffic: false,
  });

  function swapLocations() {
    setOrigin(dest);
    setDest(origin);
  }

  function toggleFilter(key: string) {
    setFilters(f => ({ ...f, [key]: !f[key as keyof typeof f] }));
  }

  async function generateRoute() {
    if (!origin || !dest || loading) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/routing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination: dest, ...filters, profile: 'driving-car' }),
      });
      const data = await res.json();
      if (data.data) setResult(data.data);
    } catch {
      // Show a demo result if API not configured
      setResult({
        id: 'demo',
        coordinates: [],
        distance_km: 14.2,
        duration_minutes: 28,
        risk_score: {
          total: 2.4,
          flood_risk: 1.2,
          weather_risk: 0.8,
          traffic_risk: 0.3,
          road_block_risk: 0.1,
          landslide_risk: 0.0,
          safety_percentage: 92,
          level: 'low',
        },
        waypoints: [],
        warnings: [],
        alternative_exists: true,
        computed_at: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  }

  const safety = result?.risk_score.safety_percentage ?? 0;
  const safetyColor = safety >= 80 ? 'text-green-400' : safety >= 60 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="sr-card">
      <div className="sr-card-header">
        <div className="sr-card-title">
          <Navigation className="w-4 h-4 text-cyan-400" />
          Route Planner
        </div>
        <span className="badge-ai"><Sparkles className="w-3 h-3" />AI Routing</span>
      </div>

      <div className="sr-card-body space-y-3">
        {/* Origin */}
        <div>
          <label className="block text-[11px] text-[#64748b] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400" />From
          </label>
          <input
            value={origin}
            onChange={e => setOrigin(e.target.value)}
            className="sr-input"
            placeholder="Current location or address"
          />
        </div>

        {/* Swap */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-[#1e2d47]" />
          <button onClick={swapLocations}
            className="w-7 h-7 rounded-lg bg-[#111827] border border-[#1e2d47] flex items-center justify-center
                       text-[#64748b] hover:text-cyan-400 hover:border-cyan-500/30 transition-all group cursor-pointer">
            <ArrowUpDown className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          </button>
          <div className="flex-1 h-px bg-[#1e2d47]" />
        </div>

        {/* Destination */}
        <div>
          <label className="block text-[11px] text-[#64748b] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400" />To
          </label>
          <input
            value={dest}
            onChange={e => setDest(e.target.value)}
            className="sr-input"
            placeholder="Enter destination"
          />
        </div>

        {/* Risk filters */}
        <div>
          <p className="text-[11px] text-[#64748b] mb-2">Avoid risk factors:</p>
          <div className="grid grid-cols-2 gap-1.5">
            {riskFilters.map(f => {
              const active = filters[f.key as keyof typeof filters];
              return (
                <button
                  key={f.key}
                  onClick={() => toggleFilter(f.key)}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-[11px] font-medium transition-all cursor-pointer',
                    active ? colorMap[f.color] : 'border-[#1e2d47] bg-transparent text-[#64748b]'
                  )}>
                  <f.icon className="w-3.5 h-3.5 flex-shrink-0" />
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Generate button */}
        {result ? (
          <div>
            <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-[13px] font-semibold text-green-400">Route Generated</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Distance',  value: `${result.distance_km} km` },
                  { label: 'Duration',  value: `${Math.round(result.duration_minutes)} min` },
                  { label: 'Safety',    value: `${safety}%`,    color: safetyColor },
                  { label: 'Risk Score',value: `${result.risk_score.total}/10` },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-[#111827] rounded-lg p-2">
                    <p className="text-[10px] text-[#64748b]">{label}</p>
                    <p className={cn('text-[14px] font-bold font-mono-num mt-0.5', color ?? 'text-[#e2e8f0]')}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
              {result.warnings.length > 0 && (
                <div className="mt-2 space-y-1">
                  {result.warnings.map((w, i) => (
                    <p key={i} className="text-[11px] text-yellow-400 flex items-center gap-1.5">
                      ⚠ {w}
                    </p>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => setResult(null)} className="btn-primary">
              <Navigation className="w-4 h-4" />
              Calculate New Route
            </button>
          </div>
        ) : (
          <button onClick={generateRoute} disabled={loading} className="btn-primary">
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" />Calculating safest route…</>
              : <><Sparkles className="w-4 h-4" />Generate Safe Route</>
            }
          </button>
        )}
      </div>
    </div>
  );
}
