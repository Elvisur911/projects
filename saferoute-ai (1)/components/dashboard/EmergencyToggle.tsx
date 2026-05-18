'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/utils';

export default function EmergencyToggle() {
  const [active, setActive] = useState(false);

  return (
    <button
      onClick={() => setActive(a => !a)}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold border-0 cursor-pointer transition-all duration-200',
        active
          ? 'bg-red-700 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]'
          : 'btn-danger'
      )}
    >
      <AlertTriangle className={cn('w-3.5 h-3.5', active && 'animate-bounce')} />
      {active ? 'EMERGENCY ON' : 'EMERGENCY'}
    </button>
  );
}
