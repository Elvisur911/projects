'use client';

import { useState, useCallback } from 'react';
import type { RouteRequest, RouteResult } from '@/types';

export function useRoute() {
  const [result, setResult]   = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const generate = useCallback(async (req: RouteRequest) => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch('/api/routing', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(req),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? 'Routing failed');
      setResult(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  function clear() { setResult(null); setError(null); }

  return { result, loading, error, generate, clear };
}
