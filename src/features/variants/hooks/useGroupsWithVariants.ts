import { useMemo } from 'react';

import type { FilterPredicate } from '~/features/filters/types';
import { useVariants } from '~/store/variants/useVariants';

export function useGroupsWithVariants(predicate: FilterPredicate<string> = () => true): ReadonlySet<string> {
    const variants = useVariants();
    return useMemo(
        () => new Set(variants.filter(({ variant }) => predicate(variant)).map(({ group }) => group)),
        [variants, predicate]
    );
}
