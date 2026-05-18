'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { DbAlert } from '@/types';

export function useAlerts() {
  const [alerts, setAlerts]   = useState<DbAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Initial fetch
    supabase
      .from('alerts')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data) setAlerts(data);
        setLoading(false);
      });

    // Realtime subscription
    const channel = supabase
      .channel('alerts-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'alerts' },
        payload => {
          setAlerts(prev => [payload.new as DbAlert, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'alerts' },
        payload => {
          setAlerts(prev =>
            prev.map(a => a.id === payload.new.id ? payload.new as DbAlert : a)
          );
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  function dismiss(id: string) {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }

  return { alerts, loading, dismiss };
}
