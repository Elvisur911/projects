import RoutePlanner from '@/components/routing/RoutePlanner';
import RiskAnalysis from '@/components/dashboard/RiskAnalysis';
import WeatherPanel from '@/components/dashboard/WeatherPanel';
import { createClient } from '@/lib/supabase/server';
import { Route, Clock } from 'lucide-react';
import { formatDistance, formatDuration } from '@/utils';

export const dynamic = 'force-dynamic';

export default async function RoutesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: history } = user
    ? await supabase
        .from('routes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
    : { data: [] };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Route className="w-5 h-5 text-cyan-400" />
        <h1 className="text-[18px] font-bold text-[#e2e8f0]">Route Planner</h1>
        <span className="badge-ai">AI Safe Routing</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4">
        <div className="space-y-4">
          <RoutePlanner />

          {/* Route history */}
          {history && history.length > 0 && (
            <div className="sr-card">
              <div className="sr-card-header">
                <div className="sr-card-title">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  Recent Routes
                </div>
              </div>
              <div className="divide-y divide-[#1e2d47]">
                {history.map(r => (
                  <div key={r.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#111827] transition-colors">
                    <div className="w-2 h-2 rounded-full flex-shrink-0"
                         style={{
                           background: r.risk_level === 'low' ? '#22c55e' :
                                       r.risk_level === 'moderate' ? '#f59e0b' :
                                       r.risk_level === 'high' ? '#f97316' : '#ef4444'
                         }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[#e2e8f0] truncate">
                        {r.origin_name} → {r.destination_name}
                      </p>
                      <p className="text-[11px] text-[#64748b]">
                        {formatDistance(r.distance_km)} · {formatDuration(r.duration_minutes)} · Safety {r.safety_percentage}%
                      </p>
                    </div>
                    <span className="text-[10px] text-[#64748b] flex-shrink-0">
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <RiskAnalysis />
          <WeatherPanel />
        </div>
      </div>
    </div>
  );
}
