'use client';

import { useState, useEffect } from 'react';
import { waterService } from '@/lib/stores/repository';

export function useWeeklyStats() {
  const [weeklyTotals, setWeeklyTotals] = useState<{ date: string; totalMl: number }[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [totals, s] = await Promise.all([
          waterService.getWeeklyTotals(),
          waterService.getStreak(),
        ]);
        if (!cancelled) {
          setWeeklyTotals(totals);
          setStreak(s);
        }
      } catch {
        if (!cancelled) setError('Failed to load stats');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return { weeklyTotals, streak, loading, error };
}
