import { type VariantAmount } from '~/types/data';

export function getVariant(
    amounts: ReadonlyArray<VariantAmount> | undefined,
    variant: string
): VariantAmount | undefined {
    return amounts?.find((v) => v.variant === variant);
}

export function getVariantAmount(amounts: ReadonlyArray<VariantAmount> | undefined, variant: string): number {
    return getVariant(amounts, variant)?.amount ?? 0;
}

export function getChangedAmount(amounts: ReadonlyArray<VariantAmount> | undefined): number | boolean {
    return amounts?.reduce((acc, v) => acc + v.amount, 0) || !!amounts?.some((v) => !!v.amount);
}
