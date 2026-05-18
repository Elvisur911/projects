'use client';

import { useState } from 'react';
import { AlertCircle, X, ChevronRight } from 'lucide-react';
import { formatTimeAgo, severityBg, severityColor, cn } from '@/utils';
import type { DbAlert } from '@/types';

const alertIcons: Record<string, string> = {
  flood_warning:      '💧',
  road_closure:       '🚧',
  storm_warning:      '⛈️',
  landslide_warning:  '⛰️',
  emergency_reroute:  '🚨',
  traffic_disruption: '🚗',
};

interface Props {
  alerts: DbAlert[];
}

export default function AlertsPanel({ alerts: initialAlerts }: Props) {
  const [alerts, setAlerts] = useState(initialAlerts);

  function dismiss(id: string) {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }

  return (
    <div className="sr-card">
      <div className="sr-card-header">
        <div className="sr-card-title">
          <AlertCircle className="w-4 h-4 text-cyan-400" />
          Active Alerts
          {alerts.length > 0 && (
            <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold">
              {alerts.length}
            </span>
          )}
        </div>
        <button className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors">
          View all →
        </button>
      </div>

      <div className="sr-card-body space-y-2 max-h-[320px] overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-[13px] font-medium text-green-400">All clear</p>
            <p className="text-[11px] text-[#64748b] mt-1">No active alerts in your area</p>
          </div>
        ) : (
          alerts.map((alert, i) => (
            <div
              key={alert.id}
              className={cn(
                'relative flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all hover:brightness-110',
                severityBg(alert.severity),
                'animate-fade-in-up'
              )}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Left accent bar */}
              <div className={cn('absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg', {
                'bg-red-500':    alert.severity === 'critical',
                'bg-orange-500': alert.severity === 'high',
                'bg-yellow-500': alert.severity === 'medium',
                'bg-green-500':  alert.severity === 'low',
              })} />

              <div className={cn(
                'w-7 h-7 rounded-lg flex items-center justify-center text-[14px] flex-shrink-0 ml-1',
                severityBg(alert.severity)
              )}>
                {alertIcons[alert.type] ?? '⚠️'}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-[#e2e8f0] leading-snug">{alert.title}</p>
                <p className="text-[11px] text-[#94a3b8] mt-0.5 leading-snug line-clamp-2">{alert.description}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={cn('text-[10px] font-medium uppercase tracking-wider', severityColor(alert.severity))}>
                    {alert.severity}
                  </span>
                  <span className="text-[#64748b] text-[10px]">·</span>
                  <span className="text-[10px] text-[#64748b]">{formatTimeAgo(alert.created_at)}</span>
                  <span className="text-[#64748b] text-[10px]">·</span>
                  <span className="text-[10px] text-[#64748b] capitalize">{alert.source.replace('_', ' ')}</span>
                </div>
              </div>

              <button
                onClick={e => { e.stopPropagation(); dismiss(alert.id); }}
                className="text-[#64748b] hover:text-[#e2e8f0] flex-shrink-0 mt-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
