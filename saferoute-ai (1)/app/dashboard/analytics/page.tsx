import { createClient } from '@/lib/supabase/server';
import AnalyticsCharts from '@/components/analytics/AnalyticsCharts';
import { BarChart3, TrendingUp, Shield, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const [
    { count: totalRoutes },
    { count: totalReports },
    { data: roadRisks },
  ] = await Promise.all([
    supabase.from('routes').select('id', { count: 'exact', head: true }),
    supabase.from('disaster_reports').select('id', { count: 'exact', head: true }),
    supabase.from('road_risks').select('*').order('risk_score', { ascending: false }),
  ]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <BarChart3 className="w-5 h-5 text-cyan-400" />
        <h1 className="text-[18px] font-bold text-[#e2e8f0]">Analytics</h1>
        <span className="badge-ai ml-2">AI-Powered Insights</span>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Routes Generated', value: totalRoutes ?? 0,  icon: TrendingUp,   color: 'text-cyan-400' },
          { label: 'Incidents Filed',  value: totalReports ?? 0, icon: AlertTriangle, color: 'text-yellow-400' },
          { label: 'Avg Safety Score', value: '79%',              icon: Shield,        color: 'text-green-400' },
          { label: 'Roads Monitored',  value: roadRisks?.length ?? 0, icon: BarChart3, color: 'text-purple-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="sr-card p-4">
            <div className="flex items-center gap-2 mb-2 text-[11px] text-[#64748b]">
              <Icon className="w-3.5 h-3.5" />{label}
            </div>
            <div className={`text-[28px] font-bold font-mono-num ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnalyticsCharts />

        {/* Road risk table */}
        <div className="sr-card lg:col-span-2">
          <div className="sr-card-header">
            <div className="sr-card-title">
              <Shield className="w-4 h-4 text-cyan-400" />
              Road Risk Monitor
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-[#1e2d47]">
                  {['Road', 'Risk Level', 'Score', 'Flood Depth', 'Passable', 'Updated'].map(h => (
                    <th key={h} className="text-left py-2.5 px-4 text-[11px] text-[#64748b] font-medium uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2d47]">
                {(roadRisks ?? []).map(road => (
                  <tr key={road.id} className="hover:bg-[#111827] transition-colors">
                    <td className="py-2.5 px-4 font-medium text-[#e2e8f0]">{road.road_name}</td>
                    <td className="py-2.5 px-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase
                        ${road.risk_level === 'critical' ? 'risk-critical' :
                          road.risk_level === 'high'     ? 'risk-high' :
                          road.risk_level === 'moderate' ? 'risk-moderate' : 'risk-low'}`}>
                        {road.risk_level}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono-num text-[#e2e8f0]">{road.risk_score}/10</td>
                    <td className="py-2.5 px-4 text-[#94a3b8]">
                      {road.flood_depth_cm ? `${road.flood_depth_cm} cm` : '—'}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={road.is_passable ? 'text-green-400' : 'text-red-400'}>
                        {road.is_passable ? '✓ Yes' : '✕ No'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-[#64748b]">
                      {new Date(road.last_updated).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
                {(!roadRisks || roadRisks.length === 0) && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#64748b] text-[12px]">
                      No road risk data. Run the Supabase schema seed first.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
