import { DAY_MS } from '~/common/utils/time';
import type { VariantAmount } from '~/types/data';

export const EXPIRY_SOON_THRESHOLD_DAYS = 30;

export type ExpiryStatus = 'expired' | 'soon';

export function getExpiryStatus(expiresAt: number | undefined, now: number): ExpiryStatus | undefined {
    if (expiresAt == null) {
        return undefined;
    }
    if (expiresAt < now) {
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

export interface ExpiryAmountBuckets {
    valid: readonly VariantAmount[];
    soon: readonly VariantAmount[];
    expired: readonly VariantAmount[];
}

// Buckets by expiry status, with `valid` also covering entries with no `expiresAt` at all - both
// are shown as one combined "not urgent" number in the products table.
export function partitionByExpiryStatus(amounts: readonly VariantAmount[], now: number): ExpiryAmountBuckets {
    const valid: VariantAmount[] = [];
    const soon: VariantAmount[] = [];
    const expired: VariantAmount[] = [];
    for (const a of amounts) {
        const status = getExpiryStatus(a.expiresAt, now);
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
