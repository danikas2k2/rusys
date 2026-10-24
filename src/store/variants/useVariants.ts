import { useQuery } from '@tanstack/react-query';

import type { Variant } from '~/schema';
import { getVariantsAction } from '~/server/actions/variants';
import { CATALOG_KEYS } from '~/store/catalog';

const EMPTY_VARIANTS: readonly Variant[] = [];

export const useVariants = (): readonly Variant[] =>
    useQuery({
        queryKey: CATALOG_KEYS.variants,
        queryFn: async () => (await getVariantsAction()).variants,
        enabled: false,
    }).data ?? EMPTY_VARIANTS;
