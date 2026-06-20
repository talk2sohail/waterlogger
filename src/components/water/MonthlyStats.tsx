'use client';

interface MonthlyStatsProps {
  total: number;
  average: number;
  bestDay: number;
  bestDayNumber: number | null;
  activeDays: number;
  daysInMonth: number;
}

export function MonthlyStats({ total, average, bestDay, bestDayNumber, activeDays, daysInMonth }: MonthlyStatsProps) {
  const items = [
    { label: 'Total', value: `${(total / 1000).toFixed(1)}L` },
    { label: 'Daily avg', value: `${Math.round(average)} ml` },
    { label: 'Best day', value: bestDayNumber ? `Day ${bestDayNumber} (${bestDay} ml)` : '—' },
    { label: 'Active days', value: `${activeDays} / ${daysInMonth}` },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl bg-water-50 p-3 text-center dark:bg-gray-700"
        >
          <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
          <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-100">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
