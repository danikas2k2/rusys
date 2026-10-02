import { useCallback } from 'react';

import type { UpdateVariant } from '~/common/data';
import { useGetVariants } from '~/features/variants/hooks/useGetVariants';
import { copyVariantAction } from '~/server/actions/variants';

export function useCopyVariant(): (
    group: string,
    variant: string,
    newGroup: string,
    newVariant?: string,
    update?: UpdateVariant
) => Promise<void> {
    const refresh = useGetVariants();
    return useCallback(
        async (group, variant, newGroup, newVariant, update): Promise<void> => {
            if (group && variant && newGroup && (group !== newGroup || (newVariant && variant !== newVariant))) {
                await copyVariantAction(group, variant, newGroup, newVariant, update);
                await refresh();
            }
        },
        [refresh]
    );
}
