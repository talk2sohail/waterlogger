'use client';

import { useState } from 'react';
import { useWeeklyStats } from '@/hooks/useWeeklyStats';
import { useMonthlyStats } from '@/hooks/useMonthlyStats';
import { useSettings } from '@/hooks/useSettings';
import { WeekChart } from '@/components/water/WeekChart';
import { CalendarHeatmap } from '@/components/water/CalendarHeatmap';
import { MonthlyStats } from '@/components/water/MonthlyStats';

function useCurrentMonth() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const prevMonth = () => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else { setMonth((m) => m - 1); }
  };
  const nextMonth = () => {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else { setMonth((m) => m + 1); }
  };

  const monthLabel = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return { year, month, monthLabel, daysInMonth, prevMonth, nextMonth };
}

export default function HistoryPage() {
  const { weeklyTotals, streak, loading: weeklyLoading, error: weeklyError } = useWeeklyStats();
  const { settings } = useSettings();
  const { year, month, monthLabel, daysInMonth, prevMonth, nextMonth } = useCurrentMonth();
  const { stats, loading: monthlyLoading, error: monthlyError } = useMonthlyStats(year, month);

  return (
    <div className="animate-fade-in space-y-8">
      <section>
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">History</h1>
        <p className="text-sm text-gray-400 dark:text-gray-500">Your hydration overview</p>
      </section>

      {streak > 0 && (
        <div className="animate-slide-up rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 p-4 text-center shadow-sm dark:from-amber-900/30 dark:to-orange-900/30">
          <p className="text-sm text-amber-600 dark:text-amber-400">🔥 Current streak</p>
          <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">
            {streak} day{streak > 1 ? 's' : ''}
          </p>
        </div>
      )}

      <section className="animate-slide-up rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800">
        <h2 className="mb-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Weekly Overview
        </h2>
        {weeklyError ? (
          <p className="text-center text-sm text-red-500">{weeklyError}</p>
        ) : weeklyLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-water-400 border-t-transparent" />
          </div>
        ) : (
          <WeekChart data={weeklyTotals} target={settings.dailyGoal.targetMl} />
        )}
      </section>

      <section className="animate-slide-up rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Monthly View
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{monthLabel}</span>
            <button onClick={nextMonth} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        {monthlyError ? (
          <p className="text-center text-sm text-red-500">{monthlyError}</p>
        ) : monthlyLoading || !stats ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-water-400 border-t-transparent" />
          </div>
        ) : (
          <>
            <CalendarHeatmap
              days={stats.days}
              target={settings.dailyGoal.targetMl}
              year={year}
              month={month}
            />
            <div className="mt-4">
              <MonthlyStats
                total={stats.total}
                average={stats.average}
                bestDay={stats.bestDay}
                bestDayNumber={stats.bestDayNumber}
                activeDays={stats.activeDays}
                daysInMonth={daysInMonth}
              />
            </div>
          </>
        )}
      </section>
    </div>
  );
}
