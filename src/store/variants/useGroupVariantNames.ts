import { useMemo } from 'react';

import { useGroupVariants } from './useGroupVariants';

export const useGroupVariantNames = (group: string): string[] => {
    const variants = useGroupVariants(group);
    return useMemo(() => variants.toSorted((a, b) => a.order - b.order).map((variant) => variant.variant), [variants]);
};
