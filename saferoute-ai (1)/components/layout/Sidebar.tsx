'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Map, Route, AlertTriangle, BarChart3,
  PlusCircle, History, Settings, Zap, Brain, LogOut,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/utils';

const navItems = [
  { href: '/dashboard',            label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/dashboard/map',        label: 'Live Map',       icon: Map,    badge: 'LIVE' },
  { href: '/dashboard/routes',     label: 'Route Planner',  icon: Route },
  { href: '/dashboard/alerts',     label: 'Alerts',         icon: AlertTriangle, badgeCount: true },
  { href: '/dashboard/analytics',  label: 'Analytics',      icon: BarChart3 },
];

const toolItems = [
  { href: '/dashboard/reports',  label: 'Report Incident', icon: PlusCircle },
  { href: '/dashboard/history',  label: 'Route History',   icon: History },
  { href: '/dashboard/settings', label: 'Settings',        icon: Settings },
];

interface Props {
  alertCount: number;
}

export default function Sidebar({ alertCount }: Props) {
  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <aside className="w-[220px] flex-shrink-0 bg-[#0D1424] border-r border-[#1e2d47] flex flex-col overflow-y-auto">

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-[#1e2d47]">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
             style={{ background: 'linear-gradient(135deg, #00d4ff, #00ff88)' }}>
          <Zap className="w-4 h-4 text-black" />
        </div>
        <div className="text-[15px] font-bold tracking-tight">
          Safe<span className="text-cyan-400">Route</span> AI
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-[10px] text-[#64748b] tracking-[1.5px] uppercase font-medium px-2 pb-2">Navigation</p>

        {navItems.map(item => {
          const active = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              className={cn('nav-link', active && 'active')}>
              <item.icon className="w-[17px] h-[17px] flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">
                  {item.badge}
                </span>
              )}
              {item.badgeCount && alertCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500 text-white min-w-[18px] text-center">
                  {alertCount}
                </span>
              )}
            </Link>
          );
        })}

        <p className="text-[10px] text-[#64748b] tracking-[1.5px] uppercase font-medium px-2 pb-2 pt-4">Tools</p>

        {toolItems.map(item => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={cn('nav-link', active && 'active')}>
              <item.icon className="w-[17px] h-[17px] flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* AI Engine card */}
      <div className="px-3 pb-3">
        <div className="rounded-lg p-3 mb-2"
             style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)' }}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[11px] font-semibold text-purple-300">AI Engine</span>
          </div>
          <p className="text-[10px] text-[#64748b] mb-2">Risk model updated 2 min ago</p>
          <div className="h-1.5 rounded-full bg-[#111827] overflow-hidden">
            <div className="h-full w-[78%] rounded-full"
                 style={{ background: 'linear-gradient(90deg, #a855f7, #00d4ff)' }} />
          </div>
          <p className="text-[10px] text-[#64748b] mt-1">Model accuracy: 94.2%</p>
        </div>

        <button onClick={handleLogout}
          className="nav-link w-full text-[#64748b] hover:text-red-400 hover:bg-red-500/5">
          <LogOut className="w-[17px] h-[17px]" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
