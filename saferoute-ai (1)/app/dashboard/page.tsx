import { createClient } from '@/lib/supabase/server';
import StatsRow from '@/components/dashboard/StatsRow';
import MapPanel from '@/components/map/MapPanel';
import RoutePlanner from '@/components/routing/RoutePlanner';
import RiskAnalysis from '@/components/dashboard/RiskAnalysis';
import WeatherPanel from '@/components/dashboard/WeatherPanel';
import AlertsPanel from '@/components/alerts/AlertsPanel';
import IncidentFeed from '@/components/dashboard/IncidentFeed';
import AnalyticsCharts from '@/components/analytics/AnalyticsCharts';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = await createClient();

  // Parallel data fetching
  const [
    { data: alerts },
    { data: reports },
    { data: roadRisks },
    { count: floodCount },
    { count: closureCount },
  ] = await Promise.all([
    supabase
      .from('alerts')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('disaster_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('road_risks')
      .select('*')
      .order('risk_score', { ascending: false }),
    supabase
      .from('alerts')
      .select('id', { count: 'exact', head: true })
      .eq('type', 'flood_warning')
      .eq('active', true),
    supabase
      .from('alerts')
      .select('id', { count: 'exact', head: true })
      .eq('type', 'road_closure')
      .eq('active', true),
  ]);

  const stats = {
    activeAlerts:   alerts?.length ?? 0,
    floodZones:     floodCount ?? 0,
    safeRoutes:     12,
    roadClosures:   closureCount ?? 0,
    incidentsTotal: reports?.length ?? 0,
  };

  return (
    <div className="p-4 space-y-4">
      {/* Stats */}
      <StatsRow stats={stats} />

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
        {/* Left column */}
        <div className="space-y-4">
          <MapPanel roadRisks={roadRisks ?? []} alerts={alerts ?? []} />
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <RoutePlanner />
          <RiskAnalysis />
          <WeatherPanel />
        </div>
      </div>

      {/* Bottom analytics row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <AlertsPanel alerts={alerts ?? []} />
        <IncidentFeed reports={reports ?? []} />
        <AnalyticsCharts />
      </div>
    </div>
  );
}
