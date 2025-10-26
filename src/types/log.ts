// src/types/log.ts
export type LogKind = 'poop' | 'feed' | 'sleepStart' | 'sleepEnd' | 'memo';

export type FeedAmount = 'a-lot' | 'normal' | 'barely';

export type BaseLog = {
  id: string; // uuid
  kind: LogKind;
  createdAt: string; // ISO string (UTC)
};

export type PoopLog = BaseLog & { kind: 'poop' };
export type FeedLog = BaseLog & { kind: 'feed'; amount?: FeedAmount };
export type SleepStartLog = BaseLog & { kind: 'sleepStart' };
export type SleepEndLog = BaseLog & { kind: 'sleepEnd'; startId: string }; // links to start
export type MemoLog = BaseLog & { kind: 'memo'; text: string }; // <= 100 words

export type LogEntry = PoopLog | FeedLog | SleepStartLog | SleepEndLog | MemoLog;
