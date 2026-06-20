'use client';

import { useState, useEffect, useCallback } from 'react';
import type { MonthlyStatsResult } from '@/lib/services/waterService';
import { waterService } from '@/lib/stores/repository';

export function useMonthlyStats(year: number, month: number) {
  const [stats, setStats] = useState<MonthlyStatsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (!cancelled) {
        setLoading(true);
        setError(null);
      }
    });

    waterService.getMonthlyStats(year, month)
      .then((result) => {
        if (!cancelled) {
          setStats(result);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Failed to load monthly stats');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [year, month, refreshCounter]);

  const refresh = useCallback(() => {
    setRefreshCounter((c) => c + 1);
  }, []);

  return { stats, loading, error, refresh };
}
