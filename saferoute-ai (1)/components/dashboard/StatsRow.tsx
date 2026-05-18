'use client';

import { motion } from 'framer-motion';
import { AlertCircle, Droplets, Route, Road, Users } from 'lucide-react';

interface Stats {
  activeAlerts:   number;
  floodZones:     number;
  safeRoutes:     number;
  roadClosures:   number;
  incidentsTotal: number;
}

const statConfig = [
  {
    key:     'activeAlerts' as const,
    label:   'Active Alerts',
    icon:    AlertCircle,
    color:   'text-cyan-400',
    bar:     'from-cyan-500',
    change:  '+2 this hour',
    up:      true,
  },
  {
    key:     'floodZones' as const,
    label:   'Flood Zones',
    icon:    Droplets,
    color:   'text-red-400',
    bar:     'from-red-500',
    change:  'Critical: 1',
    up:      true,
  },
  {
    key:     'safeRoutes' as const,
    label:   'Safe Routes',
    icon:    Route,
    color:   'text-green-400',
    bar:     'from-green-500',
    change:  'Avg safety 87%',
    up:      false,
  },
  {
    key:     'roadClosures' as const,
    label:   'Road Closures',
    icon:    Road,
    color:   'text-yellow-400',
    bar:     'from-yellow-500',
    change:  '+1 new',
    up:      true,
  },
  {
    key:     'incidentsTotal' as const,
    label:   'Reports Filed',
    icon:    Users,
    color:   'text-purple-400',
    bar:     'from-purple-500',
    change:  'Crowdsourced',
    up:      false,
  },
];

export default function StatsRow({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
      {statConfig.map((cfg, i) => (
        <motion.div
          key={cfg.key}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="sr-card relative overflow-hidden group hover:border-[#243450] transition-colors"
        >
          {/* Top color bar */}
          <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${cfg.bar} to-transparent`} />

          <div className="p-3.5">
            <div className="flex items-center gap-1.5 text-[11px] text-[#64748b] mb-2">
              <cfg.icon className="w-3 h-3" />
              {cfg.label}
            </div>
            <div className={`text-[26px] font-bold font-mono-num leading-none mb-1.5 ${cfg.color}`}>
              {stats[cfg.key]}
            </div>
            <div className={`text-[11px] flex items-center gap-1 ${
              cfg.up ? 'text-red-400' : 'text-green-400'
            }`}>
              {cfg.up ? '↑' : '↓'} {cfg.change}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
