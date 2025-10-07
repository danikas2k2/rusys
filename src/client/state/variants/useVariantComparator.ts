import { useCallback } from 'react';
import { useSelector } from 'react-redux';

import { isEqual } from 'lodash';

import { compareNames } from '~/client/app/utils/compareNames';
import { type WithVariantsState } from '~/client/state/variants/types';

export function useVariantComparator(): (group: string) => (a: string, b: string) => number {
    const variantOrders = useSelector(
        (state: WithVariantsState) =>
            state.variants?.reduce<Record<string, Record<string, number>>>(
                (r, { group, variant, order }) => ({ ...r, [group]: { ...r[group], [variant]: order } }),
                {}
            ) ?? {},
        isEqual
    );
    return useCallback(
        (group: string) =>
            (a: string, b: string): number =>
                (variantOrders[group]?.[a] ?? Number.POSITIVE_INFINITY) -
                    (variantOrders[group]?.[b] ?? Number.POSITIVE_INFINITY) || compareNames(a, b),
        [variantOrders]
    );
}
