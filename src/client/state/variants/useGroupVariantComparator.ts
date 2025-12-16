import equal from 'fast-deep-equal/es6/react';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';

import type { WithVariantsState } from '~/client/state/variants/types';
import { compareNames } from '~/client/utils/compareNames';

export function useGroupVariantComparator(group: string): (a: string, b: string) => number {
    const variantOrders: Record<string, number> = useSelector(
        (state: WithVariantsState) =>
            state.variants
                ?.filter((v) => v.group === group)
                .reduce((r, { variant, order }) => ({ ...r, [variant]: order }), {}) ?? {},
        equal
    );
    return useCallback(
        (a: string, b: string): number =>
            (variantOrders[a] ?? Number.POSITIVE_INFINITY) - (variantOrders[b] ?? Number.POSITIVE_INFINITY) ||
            compareNames(a, b),
        [variantOrders]
    );
}
