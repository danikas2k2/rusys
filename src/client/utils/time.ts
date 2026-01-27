const QUARTER_HOUR_MINUTES = 15;

export function getRoundedDate(time: string | number): Date {
    const d = new Date(+time);
    d.setSeconds(0, 0);
    d.setMinutes(Math.floor(d.getMinutes() / QUARTER_HOUR_MINUTES) * QUARTER_HOUR_MINUTES);
    return d;
}

export function formatTime(date: Date): string {
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    if (!days) {
        return '';
    }
    if (days === 1) {
        return 'Yesterday';
    }
    return date.toLocaleDateString('en', days < 7 ? { weekday: 'long' } : { month: 'long', day: 'numeric' });
}
