import { useCallback } from 'react';
import { type Variant } from '~/state/details/types';
import { useAllVariants } from '~/state/variants/useAllVariants';

export function useVariantComparator(): (a: Variant | string, b: Variant | string) => number {
    const allVariants = useAllVariants();
    return useCallback(
        (a: Variant | string, b: Variant | string): number =>
            allVariants.indexOf(a as Variant) - allVariants.indexOf(b as Variant),
        [allVariants]
    );
}
