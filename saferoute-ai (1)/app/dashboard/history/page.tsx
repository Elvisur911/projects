import { createClient } from '@/lib/supabase/server';
import { History } from 'lucide-react';
import { formatDistance, formatDuration } from '@/utils';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: routes } = user
    ? await supabase
        .from('routes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
    : { data: [] };

  const levelColor: Record<string, string> = {
    low:      'text-green-400',
    moderate: 'text-yellow-400',
    high:     'text-orange-400',
    critical: 'text-red-400',
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <History className="w-5 h-5 text-cyan-400" />
        <h1 className="text-[18px] font-bold text-[#e2e8f0]">Route History</h1>
      </div>

      <div className="sr-card">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-[#1e2d47]">
                {['Origin', 'Destination', 'Distance', 'Duration', 'Safety', 'Risk', 'Date'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-[11px] text-[#64748b] font-medium uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2d47]">
              {(routes ?? []).map(r => (
                <tr key={r.id} className="hover:bg-[#111827] transition-colors">
                  <td className="py-3 px-4 text-[#e2e8f0] font-medium">{r.origin_name}</td>
                  <td className="py-3 px-4 text-[#e2e8f0]">{r.destination_name}</td>
                  <td className="py-3 px-4 text-[#94a3b8] font-mono-num">{formatDistance(r.distance_km)}</td>
                  <td className="py-3 px-4 text-[#94a3b8] font-mono-num">{formatDuration(r.duration_minutes)}</td>
                  <td className="py-3 px-4 font-mono-num font-bold text-green-400">{r.safety_percentage}%</td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold capitalize ${levelColor[r.risk_level] ?? 'text-[#94a3b8]'}`}>
                      {r.risk_level}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#64748b]">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {(!routes || routes.length === 0) && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#64748b] text-[13px]">
                    No route history yet. Generate a safe route to see it here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
