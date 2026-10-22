import { useQuery } from '@tanstack/react-query';

import type { Variant } from '~/common/data';
import { getVariantsAction } from '~/server/actions/variants';
import { CATALOG_KEYS } from '~/store/catalog';

export const useVariant = (group: string, variant: string): Readonly<Variant> | undefined =>
    useQuery({
        queryKey: CATALOG_KEYS.variants,
        queryFn: async () => (await getVariantsAction()).variants,
        enabled: false,
        select: (variants) => variants.find((v) => v.group === group && v.variant === variant),
    }).data;
