import type { IWaterLogRepository } from './IWaterLogRepository';
import type { WaterEntry, Settings, PersistedState } from '@/lib/types';
import { DEFAULT_SETTINGS, PERSISTENCE_VERSION } from '@/lib/types';

const STORAGE_KEY = 'waterlogger:state';

function readState(): PersistedState {
  if (typeof window === 'undefined') {
    return { entries: [], settings: DEFAULT_SETTINGS, version: PERSISTENCE_VERSION };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { entries: [], settings: DEFAULT_SETTINGS, version: PERSISTENCE_VERSION };
    }
    const parsed = JSON.parse(raw) as PersistedState;
    // Merge with defaults for forward compatibility
    return {
      entries: parsed.entries ?? [],
      settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
      version: parsed.version ?? PERSISTENCE_VERSION,
    };
  } catch {
    return { entries: [], settings: DEFAULT_SETTINGS, version: PERSISTENCE_VERSION };
  }
}

function writeState(state: PersistedState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export class LocalStorageWaterLogRepository implements IWaterLogRepository {
  async getEntries(): Promise<WaterEntry[]> {
    return readState().entries;
  }

  async addEntry(entry: WaterEntry): Promise<void> {
    const state = readState();
    state.entries.push(entry);
    writeState(state);
  }

  async updateEntry(entry: WaterEntry): Promise<void> {
    const state = readState();
    const index = state.entries.findIndex((e) => e.id === entry.id);
    if (index !== -1) {
      state.entries[index] = entry;
      writeState(state);
    }
  }

  async deleteEntry(id: string): Promise<void> {
    const state = readState();
    state.entries = state.entries.filter((e) => e.id !== id);
    writeState(state);
  }

  async getSettings(): Promise<Settings> {
    return readState().settings;
  }

  async updateSettings(settings: Settings): Promise<void> {
    const state = readState();
    state.settings = settings;
    writeState(state);
  }

  async clearAll(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
  }
}
