import type { Variant } from '@rusys/common/data';
import { useMemo } from 'react';

import { useVariants } from '~/client/state/variants/useVariants';

export function useSortedVariants() {
    const variants = useVariants();
    return useMemo((): readonly Variant[] => variants.toSorted((a, b) => a.order - b.order), [variants]);
}
