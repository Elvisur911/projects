import IncidentFeed from '@/components/dashboard/IncidentFeed';
import { createClient } from '@/lib/supabase/server';
import { PlusCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: reports } = await supabase
    .from('disaster_reports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <PlusCircle className="w-5 h-5 text-cyan-400" />
        <h1 className="text-[18px] font-bold text-[#e2e8f0]">Incident Reports</h1>
      </div>
      <div className="max-w-lg">
        <IncidentFeed reports={reports ?? []} />
      </div>
    </div>
  );
}
