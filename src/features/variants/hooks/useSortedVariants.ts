import { useMemo } from 'react';

import type { Variant } from '~/schema';
import { useVariants } from '~/store/variants';

export function useSortedVariants() {
    const variants = useVariants();
    return useMemo((): readonly Variant[] => variants.toSorted((a, b) => a.order - b.order), [variants]);
}
