'use client';

interface ProgressBarProps {
  current: number;
  target: number;
  color?: string;
}

export function ProgressBar({ current, target, color = '#3b82f6' }: ProgressBarProps) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const trackColor = `${color}33`;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-gray-500 dark:text-gray-400">Progress</span>
        <span className="font-medium" style={{ color }}>
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="h-3 w-full rounded-full overflow-hidden" style={{ backgroundColor: trackColor }}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percentage}%`, background: `linear-gradient(to right, ${color}99, ${color})` }}
        />
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
        {current} / {target} ml
      </p>
    </div>
  );
}
