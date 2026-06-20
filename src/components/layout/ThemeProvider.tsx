'use client';

import { useEffect } from 'react';
import { waterService } from '@/lib/stores/repository';
import { THEME_CHANGED_EVENT } from '@/lib/constants';

function resolveTheme(theme: string): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme as 'light' | 'dark';
}

function applyFromSettings() {
  waterService.getSettings().then((settings) => {
    const t = resolveTheme(settings.theme);
    document.documentElement.classList.toggle('dark', t === 'dark');
  });
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    applyFromSettings();

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'waterlogger:state') applyFromSettings();
    };
    window.addEventListener('storage', onStorage);

    const onThemeChanged = () => applyFromSettings();
    window.addEventListener(THEME_CHANGED_EVENT, onThemeChanged);

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onMqChange = () => {
      waterService.getSettings().then((s) => {
        if (s.theme === 'system') applyFromSettings();
      });
    };
    mq.addEventListener('change', onMqChange);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(THEME_CHANGED_EVENT, onThemeChanged);
      mq.removeEventListener('change', onMqChange);
    };
  }, []);

  return <>{children}</>;
}
