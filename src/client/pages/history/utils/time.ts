const MINUTE_MS = 60_000;
const QUARTER_HOUR_MINUTES = 15;

export function formatTimeHHmm(time: number): string {
    return new Date(time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
}

function startOfDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfWeekMonday(d: Date): Date {
    // JS: Sunday=0 ... Saturday=6; we want Monday as first day of week
    const day = d.getDay();
    const diff = (day + 6) % 7; // Monday->0, Sunday->6
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() - diff);
}

function capitalizeLt(s: string): string {
    if (!s) return s;
    return s[0]!.toUpperCase() + s.slice(1);
}

export function roundDownToQuarterHourMs(time: number): number {
    const d = new Date(time);
    d.setSeconds(0, 0);
    const m = d.getMinutes();
    d.setMinutes(Math.floor(m / QUARTER_HOUR_MINUTES) * QUARTER_HOUR_MINUTES);
    return d.getTime();
}

export function minuteKey(time: number): number {
    return Math.floor(time / MINUTE_MS);
}

export function formatSessionStartTitle(startTime: number): string {
    const rounded = new Date(roundDownToQuarterHourMs(startTime));
    const now = new Date();

    const today = startOfDay(now);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const weekStart = startOfWeekMonday(now);
    const nextWeekStart = new Date(weekStart);
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);

    const timeStr = formatTimeHHmm(rounded.getTime());

    // Today: omit date completely
    if (isSameDay(rounded, today)) {
        return timeStr;
    }
    if (isSameDay(rounded, yesterday)) {
        return `Vakar ${timeStr}`;
    }
    if (rounded >= weekStart && rounded < nextWeekStart) {
        const weekday = capitalizeLt(rounded.toLocaleDateString('lt-LT', { weekday: 'long' }));
        return `${weekday} ${timeStr}`;
    }

    const monthDay = capitalizeLt(rounded.toLocaleDateString('lt-LT', { month: 'long', day: 'numeric' }));
    return `${monthDay} ${timeStr}`;
}
