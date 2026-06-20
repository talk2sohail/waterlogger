'use client';

import { useEffect } from 'react';

export function PwaInit() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // SW registration failed — app works without it
      });
    }
  }, []);

  return null;
}
