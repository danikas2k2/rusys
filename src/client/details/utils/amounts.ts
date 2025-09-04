import { type VariantAmount } from '~/types/data';

export function getVariantAmount(amounts: ReadonlyArray<VariantAmount> | undefined, variant: string): number {
    return amounts?.reduce((a, v) => a + (v.variant === variant ? v.amount : 0), 0) ?? 0;
}

export function getChangedAmount(amounts: ReadonlyArray<VariantAmount> | undefined): number | boolean {
    return amounts?.reduce((a, v) => a + v.amount, 0) || !!amounts?.some((v) => !!v.amount);
}
