import { useCallback } from 'react';
import { cmp } from '~/client/utils/cmp';
import { type Variant } from '~/store/details/types';
import useAllVariants from '~/store/details/useAllVariants';

export default function useVariantComparator(): (a: Variant | string, b: Variant | string) => number {
    const allVariants = useAllVariants();
    return useCallback(
        (a: Variant | string, b: Variant | string): number =>
            cmp(allVariants.indexOf(a as Variant), allVariants.indexOf(b as Variant)),
        [allVariants]
    );
}
