import { formatDate, formatTime, getRoundedDate } from '~/lib/utils/time';

describe('getRoundedDate', () => {
    const NOW = new Date('2024-06-15T10:23:45.678Z').getTime();

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(NOW);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('last week (< 7 days) — 15 min precision', () => {
        it('rounds minutes down to nearest 15 and clears seconds and ms', () => {
            // 10:23:45.678 -> 10:15:00.000
            const result = getRoundedDate(NOW - 2 * 24 * 60 * 60 * 1000);

            expect(result.getMinutes()).toBe(15);
            expect(result.getSeconds()).toBe(0);
            expect(result.getMilliseconds()).toBe(0);
        });

        it('rounds to 0 when minutes are 0-14', () => {
            const result = getRoundedDate(new Date('2024-06-13T10:00:30.500Z').getTime());

            expect(result.getMinutes()).toBe(0);
            expect(result.getSeconds()).toBe(0);
            expect(result.getMilliseconds()).toBe(0);
        });

        it('rounds to 30 when minutes are 30-44', () => {
            const result = getRoundedDate(new Date('2024-06-13T10:44:59.999Z').getTime());

            expect(result.getMinutes()).toBe(30);
        });

        it('rounds to 45 when minutes are 45-59', () => {
            const result = getRoundedDate(new Date('2024-06-13T10:59:00.000Z').getTime());

            expect(result.getMinutes()).toBe(45);
        });

        it('accepts a string timestamp', () => {
            const result = getRoundedDate(String(new Date('2024-06-13T10:23:45.678Z').getTime()));

            expect(result.getMinutes()).toBe(15);
            expect(result.getSeconds()).toBe(0);
        });
    });

    describe('last 3 months (7 days – 90 days) — 1 hour precision', () => {
        it('rounds to the start of the hour', () => {
            const result = getRoundedDate(new Date('2024-05-01T10:44:59.999Z').getTime());

            expect(result.getMinutes()).toBe(0);
            expect(result.getSeconds()).toBe(0);
            expect(result.getMilliseconds()).toBe(0);
        });

        it('preserves the hour', () => {
            const result = getRoundedDate(new Date('2024-05-01T14:59:00.000Z').getTime());

            expect(result.getUTCHours()).toBe(14);
        });
    });

    describe('older than 3 months — 1 day precision', () => {
        it('rounds to midnight (start of day)', () => {
            const result = getRoundedDate(new Date('2024-01-01T14:44:59.999Z').getTime());

            expect(result.getHours()).toBe(0);
            expect(result.getMinutes()).toBe(0);
            expect(result.getSeconds()).toBe(0);
            expect(result.getMilliseconds()).toBe(0);
        });

        it('preserves the date', () => {
            const result = getRoundedDate(new Date('2024-01-01T14:44:59.999Z').getTime());

            expect(result.getFullYear()).toBe(2024);
            expect(result.getMonth()).toBe(0);
            expect(result.getDate()).toBe(1);
        });
    });
});

describe('formatTime', () => {
    const NOW = new Date('2024-06-15T12:00:00.000Z').getTime();

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(NOW);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns formatted HH:MM time string for a recent date', () => {
        const date = new Date('2024-06-14T09:05:00.000Z');
        const result = formatTime(date, 'en-GB');

        expect(result).toMatch(/^\d{2}:\d{2}$/);
    });

    it('returns time without seconds', () => {
        const date = new Date(2024, 5, 14, 14, 30, 45, 0); // local time
        const result = formatTime(date, 'en-GB');

        expect(result).toBe('14:30');
    });

    it('returns null for a date older than 3 months', () => {
        const old = new Date('2024-01-01T10:00:00.000Z');
        const result = formatTime(old);

        expect(result).toBeNull();
    });

    it('returns a string for a date within 3 months', () => {
        const recent = new Date('2024-05-01T10:00:00.000Z');
        const result = formatTime(recent);

        expect(result).not.toBeNull();
    });
});

describe('formatDate', () => {
    const NOW = new Date('2024-06-15T12:00:00.000Z').getTime();

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(NOW);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns empty string for today (days=0)', () => {
        const today = new Date(NOW);

        expect(formatDate(today)).toBe('');
    });

    it('returns label("Yesterday") for yesterday (days=1)', () => {
        const yesterday = new Date(NOW - 24 * 60 * 60 * 1000);

        expect(formatDate(yesterday)).toBe('Yesterday');
    });

    it('calls custom label function with "Yesterday" for yesterday', () => {
        const label = vi.fn((s: string) => `[${s}]`);
        const yesterday = new Date(NOW - 24 * 60 * 60 * 1000);
        const result = formatDate(yesterday, 'en', label);

        expect(label).toHaveBeenCalledWith('Yesterday');
        expect(result).toBe('[Yesterday]');
    });

    it('returns weekday name for 2 days ago (days < 7)', () => {
        const twoDaysAgo = new Date(NOW - 2 * 24 * 60 * 60 * 1000);
        const result = formatDate(twoDaysAgo, 'en');

        // Should be a weekday name like "Monday", "Tuesday", etc.
        expect(result).toMatch(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$/);
    });

    it('returns weekday name for 6 days ago (days < 7 boundary)', () => {
        const sixDaysAgo = new Date(NOW - 6 * 24 * 60 * 60 * 1000);
        const result = formatDate(sixDaysAgo, 'en');

        expect(result).toMatch(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$/);
    });

    it('returns month and day for 7 days ago (days >= 7)', () => {
        const sevenDaysAgo = new Date(NOW - 7 * 24 * 60 * 60 * 1000);
        const result = formatDate(sevenDaysAgo, 'en');

        // Should include a month name and a day number (e.g. "June 8")
        expect(result).toMatch(/\d+/);
        expect(result).toMatch(/[A-Z][a-z]+/);
    });

    it('returns month and day for 30 days ago (days >= 7)', () => {
        const thirtyDaysAgo = new Date(NOW - 30 * 24 * 60 * 60 * 1000);
        const result = formatDate(thirtyDaysAgo, 'en');

        expect(result).toMatch(/\d+/);
    });

    it('formats Lithuanian dates with a capitalized month and no day suffix', () => {
        vi.setSystemTime(new Date(2024, 8, 23, 12));

        expect(formatDate(new Date(2024, 8, 15, 12), 'lt-LT')).toBe('Rugsėjo 15');
        expect(formatDate(new Date(2024, 8, 15, 12), 'lt')).toBe('Rugsėjo 15');
        expect(formatDate(new Date(2023, 8, 15, 12), 'lt-LT')).toBe('Rugsėjo 15, 2023');
    });

    it('uses default locale "en" when not specified', () => {
        const sevenDaysAgo = new Date(NOW - 7 * 24 * 60 * 60 * 1000);
        const withDefault = formatDate(sevenDaysAgo);
        const withExplicit = formatDate(sevenDaysAgo, 'en');

        expect(withDefault).toBe(withExplicit);
    });

    it('includes year when date is from a previous year', () => {
        // NOW is 2024-06-15; a date from 2023 should show year
        const lastYear = new Date('2023-03-10T10:00:00.000Z');
        const result = formatDate(lastYear, 'en');

        expect(result).toMatch(/2023/);
    });

    it('does not include year when date is from the current year', () => {
        const thisYear = new Date(NOW - 30 * 24 * 60 * 60 * 1000); // 30 days ago, same year
        const result = formatDate(thisYear, 'en');

        expect(result).not.toMatch(/2024/);
    });
});
