export type WaterType = 'water' | 'tea' | 'coffee' | 'juice' | 'other';

export const BEVERAGE_INFO: Record<WaterType, { label: string; icon: string; color: string }> = {
  water:  { label: 'Water',  icon: '💧', color: '#3b82f6' },
  tea:    { label: 'Tea',    icon: '🍵', color: '#b45309' },
  coffee: { label: 'Coffee', icon: '☕', color: '#78350f' },
  juice:  { label: 'Juice',  icon: '🧃', color: '#f97316' },
  other:  { label: 'Other',  icon: '🥤', color: '#a855f7' },
};

export interface WaterEntry {
  id: string;
  amountMl: number;
  timestamp: string;
  type: WaterType;
  note?: string;
}

export interface DailyGoal {
  targetMl: number;
  enabled: boolean;
}

export interface Settings {
  dailyGoal: DailyGoal;
  unit: 'ml' | 'oz';
  theme: 'light' | 'dark' | 'system';
  reminderIntervalMinutes: number;
}

export interface PersistedState {
  entries: WaterEntry[];
  settings: Settings;
  version: number;
}

export const DEFAULT_SETTINGS: Settings = {
  dailyGoal: { targetMl: 4000, enabled: true },
  unit: 'ml',
  theme: 'system',
  reminderIntervalMinutes: 0,
};

export const PERSISTENCE_VERSION = 1;
