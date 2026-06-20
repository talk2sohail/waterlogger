# Water Logger — Feature Specification

## Overview
A fast, interactive water intake tracker with fluid animations. Local-first with future cloud sync support. Built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4.

---

## Architecture

### Modular Layers

```
┌─────────────────────────────────────────┐
│              UI Components               │
│  (pages, layouts, reusable components)  │
├─────────────────────────────────────────┤
│           State / Hooks Layer            │
│  (React hooks, zustand stores, etc.)    │
├─────────────────────────────────────────┤
│            Service Layer                 │
│  (business logic, calculations, stats)  │
├─────────────────────────────────────────┤
│         Repository Interface            │
│  (IWaterLogRepository - abstraction)    │
├──────────────────┬──────────────────────┤
│ LocalStorageRepo │ (future: CloudRepo)  │
└──────────────────┴──────────────────────┘
```

- **Repository pattern** — data access is abstracted behind an interface. Swap implementations without touching business logic.
- **Service layer** — pure functions, easy to test.
- **Components** — thin, presentational where possible; use hooks for stateful logic.

### Key design decisions
- **Local-first**: All data lives in `localStorage` initially, structured for future migration.
- **No auth yet**: Added when cloud sync ships.
- **No external state lib initially**: React context + hooks are sufficient; upgrade to zustand if complexity grows.
- **Animation**: CSS transitions + Tailwind for most things; `framer-motion` if complex choreography is needed.

---

## Data Model

```typescript
interface WaterEntry {
  id: string;           // crypto.randomUUID()
  amountMl: number;     // amount in milliliters
  timestamp: string;    // ISO 8601
  type: WaterType;      // 'water' | 'tea' | 'coffee' | 'juice' | 'other'
  note?: string;
}

type WaterType = 'water' | 'tea' | 'coffee' | 'juice' | 'other';

interface DailyGoal {
  targetMl: number;     // default 2000
  enabled: boolean;
}

interface Settings {
  dailyGoal: DailyGoal;
  unit: 'ml' | 'oz';
  theme: 'light' | 'dark' | 'system';
  reminderIntervalMinutes: number;  // 0 = off
}

// LocalStorage shape:
interface PersistedState {
  entries: WaterEntry[];
  settings: Settings;
  version: number;       // for future migrations
}
```

---

## Features by Phase

### Phase 1 — Core (this sprint)

| # | Feature | Description | Status |
|--|---------|-------------|--------|
| 1.1 | Quick-add water | Tap button to log preset amounts (200ml, 250ml, 500ml) | ✅ |
| 1.2 | Custom amount | Manual input for any ml value | ✅ |
| 1.3 | Daily goal config | Set target ml in settings | ✅ |
| 1.4 | Progress ring | Animated circular progress toward daily goal | ✅ |
| 1.5 | Progress bar | Horizontal bar showing today's progress | ✅ |
| 1.6 | Today's log list | Chronological list of today's entries with delete | ✅ |
| 1.7 | Persistence | All data saved to localStorage | ✅ |
| 1.8 | Settings page | Unit toggle, theme toggle, goal setting | ✅ |
| 1.9 | Week summary | Simple 7-day bar chart | ✅ |
| 1.10 | Animations | Fluid micro-interactions (add water, progress update, page transitions) | ✅ |

### Phase 2 — Enhanced ✅

| # | Feature | Description | Status |
|---|---------|-------------|--------|
| 2.1 | Multi-beverage | Track tea, coffee, juice separately | ✅ |
| 2.2 | Rich history | Monthly calendar view, detailed stats | ✅ |
| 2.3 | Reminders | Browser notifications at configurable intervals | ✅ |
| 2.4 | Dark mode | System-aware + manual toggle | ✅ |
| 2.5 | Export data | Download as CSV/JSON | ✅ |
| 2.6 | PWA | Installable, offline-capable | ✅ |

### Phase 3 — Cloud Sync

| # | Feature | Description | Status |
|---|---------|-------------|--------|
| 3.1 | Auth | Email/password or OAuth (Google, Apple) | 🔲 |
| 3.2 | Cloud storage | Entries synced to Supabase / similar | 🔲 |
| 3.3 | Multi-device | Real-time sync across devices | 🔲 |
| 3.4 | Conflict resolution | Last-write-wins with merge | 🔲 |

---

## Routes (App Router)

| Path | Page | Purpose |
|------|------|---------|
| `/` | Home | Today's log + quick-add + progress ring |
| `/history` | History | Weekly/monthly stats & charts |
| `/settings` | Settings | Goal, units, theme, reminders, export |
| `/manifest.json` | Static | PWA manifest |
| `/sw.js` | Static | Service worker |
| `/icons/icon.svg` | Static | PWA app icon |

---

## Component Tree

```
RootLayout
├── ThemeProvider (dark mode, system pref, flash prevention)
├── ReminderInit (browser notification service)
├── PwaInit (service worker registration)
├── Header (nav)
├── Page content
│   ├── HomePage
│   │   ├── ProgressRing (animated SVG)
│   │   ├── BeverageSelector (water/tea/coffee/juice/other)
│   │   ├── QuickAddButtons (200ml, 250ml, 500ml)
│   │   ├── CustomAmountInput
│   │   └── TodayEntries (list with delete)
│   ├── HistoryPage
│   │   ├── WeekChart (7-day bar chart)
│   │   ├── CalendarHeatmap (month grid)
│   │   └── MonthlyStats (total, avg, best day, active days)
│   └── SettingsPage
│       ├── Goal setting (target ml)
│       ├── Theme toggle (light/dark/system)
│       ├── Unit toggle (ml/oz)
│       ├── Reminders (interval + permission)
│       ├── Export (CSV/JSON)
│       └── Danger zone (clear all)
```

---

## Non-goals (out of scope for now)
- Complex social features (leaderboards, sharing)
- Native mobile apps (PWA is sufficient)
- BLE/smart bottle integration
- ML-driven hydration predictions

---

## Future Extensibility Points
- `IWaterLogRepository` interface — implement `SupabaseWaterLogRepository` for cloud
- Entry `type` field — already in schema, UI filters can be added later
- Plugin-style notifications — `NotificationService` interface (browser, push, etc.)
