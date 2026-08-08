import type { Variant, VariantAmount, YearAmounts } from '~/types/data';

export function getVariantAmount(
    amounts: readonly VariantAmount[] | undefined,
    variant: string,
    suspicious?: boolean,
    home?: boolean,
    expiresAt?: number
): number {
    return (
        amounts?.reduce(
            (a, v) =>
                a +
                (v.variant === variant &&
                !!v.suspicious === !!suspicious &&
                !!v.home === !!home &&
                v.expiresAt === expiresAt
                    ? v.amount
                    : 0),
            0
        ) ?? 0
    );
}

export function getChangedAmount(amounts: readonly VariantAmount[] | undefined): number | boolean {
    return amounts?.reduce((a, v) => a + v.amount, 0) || !!amounts?.some((v) => !!v.amount);
}

export function getCombinedAmounts(years: readonly YearAmounts[] | undefined): readonly VariantAmount[] | undefined {
    return years?.reduce<readonly VariantAmount[]>(
        (acc, { amounts }) => (amounts ? amounts.reduce(addVariantAmount, acc) : acc),
        []
    );
}

// Merges several products' `years` (e.g. a parent's own years plus all of its descendants') into
// one, summing per year via addVariantAmount — the same current-balance combine used within a
// single product's own years, just folded across multiple products as well.
export function combineProductYears(
    yearsList: readonly (readonly YearAmounts[] | undefined)[]
): readonly YearAmounts[] {
    const byYear = new Map<number, readonly VariantAmount[]>();
    for (const years of yearsList) {
        for (const { year, amounts } of years ?? []) {
            byYear.set(year, (amounts ?? []).reduce(addVariantAmount, byYear.get(year) ?? []));
        }
    }
    return Array.from(byYear.entries())
        .map(([year, amounts]) => ({ year, amounts }))
        .sort((a, b) => a.year - b.year);
}

export interface AmountTotals {
    volume?: number;
    weight?: number;
    count?: number;
    unitless: readonly VariantAmount[];
}

// Like a single AmountTotals bucket, but keeps the raw entries that were merged into `total` -
// for contexts that want to show the total alongside the individual variants it came from.
export interface AmountTotalWithSources {
    total: number;
    sources: readonly VariantAmount[];
}

export interface AmountTotalsDetailed {
    volume?: AmountTotalWithSources;
    weight?: AmountTotalWithSources;
    count?: AmountTotalWithSources;
    unitless: readonly VariantAmount[];
}

const BASE_ML_PER_UNIT: Record<'l' | 'ml', number> = { l: 1000, ml: 1 };
const BASE_G_PER_UNIT: Record<'kg' | 'g', number> = { kg: 1000, g: 1 };

function addToBucket(
    bucket: AmountTotalWithSources | undefined,
    add: number,
    source: VariantAmount
): AmountTotalWithSources {
    return { total: (bucket?.total ?? 0) + add, sources: [...(bucket?.sources ?? []), source] };
}

export function getAmountTotalsDetailed(
    amounts: readonly VariantAmount[] | undefined,
    variants: readonly Variant[]
): AmountTotalsDetailed {
    const totals: AmountTotalsDetailed = { unitless: [] };

    for (const a of amounts ?? []) {
        const variant = variants.find((v) => v.variant === a.variant);
        const units = variant?.units;
        const perUnit = variant?.count ?? 1;

        if (units === 'l' || units === 'ml') {
            totals.volume = addToBucket(totals.volume, a.amount * perUnit * BASE_ML_PER_UNIT[units], a);
        } else if (units === 'kg' || units === 'g') {
            totals.weight = addToBucket(totals.weight, a.amount * perUnit * BASE_G_PER_UNIT[units], a);
        } else if (units === 'vnt') {
            totals.count = addToBucket(totals.count, a.amount * perUnit, a);
        } else {
            totals.unitless = [...totals.unitless, a];
        }
    }

    return totals;
}

export function getAmountTotals(
    amounts: readonly VariantAmount[] | undefined,
    variants: readonly Variant[]
): AmountTotals {
    const { volume, weight, count, unitless } = getAmountTotalsDetailed(amounts, variants);
    return {
        ...(volume ? { volume: volume.total } : {}),
        ...(weight ? { weight: weight.total } : {}),
        ...(count ? { count: count.total } : {}),
        unitless,
    };
}

