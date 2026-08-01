import type { Variant, VariantAmount, YearAmounts } from '~/types/data';

export function getVariantAmount(
    amounts: readonly VariantAmount[] | undefined,
    variant: string,
    suspicious?: boolean,
    home?: boolean
): number {
    return (
        amounts?.reduce(
            (a, v) =>
                a + (v.variant === variant && !!v.suspicious === !!suspicious && !!v.home === !!home ? v.amount : 0),
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

const BASE_ML_PER_UNIT: Record<'l' | 'ml', number> = { l: 1000, ml: 1 };
const BASE_G_PER_UNIT: Record<'kg' | 'g', number> = { kg: 1000, g: 1 };

export function getAmountTotals(
    amounts: readonly VariantAmount[] | undefined,
    variants: readonly Variant[]
): AmountTotals {
    const totals: AmountTotals = { unitless: [] };

    for (const a of amounts ?? []) {
        const variant = variants.find((v) => v.variant === a.variant);
        const units = variant?.units;
        const perUnit = variant?.count ?? 1;

        if (units === 'l' || units === 'ml') {
            totals.volume = (totals.volume ?? 0) + a.amount * perUnit * BASE_ML_PER_UNIT[units];
        } else if (units === 'kg' || units === 'g') {
            totals.weight = (totals.weight ?? 0) + a.amount * perUnit * BASE_G_PER_UNIT[units];
        } else if (units === 'vnt') {
            totals.count = (totals.count ?? 0) + a.amount * perUnit;
        } else {
            totals.unitless = [...totals.unitless, a];
        }
    }

    return totals;
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
    { variant, amount, suspicious, home }: VariantAmount
): typeof acc {
    const i = acc.findIndex((a) => a.variant === variant && !!a.suspicious === !!suspicious && !!a.home === !!home);
    return i >= 0
        ? [...acc.slice(0, i), { ...acc[i], amount: acc[i].amount + amount }, ...acc.slice(i + 1)]
        : [
              ...acc,
              {
                  variant,
                  amount,
                  ...(suspicious ? { suspicious } : {}),
                  ...(home ? { home } : {}),
              },
          ];
}

// Like addVariantAmount, but keeps `recycled` as part of the combine key instead of dropping it.
// addVariantAmount intentionally collapses consumed/recycled into one running "current balance"
// total; history/summary rollups need consumed and recycled kept as separate totals.
export function addTypedVariantAmount(
    acc: readonly VariantAmount[],
    { variant, amount, recycled, suspicious, home }: VariantAmount
): typeof acc {
    const i = acc.findIndex(
        (a) =>
            a.variant === variant &&
            (a.recycled ?? null) === (recycled ?? null) &&
            !!a.suspicious === !!suspicious &&
            !!a.home === !!home
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
              },
          ];
}
