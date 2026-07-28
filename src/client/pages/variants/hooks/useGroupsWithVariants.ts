import { useMemo } from 'react';

import { useVariants } from '~/client/state/variants/useVariants';

export function useGroupsWithVariants(): ReadonlySet<string> {
    const variants = useVariants();
    return useMemo(() => new Set(variants.map(({ group }) => group)), [variants]);
}
