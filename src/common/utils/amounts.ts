import { type VariantAmount, type YearAmounts } from '~/types/data';

export function getVariantAmount(amounts: ReadonlyArray<VariantAmount> | undefined, variant: string): number {
    return amounts?.reduce((a, v) => a + (v.variant === variant ? v.amount : 0), 0) ?? 0;
}

export function getChangedAmount(amounts: ReadonlyArray<VariantAmount> | undefined): number | boolean {
    return amounts?.reduce((a, v) => a + v.amount, 0) || !!amounts?.some((v) => !!v.amount);
}
export function getCombinedAmounts(
    years: ReadonlyArray<YearAmounts> | undefined
): ReadonlyArray<VariantAmount> | undefined {
    return years?.reduce<ReadonlyArray<VariantAmount>>(
        (acc, { amounts }) => (amounts ? amounts.reduce(addVariantAmount, acc) : acc),
        []
    );
}

export function addVariantAmount(acc: ReadonlyArray<VariantAmount>, { variant, amount }: VariantAmount): typeof acc {
    const i = acc.findIndex((a) => a.variant === variant);
    return i >= 0
        ? [...acc.slice(0, i), { variant, amount: acc[i].amount + amount }, ...acc.slice(i + 1)]
        : [...acc, { variant, amount }];
}

export const hasAmount = (a: VariantAmount) => a.amount > 0;

export const cleanupRecycled = ({ recycled, ...v }: VariantAmount): VariantAmount =>
    recycled ? { ...v, recycled } : v;
