import type { WaterEntry, Settings } from '@/lib/types';

export interface IWaterLogRepository {
  getEntries(): Promise<WaterEntry[]>;
  addEntry(entry: WaterEntry): Promise<void>;
  updateEntry(entry: WaterEntry): Promise<void>;
  deleteEntry(id: string): Promise<void>;
  getSettings(): Promise<Settings>;
  updateSettings(settings: Settings): Promise<void>;
  clearAll(): Promise<void>;
}
