import { useCallback } from 'react';

import { useGetVariants } from '~/features/variants/hooks/useGetVariants';
import type { DeleteVariant } from '~/schema';
import { deleteVariantAction } from '~/server/actions/variants';

export function useDeleteVariant(): (request: DeleteVariant) => Promise<void> {
    const refresh = useGetVariants();
    return useCallback(
        async (request: DeleteVariant): Promise<void> => {
            const { group, variant } = request;
            if (group && variant) {
                await deleteVariantAction(request);
                await refresh();
            }
        },
        [refresh]
    );
}
