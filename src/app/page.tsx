'use client';

import { useState, useEffect } from 'react';
import type { WaterType } from '@/lib/types';
import { BEVERAGE_INFO } from '@/lib/types';
import { useWaterEntries } from '@/hooks/useWaterEntries';
import { useSettings } from '@/hooks/useSettings';
import { ProgressRing } from '@/components/water/ProgressRing';
import { QuickAddButtons } from '@/components/water/QuickAddButtons';
import { CustomAmountInput } from '@/components/water/CustomAmountInput';
import { TodayEntries } from '@/components/water/TodayEntries';
import { BeverageSelector } from '@/components/water/BeverageSelector';

export default function HomePage() {
  const { entries, todayTotal, loading, error, addWater, deleteEntry } = useWaterEntries();
  const { settings } = useSettings();
  const [beverageType, setBeverageType] = useState<WaterType>('water');

  const beverageColor = BEVERAGE_INFO[beverageType].color;

  useEffect(() => {
    document.documentElement.style.setProperty('--beverage-color', beverageColor);
  }, [beverageColor]);
  const targetMl = settings.dailyGoal.enabled ? settings.dailyGoal.targetMl : 1;

  async function handleAdd(amountMl: number) {
    await addWater(amountMl, beverageType);
  }

  async function handleDelete(id: string) {
    await deleteEntry(id);
  }

  return (
    <div className="space-y-4">
      <section className="animate-fade-in flex flex-col items-center gap-2">
        <ProgressRing current={todayTotal} target={targetMl} color={beverageColor} />
        {error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {loading ? 'Loading...' : `${entries.length} entries today`}
          </p>
        )}
      </section>

      <section className="space-y-4">
        <BeverageSelector selected={beverageType} onChange={setBeverageType} />
        <QuickAddButtons onAdd={handleAdd} disabled={loading} color={beverageColor} />
        <CustomAmountInput onAdd={handleAdd} disabled={loading} color={beverageColor} />
      </section>

      <section className="animate-fade-in">
        <h2 className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Today&apos;s Log
        </h2>
        <TodayEntries entries={entries} onDelete={handleDelete} />
      </section>
    </div>
  );
}