export interface FormattedQuantity {
    value: string;
    unit: string;
}

const FRACTION_SYMBOLS: Record<number, string> = {
    0.25: '¼',
    0.5: '½',
    0.75: '¾',
};

function formatQuantity(base: number, small: 'ml' | 'g', big: 'l' | 'kg'): FormattedQuantity {
    const useBig = base >= 100;
    const raw = useBig ? base / 1000 : base;
    const rounded = Math.round(raw * 4) / 4;
    const unit = useBig ? big : small;

    if (rounded === 0 && raw > 0) {
        return { value: '<½', unit };
    }

    const whole = Math.trunc(rounded);
    const fractionSymbol = FRACTION_SYMBOLS[rounded - whole] ?? '';
    const value = whole === 0 && fractionSymbol ? fractionSymbol : `${whole}${fractionSymbol}`;
    return { value, unit };
}

export function formatVolume(totalMl: number): FormattedQuantity {
    return formatQuantity(totalMl, 'ml', 'l');
}

export function formatWeight(totalG: number): FormattedQuantity {
    return formatQuantity(totalG, 'g', 'kg');
}

export function addVariantAmount(
    acc: readonly VariantAmount[],
    { variant, amount, suspicious, home, expiresAt }: VariantAmount
): typeof acc {
    // expiresAt is kept in the combine key (exact match, not !!-coerced like the boolean flags) so
    // differently-dated batches of the same variant never merge into one total.
    const i = acc.findIndex(
        (a) =>
            a.variant === variant && !!a.suspicious === !!suspicious && !!a.home === !!home && a.expiresAt === expiresAt
    );
    return i >= 0
        ? [...acc.slice(0, i), { ...acc[i], amount: acc[i].amount + amount }, ...acc.slice(i + 1)]
        : [
              ...acc,
              {
                  variant,
                  amount,
                  ...(suspicious ? { suspicious } : {}),
                  ...(home ? { home } : {}),
                  ...(expiresAt ? { expiresAt } : {}),
              },
          ];
}

// Merges entries that only differ by expiresAt - for contexts where the caller has already
// grouped amounts by expiry status (e.g. the products table's "total" view, which sums each
// status bucket into one number instead of listing every distinct dated batch like the
// "detailed" view does).
export function mergeAmountsIgnoringExpiry(amounts: readonly VariantAmount[]): readonly VariantAmount[] {
    const merged: VariantAmount[] = [];
    for (const { variant, amount, suspicious, home } of amounts) {
        const i = merged.findIndex(
            (a) => a.variant === variant && !!a.suspicious === !!suspicious && !!a.home === !!home
        );
        if (i >= 0) {
            merged[i] = { ...merged[i], amount: merged[i].amount + amount };
        } else {
            merged.push({ variant, amount, ...(suspicious ? { suspicious } : {}), ...(home ? { home } : {}) });
        }
    }
    return merged;
}

// Like addVariantAmount, but keeps `recycled` as part of the combine key instead of dropping it.
// addVariantAmount intentionally collapses consumed/recycled into one running "current balance"
// total; history/summary rollups need consumed and recycled kept as separate totals. expiresAt is
// kept in the key for the same reason as addVariantAmount - distinct batches must never merge.
export function addTypedVariantAmount(
    acc: readonly VariantAmount[],
    { variant, amount, recycled, suspicious, home, expiresAt }: VariantAmount
): typeof acc {
    const i = acc.findIndex(
        (a) =>
            a.variant === variant &&
            (a.recycled ?? null) === (recycled ?? null) &&
            !!a.suspicious === !!suspicious &&
            !!a.home === !!home &&
            a.expiresAt === expiresAt
    );
    return i >= 0
        ? [...acc.slice(0, i), { ...acc[i], amount: acc[i].amount + amount }, ...acc.slice(i + 1)]
        : [
              ...acc,
              {
                  variant,
                  amount,
                  ...(recycled != null ? { recycled } : {}),
                  ...(suspicious ? { suspicious } : {}),
                  ...(home ? { home } : {}),
                  ...(expiresAt ? { expiresAt } : {}),
              },
          ];
}
