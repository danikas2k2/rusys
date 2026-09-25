import type { Variant } from '@rusys/common/data';
import { useMemo } from 'react';

import { useVariants } from '~/store/variants/useVariants';

export function useSortedVariants() {
    const variants = useVariants();
    return useMemo((): readonly Variant[] => variants.toSorted((a, b) => a.order - b.order), [variants]);
}
