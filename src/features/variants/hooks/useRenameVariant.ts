import { useCallback } from 'react';

import { useGetVariants } from '~/features/variants/hooks/useGetVariants';
import type { RenameVariant } from '~/schema';
import { renameVariantAction } from '~/server/actions/variants';

export function useRenameVariant(): (request: RenameVariant) => Promise<void> {
    const refresh = useGetVariants();
    return useCallback(
        async (request: RenameVariant): Promise<void> => {
            const { group, variant, targetVariant } = request;
            if (group && variant && targetVariant && variant !== targetVariant) {
                await renameVariantAction(request);
                await refresh();
            }
        },
        [refresh]
    );
}
