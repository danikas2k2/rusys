import { DAY_MS } from '~/common/utils/time';
import type { VariantAmount } from '~/types/data';

export const EXPIRY_SOON_THRESHOLD_DAYS = 30;

const DAYS_PER_WEEK = 7;
const DAYS_PER_MONTH = 30;
const DAYS_PER_YEAR = 365;

export type ExpiryStatus = 'expired' | 'soon';

export function getExpiryStatus(
    expiresAt: number | undefined,
    now: number,
    expiryToleranceDays = 0
): ExpiryStatus | undefined {
    if (expiresAt == null) {
        return undefined;
    }
    if (expiresAt + expiryToleranceDays * DAY_MS < now) {
        return 'expired';
    }
    if (expiresAt < now + EXPIRY_SOON_THRESHOLD_DAYS * DAY_MS) {
        return 'soon';
    }
    return undefined;
}

export function getWorstExpiryStatus(statuses: readonly (ExpiryStatus | undefined)[]): ExpiryStatus | undefined {
    if (statuses.includes('expired')) {
        return 'expired';
    }
    if (statuses.includes('soon')) {
        return 'soon';
    }
    return undefined;
}

// Parses a `YYYY-MM-DD` value as a local calendar date (avoids treating a bare date string as UTC
// midnight, which can shift the date by a day depending on timezone).
export function parseDateOnly(value: string): number {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day).getTime();
}

export function formatDateOnly(epochMs: number): string {
    const d = new Date(epochMs);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Converts a human-entered expiry tolerance to whole days. */
export function parseExpiryTolerance(value: string): number | undefined {
    const match = value.trim().match(/^(\d+)(?:\s*([\p{L}.]+))?$/u);
    if (!match) {
        return undefined;
    }

    const amount = Number(match[1]);
    const suffixWithPunctuation = match[2]?.toLocaleLowerCase('lt-LT') ?? '';
    const suffix = suffixWithPunctuation.replace(/\.$/u, '');
    const multiplier =
        suffix === '' || suffix === 'd'
            ? 1
            : suffix === 's' || suffix === 'sav' || suffix === 'w'
              ? DAYS_PER_WEEK
              : suffix === 'mėn' || suffix === 'men' || suffix === 'mon'
                ? DAYS_PER_MONTH
                : suffix === 'm' || suffix === 'y' || suffix === 'met'
                  ? DAYS_PER_YEAR
                  : undefined;

    const days = multiplier === undefined ? Number.NaN : amount * multiplier;
    return Number.isSafeInteger(days) ? days : undefined;
}

/** Formats whole days with the closest useful Lithuanian time unit. */
export function formatExpiryTolerance(days: number): string {
    if (days <= DAYS_PER_WEEK) {
        return String(days);
    }

    const weeks = Math.round(days / DAYS_PER_WEEK);
    const months = Math.round(days / DAYS_PER_MONTH);
    const years = Math.round(days / DAYS_PER_YEAR);
    const weekDifference = Math.abs(days - weeks * DAYS_PER_WEEK);
    const monthDifference = Math.abs(days - months * DAYS_PER_MONTH);
    const yearDifference = Math.abs(days - years * DAYS_PER_YEAR);

    if (years > 0 && yearDifference < monthDifference && yearDifference < weekDifference) {
        return `${years} m.`;
    }
    if (months > 20) {
        return `${years} m.`;
    }
    if ((months > 0 && monthDifference < weekDifference) || weeks > 20) {
        return `${months} mėn`;
    }
    return `${weeks} sav`;
}

export interface ExpiryAmountBuckets {
    valid: readonly VariantAmount[];
    soon: readonly VariantAmount[];
    expired: readonly VariantAmount[];
}

// Buckets by expiry status, with `valid` also covering entries with no `expiresAt` at all - both
// are shown as one combined "not urgent" number in the products table.
export function partitionByExpiryStatus(
    amounts: readonly VariantAmount[],
    now: number,
    expiryToleranceDays = 0
): ExpiryAmountBuckets {
    const valid: VariantAmount[] = [];
    const soon: VariantAmount[] = [];
    const expired: VariantAmount[] = [];
    for (const a of amounts) {
        const status = getExpiryStatus(a.expiresAt, now, expiryToleranceDays);
        if (status === 'expired') {
            expired.push(a);
        } else if (status === 'soon') {
            soon.push(a);
        } else {
            valid.push(a);
        }
    }
    return { valid, soon, expired };
}

// Display order for the three buckets: soon-expiring first (most urgent to use up), then valid,
// then already-expired last (to be discarded, no longer actionable).
export function orderedExpiryBuckets(
    buckets: ExpiryAmountBuckets
): readonly [ExpiryStatus | undefined, readonly VariantAmount[]][] {
    return [
        ['soon', buckets.soon],
        [undefined, buckets.valid],
        ['expired', buckets.expired],
    ];
}
