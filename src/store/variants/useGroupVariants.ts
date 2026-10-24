import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import type { Variant } from '~/schema';
import { getVariantsAction } from '~/server/actions/variants';
import { CATALOG_KEYS } from '~/store/catalog';

const EMPTY_VARIANTS: readonly Variant[] = [];

export const useGroupVariants = (group: string): readonly Variant[] => {
    const select = useCallback(
        (variants: readonly Variant[]) => variants.filter((variant) => variant.group === group),
        [group]
    );
    return (
        useQuery({
            queryKey: CATALOG_KEYS.variants,
            queryFn: async () => (await getVariantsAction()).variants,
            enabled: false,
            select,
        }).data ?? EMPTY_VARIANTS
    );
};
