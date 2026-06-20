'use client';

interface CalendarHeatmapProps {
  days: { day: number; totalMl: number }[];
  target: number;
  year: number;
  month: number;
}

function getIntensityClass(totalMl: number, target: number): string {
  if (totalMl === 0) return 'bg-gray-100 dark:bg-gray-700';
  const ratio = totalMl / target;
  if (ratio >= 1) return 'bg-water-500 dark:bg-water-400';
  if (ratio >= 0.66) return 'bg-water-400 dark:bg-water-500';
  if (ratio >= 0.33) return 'bg-water-300 dark:bg-water-600';
  return 'bg-water-200 dark:bg-water-700';
}

export function CalendarHeatmap({ days, target, year, month }: CalendarHeatmapProps) {
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  if (days.length === 0) {
    return <p className="py-4 text-center text-sm text-gray-400">No data for this month.</p>;
  }

  return (
    <div>
      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-xs text-gray-400 dark:text-gray-500">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {blanks.map((_, i) => (
          <div key={`blank-${i}`} className="aspect-square rounded-lg" />
        ))}
        {days.map((d) => (
          <div
            key={d.day}
            className={`group relative flex aspect-square items-center justify-center rounded-lg text-xs font-medium transition-colors ${getIntensityClass(d.totalMl, target)}`}
          >
            <span className={d.totalMl > 0 ? 'text-white dark:text-gray-900' : 'text-gray-400 dark:text-gray-500'}>
              {d.day}
            </span>
            {d.totalMl > 0 && (
              <div className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow transition-opacity group-hover:opacity-100 dark:bg-gray-200 dark:text-gray-900">
                {d.totalMl} ml
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
