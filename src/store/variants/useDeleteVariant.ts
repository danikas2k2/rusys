import { useCallback } from 'react';

import { deleteVariantAction } from '~/server/actions/variants';
import { useGetVariants } from '~/store/variants/useGetVariants';

export function useDeleteVariant(): (group: string, variant: string) => Promise<void> {
    const refresh = useGetVariants();
    return useCallback(
        async (group: string, variant: string): Promise<void> => {
            if (group && variant) {
                await deleteVariantAction(group, variant);
                await refresh();
            }
        },
        [refresh]
    );
}
