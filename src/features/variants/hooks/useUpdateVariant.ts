import { useCallback } from 'react';

import { useGetVariants } from '~/features/variants/hooks/useGetVariants';
import type { UpdateVariant } from '~/schema';
import { updateVariantAction } from '~/server/actions/variants';

export function useUpdateVariant(): (request: UpdateVariant) => Promise<void> {
    const refresh = useGetVariants();
    return useCallback(
        async (request: UpdateVariant): Promise<void> => {
            const { group, variant } = request;
            if (group && variant) {
                await updateVariantAction(request);
                await refresh();
            }
        },
        [refresh]
    );
}
