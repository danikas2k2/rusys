import { createSelector } from '@reduxjs/toolkit';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';

import { compareNames } from '~/lib/utils/compareNames';
import type { WithVariantsState } from '~/store/variants/types';

const selectVariantOrders = createSelector(
    [(state: WithVariantsState) => state.variants, (_state: WithVariantsState, group: string) => group],
    (variants, group): Record<string, number> => {
        const orders: Record<string, number> = {};
        for (const { variant, order, group: variantGroup } of variants ?? []) {
            if (variantGroup === group) {
                orders[variant] = order;
            }
        }
        return orders;
    }
);

export function useGroupVariantComparator(group: string): (a: string, b: string) => number {
    const variantOrders = useSelector((state: WithVariantsState) => selectVariantOrders(state, group));
    return useCallback(
        (a: string, b: string): number =>
            (variantOrders[a] ?? Number.POSITIVE_INFINITY) - (variantOrders[b] ?? Number.POSITIVE_INFINITY) ||
            compareNames(a, b),
        [variantOrders]
    );
}
