'use client';

import { useState, useEffect } from 'react';
import { requestPermission } from '@/lib/services/reminderService';

export function NotificationBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'default') {
      const dismissed = sessionStorage.getItem('notif-banner-dismissed');
      if (!dismissed) setVisible(true);
    }
  }, []);

  async function handleEnable() {
    const ok = await requestPermission();
    if (ok) setVisible(false);
  }

  function handleDismiss() {
    setVisible(false);
    sessionStorage.setItem('notif-banner-dismissed', 'true');
  }

  if (!visible) return null;

  return (
    <div className="animate-slide-up rounded-2xl bg-water-50 p-4 shadow-sm dark:bg-water-900/20">
      <div className="flex items-start gap-3">
        <span className="text-xl">🔔</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
            Stay hydrated!
          </p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Enable reminders to get notified throughout the day.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={handleEnable}
            className="rounded-xl bg-water-500 px-3 py-1.5 text-xs font-medium text-white shadow transition-all hover:bg-water-600 active:scale-95"
          >
            Enable
          </button>
          <button
            onClick={handleDismiss}
            className="rounded-xl px-3 py-1.5 text-xs text-gray-400 transition-all hover:text-gray-600 dark:hover:text-gray-300"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
