import type { ProductUpdateHistoryItem } from '~/types/data';

export const SESSION_GAP_MS = 15 * 60 * 1000;

export type HistorySession = {
    startTime: number;
    endTime: number;
    items: readonly ProductUpdateHistoryItem[];
};

export function buildSessions(items: readonly ProductUpdateHistoryItem[], gapMs = SESSION_GAP_MS): readonly HistorySession[] {
    if (!items.length) {
        return [];
    }

    const sorted = [...items].sort((a, b) => a.time - b.time); // ascending
    const sessions: ProductUpdateHistoryItem[][] = [];

    let current: ProductUpdateHistoryItem[] = [];
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

        sessions.push(current);
        current = [item];
        prevTime = item.time;
    }

    if (current.length) {
        sessions.push(current);
    }

    return sessions
        .map((s) => {
            const startTime = s[0]!.time;
            const endTime = s[s.length - 1]!.time;
            // Render latest first inside the session (same UX as existing history table)
            const displayItems = [...s].sort((a, b) => b.time - a.time);
            return { startTime, endTime, items: displayItems } satisfies HistorySession;
        })
        .sort((a, b) => b.startTime - a.startTime); // newest sessions first
}


