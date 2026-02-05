import type { History } from '~/types/data';

export const SESSION_GAP_MS = 15 * 60 * 1000;

export interface HistorySession {
    startTime: number;
    endTime: number;
    items: readonly History[];
}

export function useHistorySessions(items: readonly History[], gapMs = SESSION_GAP_MS): readonly HistorySession[] {
    if (!items.length) {
        return [];
    }

    const byUser = new Map<string, History[]>();
    for (const item of items) {
        const key = (item.user ?? '').toLowerCase();
        const arr = byUser.get(key);
        if (arr) {
            arr.push(item);
        } else {
            byUser.set(key, [item]);
        }
    }

    const allSessions: HistorySession[] = [];

    for (const userItems of byUser.values()) {
        const sorted = [...userItems].sort((a, b) => a.time - b.time); // ascending
        let current: History[] = [];
        let prevTime = 0;

        for (const item of sorted) {
            if (!current.length) {
                current = [item];
                prevTime = item.time;
                continue;
            }

            const gap = item.time - prevTime;
            if (gap <= gapMs) {
                current.push(item);
                prevTime = item.time;
                continue;
            }

            const startTime = current[0]!.time;
            const endTime = current[current.length - 1]!.time;
            allSessions.push({
                startTime,
                endTime,
                items: [...current].sort((a, b) => b.time - a.time),
            });
            current = [item];
            prevTime = item.time;
        }

        if (current.length) {
            const startTime = current[0]!.time;
            const endTime = current[current.length - 1]!.time;
            allSessions.push({
                startTime,
                endTime,
                items: [...current].sort((a, b) => b.time - a.time),
            });
        }
    }

    return allSessions.sort((a, b) => b.startTime - a.startTime); // newest sessions first
}
