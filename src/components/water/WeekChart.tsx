'use client';

import { useState, useEffect } from 'react';

interface WeekChartProps {
  data: { date: string; totalMl: number }[];
  target: number;
}

export function WeekChart({ data, target }: WeekChartProps) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">No data yet this week.</p>;
  }

  const maxVal = Math.max(...data.map((d) => d.totalMl), target);

  return (
    <div className="flex items-end justify-between gap-2">
      {data.map((day) => {
        const heightPct = maxVal > 0 ? (day.totalMl / maxVal) * 100 : 0;
        const isMet = day.totalMl >= target;

        return (
          <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{day.totalMl > 0 ? `${Math.round(day.totalMl / 100) / 10}L` : ''}</span>
            <div className="relative h-32 w-full rounded-lg bg-water-50 dark:bg-gray-700">
              <div
                className="absolute bottom-0 left-0 right-0 rounded-lg transition-all duration-700 ease-out"
                style={{
                  height: animate ? `${heightPct}%` : '0%',
                  backgroundColor: isMet ? '#60a5fa' : '#93c5fd',
                  opacity: animate ? 1 : 0,
                }}
              />
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500">{day.date}</span>
          </div>
        );
      })}
    </div>
  );
}
