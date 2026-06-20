'use client';

import { useEffect, useState } from 'react';
import {
  startReminderService,
  requestPermission,
  isPermissionGranted,
  sendSwReminderConfig,
} from '@/lib/services/reminderService';
import { waterService } from '@/lib/stores/repository';

export function useReminders() {
  useEffect(() => {
    const service = startReminderService(async () => {
      const [entries, settings] = await Promise.all([
        waterService.getAllEntries(),
        waterService.getSettings(),
      ]);

      const today = new Date();
      const todayTotal = entries
        .filter((e) => {
          const d = new Date(e.timestamp);
          return (
            d.getFullYear() === today.getFullYear() &&
            d.getMonth() === today.getMonth() &&
            d.getDate() === today.getDate()
          );
        })
        .reduce((sum, e) => sum + e.amountMl, 0);

      return {
        currentMl: todayTotal,
        targetMl: settings.dailyGoal.enabled ? settings.dailyGoal.targetMl : 1,
        intervalMinutes: settings.reminderIntervalMinutes,
      };
    });

    service.start();

    waterService.getSettings().then((settings) => {
      sendSwReminderConfig({
        intervalMinutes: settings.reminderIntervalMinutes,
        targetMl: settings.dailyGoal.enabled ? settings.dailyGoal.targetMl : 1,
        currentMl: 0,
      });
    });

    return () => {
      service.stop();
    };
  }, []);
}

export function useRequestNotificationPermission() {
  const [granted, setGranted] = useState(() => {
    try {
      return typeof Notification !== 'undefined' && Notification.permission === 'granted';
    } catch {
      return false;
    }
  });

  const request = async (): Promise<boolean> => {
    if (!('Notification' in window)) return false;
    if (isPermissionGranted()) return true;
    const ok = await requestPermission();
    if (ok) setGranted(true);
    return ok;
  };

  return { request, granted };
}
