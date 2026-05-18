import { createClient } from '@/lib/supabase/server';
import AlertsPanel from '@/components/alerts/AlertsPanel';
import { AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AlertsPage() {
  const supabase = await createClient();
  const { data: alerts } = await supabase
    .from('alerts')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false });

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-red-400" />
        <h1 className="text-[18px] font-bold text-[#e2e8f0]">Active Alerts</h1>
        {alerts && alerts.length > 0 && (
          <span className="text-[11px] bg-red-500 text-white px-2 py-0.5 rounded font-bold">
            {alerts.length} active
          </span>
        )}
      </div>
      <AlertsPanel alerts={alerts ?? []} />
    </div>
  );
}
