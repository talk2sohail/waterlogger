import type { IWaterLogRepository } from '@/lib/repositories/IWaterLogRepository';
import type { WaterEntry, WaterType, Settings } from '@/lib/types';

function createId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createEntry(amountMl: number, type: WaterType = 'water', note?: string): WaterEntry {
  return {
    id: createId(),
    amountMl,
    timestamp: new Date().toISOString(),
    type,
    note,
  };
}

export function getTodayEntries(entries: WaterEntry[]): WaterEntry[] {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return entries.filter((e) => new Date(e.timestamp) >= startOfDay);
}

export function getTotalForDay(entries: WaterEntry[], date: Date = new Date()): number {
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 86400000);
  return entries
    .filter((e) => {
      const d = new Date(e.timestamp);
      return d >= startOfDay && d < endOfDay;
    })
    .reduce((sum, e) => sum + e.amountMl, 0);
}

export function getTotalForDayByType(entries: WaterEntry[], date: Date, type: WaterType): number {
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 86400000);
  return entries
    .filter((e) => {
      const d = new Date(e.timestamp);
      return d >= startOfDay && d < endOfDay && e.type === type;
    })
    .reduce((sum, e) => sum + e.amountMl, 0);
}

export function getWeeklyTotals(entries: WaterEntry[]): { date: string; totalMl: number }[] {
  const today = new Date();
  const days: { date: string; totalMl: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    days.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      totalMl: getTotalForDay(entries, date),
    });
  }
  return days;
}

export function getStreak(entries: WaterEntry[], targetMl: number): number {
  const dailyTotals = new Map<string, number>();
  for (const e of entries) {
    const d = new Date(e.timestamp);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    dailyTotals.set(key, (dailyTotals.get(key) ?? 0) + e.amountMl);
  }

  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const total = dailyTotals.get(key) ?? 0;
    if (total >= targetMl) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function getMonthlyCalendarDays(entries: WaterEntry[], year: number, month: number): { day: number; totalMl: number }[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: { day: number; totalMl: number }[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    days.push({
      day: d,
      totalMl: getTotalForDay(entries, date),
    });
  }
  return days;
}

export interface MonthlyStatsResult {
  total: number;
  average: number;
  bestDay: number;
  bestDayNumber: number | null;
  days: { day: number; totalMl: number }[];
  activeDays: number;
}

export function computeMonthlyStats(entries: WaterEntry[], year: number, month: number): MonthlyStatsResult {
  const days = getMonthlyCalendarDays(entries, year, month);
  const totals = days.map((d) => d.totalMl);
  const total = totals.reduce((a, b) => a + b, 0);
  const daysWithData = totals.filter((t) => t > 0);
  const average = daysWithData.length > 0 ? Math.round(total / daysWithData.length) : 0;
  const bestDay = Math.max(...totals, 0);
  const bestDayIndex = totals.indexOf(bestDay);

  return {
    total,
    average,
    bestDay,
    bestDayNumber: bestDayIndex >= 0 ? days[bestDayIndex].day : null,
    days,
    activeDays: daysWithData.length,
  };
}

export class WaterService {
  constructor(private repo: IWaterLogRepository) {}

  async addWater(amountMl: number, type: WaterType = 'water', note?: string): Promise<WaterEntry> {
    const entry = createEntry(amountMl, type, note);
    await this.repo.addEntry(entry);
    return entry;
  }

  async deleteEntry(id: string): Promise<void> {
    await this.repo.deleteEntry(id);
  }

  async getTodayEntries(): Promise<WaterEntry[]> {
    const all = await this.repo.getEntries();
    return getTodayEntries(all);
  }

  async getTodayTotal(): Promise<number> {
    const all = await this.repo.getEntries();
    return getTotalForDay(all);
  }

  async getWeeklyTotals(): Promise<{ date: string; totalMl: number }[]> {
    const all = await this.repo.getEntries();
    return getWeeklyTotals(all);
  }

  async getStreak(): Promise<number> {
    const all = await this.repo.getEntries();
    const settings = await this.repo.getSettings();
    return getStreak(all, settings.dailyGoal.targetMl);
  }

  async getMonthlyStats(year: number, month: number) {
    const all = await this.repo.getEntries();
    return computeMonthlyStats(all, year, month);
  }

  async getAllEntries(): Promise<WaterEntry[]> {
    return this.repo.getEntries();
  }

  async getSettings(): Promise<Settings> {
    return this.repo.getSettings();
  }

  async updateSettings(settings: Settings): Promise<void> {
    await this.repo.updateSettings(settings);
  }

  async clearAll(): Promise<void> {
    await this.repo.clearAll();
  }
}
