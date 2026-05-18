'use client';

import { Shield } from 'lucide-react';
import { useWeather } from '@/hooks/useWeather';
import { computeRiskScore } from '@/lib/risk-engine';
import { cn } from '@/utils';

const riskBars = [
  { key: 'flood_risk',      label: 'Flood Risk',    color: 'bg-gradient-to-r from-red-500 to-red-700' },
  { key: 'weather_risk',    label: 'Weather Risk',  color: 'bg-gradient-to-r from-yellow-500 to-orange-500' },
  { key: 'traffic_risk',    label: 'Traffic Risk',  color: 'bg-gradient-to-r from-cyan-500 to-blue-500' },
  { key: 'road_block_risk', label: 'Road Block',    color: 'bg-gradient-to-r from-green-500 to-emerald-500' },
  { key: 'landslide_risk',  label: 'Landslide',     color: 'bg-gradient-to-r from-purple-500 to-violet-500' },
] as const;

export default function RiskAnalysis() {
  const { weather } = useWeather();

  const risk = weather
    ? computeRiskScore(weather, 1)
    : {
        total: 3.2, flood_risk: 6.5, weather_risk: 4.5,
        traffic_risk: 3.0, road_block_risk: 2.0, landslide_risk: 1.5,
        safety_percentage: 76, level: 'moderate' as const,
      };

  const levelColors = {
    low:      'text-green-400  bg-green-500/10  border-green-500/20',
    moderate: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    high:     'text-orange-400 bg-orange-500/10 border-orange-500/20',
    critical: 'text-red-400    bg-red-500/10    border-red-500/20',
  };

  // SVG ring
  const radius = 40;
  const circ   = 2 * Math.PI * radius;
  const offset = circ * (1 - risk.safety_percentage / 100);

  return (
    <div className="sr-card">
      <div className="sr-card-header">
        <div className="sr-card-title">
          <Shield className="w-4 h-4 text-cyan-400" />
          Risk Analysis
        </div>
        <span className={cn('text-[10px] px-2 py-0.5 rounded border font-semibold uppercase', levelColors[risk.level])}>
          {risk.level}
        </span>
      </div>

      <div className="sr-card-body">
        {/* Safety ring */}
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r={radius} fill="none" stroke="#1a2235" strokeWidth="8" />
              <circle
                cx="50" cy="50" r={radius}
                fill="none"
                stroke="url(#safetyGrad)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                transform="rotate(-90 50 50)"
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
              <defs>
                <linearGradient id="safetyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor="#22c55e" />
                  <stop offset="60%"  stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
              <text x="50" y="46" textAnchor="middle" fill="#e2e8f0" fontSize="18"
                    fontWeight="700" fontFamily="var(--font-jetbrains-mono, monospace)">
                {risk.safety_percentage}
              </text>
              <text x="50" y="60" textAnchor="middle" fill="#64748b" fontSize="9"
                    fontFamily="var(--font-space-grotesk, sans-serif)">SAFETY %</text>
            </svg>
          </div>
        </div>

        {/* Risk bars */}
        <div className="space-y-2.5">
          {riskBars.map(({ key, label, color }) => {
            const val = risk[key];
            return (
              <div key={key} className="flex items-center gap-2.5">
                <span className="text-[11px] text-[#94a3b8] w-[80px] flex-shrink-0">{label}</span>
                <div className="flex-1 h-1.5 bg-[#111827] rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-700', color)}
                    style={{ width: `${val * 10}%` }}
                  />
                </div>
                <span className="text-[11px] font-mono-num text-[#64748b] w-7 text-right">{val}</span>
              </div>
            );
          })}
        </div>

        {/* Composite score */}
        <div className="mt-3 pt-3 border-t border-[#1e2d47] flex justify-between items-center">
          <span className="text-[11px] text-[#64748b]">Composite Risk Score</span>
          <span className={cn('text-[14px] font-bold font-mono-num',
            risk.level === 'low' ? 'text-green-400' :
            risk.level === 'moderate' ? 'text-yellow-400' :
            risk.level === 'high' ? 'text-orange-400' : 'text-red-400'
          )}>
            {risk.total} / 10
          </span>
        </div>
      </div>
    </div>
  );
}
