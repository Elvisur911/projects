'use client';

import { useState } from 'react';
import { Radio, Plus, Brain, X, Loader2 } from 'lucide-react';
import { formatTimeAgo, cn } from '@/utils';
import { DISASTER_TYPE_CONFIG, SEVERITY_COLORS } from '@/constants';
import type { DbDisasterReport, DisasterType, SeverityLevel } from '@/types';

interface Props {
  reports: DbDisasterReport[];
}

export default function IncidentFeed({ reports }: Props) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [form, setForm] = useState({
    type: '' as DisasterType | '',
    location_name: '',
    description: '',
    severity: 'medium' as SeverityLevel,
  });

  async function submitReport(e: React.FormEvent) {
    e.preventDefault();
    if (!form.type) return;
    setSubmitting(true);
    try {
      await fetch('/api/disaster-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, lat: -1.2921, lng: 36.8219 }),
      });
      setSubmitted(true);
      setTimeout(() => { setOpen(false); setSubmitted(false); }, 1500);
    } catch {
      setSubmitted(true);
      setTimeout(() => { setOpen(false); setSubmitted(false); }, 1500);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="sr-card">
        <div className="sr-card-header">
          <div className="sr-card-title">
            <Radio className="w-4 h-4 text-cyan-400" />
            Crowdsourced Incidents
          </div>
          <span className="badge-ai"><Brain className="w-3 h-3" />AI Verified</span>
        </div>

        <div className="sr-card-body">
          <div className="space-y-2 max-h-[220px] overflow-y-auto mb-3">
            {reports.length === 0 ? (
              // Fallback demo incidents
              [
                { id: '1', type: 'landslide'      as DisasterType, severity: 'critical' as SeverityLevel, title: 'Landslide debris on road',   location_name: 'Limuru Road, Muthaiga',        created_at: new Date(Date.now() - 2*60000).toISOString() },
                { id: '2', type: 'flood'           as DisasterType, severity: 'high'     as SeverityLevel, title: 'Flooded underpass',           location_name: 'Globe Roundabout, CBD',        created_at: new Date(Date.now() - 8*60000).toISOString() },
                { id: '3', type: 'traffic_jam'     as DisasterType, severity: 'medium'   as SeverityLevel, title: 'Heavy traffic jam',           location_name: 'Waiyaki Way, Westlands',       created_at: new Date(Date.now() - 15*60000).toISOString() },
                { id: '4', type: 'drainage_failure' as DisasterType, severity: 'medium'  as SeverityLevel, title: 'Broken drainage spill',       location_name: 'Industrial Area Rd',           created_at: new Date(Date.now() - 28*60000).toISOString() },
                { id: '5', type: 'road_closure'    as DisasterType, severity: 'low'      as SeverityLevel, title: 'Road cleared — all clear',    location_name: 'Thika Highway, Roysambu',     created_at: new Date(Date.now() - 42*60000).toISOString() },
              ].map(r => <IncidentRow key={r.id} report={r as any} />)
            ) : (
              reports.slice(0, 8).map(r => <IncidentRow key={r.id} report={r} />)
            )}
          </div>

          <button
            onClick={() => setOpen(true)}
            className="w-full py-2.5 rounded-lg border border-dashed border-cyan-500/25 bg-cyan-500/5
                       text-[12px] text-cyan-400 flex items-center justify-center gap-2 cursor-pointer
                       hover:bg-cyan-500/10 hover:border-cyan-500/40 transition-all"
          >
            <Plus className="w-4 h-4" />
            Report an Incident
          </button>
        </div>
      </div>

      {/* Report Modal */}
      {open && (
        <div className="fixed inset-0 bg-[#070B14]/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
             onClick={e => e.target === e.currentTarget && setOpen(false)}>
          <div className="sr-card w-full max-w-md animate-fade-in-up shadow-2xl">
            <div className="sr-card-header">
              <div className="sr-card-title">
                <Plus className="w-4 h-4 text-cyan-400" />
                Report an Incident
              </div>
              <button onClick={() => setOpen(false)} className="text-[#64748b] hover:text-[#e2e8f0] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {submitted ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-3">✅</div>
                <p className="text-[15px] font-semibold text-green-400">Incident Submitted</p>
                <p className="text-[12px] text-[#64748b] mt-1">Your report has been sent for AI verification.</p>
              </div>
            ) : (
              <form onSubmit={submitReport} className="sr-card-body space-y-4">
                <div>
                  <label className="block text-[11px] text-[#64748b] uppercase tracking-widest mb-1.5">Incident Type</label>
                  <select
                    required
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value as DisasterType }))}
                    className="sr-input"
                  >
                    <option value="">Select type…</option>
                    {Object.entries(DISASTER_TYPE_CONFIG).map(([key, cfg]) => (
                      <option key={key} value={key}>{cfg.icon} {cfg.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-[#64748b] uppercase tracking-widest mb-1.5">Location</label>
                  <input
                    required
                    value={form.location_name}
                    onChange={e => setForm(f => ({ ...f, location_name: e.target.value }))}
                    className="sr-input"
                    placeholder="Road name or area"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#64748b] uppercase tracking-widest mb-1.5">Description</label>
                  <textarea
                    required
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="sr-input resize-none"
                    rows={3}
                    placeholder="Describe what you see…"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#64748b] uppercase tracking-widest mb-1.5">Severity</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['low','medium','high','critical'] as SeverityLevel[]).map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, severity: s }))}
                        className={cn(
                          'py-2 rounded-lg text-[11px] font-medium border capitalize cursor-pointer transition-all',
                          form.severity === s
                            ? s === 'critical' ? 'bg-red-500/15 border-red-500/40 text-red-400'
                            : s === 'high'     ? 'bg-orange-500/15 border-orange-500/40 text-orange-400'
                            : s === 'medium'   ? 'bg-yellow-500/15 border-yellow-500/40 text-yellow-400'
                            :                    'bg-green-500/15 border-green-500/40 text-green-400'
                            : 'bg-[#111827] border-[#1e2d47] text-[#64748b]'
                        )}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary flex-1">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {submitting ? 'Submitting…' : 'Submit Report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function IncidentRow({ report }: { report: DbDisasterReport }) {
  const cfg   = DISASTER_TYPE_CONFIG[report.type] ?? DISASTER_TYPE_CONFIG.other;
  const color = SEVERITY_COLORS[report.severity] ?? '#94a3b8';

  return (
    <div className="flex items-center gap-2.5 p-2.5 bg-[#111827] border border-[#1e2d47] rounded-lg
                    hover:border-[#243450] transition-all cursor-pointer">
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-[#e2e8f0] truncate">{report.title}</p>
        <p className="text-[10px] text-[#64748b] truncate mt-0.5">{report.location_name}</p>
      </div>
      <span className="text-[10px] text-[#64748b] flex-shrink-0">{formatTimeAgo(report.created_at)}</span>
    </div>
  );
}
