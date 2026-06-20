'use client';

import { useState } from 'react';

interface CustomAmountInputProps {
  onAdd: (amountMl: number) => void;
  disabled?: boolean;
  color?: string;
}

export function CustomAmountInput({ onAdd, disabled, color = '#3b82f6' }: CustomAmountInputProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const num = Number(value);
    if (!value || isNaN(num) || num <= 0 || num > 5000) {
      setError('Enter a valid amount (1–5000 ml)');
      return;
    }
    setError('');
    onAdd(num);
    setValue('');
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="flex-1">
        <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400" htmlFor="custom-amount">
          Custom amount (ml)
        </label>
        <input
          id="custom-amount"
          type="number"
          min={1}
          max={5000}
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(''); }}
          disabled={disabled}
          placeholder="e.g. 300"
          className="no-spinner appearance-none w-full rounded-xl border bg-white px-3 py-2 text-center text-lg text-gray-800 transition-all focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-gray-100"
          style={{
            borderColor: `${color}66`,
            focusBorderColor: color,
            '--tw-ring-color': `${color}44`,
          } as React.CSSProperties}
          onFocus={(e) => { e.target.style.borderColor = color; }}
          onBlur={(e) => { e.target.style.borderColor = `${color}66`; }}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
      <button
        type="submit"
        disabled={disabled}
        className="rounded-xl px-4 py-2 text-white shadow transition-all hover:shadow-md active:scale-95 disabled:opacity-50"
        style={{ backgroundColor: color }}
        onMouseEnter={(e) => { (e.target as HTMLElement).style.filter = 'brightness(0.9)'; }}
        onMouseLeave={(e) => { (e.target as HTMLElement).style.filter = 'none'; }}
      >
        Add
      </button>
    </form>
  );
}
