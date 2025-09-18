import { useCallback } from 'react';
import { useSelector } from 'react-redux';

import { isEqual } from 'lodash';

import { compareNames } from '~/client/utils/compareNames';
import { type WithVariantsState } from '~/state/variants/types';

export function useGroupVariantComparator(group: string): (a: string, b: string) => number {
    const variantOrders: Record<string, number> = useSelector(
        (state: WithVariantsState) =>
            state.variants
                ?.filter((v) => v.group === group)
                .reduce((r, { variant, order }) => ({ ...r, [variant]: order }), {}) ?? {},
        isEqual
    );
    return useCallback(
        (a: string, b: string): number =>
            (variantOrders[a] ?? Number.POSITIVE_INFINITY) - (variantOrders[b] ?? Number.POSITIVE_INFINITY) ||
            compareNames(a, b),
        [variantOrders]
    );
}
