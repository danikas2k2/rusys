import type { VariantAmount, YearAmounts } from '~/types/data';

export function getVariantAmount(
    amounts: readonly VariantAmount[] | undefined,
    variant: string,
    suspicious?: boolean
): number {
    return (
        amounts?.reduce((a, v) => a + (v.variant === variant && !!v.suspicious === !!suspicious ? v.amount : 0), 0) ?? 0
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

export function addVariantAmount(
    acc: readonly VariantAmount[],
    { variant, amount, suspicious }: VariantAmount
): typeof acc {
    const i = acc.findIndex((a) => a.variant === variant && !!a.suspicious === !!suspicious);
    return i >= 0
        ? [...acc.slice(0, i), { ...acc[i], amount: acc[i].amount + amount }, ...acc.slice(i + 1)]
        : [...acc, suspicious ? { variant, amount, suspicious } : { variant, amount }];
}
