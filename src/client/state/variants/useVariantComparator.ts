import equal from 'fast-deep-equal/es6/react';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';

import type { WithVariantsState } from '~/client/state/variants/types';
import { compareNames } from '~/client/utils/compareNames';

export function useVariantComparator(): (group: string) => (a: string, b: string) => number {
    const variantOrders = useSelector(
        (state: WithVariantsState) =>
            state.variants?.reduce<Record<string, Record<string, number>>>(
                (r, { group, variant, order }) => ({ ...r, [group]: { ...r[group], [variant]: order } }),
                {}
            ) ?? {},
        equal
    );
    return useCallback(
        (group: string) =>
            (a: string, b: string): number =>
                (variantOrders[group]?.[a] ?? Number.POSITIVE_INFINITY) -
                    (variantOrders[group]?.[b] ?? Number.POSITIVE_INFINITY) || compareNames(a, b),
        [variantOrders]
    );
}
