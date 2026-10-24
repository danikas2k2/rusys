import { useCallback } from 'react';

import { useGetVariants } from '~/features/variants/hooks/useGetVariants';
import type { CopyVariant } from '~/schema';
import { copyVariantAction } from '~/server/actions/variants';

export function useCopyVariant(): (request: CopyVariant) => Promise<void> {
    const refresh = useGetVariants();
    return useCallback(
        async (request: CopyVariant): Promise<void> => {
            const { group, variant, targetGroup, targetVariant } = request;
            if (
                group &&
                variant &&
                targetGroup &&
                (group !== targetGroup || (targetVariant && variant !== targetVariant))
            ) {
                await copyVariantAction(request);
                await refresh();
            }
        },
        [refresh]
    );
}
