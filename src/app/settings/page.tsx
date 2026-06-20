'use client';

import { useSettings } from '@/hooks/useSettings';
import { useRequestNotificationPermission } from '@/hooks/useReminders';
import { exportAsCSV, exportAsJSON } from '@/lib/services/exportService';
import { waterService } from '@/lib/stores/repository';
import { useState } from 'react';

const reminderOptions = [
  { value: 0, label: 'Off' },
  { value: 30, label: 'Every 30 min' },
  { value: 60, label: 'Every hour' },
  { value: 120, label: 'Every 2 hours' },
];

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const { request: requestNotif, granted } = useRequestNotificationPermission();
  const [goalInput, setGoalInput] = useState(String(settings.dailyGoal.targetMl));
  const [saved, setSaved] = useState('');
  const [exporting, setExporting] = useState(false);

  async function handleGoalSave(e: React.FormEvent) {
    e.preventDefault();
    const num = Number(goalInput);
    if (num > 0 && num <= 10000) {
      await updateSettings({
        dailyGoal: { ...settings.dailyGoal, targetMl: num },
      });
      setSaved('Goal updated! ✓');
      setTimeout(() => setSaved(''), 2000);
    }
  }

  async function handleThemeChange(theme: 'light' | 'dark' | 'system') {
    await updateSettings({ theme });
  }

  async function handleExport(type: 'csv' | 'json') {
    setExporting(true);
    const [entries, s] = await Promise.all([
      waterService.getAllEntries(),
      waterService.getSettings(),
    ]);
    if (type === 'csv') exportAsCSV(entries);
    else exportAsJSON(entries, s);
    setExporting(false);
  }

  async function handleClearAll() {
    if (window.confirm('Delete ALL water data? This cannot be undone.')) {
      await waterService.clearAll();
      window.location.reload();
    }
  }

  return (
    <div className="animate-fade-in space-y-8">
      <section>
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Settings</h1>
        <p className="text-sm text-gray-400 dark:text-gray-500">Customize your experience</p>
      </section>

      <section className="animate-slide-up rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800">
        <h2 className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Daily Goal
        </h2>
        <form onSubmit={handleGoalSave} className="flex items-end gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-xs text-gray-400 dark:text-gray-500" htmlFor="goal">
              Target (ml)
            </label>
            <input
              id="goal"
              type="number"
              min={1}
              max={10000}
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              className="w-full rounded-xl border border-water-200 bg-white px-3 py-2 text-gray-800 transition-all focus:border-water-400 focus:outline-none focus:ring-2 focus:ring-water-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-water-500 dark:focus:ring-water-700"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-water-500 px-5 py-2 text-white shadow transition-all hover:bg-water-600 active:scale-95"
          >
            Save
          </button>
        </form>
        {saved && <p className="mt-2 text-xs text-green-500">{saved}</p>}
      </section>

      <section className="animate-slide-up rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800">
        <h2 className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Theme
        </h2>
        <div className="flex gap-2">
          {(['light', 'dark', 'system'] as const).map((t) => (
            <button
              key={t}
              onClick={() => handleThemeChange(t)}
              className={`flex-1 rounded-xl px-3 py-2 text-sm capitalize transition-all ${
                settings.theme === t
                  ? 'bg-water-500 text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      <section className="animate-slide-up rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800">
        <h2 className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Unit
        </h2>
        <div className="flex gap-2">
          {(['ml', 'oz'] as const).map((u) => (
            <button
              key={u}
              onClick={() => updateSettings({ unit: u })}
              className={`flex-1 rounded-xl px-3 py-2 text-sm capitalize transition-all ${
                settings.unit === u
                  ? 'bg-water-500 text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </section>

      <section className="animate-slide-up rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800">
        <h2 className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Reminders
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">Browser notifications</span>
            <button
              onClick={requestNotif}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                granted
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-water-100 text-water-700 hover:bg-water-200 dark:bg-water-900/30 dark:text-water-400'
              }`}
            >
              {granted ? '✅ Enabled' : 'Enable'}
            </button>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-400 dark:text-gray-500" htmlFor="reminder-interval">
              Remind me
            </label>
            <select
              id="reminder-interval"
              value={settings.reminderIntervalMinutes}
              onChange={(e) => updateSettings({ reminderIntervalMinutes: Number(e.target.value) })}
              className="w-full rounded-xl border border-water-200 bg-white px-3 py-2 text-sm text-gray-700 transition-all focus:border-water-400 focus:outline-none focus:ring-2 focus:ring-water-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            >
              {reminderOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="animate-slide-up rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800">
        <h2 className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Export Data
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('csv')}
            disabled={exporting}
            className="flex-1 rounded-xl bg-water-500 px-3 py-2 text-sm text-white shadow transition-all hover:bg-water-600 active:scale-95 disabled:opacity-50"
          >
            Export CSV
          </button>
          <button
            onClick={() => handleExport('json')}
            disabled={exporting}
            className="flex-1 rounded-xl bg-water-500 px-3 py-2 text-sm text-white shadow transition-all hover:bg-water-600 active:scale-95 disabled:opacity-50"
          >
            Export JSON
          </button>
        </div>
      </section>

      <section className="animate-slide-up rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800">
        <h2 className="mb-3 text-sm font-semibold text-red-500 uppercase tracking-wide">
          Danger Zone
        </h2>
        <button
          onClick={handleClearAll}
          className="w-full rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-600 transition-all hover:bg-red-100 active:scale-95 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
        >
          Delete all data
        </button>
      </section>
    </div>
  );
}
