'use client';

interface QuickAddButtonsProps {
  onAdd: (amountMl: number) => void;
  disabled?: boolean;
  color?: string;
}

const presets = [200, 250, 500];

function hexToRgb(hex: string) {
  const v = parseInt(hex.replace('#', ''), 16);
  return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
}

export function QuickAddButtons({ onAdd, disabled, color = '#3b82f6' }: QuickAddButtonsProps) {
  const rgb = hexToRgb(color);
  const lighter = `rgb(${Math.min(rgb.r + 60, 255)}, ${Math.min(rgb.g + 60, 255)}, ${Math.min(rgb.b + 60, 255)})`;

  return (
    <div className="flex gap-3">
      {presets.map((amount) => (
        <button
          key={amount}
          onClick={() => onAdd(amount)}
          disabled={disabled}
          className="flex-1 rounded-2xl px-4 py-3 text-center text-white shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-50"
          style={{ background: `linear-gradient(to bottom right, ${lighter}, ${color})` }}
        >
          <span className="block text-lg font-bold">{amount}ml</span>
          <span className="block text-xs opacity-70">+ Add</span>
        </button>
      ))}
    </div>
  );
}
