'use client';

import { useState } from 'react';
import { Settings, Bell, Map, Shield, User, Save, Loader2 } from 'lucide-react';
import { cn } from '@/utils';

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const [prefs, setPrefs] = useState({
    notifications_flood:   true,
    notifications_storm:   true,
    notifications_closure: true,
    emergency_alerts:      true,
    map_style:             'dark',
    default_profile:       'driving-car',
    avoid_floods:          true,
    avoid_storms:          true,
    avoid_road_blocks:     true,
  });

  async function handleSave() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const toggle = (key: keyof typeof prefs) =>
    setPrefs(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="p-4 space-y-4 max-w-2xl">
      <div className="flex items-center gap-2">
        <Settings className="w-5 h-5 text-cyan-400" />
        <h1 className="text-[18px] font-bold text-[#e2e8f0]">Settings</h1>
      </div>

      {/* Notifications */}
      <Section icon={<Bell className="w-4 h-4 text-cyan-400" />} title="Notifications">
        {[
          { key: 'notifications_flood',   label: 'Flood warnings',    desc: 'Alerts when flood risk is high' },
          { key: 'notifications_storm',   label: 'Storm warnings',    desc: 'Alerts for dangerous weather' },
          { key: 'notifications_closure', label: 'Road closures',     desc: 'Notifications for blocked roads' },
          { key: 'emergency_alerts',      label: 'Emergency alerts',  desc: 'Critical safety notifications' },
        ].map(({ key, label, desc }) => (
          <ToggleRow
            key={key}
            label={label}
            desc={desc}
            value={prefs[key as keyof typeof prefs] as boolean}
            onChange={() => toggle(key as keyof typeof prefs)}
          />
        ))}
      </Section>

      {/* Map */}
      <Section icon={<Map className="w-4 h-4 text-cyan-400" />} title="Map Preferences">
        <div className="py-2">
          <label className="block text-[12px] text-[#94a3b8] mb-2">Default Map Style</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'dark',       label: 'Dark',       desc: 'Night mode' },
              { value: 'satellite',  label: 'Satellite',  desc: 'Aerial view' },
              { value: 'navigation', label: 'Navigation', desc: 'Route-focused' },
            ].map(s => (
              <button
                key={s.value}
                onClick={() => setPrefs(p => ({ ...p, map_style: s.value }))}
                className={cn(
                  'p-3 rounded-lg border text-left transition-all cursor-pointer',
                  prefs.map_style === s.value
                    ? 'border-cyan-500/40 bg-cyan-500/8 text-cyan-400'
                    : 'border-[#1e2d47] text-[#64748b] hover:border-[#243450]'
                )}>
                <p className="text-[12px] font-medium">{s.label}</p>
                <p className="text-[10px] mt-0.5 opacity-70">{s.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Routing */}
      <Section icon={<Shield className="w-4 h-4 text-cyan-400" />} title="Routing Defaults">
        <div className="py-2 mb-2">
          <label className="block text-[12px] text-[#94a3b8] mb-2">Default Vehicle Profile</label>
          <select
            value={prefs.default_profile}
            onChange={e => setPrefs(p => ({ ...p, default_profile: e.target.value }))}
            className="sr-input"
          >
            <option value="driving-car">🚗 Car</option>
            <option value="driving-hgv">🚛 Heavy Vehicle</option>
            <option value="foot-walking">🚶 Walking</option>
          </select>
        </div>
        {[
          { key: 'avoid_floods',      label: 'Avoid flood zones by default' },
          { key: 'avoid_storms',      label: 'Avoid storm areas by default' },
          { key: 'avoid_road_blocks', label: 'Avoid road blocks by default' },
        ].map(({ key, label }) => (
          <ToggleRow
            key={key}
            label={label}
            value={prefs[key as keyof typeof prefs] as boolean}
            onChange={() => toggle(key as keyof typeof prefs)}
          />
        ))}
      </Section>

      <button onClick={handleSave} disabled={saving} className="btn-primary max-w-[160px]">
        {saving  ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> :
         saved   ? <>✓ Saved!</> :
                   <><Save className="w-4 h-4" />Save Settings</>}
      </button>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="sr-card">
      <div className="sr-card-header">
        <div className="sr-card-title">{icon}{title}</div>
      </div>
      <div className="sr-card-body divide-y divide-[#1e2d47]">{children}</div>
    </div>
  );
}

function ToggleRow({ label, desc, value, onChange }: {
  label: string; desc?: string; value: boolean; onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-[13px] text-[#e2e8f0]">{label}</p>
        {desc && <p className="text-[11px] text-[#64748b] mt-0.5">{desc}</p>}
      </div>
      <button
        onClick={onChange}
        className={cn(
          'relative w-10 h-5 rounded-full transition-all cursor-pointer border-0 flex-shrink-0',
          value ? 'bg-cyan-500' : 'bg-[#243450]'
        )}>
        <span className={cn(
          'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all',
          value ? 'left-[22px]' : 'left-0.5'
        )} />
      </button>
    </div>
  );
}
