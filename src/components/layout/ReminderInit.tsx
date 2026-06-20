'use client';

import { useReminders } from '@/hooks/useReminders';

export function ReminderInit() {
  useReminders();
  return null;
}
