import { createSelector } from '@reduxjs/toolkit';
import type { Variant } from '@rusys/common/data';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { compareNames } from '~/lib/utils/compareNames';
import type { WithVariantsState } from '~/store/variants/types';

export function useGroupVariantComparator(group: string): (a: string, b: string) => number {
    // A dedicated selector instance per (component, group) — createSelector's cache is a single
    // slot, so sharing one instance across many components/groups would thrash on every render.
    const selectVariantOrders = useMemo(
        () =>
            createSelector(
                (state: WithVariantsState) => state.variants,
                (variants: readonly Variant[] | undefined): Record<string, number> => {
                    const orders: Record<string, number> = {};
                    for (const { variant, order, group: variantGroup } of variants ?? []) {
                        if (variantGroup === group) {
                            orders[variant] = order;
                        }
                    }
                    return orders;
                }
            ),
        [group]
    );
    const variantOrders = useSelector<WithVariantsState, Record<string, number>>(selectVariantOrders);
    return useCallback(
        (a: string, b: string): number =>
            (variantOrders[a] ?? Number.POSITIVE_INFINITY) - (variantOrders[b] ?? Number.POSITIVE_INFINITY) ||
            compareNames(a, b),
        [variantOrders]
    );
}
