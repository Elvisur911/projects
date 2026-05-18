'use client';

import { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { cn } from '@/utils';

const floodTrend = [
  { day: 'Mon', value: 28 }, { day: 'Tue', value: 35 },
  { day: 'Wed', value: 42 }, { day: 'Thu', value: 72 },
  { day: 'Fri', value: 55 }, { day: 'Sat', value: 61 },
  { day: 'Sun', value: 48 },
];

const safetyTrend = [
  { day: 'Mon', value: 82 }, { day: 'Tue', value: 78 },
  { day: 'Wed', value: 71 }, { day: 'Thu', value: 55 },
  { day: 'Fri', value: 68 }, { day: 'Sat', value: 62 },
  { day: 'Sun', value: 73 },
];

const activeZones = [
  { name: 'Ngong Rd',     risk: 82, level: 'critical' },
  { name: 'Mombasa Rd',   risk: 54, level: 'high' },
  { name: 'Thika Hwy',    risk: 21, level: 'low' },
  { name: 'Waiyaki Way',  risk: 47, level: 'moderate' },
];

const zoneColors: Record<string, string> = {
  critical: '#ef4444', high: '#f97316', moderate: '#f59e0b', low: '#22c55e',
};

const tabs = ['Flood Risk', 'Safety %', 'Active Zones'] as const;
type Tab = typeof tabs[number];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0D1424] border border-[#243450] rounded-lg px-3 py-2 text-[11px]">
      <p className="text-[#94a3b8] mb-1">{label}</p>
      <p className="font-bold text-[#e2e8f0]">{payload[0].value}%</p>
    </div>
  );
};

export default function AnalyticsCharts() {
  const [tab, setTab] = useState<Tab>('Flood Risk');

  return (
    <div className="sr-card">
      <div className="sr-card-header">
        <div className="sr-card-title">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          Risk Trend (7d)
        </div>
        <div className="flex gap-1.5">
          <span className="risk-critical text-[10px] px-1.5 py-0.5 rounded">Flood</span>
          <span className="risk-moderate text-[10px] px-1.5 py-0.5 rounded">Weather</span>
        </div>
      </div>

      <div className="sr-card-body">
        {/* Tabs */}
        <div className="flex gap-1 bg-[#111827] rounded-lg p-1 mb-3">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 py-1.5 rounded-md text-[11px] font-medium transition-all cursor-pointer',
                tab === t
                  ? 'bg-[#0D1424] text-[#e2e8f0] shadow'
                  : 'text-[#64748b] hover:text-[#94a3b8]'
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Chart content */}
        {tab === 'Flood Risk' && (
          <div>
            <ResponsiveContainer width="100%" height={100}>
              <AreaChart data={floodTrend} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="floodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d47" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2}
                      fill="url(#floodGrad)" dot={false} activeDot={{ r: 4, fill: '#ef4444' }} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex justify-between items-center mt-2">
              <p className="text-[11px] text-[#64748b]">
                Peak risk: <span className="text-red-400 font-semibold">Thu 72%</span>
              </p>
              <span className="risk-critical text-[10px] px-2 py-0.5 rounded">+18% vs last week</span>
            </div>
          </div>
        )}

        {tab === 'Safety %' && (
          <div>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={safetyTrend} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d47" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#22c55e" radius={[3, 3, 0, 0]} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-[11px] text-[#64748b] mt-2">
              Avg safety this week: <span className="text-green-400 font-semibold">69%</span>
            </p>
          </div>
        )}

        {tab === 'Active Zones' && (
          <div className="space-y-0 divide-y divide-[#1e2d47]">
            {activeZones.map(z => (
              <div key={z.name} className="flex items-center gap-2.5 py-2.5">
                <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: zoneColors[z.level] }} />
                <span className="flex-1 text-[12px] text-[#e2e8f0]">{z.name}</span>
                <div className="w-24 h-1.5 bg-[#111827] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${z.risk}%`, background: zoneColors[z.level] }}
                  />
                </div>
                <span className="text-[11px] font-mono-num w-10 text-right"
                      style={{ color: zoneColors[z.level] }}>
                  {z.risk}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
