import { useCallback, useMemo } from 'react';

import { compare } from '~/lib/utils/names';
import { useVariants } from './useVariants';

function selectVariantOrders(variants: ReturnType<typeof useVariants>, group: string): Record<string, number> {
    const orders: Record<string, number> = {};
    for (const { variant, order, group: variantGroup } of variants) {
        if (variantGroup === group) {
            orders[variant] = order;
        }
    }
    return orders;
}

export function useGroupVariantComparator(group: string): (a: string, b: string) => number {
    const variants = useVariants();
    const variantOrders = useMemo(() => selectVariantOrders(variants, group), [variants, group]);
    return useCallback(
        (a: string, b: string): number =>
            (variantOrders[a] ?? Number.POSITIVE_INFINITY) - (variantOrders[b] ?? Number.POSITIVE_INFINITY) ||
            compare(a, b),
        [variantOrders]
    );
}
