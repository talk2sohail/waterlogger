'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Settings } from '@/lib/types';
import { DEFAULT_SETTINGS } from '@/lib/types';
import { waterService } from '@/lib/stores/repository';
import { THEME_CHANGED_EVENT } from '@/lib/constants';

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    waterService.getSettings().then(setSettings);
  }, []);

  const updateSettings = useCallback(async (partial: Partial<Settings>) => {
    const current = await waterService.getSettings();
    const updated = { ...current, ...partial };
    await waterService.updateSettings(updated);
    setSettings(updated);
    if (partial.theme) {
      window.dispatchEvent(new CustomEvent(THEME_CHANGED_EVENT, { detail: updated }));
    }
  }, []);

  return { settings, updateSettings };
}
