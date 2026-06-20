'use client';

import type { WaterType } from '@/lib/types';
import { BEVERAGE_INFO } from '@/lib/types';

interface BeverageSelectorProps {
  selected: WaterType;
  onChange: (type: WaterType) => void;
}

const types = Object.keys(BEVERAGE_INFO) as WaterType[];

export function BeverageSelector({ selected, onChange }: BeverageSelectorProps) {
  return (
    <div className="flex gap-1.5">
      {types.map((type) => {
        const info = BEVERAGE_INFO[type];
        const isActive = type === selected;
        return (
          <button
            key={type}
            onClick={() => onChange(type)}
            className={`flex items-center gap-1 rounded-xl px-3 py-2 text-sm transition-all active:scale-95 ${
              isActive
                ? 'text-white shadow'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
            style={isActive ? { backgroundColor: info.color } : undefined}
            title={info.label}
          >
            <span>{info.icon}</span>
            <span className="hidden sm:inline">{info.label}</span>
          </button>
        );
      })}
    </div>
  );
}
