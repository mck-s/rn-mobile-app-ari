// src/utils/summary.ts
import type { LogEntry } from '../../src/types/log';
import { startOfLocalDay, endOfLocalDay } from '../../src/store/useLogs';

export function dailySummary(logs: LogEntry[], dateISO: string, tz: string) {
  const day = new Date(dateISO);
  const start = startOfLocalDay(day, tz).getTime();
  const end = endOfLocalDay(day, tz).getTime();

  let poops = 0;
  let feeds = 0;
  let sleepMs = 0;

  // Map sleepStart.id -> start log (we keep all; intersection handles the window)
  const startMap = new Map<string, LogEntry>();
  const endList: { startId: string; endAt: number }[] = [];

  for (const l of logs) {
    const t = new Date(l.createdAt).getTime();

    switch (l.kind) {
      case 'poop':
        if (t >= start && t <= end) poops++;
        break;
      case 'feed':
        if (t >= start && t <= end) feeds++;
        break;
      case 'sleepStart':
        startMap.set(l.id, l);
        break;
      case 'sleepEnd':
        endList.push({ startId: l.startId, endAt: t });
        break;
    }
  }

  // For each matched sleep pair, compute intersection with [start, end]
  for (const { startId, endAt } of endList) {
    const startLog = startMap.get(startId);
    if (!startLog) continue;
    const st = new Date(startLog.createdAt).getTime();

    const a = Math.max(st, start);
    const b = Math.min(endAt, end);
    if (b > a) sleepMs += b - a;
  }

  return { poops, feeds, sleepMs };
}

export function formatDuration(ms: number) {
  const h = Math.floor(ms / 3600000);
  const m = Math.round((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}
