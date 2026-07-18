import { formatDate, formatTime, getRoundedDate } from '~/client/utils/time';

describe('getRoundedDate', () => {
    it('rounds minutes down to nearest 15 and clears seconds and ms', () => {
        // 10:23:45.678 -> 10:15:00.000
        const input = new Date(2024, 0, 1, 10, 23, 45, 678).getTime();
        const result = getRoundedDate(input);
        expect(result.getMinutes()).toBe(15);
        expect(result.getSeconds()).toBe(0);
        expect(result.getMilliseconds()).toBe(0);
    });

    it('rounds minutes at exact boundary (0 minutes stays 0)', () => {
        const input = new Date(2024, 0, 1, 10, 0, 30, 500).getTime();
        const result = getRoundedDate(input);
        expect(result.getMinutes()).toBe(0);
        expect(result.getSeconds()).toBe(0);
        expect(result.getMilliseconds()).toBe(0);
    });

    it('rounds to 30 when minutes are 30-44', () => {
        const input = new Date(2024, 0, 1, 10, 44, 59, 999).getTime();
        const result = getRoundedDate(input);
        expect(result.getMinutes()).toBe(30);
    });

    it('rounds to 45 when minutes are 45-59', () => {
        const input = new Date(2024, 0, 1, 10, 59, 0, 0).getTime();
        const result = getRoundedDate(input);
        expect(result.getMinutes()).toBe(45);
    });

    it('accepts a string timestamp', () => {
        const date = new Date(2024, 0, 1, 10, 23, 45, 678);
        const result = getRoundedDate(String(date.getTime()));
        expect(result.getMinutes()).toBe(15);
        expect(result.getSeconds()).toBe(0);
        expect(result.getMilliseconds()).toBe(0);
    });

    it('accepts a numeric timestamp', () => {
        const date = new Date(2024, 0, 1, 10, 16, 0, 0);
        const result = getRoundedDate(date.getTime());
        expect(result.getMinutes()).toBe(15);
    });
});

describe('formatTime', () => {
    it('returns formatted HH:MM time string', () => {
        const date = new Date(2024, 0, 1, 9, 5, 0, 0);
        const result = formatTime(date, 'en-GB');
        expect(result).toMatch(/^\d{2}:\d{2}$/);
    });

    it('returns time without seconds', () => {
        const date = new Date(2024, 0, 1, 14, 30, 45, 0);
        const result = formatTime(date, 'en-GB');
        expect(result).toBe('14:30');
    });
});

describe('formatDate', () => {
    const NOW = new Date('2024-06-15T12:00:00.000Z').getTime();

    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(NOW);
    });

    afterEach(() => {
        jest.useRealTimers();
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
        const label = jest.fn((s: string) => `[${s}]`);
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

    it('uses default locale "en" when not specified', () => {
        const sevenDaysAgo = new Date(NOW - 7 * 24 * 60 * 60 * 1000);
        const withDefault = formatDate(sevenDaysAgo);
        const withExplicit = formatDate(sevenDaysAgo, 'en');
        expect(withDefault).toBe(withExplicit);
    });
});
