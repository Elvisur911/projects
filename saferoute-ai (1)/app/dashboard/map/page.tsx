import { createClient } from '@/lib/supabase/server';
import MapPanel from '@/components/map/MapPanel';

export const dynamic = 'force-dynamic';

export default async function MapPage() {
  const supabase = await createClient();
  const [{ data: roadRisks }, { data: alerts }] = await Promise.all([
    supabase.from('road_risks').select('*').order('risk_score', { ascending: false }),
    supabase.from('alerts').select('*').eq('active', true).limit(20),
  ]);

  return (
    <div className="p-4 h-[calc(100vh-56px)]">
      <div className="h-full" style={{ minHeight: '600px' }}>
        <MapPanel roadRisks={roadRisks ?? []} alerts={alerts ?? []} />
      </div>
    </div>
  );
}
