import { HOUR_MS, QUARTER_HOUR_MS, THREE_MONTHS_MS, WEEK_MS } from '~/common/utils/time';

export { THREE_MONTHS_MS };

export function getRoundedDate(time: string | number): Date {
    const t = +time;
    const now = Date.now();
    const age = now - t;

    if (age >= THREE_MONTHS_MS) {
        const d = new Date(t);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    if (age >= WEEK_MS) {
        return new Date(Math.floor(t / HOUR_MS) * HOUR_MS);
    }

    return new Date(Math.floor(t / QUARTER_HOUR_MS) * QUARTER_HOUR_MS);
}

export function formatTime(date: Date, locale?: string): string | null {
    if (Date.now() - date.getTime() >= THREE_MONTHS_MS) {
        return null;
    }

    return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function formatDate(date: Date, locale = 'en', label: (s: string) => string = (s) => s): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    if (!days) {
        return '';
    }
    if (days === 1) {
        return label('Yesterday');
    }
    const sameYear = date.getFullYear() === now.getFullYear();
    if (days >= 7 && (locale === 'lt' || locale.startsWith('lt-'))) {
        const month = new Intl.DateTimeFormat(locale, { month: 'long', day: 'numeric' })
            .formatToParts(date)
            .find((part) => part.type === 'month')!.value;
        const monthAndDay = `${month.charAt(0).toLocaleUpperCase(locale)}${month.slice(1)} ${date.getDate()}`;
        return sameYear ? monthAndDay : `${monthAndDay}, ${date.getFullYear()}`;
    }
    return date.toLocaleDateString(
        locale,
        days < 7
            ? { weekday: 'long' }
            : sameYear
              ? { month: 'long', day: 'numeric' }
              : { year: 'numeric', month: 'long', day: 'numeric' }
    );
}
