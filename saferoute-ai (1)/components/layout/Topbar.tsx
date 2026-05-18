'use client';

import { useState } from 'react';
import { Bell, Search, AlertTriangle, ChevronDown } from 'lucide-react';
import EmergencyToggle from '@/components/dashboard/EmergencyToggle';

interface Props {
  user: { email: string; full_name?: string | null };
}

export default function Topbar({ user }: Props) {
  const [notifOpen, setNotifOpen] = useState(false);

  const initials = user.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email.slice(0, 2).toUpperCase();

  return (
    <header className="h-14 bg-[#0D1424] border-b border-[#1e2d47] flex items-center px-4 gap-4 flex-shrink-0">

      {/* Search */}
      <div className="flex-1 max-w-sm">
        <div className="flex items-center gap-2 bg-[#111827] border border-[#1e2d47] rounded-lg
                        px-3 py-1.5 hover:border-[#243450] transition-colors group">
          <Search className="w-3.5 h-3.5 text-[#64748b] group-hover:text-[#94a3b8] flex-shrink-0" />
          <input
            type="text"
            placeholder="Search locations, alerts, routes…"
            className="bg-transparent border-none outline-none text-[13px] text-[#e2e8f0]
                       placeholder:text-[#64748b] w-full"
          />
          <kbd className="hidden sm:block text-[10px] text-[#64748b] bg-[#1a2235] px-1.5 py-0.5 rounded">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Status pill */}
      <div className="status-live hidden sm:flex">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-blink" />
        Live Monitoring
      </div>

      {/* Emergency toggle */}
      <EmergencyToggle />

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setNotifOpen(o => !o)}
          className="w-9 h-9 rounded-lg bg-[#111827] border border-[#1e2d47] flex items-center justify-center
                     hover:border-[#243450] transition-colors relative"
        >
          <Bell className="w-4 h-4 text-[#94a3b8]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0D1424]" />
        </button>

        {notifOpen && (
          <div className="absolute right-0 top-full mt-2 w-72 sr-card shadow-2xl z-50 animate-fade-in-up">
            <div className="sr-card-header">
              <span className="sr-card-title text-[13px]">
                <Bell className="w-4 h-4 text-cyan-400" />
                Notifications
              </span>
              <span className="text-[11px] text-cyan-400 cursor-pointer">Mark all read</span>
            </div>
            <div className="divide-y divide-[#1e2d47]">
              {[
                { icon: '🌊', title: 'Flood alert: Ngong Road', time: '5m ago', color: 'text-red-400' },
                { icon: '⛈️', title: 'Storm warning issued',     time: '12m ago', color: 'text-yellow-400' },
                { icon: '🚧', title: 'Road closure: Uhuru Hwy', time: '34m ago', color: 'text-blue-400' },
              ].map((n, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-[#111827] cursor-pointer">
                  <span className="text-lg mt-0.5">{n.icon}</span>
                  <div className="flex-1">
                    <p className={`text-[12px] font-medium ${n.color}`}>{n.title}</p>
                    <p className="text-[11px] text-[#64748b] mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-2.5 border-t border-[#1e2d47] text-center">
              <span className="text-[11px] text-cyan-400 cursor-pointer hover:underline">
                View all alerts →
              </span>
            </div>
          </div>
        )}
      </div>

      {/* User avatar */}
      <div className="flex items-center gap-2 cursor-pointer group">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0"
             style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
          {initials}
        </div>
        <div className="hidden sm:block">
          <p className="text-[12px] font-medium text-[#e2e8f0] leading-none">
            {user.full_name ?? user.email.split('@')[0]}
          </p>
          <p className="text-[10px] text-[#64748b] mt-0.5 leading-none">{user.email}</p>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-[#64748b] hidden sm:block" />
      </div>
    </header>
  );
}
