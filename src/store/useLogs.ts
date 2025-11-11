// src/store/useLogs.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuid } from 'uuid';
import type { LogEntry, PoopAmount, FeedAmount } from '../../src/types/log';

type State = {
  logs: LogEntry[];
  activeSleepId?: string; // if sleeping, keep the sleepStart id
};

type Actions = {
  addPoop: (amount?: PoopAmount) => void;
  addFeed: (amount?: FeedAmount) => void;
  startSleep: () => void;
  endSleep: () => void; // pairs with active start
  addMemo: (text: string) => void;
  deleteLog: (id: string) => void;
  deleteDay: (dateISO: string, tz: string) => void; // removes logs that fall on that calendar day
  deleteAll: () => void;
};

function nowISO() {
  return new Date().toISOString(); // store in UTC
}

export const useLogs = create<State & Actions>()(
  persist(
    (set, get) => ({
      logs: [],
      activeSleepId: undefined,

      addPoop: (amount) =>
        set((s) => ({
          logs: [...s.logs, { id: uuid(), kind: 'poop', amount, createdAt: nowISO() }],
        })),

      addFeed: (amount) =>
        set((s) => ({
          logs: [...s.logs, { id: uuid(), kind: 'feed', amount, createdAt: nowISO() }],
        })),

      startSleep: () =>
        set((s) => {
          if (s.activeSleepId) return s; // already sleeping; ignore
          const id = uuid();
          const start: LogEntry = { id, kind: 'sleepStart', createdAt: nowISO() };
          return { logs: [...s.logs, start], activeSleepId: id };
        }),

      endSleep: () =>
        set((s) => {
          if (!s.activeSleepId) return s; // no active sleep
          const end: LogEntry = {
            id: uuid(),
            kind: 'sleepEnd',
            createdAt: nowISO(),
            startId: s.activeSleepId,
          };
          return { logs: [...s.logs, end], activeSleepId: undefined };
        }),

      addMemo: (text) =>
        set((s) => ({
          logs: [...s.logs, { id: uuid(), kind: 'memo', text, createdAt: nowISO() }],
        })),

      deleteLog: (id) => set((s) => ({ logs: s.logs.filter((l) => l.id !== id) })),

      deleteDay: (dateISO, tz) =>
        set((s) => {
          // remove logs whose *local date* == dateISO's local date
          const day = new Date(dateISO);
          const start = startOfLocalDay(day, tz);
          const end = endOfLocalDay(day, tz);
          return {
            logs: s.logs.filter((l) => {
              const t = new Date(l.createdAt).getTime();
              return t < start.getTime() || t > end.getTime();
            }),
          };
        }),

      deleteAll: () => set({ logs: [], activeSleepId: undefined }),
    }),
    {
      name: 'baby-care-logs',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
);

// --- utils: local day boundaries (clip intervals to day)
export function startOfLocalDay(d: Date, tz: string) {
  // tz must be a string; fallback already handled by caller
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d);

  const y = Number(parts.find((p) => p.type === 'year')?.value);
  const m = Number(parts.find((p) => p.type === 'month')?.value) - 1; // 0-based
  const day = Number(parts.find((p) => p.type === 'day')?.value);

  // Construct a UTC timestamp for that local midnight
  return new Date(Date.UTC(y, m, day, 0, 0, 0));
}

export function endOfLocalDay(d: Date, tz: string) {
  const s = startOfLocalDay(d, tz);
  return new Date(s.getTime() + 24 * 60 * 60 * 1000 - 1);
}
