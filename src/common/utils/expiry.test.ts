import {
    formatDateOnly,
    getExpiryStatus,
    getWorstExpiryStatus,
    parseDateOnly,
    partitionByExpiryStatus,
} from '~/common/utils/expiry';
import { DAY_MS } from '~/common/utils/time';

const NOW = 1_700_000_000_000;

describe('getExpiryStatus', () => {
    it('returns undefined when no expiresAt is set', () => {
        expect(getExpiryStatus(undefined, NOW)).toBeUndefined();
    });

    it('returns undefined when well within the valid window', () => {
        expect(getExpiryStatus(NOW + 40 * DAY_MS, NOW)).toBeUndefined();
    });

    it('returns "soon" just inside the 30-day threshold', () => {
        expect(getExpiryStatus(NOW + 30 * DAY_MS - 1, NOW)).toBe('soon');
    });

    it('returns undefined exactly at the 30-day threshold', () => {
        expect(getExpiryStatus(NOW + 30 * DAY_MS, NOW)).toBeUndefined();
    });

    it('returns "soon" when a few days out', () => {
        expect(getExpiryStatus(NOW + 5 * DAY_MS, NOW)).toBe('soon');
    });

    it('returns "soon" exactly at now', () => {
        expect(getExpiryStatus(NOW, NOW)).toBe('soon');
    });

    it('returns "expired" just past now', () => {
        expect(getExpiryStatus(NOW - 1, NOW)).toBe('expired');
    });

    it('returns "expired" well in the past', () => {
        expect(getExpiryStatus(NOW - 100 * DAY_MS, NOW)).toBe('expired');
    });
});

describe('getWorstExpiryStatus', () => {
    it('returns undefined for an empty list', () => {
        expect(getWorstExpiryStatus([])).toBeUndefined();
    });

    it('returns undefined when all statuses are undefined', () => {
        expect(getWorstExpiryStatus([undefined, undefined])).toBeUndefined();
    });

    it('returns "soon" when present without "expired"', () => {
        expect(getWorstExpiryStatus([undefined, 'soon'])).toBe('soon');
    });

    it('returns "expired" when present alongside "soon"', () => {
        expect(getWorstExpiryStatus(['soon', 'expired', undefined])).toBe('expired');
    });
});

describe('parseDateOnly', () => {
    it('parses a YYYY-MM-DD string as a local calendar date', () => {
        expect(parseDateOnly('2026-08-15')).toBe(new Date(2026, 7, 15).getTime());
    });

    it('round-trips through formatDateOnly', () => {
        const value = '2026-01-05';

        expect(formatDateOnly(parseDateOnly(value))).toBe(value);
    });
});

describe('formatDateOnly', () => {
    it('formats an epoch ms value as YYYY-MM-DD', () => {
        expect(formatDateOnly(new Date(2026, 7, 15).getTime())).toBe('2026-08-15');
    });

    it('zero-pads single-digit month and day', () => {
        expect(formatDateOnly(new Date(2026, 0, 5).getTime())).toBe('2026-01-05');
    });
});

describe('partitionByExpiryStatus', () => {
    const withNoDate = { variant: 'p', amount: 1 };
    const withValidDate = { variant: 'p', amount: 2, expiresAt: NOW + 40 * DAY_MS };
    const withSoonDate = { variant: 'p', amount: 3, expiresAt: NOW + 5 * DAY_MS };
    const withExpiredDate = { variant: 'p', amount: 4, expiresAt: NOW - 5 * DAY_MS };

    it('returns empty buckets for an empty list', () => {
        expect(partitionByExpiryStatus([], NOW)).toStrictEqual({ valid: [], soon: [], expired: [] });
    });

    it('buckets an entry with no expiresAt as valid', () => {
        expect(partitionByExpiryStatus([withNoDate], NOW)).toStrictEqual({
            valid: [withNoDate],
            soon: [],
            expired: [],
        });
    });

    it('buckets a not-yet-soon dated entry as valid, alongside undated entries', () => {
        expect(partitionByExpiryStatus([withNoDate, withValidDate], NOW)).toStrictEqual({
            valid: [withNoDate, withValidDate],
            soon: [],
            expired: [],
        });
    });

    it('buckets a soon-expiring entry separately', () => {
        expect(partitionByExpiryStatus([withSoonDate], NOW)).toStrictEqual({
            valid: [],
            soon: [withSoonDate],
            expired: [],
        });
    });

    it('buckets an already-expired entry separately', () => {
        expect(partitionByExpiryStatus([withExpiredDate], NOW)).toStrictEqual({
            valid: [],
            soon: [],
            expired: [withExpiredDate],
        });
    });

    it('splits a mixed list into all three buckets, preserving order within each', () => {
        expect(partitionByExpiryStatus([withExpiredDate, withNoDate, withSoonDate, withValidDate], NOW)).toStrictEqual({
            valid: [withNoDate, withValidDate],
            soon: [withSoonDate],
            expired: [withExpiredDate],
        });
    });
});
