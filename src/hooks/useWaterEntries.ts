'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { WaterEntry, WaterType } from '@/lib/types';
import { waterService } from '@/lib/stores/repository';

export function useWaterEntries() {
  const [entries, setEntries] = useState<WaterEntry[]>([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    let cancelled = false;

    if (!isFirstLoad.current) {
      setError(null);
    }

    waterService.getTodayEntries()
      .then((todayEntries) => {
        if (!cancelled) {
          const total = todayEntries.reduce((sum, e) => sum + e.amountMl, 0);
          setEntries(todayEntries);
          setTodayTotal(total);
          setLoading(false);
          isFirstLoad.current = false;
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Failed to load entries');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [refreshCounter]);

  const addWater = useCallback(
    async (amountMl: number, type: WaterType = 'water', note?: string) => {
      try {
        await waterService.addWater(amountMl, type, note);
        setRefreshCounter((c) => c + 1);
      } catch {
        setError('Failed to add entry');
      }
    },
    [],
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      try {
        await waterService.deleteEntry(id);
        setRefreshCounter((c) => c + 1);
      } catch {
        setError('Failed to delete entry');
      }
    },
    [],
  );

  const refresh = useCallback(() => {
    setRefreshCounter((c) => c + 1);
  }, []);

  return { entries, todayTotal, loading, error, addWater, deleteEntry, refresh };
}
