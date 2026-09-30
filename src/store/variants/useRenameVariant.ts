import { useCallback } from 'react';

import type { UpdateVariant } from '~/common/data';
import { renameVariantAction } from '~/server/actions/variants';
import { useGetVariants } from '~/store/variants/useGetVariants';

export function useRenameVariant(): (
    group: string,
    variant: string,
    newVariant: string,
    update?: UpdateVariant
) => Promise<void> {
    const refresh = useGetVariants();
    return useCallback(
        async (group, variant, newVariant, update): Promise<void> => {
            if (group && variant && newVariant && variant !== newVariant) {
                await renameVariantAction(group, variant, newVariant, update);
                await refresh();
            }
        },
        [refresh]
    );
}
