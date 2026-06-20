'use client';

import { useState, useEffect, useRef } from 'react';
import type { WaterEntry } from '@/lib/types';
import { BEVERAGE_INFO } from '@/lib/types';

interface TodayEntriesProps {
  entries: WaterEntry[];
  onDelete: (id: string) => void;
}

export function TodayEntries({ entries, onDelete }: TodayEntriesProps) {
  const [animId, setAnimId] = useState<string | null>(null);
  const [pushedId, setPushedId] = useState<string | null>(null);
  const prevIdsRef = useRef<Set<string>>(new Set());
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (entries.length === 0) {
      prevIdsRef.current = new Set();
      return;
    }

    const sorted = [...entries].reverse();
    const newIds = new Set<string>();
    for (const entry of entries) {
      if (!prevIdsRef.current.has(entry.id)) {
        newIds.add(entry.id);
      }
    }

    if (newIds.size > 0 && hasLoaded.current) {
      setAnimId([...newIds][0]);

      const previousTopId = sorted[1]?.id;
      if (previousTopId) {
        setPushedId(previousTopId);
      }
    }

    prevIdsRef.current = new Set(entries.map((e) => e.id));

    if (!hasLoaded.current) {
      hasLoaded.current = true;
    }
  }, [entries]);

  if (entries.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
        No water logged today yet. Tap a button above to start!
      </p>
    );
  }

  const sorted = [...entries].reverse();

  return (
    <ul className="space-y-2">
      {sorted.map((entry) => {
        const isAnimating = entry.id === animId;
        const isPushed = entry.id === pushedId;
        const info = BEVERAGE_INFO[entry.type] ?? BEVERAGE_INFO.water;
        return (
          <li
            key={entry.id}
            className={`flex items-center justify-between rounded-xl border border-water-100 bg-white px-4 py-3 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 ${
              isAnimating ? 'slide-in-wobble' : ''
            } ${isPushed ? 'push-down' : ''}`}
            style={{ borderLeftColor: info.color, borderLeftWidth: '4px' }}
            onAnimationEnd={() => {
              if (isAnimating) setAnimId(null);
              if (isPushed) setPushedId(null);
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{info.icon}</span>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-100">
                  {entry.amountMl} ml <span className="text-xs font-normal text-gray-400 dark:text-gray-500">{info.label}</span>
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <button
              onClick={() => onDelete(entry.id)}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30"
              aria-label="Delete entry"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
