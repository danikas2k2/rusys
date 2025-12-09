import { useMemo } from 'react';

import { useVariants } from '~/client/state/variants/useVariants';
import type { Variant } from '~/types/data';

export function useSortedVariants() {
    const variants = useVariants();
    return useMemo((): readonly Variant[] => variants.toSorted((a, b) => a.order - b.order), [variants]);
}
